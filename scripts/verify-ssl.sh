#!/bin/bash
# =============================================================================
# SSL Certificate Verification Script
# =============================================================================
# This script helps verify that Let's Encrypt SSL certificates are properly
# configured and issued by Traefik

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}SSL Certificate Verification${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

# Get domain from .env
DOMAIN=$(grep "^DOMAIN=" .env | cut -d'=' -f2)
ACME_EMAIL=$(grep "^ACME_EMAIL=" .env | cut -d'=' -f2)

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}✗ DOMAIN not set in .env${NC}"
    exit 1
fi

if [ -z "$ACME_EMAIL" ]; then
    echo -e "${RED}✗ ACME_EMAIL not set in .env${NC}"
    exit 1
fi

echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo -e "ACME Email: ${GREEN}$ACME_EMAIL${NC}"
echo ""

# Check if Traefik is running
echo -e "${BLUE}[1/6] Checking Traefik status...${NC}"
if ! docker ps --format '{{.Names}}' | grep -q "scamnemesis-traefik"; then
    echo -e "${RED}✗ Traefik is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Traefik is running${NC}"
echo ""

# Check Traefik health
echo -e "${BLUE}[2/6] Checking Traefik health...${NC}"
if docker exec scamnemesis-traefik traefik healthcheck --ping 2>/dev/null; then
    echo -e "${GREEN}✓ Traefik health check passed${NC}"
else
    echo -e "${RED}✗ Traefik health check failed${NC}"
    exit 1
fi
echo ""

# Check if acme.json exists
echo -e "${BLUE}[3/6] Checking ACME certificate file...${NC}"
if docker exec scamnemesis-traefik test -f /letsencrypt/acme.json 2>/dev/null; then
    echo -e "${GREEN}✓ ACME certificate file exists${NC}"

    # Check file size
    size=$(docker exec scamnemesis-traefik stat -f %z /letsencrypt/acme.json 2>/dev/null || docker exec scamnemesis-traefik stat -c %s /letsencrypt/acme.json 2>/dev/null)
    echo -e "  File size: $size bytes"

    if [ "$size" -lt 100 ]; then
        echo -e "${YELLOW}⚠ File is very small - certificates may not be issued yet${NC}"
    fi
else
    echo -e "${RED}✗ ACME certificate file not found${NC}"
    exit 1
fi
echo ""

# Check if certificates exist in acme.json
echo -e "${BLUE}[4/6] Checking for SSL certificates...${NC}"
if command -v jq &> /dev/null; then
    cert_count=$(docker exec scamnemesis-traefik cat /letsencrypt/acme.json 2>/dev/null | jq '.letsencrypt.Certificates | length' 2>/dev/null || echo "0")

    if [ "$cert_count" -gt 0 ]; then
        echo -e "${GREEN}✓ $cert_count certificate(s) found${NC}"

        # Show certificate details
        echo -e "\nCertificate details:"
        docker exec scamnemesis-traefik cat /letsencrypt/acme.json 2>/dev/null | jq -r '.letsencrypt.Certificates[] | "  Domain: \(.domain.main)"' 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠ No certificates found yet${NC}"
        echo -e "  This is normal for a fresh deployment. Certificates may take 2-5 minutes to issue."
    fi
else
    echo -e "${YELLOW}⚠ jq not installed, skipping certificate details${NC}"
    grep -q "Certificates" <(docker exec scamnemesis-traefik cat /letsencrypt/acme.json 2>/dev/null) && echo -e "${GREEN}✓ Certificates section found${NC}" || echo -e "${YELLOW}⚠ No certificates section found${NC}"
fi
echo ""

# Check DNS resolution
echo -e "${BLUE}[5/6] Checking DNS resolution...${NC}"
if command -v dig &> /dev/null; then
    ip=$(dig +short "$DOMAIN" | head -n1)
    if [ -n "$ip" ]; then
        echo -e "${GREEN}✓ DNS resolves to: $ip${NC}"
    else
        echo -e "${RED}✗ DNS does not resolve${NC}"
        echo -e "  Let's Encrypt cannot issue certificates without valid DNS"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ dig not installed, skipping DNS check${NC}"
fi
echo ""

# Test HTTPS connection
echo -e "${BLUE}[6/6] Testing HTTPS connection...${NC}"
if command -v curl &> /dev/null; then
    # Try to get certificate info
    cert_info=$(curl -vI "https://$DOMAIN" 2>&1 || true)

    if echo "$cert_info" | grep -q "SSL certificate problem"; then
        echo -e "${RED}✗ SSL certificate problem detected${NC}"
        echo -e "\nCertificate details:"
        echo "$cert_info" | grep -i "subject\|issuer" || echo "  (no details available)"

        if echo "$cert_info" | grep -iq "TRAEFIK DEFAULT CERT"; then
            echo -e "\n${YELLOW}⚠ Using Traefik default certificate${NC}"
            echo -e "  Possible causes:"
            echo -e "  1. Let's Encrypt certificate not issued yet (wait 2-5 minutes)"
            echo -e "  2. ACME_EMAIL is invalid"
            echo -e "  3. DNS not properly configured"
            echo -e "  4. Ports 80/443 not accessible from internet"
            echo -e "\n  Check Traefik logs: docker logs scamnemesis-traefik | grep -i acme"
        fi
    elif echo "$cert_info" | grep -iq "Let's Encrypt"; then
        echo -e "${GREEN}✓ Valid Let's Encrypt certificate!${NC}"
        echo -e "\nCertificate details:"
        echo "$cert_info" | grep -i "subject\|issuer\|expire" || true
    elif echo "$cert_info" | grep -q "HTTP/"; then
        echo -e "${YELLOW}⚠ HTTPS connection successful, checking certificate issuer...${NC}"
        issuer=$(echo "$cert_info" | grep -i "issuer" || echo "Unknown")
        echo -e "  Issuer: $issuer"

        if echo "$issuer" | grep -iq "Let's Encrypt"; then
            echo -e "${GREEN}✓ Certificate is from Let's Encrypt${NC}"
        else
            echo -e "${YELLOW}⚠ Certificate is not from Let's Encrypt${NC}"
        fi
    else
        echo -e "${RED}✗ Could not connect to HTTPS endpoint${NC}"
        echo -e "  Make sure ports 80 and 443 are accessible from the internet"
    fi
else
    echo -e "${YELLOW}⚠ curl not installed, skipping HTTPS test${NC}"
fi
echo ""

# Summary and recommendations
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Summary & Recommendations${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "If certificates are not issued yet:"
echo -e "  1. Wait 2-5 minutes for Let's Encrypt to issue certificates"
echo -e "  2. Check Traefik logs for ACME errors:"
echo -e "     ${YELLOW}docker logs scamnemesis-traefik | grep -i acme${NC}"
echo -e "  3. Verify ACME_EMAIL is valid (current: $ACME_EMAIL)"
echo -e "  4. Ensure DNS points to your server IP"
echo -e "  5. Verify ports 80 and 443 are accessible from internet"
echo ""

echo -e "To force certificate renewal:"
echo -e "  ${YELLOW}docker stop scamnemesis-traefik${NC}"
echo -e "  ${YELLOW}docker volume rm scamnemesis_traefik_certs_prod${NC}"
echo -e "  ${YELLOW}docker compose -f docker-compose.prod.yml up -d${NC}"
echo ""

echo -e "To view certificate details:"
echo -e "  ${YELLOW}docker exec scamnemesis-traefik cat /letsencrypt/acme.json | jq${NC}"
echo ""

echo -e "${GREEN}Verification complete!${NC}"
