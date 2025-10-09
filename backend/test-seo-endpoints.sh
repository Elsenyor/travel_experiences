#!/bin/bash

# Script de prueba para endpoints SEO
# Verifica que sitemap.xml y robots.txt funcionen correctamente

echo "🔍 Probando endpoints SEO..."
echo "========================================"
echo ""

BASE_URL="http://localhost:3000"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para probar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    echo -n "Probando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
    fi
}

# Función para mostrar contenido
show_content() {
    local url=$1
    local name=$2
    local lines=${3:-20}
    
    echo ""
    echo -e "${YELLOW}📄 Primeras $lines líneas de $name:${NC}"
    echo "----------------------------------------"
    curl -s "$url" | head -n $lines
    echo "----------------------------------------"
    echo ""
}

# Probar endpoints
echo "1. Probando conectividad..."
test_endpoint "$BASE_URL/health" "Health Check"
echo ""

echo "2. Probando endpoints SEO..."
test_endpoint "$BASE_URL/sitemap.xml" "Sitemap principal"
test_endpoint "$BASE_URL/sitemap-index.xml" "Sitemap index"
test_endpoint "$BASE_URL/sitemap-trips.xml" "Sitemap de viajes"
test_endpoint "$BASE_URL/sitemap-articles.xml" "Sitemap de artículos"
test_endpoint "$BASE_URL/robots.txt" "Robots.txt"
echo ""

# Mostrar contenido
echo "3. Mostrando contenido..."
show_content "$BASE_URL/robots.txt" "robots.txt" 30
show_content "$BASE_URL/sitemap.xml" "sitemap.xml" 25

echo ""
echo "========================================"
echo -e "${GREEN}✅ Pruebas completadas!${NC}"
echo ""
echo "📝 Para ver el contenido completo:"
echo "   - Sitemap: $BASE_URL/sitemap.xml"
echo "   - Robots: $BASE_URL/robots.txt"
echo ""
echo "🌐 Abrir en navegador:"
echo "   - curl $BASE_URL/sitemap.xml"
echo "   - curl $BASE_URL/robots.txt"
echo ""

