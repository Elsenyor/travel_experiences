#!/bin/bash

# Test Slug Implementation
# This script tests the slug functionality for trips and articles

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testing Slug Implementation ===${NC}\n"

# Note: You need to replace YOUR_AUTH_TOKEN with a valid admin token
# Get token by logging in first
AUTH_TOKEN="YOUR_AUTH_TOKEN"

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

echo -e "${YELLOW}--- Test 1: Create Trip with Auto-generated Slug ---${NC}"
RESPONSE=$(curl -s -X POST "$API_BASE/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "destination": "Test Destination",
    "trip_type": "cultural",
    "price": 1000,
    "translations": [{
      "language": "es",
      "title": "Viaje de Prueba con Slug Automático",
      "description": "Descripción de prueba",
      "itinerary": "Itinerario de prueba"
    }]
  }')

echo "$RESPONSE" | jq '.'
SLUG=$(echo "$RESPONSE" | jq -r '.data.slug')
TRIP_ID=$(echo "$RESPONSE" | jq -r '.data.id')

if [[ "$SLUG" == "viaje-de-prueba-con-slug-automatico" ]]; then
    print_result 0 "Slug auto-generado correctamente: $SLUG"
else
    print_result 1 "Error generando slug automático. Expected: 'viaje-de-prueba-con-slug-automatico', Got: '$SLUG'"
fi

echo -e "\n${YELLOW}--- Test 2: Create Trip with Custom Slug ---${NC}"
RESPONSE=$(curl -s -X POST "$API_BASE/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "destination": "Test Destination 2",
    "trip_type": "adventure",
    "price": 1500,
    "slug": "mi-slug-personalizado-2025",
    "translations": [{
      "language": "es",
      "title": "Viaje con Slug Personalizado",
      "description": "Descripción de prueba",
      "itinerary": "Itinerario de prueba"
    }]
  }')

echo "$RESPONSE" | jq '.'
CUSTOM_SLUG=$(echo "$RESPONSE" | jq -r '.data.slug')
TRIP_ID_2=$(echo "$RESPONSE" | jq -r '.data.id')

if [[ "$CUSTOM_SLUG" == "mi-slug-personalizado-2025" ]]; then
    print_result 0 "Slug personalizado aplicado correctamente: $CUSTOM_SLUG"
else
    print_result 1 "Error aplicando slug personalizado. Expected: 'mi-slug-personalizado-2025', Got: '$CUSTOM_SLUG'"
fi

echo -e "\n${YELLOW}--- Test 3: Test Slug with Special Characters ---${NC}"
RESPONSE=$(curl -s -X POST "$API_BASE/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "destination": "Test Destination 3",
    "trip_type": "cultural",
    "price": 1200,
    "translations": [{
      "language": "es",
      "title": "¡Viaje a Japón - Aventura 2025!",
      "description": "Descripción de prueba",
      "itinerary": "Itinerario de prueba"
    }]
  }')

echo "$RESPONSE" | jq '.'
SPECIAL_SLUG=$(echo "$RESPONSE" | jq -r '.data.slug')
TRIP_ID_3=$(echo "$RESPONSE" | jq -r '.data.id')

if [[ "$SPECIAL_SLUG" == "viaje-a-japon-aventura-2025" ]]; then
    print_result 0 "Slug con caracteres especiales sanitizado correctamente: $SPECIAL_SLUG"
else
    print_result 1 "Error sanitizando caracteres especiales. Expected: 'viaje-a-japon-aventura-2025', Got: '$SPECIAL_SLUG'"
fi

echo -e "\n${YELLOW}--- Test 4: Test Duplicate Slug (Auto-increment) ---${NC}"
RESPONSE=$(curl -s -X POST "$API_BASE/trips" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "destination": "Test Destination 4",
    "trip_type": "cultural",
    "price": 1000,
    "slug": "mi-slug-personalizado-2025",
    "translations": [{
      "language": "es",
      "title": "Otro Viaje",
      "description": "Descripción de prueba",
      "itinerary": "Itinerario de prueba"
    }]
  }')

echo "$RESPONSE" | jq '.'
DUPLICATE_SLUG=$(echo "$RESPONSE" | jq -r '.data.slug')
TRIP_ID_4=$(echo "$RESPONSE" | jq -r '.data.id')

if [[ "$DUPLICATE_SLUG" == "mi-slug-personalizado-2025-1" ]]; then
    print_result 0 "Slug duplicado manejado correctamente con sufijo: $DUPLICATE_SLUG"
else
    print_result 1 "Error manejando slug duplicado. Expected suffix '-1', Got: '$DUPLICATE_SLUG'"
fi

echo -e "\n${YELLOW}--- Test 5: Update Slug ---${NC}"
if [[ ! -z "$TRIP_ID" && "$TRIP_ID" != "null" ]]; then
    RESPONSE=$(curl -s -X PUT "$API_BASE/trips/$TRIP_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d '{
        "slug": "slug-actualizado-test"
      }')

    echo "$RESPONSE" | jq '.'
    UPDATED_SLUG=$(echo "$RESPONSE" | jq -r '.data.slug')

    if [[ "$UPDATED_SLUG" == "slug-actualizado-test" ]]; then
        print_result 0 "Slug actualizado correctamente: $UPDATED_SLUG"
    else
        print_result 1 "Error actualizando slug. Expected: 'slug-actualizado-test', Got: '$UPDATED_SLUG'"
    fi
else
    print_result 1 "No se pudo obtener TRIP_ID para test de actualización"
fi

echo -e "\n${YELLOW}--- Test 6: Create Article with Auto-generated Slug ---${NC}"
RESPONSE=$(curl -s -X POST "$API_BASE/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "author_id": 1,
    "featured_image": "https://example.com/image.jpg",
    "translations": [{
      "language": "es",
      "title": "Qué ver en Bali - Guía Completa 2025",
      "content": "Contenido del artículo..."
    }]
  }')

echo "$RESPONSE" | jq '.'
ARTICLE_SLUG=$(echo "$RESPONSE" | jq -r '.data.slug')
ARTICLE_ID=$(echo "$RESPONSE" | jq -r '.data.id')

if [[ "$ARTICLE_SLUG" == "que-ver-en-bali-guia-completa-2025" ]]; then
    print_result 0 "Slug de artículo generado correctamente: $ARTICLE_SLUG"
else
    print_result 1 "Error generando slug de artículo. Expected: 'que-ver-en-bali-guia-completa-2025', Got: '$ARTICLE_SLUG'"
fi

echo -e "\n${YELLOW}--- Cleanup: Delete Test Records ---${NC}"

# Delete test trips
if [[ ! -z "$TRIP_ID" && "$TRIP_ID" != "null" ]]; then
    curl -s -X DELETE "$API_BASE/trips/$TRIP_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    print_result 0 "Deleted test trip 1"
fi

if [[ ! -z "$TRIP_ID_2" && "$TRIP_ID_2" != "null" ]]; then
    curl -s -X DELETE "$API_BASE/trips/$TRIP_ID_2" \
      -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    print_result 0 "Deleted test trip 2"
fi

if [[ ! -z "$TRIP_ID_3" && "$TRIP_ID_3" != "null" ]]; then
    curl -s -X DELETE "$API_BASE/trips/$TRIP_ID_3" \
      -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    print_result 0 "Deleted test trip 3"
fi

if [[ ! -z "$TRIP_ID_4" && "$TRIP_ID_4" != "null" ]]; then
    curl -s -X DELETE "$API_BASE/trips/$TRIP_ID_4" \
      -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    print_result 0 "Deleted test trip 4"
fi

if [[ ! -z "$ARTICLE_ID" && "$ARTICLE_ID" != "null" ]]; then
    curl -s -X DELETE "$API_BASE/articles/$ARTICLE_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
    print_result 0 "Deleted test article"
fi

echo -e "\n${GREEN}=== All Tests Completed ===${NC}\n"

echo -e "${YELLOW}Note:${NC} To run these tests, you need to:"
echo "1. Have the server running on $BASE_URL"
echo "2. Replace YOUR_AUTH_TOKEN with a valid admin token"
echo "3. Make the script executable: chmod +x test-slug-implementation.sh"
echo "4. Run the script: ./test-slug-implementation.sh"


