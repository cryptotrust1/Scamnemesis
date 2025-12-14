#!/bin/bash
# =============================================================================
# SCAMNEMESIS PRODUCTION DEBUG SCRIPT
# Run this on your Hetzner server (77.42.44.140) to diagnose issues
# =============================================================================

set -e

echo "=========================================="
echo "SCAMNEMESIS PRODUCTION DEBUG"
echo "=========================================="
echo ""

cd /var/www/Scamnemesis || { echo "ERROR: Directory /var/www/Scamnemesis not found"; exit 1; }

echo "1. CHECKING .ENV FILE"
echo "----------------------------------------"
if [ -f .env ]; then
    echo "✓ .env file exists"
    echo ""
    echo "DOMAIN value:"
    grep "^DOMAIN=" .env || echo "⚠️  DOMAIN not set! This will default to 'localhost'"
    echo ""
    echo "ACME_EMAIL value:"
    grep "^ACME_EMAIL=" .env || echo "⚠️  ACME_EMAIL not set!"
else
    echo "❌ .env file NOT FOUND!"
fi
echo ""

echo "2. CHECKING DOCKER CONTAINERS"
echo "----------------------------------------"
docker compose -f docker-compose.prod.yml ps
echo ""

echo "3. CHECKING CONTAINER HEALTH STATUS"
echo "----------------------------------------"
for container in scamnemesis-app scamnemesis-traefik scamnemesis-postgres scamnemesis-redis scamnemesis-minio; do
    if docker ps -q -f name=$container > /dev/null 2>&1; then
        health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "no healthcheck")
        status=$(docker inspect --format='{{.State.Status}}' $container 2>/dev/null || echo "unknown")
        echo "$container: status=$status, health=$health"
    else
        echo "$container: ❌ NOT RUNNING"
    fi
done
echo ""

echo "4. CHECKING APP CONTAINER LOGS (last 50 lines)"
echo "----------------------------------------"
docker compose -f docker-compose.prod.yml logs app --tail=50 2>&1 || echo "Failed to get app logs"
echo ""

echo "5. CHECKING TRAEFIK LOGS (last 30 lines)"
echo "----------------------------------------"
docker compose -f docker-compose.prod.yml logs traefik --tail=30 2>&1 || echo "Failed to get traefik logs"
echo ""

echo "6. TESTING INTERNAL HEALTH ENDPOINT"
echo "----------------------------------------"
echo "From inside app container:"
docker compose -f docker-compose.prod.yml exec -T app curl -sf http://localhost:3000/api/v1/health 2>&1 || echo "❌ Health check FAILED inside container"
echo ""

echo "7. TESTING TRAEFIK -> APP CONNECTION"
echo "----------------------------------------"
echo "From inside traefik container:"
docker compose -f docker-compose.prod.yml exec -T traefik wget -qO- http://app:3000/api/v1/health 2>&1 || echo "❌ Traefik cannot reach app"
echo ""

echo "8. CHECKING DOCKER NETWORKS"
echo "----------------------------------------"
echo "Networks:"
docker network ls | grep scamnemesis
echo ""
echo "Containers on scamnemesis_network_prod:"
docker network inspect scamnemesis_network_prod --format='{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || echo "Network not found"
echo ""

echo "9. CHECKING TRAEFIK ROUTERS (if API enabled)"
echo "----------------------------------------"
docker compose -f docker-compose.prod.yml exec -T traefik wget -qO- http://localhost:8080/api/rawdata 2>&1 | head -100 || echo "Traefik API not accessible (dashboard disabled)"
echo ""

echo "10. CHECKING DISK SPACE"
echo "----------------------------------------"
df -h / | tail -1
echo ""

echo "11. CHECKING MEMORY"
echo "----------------------------------------"
free -h | head -2
echo ""

echo "12. EXTERNAL CONNECTIVITY TEST"
echo "----------------------------------------"
echo "Testing from server to scamnemesis.com:"
curl -sI https://scamnemesis.com 2>&1 | head -5 || echo "Failed to connect"
echo ""

echo "=========================================="
echo "DEBUG COMPLETE"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo "1. If DOMAIN is 'localhost' or missing, set it in GitHub Secrets and redeploy"
echo "2. If app container is unhealthy, check the logs above for errors"
echo "3. If traefik cannot reach app, check Docker network configuration"
echo "4. Share this output for further analysis"
