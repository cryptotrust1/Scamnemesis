#!/bin/bash
# =============================================================================
# Production Docker Compose Validation Script
# =============================================================================
# This script validates the production deployment of Scamnemesis
# Run this after deployment to verify all services are healthy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.prod.yml"
ERRORS=0
WARNINGS=0

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Scamnemesis Production Validation${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# =============================================================================
# Function to print status
# =============================================================================
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✓${NC} $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        ((WARNINGS++))
    else
        echo -e "${RED}✗${NC} $message"
        ((ERRORS++))
    fi
}

# =============================================================================
# 1. Check if Docker is running
# =============================================================================
echo -e "${BLUE}[1/10] Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    print_status "FAIL" "Docker is not installed"
    exit 1
fi

if ! docker ps &> /dev/null; then
    print_status "FAIL" "Docker daemon is not running"
    exit 1
fi
print_status "OK" "Docker is running"
echo ""

# =============================================================================
# 2. Check if compose file exists
# =============================================================================
echo -e "${BLUE}[2/10] Checking compose file...${NC}"
if [ ! -f "$COMPOSE_FILE" ]; then
    print_status "FAIL" "docker-compose.prod.yml not found"
    exit 1
fi
print_status "OK" "Compose file found"
echo ""

# =============================================================================
# 3. Validate compose file syntax
# =============================================================================
echo -e "${BLUE}[3/10] Validating compose file syntax...${NC}"
if docker compose -f "$COMPOSE_FILE" config --quiet 2>&1 | grep -i error; then
    print_status "FAIL" "Compose file has syntax errors"
else
    print_status "OK" "Compose file syntax is valid"
fi
echo ""

# =============================================================================
# 4. Check required environment variables
# =============================================================================
echo -e "${BLUE}[4/10] Checking environment variables...${NC}"

if [ ! -f ".env" ]; then
    print_status "FAIL" ".env file not found"
    exit 1
fi

# Critical variables that must be set
CRITICAL_VARS=(
    "ACME_EMAIL"
    "DOMAIN"
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "ADMIN_SETUP_TOKEN"
)

for var in "${CRITICAL_VARS[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
        value=$(grep "^${var}=" .env | cut -d'=' -f2-)
        if [ -z "$value" ] || [ "$value" = "changeme" ] || [[ "$value" =~ example\.com ]]; then
            print_status "FAIL" "$var is set but has invalid/default value"
        else
            print_status "OK" "$var is configured"
        fi
    else
        print_status "FAIL" "$var is not set in .env"
    fi
done
echo ""

# =============================================================================
# 5. Check service status
# =============================================================================
echo -e "${BLUE}[5/10] Checking service status...${NC}"

SERVICES=(
    "scamnemesis-traefik"
    "scamnemesis-app"
    "scamnemesis-postgres"
    "scamnemesis-redis"
    "scamnemesis-typesense"
    "scamnemesis-ml"
    "scamnemesis-clamav"
    "scamnemesis-minio"
    "scamnemesis-prometheus"
    "scamnemesis-grafana"
)

for service in "${SERVICES[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
        status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "no-healthcheck")
        if [ "$status" = "healthy" ]; then
            print_status "OK" "$service is running and healthy"
        elif [ "$status" = "no-healthcheck" ]; then
            if docker ps --filter "name=${service}" --filter "status=running" --quiet | grep -q .; then
                print_status "WARN" "$service is running (no health check)"
            else
                print_status "FAIL" "$service is not running"
            fi
        elif [ "$status" = "starting" ]; then
            print_status "WARN" "$service is starting (health check pending)"
        else
            print_status "FAIL" "$service is unhealthy (status: $status)"
        fi
    else
        print_status "FAIL" "$service is not running"
    fi
done
echo ""

# =============================================================================
# 6. Check Traefik SSL certificates
# =============================================================================
echo -e "${BLUE}[6/10] Checking Traefik SSL certificates...${NC}"

if docker ps --format '{{.Names}}' | grep -q "scamnemesis-traefik"; then
    # Check if acme.json exists
    if docker exec scamnemesis-traefik test -f /letsencrypt/acme.json 2>/dev/null; then
        print_status "OK" "ACME certificate file exists"

        # Check if certificates are present
        cert_count=$(docker exec scamnemesis-traefik cat /letsencrypt/acme.json 2>/dev/null | grep -o '"Certificates"' | wc -l)
        if [ "$cert_count" -gt 0 ]; then
            print_status "OK" "SSL certificates are present"
        else
            print_status "WARN" "No SSL certificates found yet (may still be provisioning)"
        fi
    else
        print_status "WARN" "ACME certificate file not found (initial setup)"
    fi
else
    print_status "FAIL" "Traefik is not running"
fi
echo ""

# =============================================================================
# 7. Check network connectivity
# =============================================================================
echo -e "${BLUE}[7/10] Checking network connectivity...${NC}"

# Check if network exists
if docker network ls | grep -q "scamnemesis_network_prod"; then
    print_status "OK" "Docker network exists"

    # Check container connections
    connected=$(docker network inspect scamnemesis_network_prod --format='{{len .Containers}}')
    if [ "$connected" -gt 0 ]; then
        print_status "OK" "$connected containers connected to network"
    else
        print_status "WARN" "No containers connected to network"
    fi
else
    print_status "FAIL" "Docker network not found"
fi
echo ""

# =============================================================================
# 8. Check persistent volumes
# =============================================================================
echo -e "${BLUE}[8/10] Checking persistent volumes...${NC}"

VOLUMES=(
    "scamnemesis_traefik_certs_prod"
    "scamnemesis_postgres_data_prod"
    "scamnemesis_redis_data_prod"
    "scamnemesis_minio_data_prod"
)

for volume in "${VOLUMES[@]}"; do
    if docker volume ls | grep -q "$volume"; then
        print_status "OK" "$volume exists"
    else
        print_status "WARN" "$volume not found (will be created on first run)"
    fi
done
echo ""

# =============================================================================
# 9. Check exposed ports
# =============================================================================
echo -e "${BLUE}[9/10] Checking exposed ports...${NC}"

# Check if ports 80 and 443 are listening
if docker ps --format '{{.Ports}}' | grep -q "0.0.0.0:80"; then
    print_status "OK" "Port 80 (HTTP) is exposed"
else
    print_status "FAIL" "Port 80 (HTTP) is not exposed"
fi

if docker ps --format '{{.Ports}}' | grep -q "0.0.0.0:443"; then
    print_status "OK" "Port 443 (HTTPS) is exposed"
else
    print_status "FAIL" "Port 443 (HTTPS) is not exposed"
fi
echo ""

# =============================================================================
# 10. Test application endpoints
# =============================================================================
echo -e "${BLUE}[10/10] Testing application endpoints...${NC}"

# Test health endpoint through Traefik (if DOMAIN is set)
if grep -q "^DOMAIN=" .env; then
    DOMAIN=$(grep "^DOMAIN=" .env | cut -d'=' -f2)

    # Test HTTP (should redirect to HTTPS)
    if curl -s -I "http://${DOMAIN}" -m 5 | grep -q "301\|302\|307\|308"; then
        print_status "OK" "HTTP to HTTPS redirect working"
    else
        print_status "WARN" "HTTP redirect not working (may need DNS propagation)"
    fi

    # Test HTTPS health endpoint (allow self-signed during initial setup)
    if curl -s -k "https://${DOMAIN}/api/v1/health" -m 5 | grep -q "ok\|healthy"; then
        print_status "OK" "Application health endpoint responding"
    else
        print_status "WARN" "Health endpoint not responding (application may still be starting)"
    fi
else
    print_status "WARN" "DOMAIN not set in .env, skipping endpoint tests"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}============================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warnings found${NC}"
    echo -e "${YELLOW}Review warnings above. System is operational but may need attention.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS errors found${NC}"
    echo -e "${YELLOW}⚠ $WARNINGS warnings found${NC}"
    echo -e "${RED}Fix errors before proceeding to production.${NC}"
    exit 1
fi
