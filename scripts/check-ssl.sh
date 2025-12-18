#!/bin/bash
# =============================================================================
# SSL/TLS Certificate Troubleshooting Script
# =============================================================================
# This script checks the SSL/TLS configuration and certificate status
# for the Scamnemesis production deployment.
#
# Usage: ./scripts/check-ssl.sh [domain]
# Example: ./scripts/check-ssl.sh scamnemesis.com
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default domain from .env or use first argument
DOMAIN="${1:-scamnemesis.com}"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}SSL/TLS Certificate Checker for ${DOMAIN}${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}>>> $1${NC}"
    echo "---"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running on server or local machine
if command -v docker &> /dev/null && docker ps | grep -q scamnemesis-traefik; then
    ON_SERVER=true
    print_success "Running on production server with Docker access"
else
    ON_SERVER=false
    print_warning "Running on local machine (limited checks available)"
fi

# =============================================================================
# 1. DNS Check
# =============================================================================
print_section "1. DNS Configuration"

echo "Checking DNS resolution for ${DOMAIN}..."
if DOMAIN_IP=$(dig +short "$DOMAIN" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -1); then
    if [ -n "$DOMAIN_IP" ]; then
        print_success "Main domain resolves to: $DOMAIN_IP"
    else
        print_error "Main domain does not resolve to an IP"
        exit 1
    fi
else
    print_error "Cannot resolve main domain"
    exit 1
fi

echo "Checking DNS resolution for www.${DOMAIN}..."
if WWW_IP=$(dig +short "www.$DOMAIN" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -1); then
    if [ -n "$WWW_IP" ]; then
        if [ "$WWW_IP" = "$DOMAIN_IP" ]; then
            print_success "WWW subdomain resolves to same IP: $WWW_IP"
        else
            print_warning "WWW subdomain resolves to different IP: $WWW_IP (expected: $DOMAIN_IP)"
        fi
    else
        print_warning "WWW subdomain does not resolve (optional, but recommended)"
    fi
else
    print_warning "WWW subdomain does not resolve"
fi

# =============================================================================
# 2. Port Check
# =============================================================================
print_section "2. Port Accessibility"

echo "Checking HTTP port (80)..."
if timeout 5 bash -c "echo > /dev/tcp/$DOMAIN/80" 2>/dev/null; then
    print_success "Port 80 is accessible"
else
    print_error "Port 80 is NOT accessible (required for Let's Encrypt HTTP-01 challenge)"
fi

echo "Checking HTTPS port (443)..."
if timeout 5 bash -c "echo > /dev/tcp/$DOMAIN/443" 2>/dev/null; then
    print_success "Port 443 is accessible"
else
    print_error "Port 443 is NOT accessible"
fi

# =============================================================================
# 3. HTTP/HTTPS Response Check
# =============================================================================
print_section "3. HTTP/HTTPS Response"

echo "Testing HTTP response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://$DOMAIN" --max-time 10 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    print_success "HTTP responds with 200 OK"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    print_success "HTTP responds with redirect ($HTTP_CODE)"
else
    print_error "HTTP responds with: $HTTP_CODE"
fi

echo "Testing HTTPS response..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "https://$DOMAIN" --max-time 10 || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    print_success "HTTPS responds with 200 OK"
else
    print_warning "HTTPS responds with: $HTTPS_CODE"
fi

# =============================================================================
# 4. Certificate Check
# =============================================================================
print_section "4. SSL/TLS Certificate"

echo "Checking certificate details..."
CERT_INFO=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null || echo "ERROR")

if [ "$CERT_INFO" = "ERROR" ]; then
    print_error "Cannot retrieve certificate information"
else
    echo "$CERT_INFO" | while read -r line; do
        if echo "$line" | grep -q "Let's Encrypt\|ISRG"; then
            print_success "$line"
        elif echo "$line" | grep -qi "traefik\|default"; then
            print_error "$line (This is the default Traefik certificate!)"
        else
            echo "  $line"
        fi
    done
fi

# Check certificate validity
CERT_ISSUER=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null | grep -o "CN=[^,]*" || echo "UNKNOWN")

if echo "$CERT_ISSUER" | grep -qi "Let's Encrypt\|ISRG"; then
    print_success "Certificate issued by Let's Encrypt"
elif echo "$CERT_ISSUER" | grep -qi "traefik"; then
    print_error "Using default Traefik certificate (Let's Encrypt failed)"
else
    print_warning "Certificate issuer: $CERT_ISSUER"
fi

# =============================================================================
# 5. Docker Container Checks (if on server)
# =============================================================================
if [ "$ON_SERVER" = true ]; then
    print_section "5. Docker Container Status"

    echo "Checking Traefik container..."
    if docker ps | grep -q scamnemesis-traefik; then
        print_success "Traefik container is running"

        echo "Checking Traefik configuration..."
        ACME_EMAIL=$(docker inspect scamnemesis-traefik | grep -o '"--certificatesresolvers.letsencrypt.acme.email=[^"]*"' | cut -d'=' -f2 | tr -d '"' || echo "NOT_SET")
        if [ "$ACME_EMAIL" != "NOT_SET" ] && [ "$ACME_EMAIL" != "admin@example.com" ] && [ -n "$ACME_EMAIL" ]; then
            print_success "ACME email configured: $ACME_EMAIL"
        else
            print_error "ACME email not configured or using default"
        fi

        echo "Checking certificate storage..."
        CERT_FILE_SIZE=$(docker exec scamnemesis-traefik ls -lh /letsencrypt/acme.json 2>/dev/null | awk '{print $5}' || echo "0")
        if [ "$CERT_FILE_SIZE" != "0" ] && [ -n "$CERT_FILE_SIZE" ]; then
            print_success "Certificate file exists (size: $CERT_FILE_SIZE)"
        else
            print_warning "Certificate file is empty or doesn't exist"
        fi

        echo "Checking for certificate errors in logs..."
        ERROR_COUNT=$(docker logs scamnemesis-traefik 2>&1 | grep -i "acme.*error" | wc -l)
        if [ "$ERROR_COUNT" -eq 0 ]; then
            print_success "No ACME errors in logs"
        else
            print_error "Found $ERROR_COUNT ACME error(s) in logs"
            echo "Recent errors:"
            docker logs scamnemesis-traefik 2>&1 | grep -i "acme.*error" | tail -3
        fi
    else
        print_error "Traefik container is not running"
    fi

    echo "Checking App container labels..."
    if docker ps | grep -q scamnemesis-app; then
        TLS_ENABLED=$(docker inspect scamnemesis-app | grep "traefik.http.routers.app.tls=true" || echo "NOT_SET")
        if [ "$TLS_ENABLED" != "NOT_SET" ]; then
            print_success "TLS explicitly enabled in app router"
        else
            print_error "TLS not explicitly enabled in app router"
        fi
    else
        print_error "App container is not running"
    fi
fi

# =============================================================================
# 6. ACME Challenge Path Check
# =============================================================================
print_section "6. ACME Challenge Path"

echo "Testing ACME challenge endpoint..."
ACME_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/.well-known/acme-challenge/test" --max-time 10 || echo "000")
if [ "$ACME_CODE" = "404" ]; then
    print_success "ACME challenge path accessible (404 is expected for test)"
elif [ "$ACME_CODE" = "000" ]; then
    print_error "Cannot reach ACME challenge path (connection failed)"
else
    print_warning "ACME challenge path responds with: $ACME_CODE"
fi

# =============================================================================
# Summary
# =============================================================================
print_section "Summary"

echo ""
echo "Domain: $DOMAIN"
echo "IP Address: $DOMAIN_IP"
echo "Certificate Issuer: $CERT_ISSUER"
echo "HTTP Status: $HTTP_CODE"
echo "HTTPS Status: $HTTPS_CODE"
echo ""

# Final recommendation
if echo "$CERT_ISSUER" | grep -qi "Let's Encrypt\|ISRG"; then
    print_success "SUCCESS: Let's Encrypt certificate is properly configured!"
else
    print_error "ISSUE: Not using Let's Encrypt certificate"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check Traefik logs: docker logs scamnemesis-traefik | grep -i acme"
    echo "2. Verify ACME email is set in .env file"
    echo "3. Ensure ports 80 and 443 are accessible from internet"
    echo "4. Check DNS is pointing to correct server"
    echo "5. Review deployment guide: SSL_FIX_DEPLOYMENT_GUIDE.md"
fi

echo ""
echo -e "${BLUE}==============================================================================${NC}"
