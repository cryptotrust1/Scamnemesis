#!/bin/bash
# ScamNemesis Deployment Verification Script
# Run this after deployment to verify everything is working

set -e

echo "=========================================="
echo "ScamNemesis Deployment Verification"
echo "=========================================="

cd /var/www/Scamnemesis

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Check .env DOMAIN for newlines
echo -e "\n[1/6] Checking DOMAIN in .env..."
DOMAIN_VALUE=$(grep "^DOMAIN=" .env | cut -d= -f2)
if echo "$DOMAIN_VALUE" | grep -q $'\n\|'$'\r'; then
    echo -e "${RED}FAIL: DOMAIN contains newline characters!${NC}"
    echo "Fix: sed -i 's/${DOMAIN_VALUE}.*/scamnemesis.com/' .env"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}OK: DOMAIN='${DOMAIN_VALUE}'${NC}"
fi

# 2. Check container status
echo -e "\n[2/6] Checking container status..."
UNHEALTHY=$(docker compose -f docker-compose.prod.yml ps 2>/dev/null | grep -c "unhealthy\|Exit" || true)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${YELLOW}WARNING: $UNHEALTHY containers are unhealthy or exited${NC}"
    docker compose -f docker-compose.prod.yml ps
else
    RUNNING=$(docker compose -f docker-compose.prod.yml ps --status running -q | wc -l)
    echo -e "${GREEN}OK: $RUNNING containers running${NC}"
fi

# 3. Check Traefik for routing errors
echo -e "\n[3/6] Checking Traefik logs for errors..."
TRAEFIK_ERRORS=$(docker compose -f docker-compose.prod.yml logs traefik --tail=50 2>&1 | grep -c "invalid.*hostname\|not a valid hostname" || true)
if [ "$TRAEFIK_ERRORS" -gt 0 ]; then
    echo -e "${RED}FAIL: Traefik has hostname errors!${NC}"
    docker compose -f docker-compose.prod.yml logs traefik --tail=10 | grep -i "hostname"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}OK: No Traefik routing errors${NC}"
fi

# 4. Check app health endpoint
echo -e "\n[4/6] Checking app health..."
HEALTH_RESPONSE=$(docker compose -f docker-compose.prod.yml exec -T app curl -s http://localhost:3000/api/v1/health 2>/dev/null || echo "FAILED")
if echo "$HEALTH_RESPONSE" | grep -q "ok\|healthy\|status"; then
    echo -e "${GREEN}OK: App health endpoint responding${NC}"
else
    echo -e "${RED}FAIL: App health endpoint not responding${NC}"
    echo "Response: $HEALTH_RESPONSE"
    ERRORS=$((ERRORS+1))
fi

# 5. Check external HTTPS access
echo -e "\n[5/6] Checking external HTTPS access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${DOMAIN_VALUE}/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}OK: https://${DOMAIN_VALUE}/ returns HTTP $HTTP_CODE${NC}"
else
    echo -e "${RED}FAIL: https://${DOMAIN_VALUE}/ returns HTTP $HTTP_CODE${NC}"
    ERRORS=$((ERRORS+1))
fi

# 6. Check www redirect
echo -e "\n[6/6] Checking www subdomain..."
WWW_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://www.${DOMAIN_VALUE}/" 2>/dev/null || echo "000")
if [ "$WWW_CODE" = "200" ] || [ "$WWW_CODE" = "301" ] || [ "$WWW_CODE" = "302" ]; then
    echo -e "${GREEN}OK: https://www.${DOMAIN_VALUE}/ returns HTTP $WWW_CODE${NC}"
else
    echo -e "${YELLOW}WARNING: https://www.${DOMAIN_VALUE}/ returns HTTP $WWW_CODE${NC}"
fi

# Summary
echo -e "\n=========================================="
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}ALL CHECKS PASSED!${NC}"
    echo "Website is operational."
else
    echo -e "${RED}$ERRORS CHECK(S) FAILED!${NC}"
    echo "Please review errors above and fix them."
    exit 1
fi
echo "=========================================="
