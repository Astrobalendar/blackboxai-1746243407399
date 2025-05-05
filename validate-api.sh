#!/bin/bash

# API Test Script for AstroBalendar
BASE_URL="https://api.astrobalendar.onrender.com"

# Function to test API endpoints
test_endpoint() {
    local endpoint=$1
    local expected_status=$2
    
    echo "Testing $endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo "✅ $endpoint - Success (Status: $response)"
    else
        echo "❌ $endpoint - Failed (Status: $response)"
        exit 1
    fi
}

# Test health check
test_endpoint "/api/health" 200

# Test users endpoint
test_endpoint "/users" 200

# Test events endpoint
test_endpoint "/events" 200

# Test predict endpoint
test_endpoint "/predict" 405  # Should return 405 for GET request

# Test MongoDB connection
if curl -s "$BASE_URL/db-status" | grep -q '"status":"healthy"'; then
    echo "✅ MongoDB connection - Success"
else
    echo "❌ MongoDB connection - Failed"
    exit 1
fi

# Test CORS headers
cors_test=$(curl -s -I -H "Origin: https://astrobalendar.netlify.app" "$BASE_URL/api/health" | grep -i "Access-Control-Allow-Origin")
if [ -n "$cors_test" ]; then
    echo "✅ CORS headers - Success"
else
    echo "❌ CORS headers - Failed"
    exit 1
fi

# Test rate limiting
for i in {1..105}; do
    if [ $i -eq 101 ]; then
        echo "Testing rate limiting..."
    fi
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
    if [ $i -eq 101 ] && [ "$status" -eq 429 ]; then
        echo "✅ Rate limiting - Success"
        break
    elif [ $i -eq 105 ]; then
        echo "❌ Rate limiting - Failed"
        exit 1
    fi
done

echo "All tests completed successfully!"
