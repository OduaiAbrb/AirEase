#!/usr/bin/env python3
"""
Airease Backend API Testing Script
Tests all backend API endpoints for functionality and data integrity
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment - test locally first
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_health_check():
    """Test GET /api - Basic health check"""
    print("🔍 Testing API Health Check...")
    try:
        response = requests.get(f"{API_BASE}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            expected_message = "Airease API is running!"
            
            if data.get("message") == expected_message:
                print_test_result("Health Check Endpoint", True, f"Response: {data}")
                return True
            else:
                print_test_result("Health Check Endpoint", False, f"Unexpected message: {data}")
                return False
        else:
            print_test_result("Health Check Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Health Check Endpoint", False, f"Exception: {str(e)}")
        return False

def test_flight_search():
    """Test POST /api/flights/search - Flight search endpoint"""
    print("🔍 Testing Flight Search API...")
    try:
        # Test payload as specified in requirements
        payload = {
            "from": "AMM",
            "to": "LHR", 
            "departDate": "2025-12-01",
            "maxPrice": 600
        }
        
        response = requests.post(
            f"{API_BASE}/flights/search",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "flights" in data and "searchParams" in data and "timestamp" in data:
                flights = data["flights"]
                
                # Should return 6 mock flights as per implementation
                if len(flights) == 6:
                    # Validate flight data structure
                    first_flight = flights[0]
                    required_fields = ["id", "from", "to", "airline", "flightNumber", 
                                     "departureTime", "arrivalTime", "duration", "price", "stops", "baggage"]
                    
                    missing_fields = [field for field in required_fields if field not in first_flight]
                    
                    if not missing_fields:
                        # Check if flights are sorted by price (as per implementation)
                        prices = [flight["price"] for flight in flights]
                        is_sorted = all(prices[i] <= prices[i+1] for i in range(len(prices)-1))
                        
                        if is_sorted:
                            print_test_result("Flight Search API", True, 
                                            f"Returned {len(flights)} flights, properly sorted by price. Sample flight: {first_flight['airline']} {first_flight['flightNumber']} - ${first_flight['price']}")
                            return True
                        else:
                            print_test_result("Flight Search API", False, "Flights not sorted by price")
                            return False
                    else:
                        print_test_result("Flight Search API", False, f"Missing fields in flight data: {missing_fields}")
                        return False
                else:
                    print_test_result("Flight Search API", False, f"Expected 6 flights, got {len(flights)}")
                    return False
            else:
                print_test_result("Flight Search API", False, f"Invalid response structure: {data}")
                return False
        else:
            print_test_result("Flight Search API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Flight Search API", False, f"Exception: {str(e)}")
        return False

def test_watchlist_creation():
    """Test POST /api/watchlist - Create flight watch"""
    print("🔍 Testing Watchlist Creation API...")
    try:
        # Create realistic watchlist data
        payload = {
            "from": "AMM",
            "to": "LHR",
            "departDate": "2025-12-01",
            "targetPrice": 500,
            "email": "test@airease.com",
            "notificationPreference": "email"
        }
        
        response = requests.post(
            f"{API_BASE}/watchlist",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if data.get("success") and "watch" in data and "message" in data:
                watch = data["watch"]
                
                # Validate watch data structure
                required_fields = ["id", "from", "to", "departDate", "targetPrice", "active", "createdAt", "lastCheck"]
                missing_fields = [field for field in required_fields if field not in watch]
                
                if not missing_fields:
                    # Validate data integrity
                    if (watch["from"] == payload["from"] and 
                        watch["to"] == payload["to"] and
                        watch["targetPrice"] == payload["targetPrice"] and
                        watch["active"] == True):
                        
                        print_test_result("Watchlist Creation API", True, 
                                        f"Created watchlist: {watch['from']} → {watch['to']} at ${watch['targetPrice']}. ID: {watch['id']}")
                        return True, watch["id"]
                    else:
                        print_test_result("Watchlist Creation API", False, "Data integrity mismatch")
                        return False, None
                else:
                    print_test_result("Watchlist Creation API", False, f"Missing fields in watch data: {missing_fields}")
                    return False, None
            else:
                print_test_result("Watchlist Creation API", False, f"Invalid response structure: {data}")
                return False, None
        else:
            print_test_result("Watchlist Creation API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False, None
            
    except Exception as e:
        print_test_result("Watchlist Creation API", False, f"Exception: {str(e)}")
        return False, None

def test_watchlist_retrieval():
    """Test GET /api/watchlist - Get all watchlists"""
    print("🔍 Testing Watchlist Retrieval API...")
    try:
        response = requests.get(f"{API_BASE}/watchlist", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "watchlists" in data:
                watchlists = data["watchlists"]
                
                if isinstance(watchlists, list):
                    if len(watchlists) > 0:
                        # Validate watchlist structure
                        first_watch = watchlists[0]
                        required_fields = ["id", "from", "to", "targetPrice", "active", "createdAt"]
                        missing_fields = [field for field in required_fields if field not in first_watch]
                        
                        if not missing_fields:
                            print_test_result("Watchlist Retrieval API", True, 
                                            f"Retrieved {len(watchlists)} watchlists. Sample: {first_watch['from']} → {first_watch['to']} at ${first_watch['targetPrice']}")
                            return True
                        else:
                            print_test_result("Watchlist Retrieval API", False, f"Missing fields in watchlist data: {missing_fields}")
                            return False
                    else:
                        print_test_result("Watchlist Retrieval API", True, "Retrieved empty watchlist (valid state)")
                        return True
                else:
                    print_test_result("Watchlist Retrieval API", False, "Watchlists is not a list")
                    return False
            else:
                print_test_result("Watchlist Retrieval API", False, f"Invalid response structure: {data}")
                return False
        else:
            print_test_result("Watchlist Retrieval API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Watchlist Retrieval API", False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting Airease Backend API Tests")
    print("=" * 50)
    
    # Test both local and external endpoints
    endpoints_to_test = [
        ("Local", "http://localhost:3000/api"),
        ("External", "https://airease.preview.emergentagent.com/api")
    ]
    
    all_results = {}
    
    for endpoint_name, base_url in endpoints_to_test:
        print(f"\n🔍 Testing {endpoint_name} Endpoint: {base_url}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("-" * 50)
        
        # Update global API_BASE for this test run
        global API_BASE
        API_BASE = base_url
        
        results = {}
        
        # Test 1: Health Check
        results["health_check"] = test_health_check()
        
        # Test 2: Flight Search
        results["flight_search"] = test_flight_search()
        
        # Test 3: Watchlist Creation
        watchlist_created, watch_id = test_watchlist_creation()
        results["watchlist_creation"] = watchlist_created
        
        # Test 4: Watchlist Retrieval
        results["watchlist_retrieval"] = test_watchlist_retrieval()
        
        all_results[endpoint_name] = results
        
        # Summary for this endpoint
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        print(f"\n{endpoint_name} Results: {passed}/{total} tests passed")
    
    # Overall Summary
    print("\n" + "=" * 50)
    print("📊 OVERALL TEST SUMMARY")
    print("=" * 50)
    
    for endpoint_name, results in all_results.items():
        print(f"\n{endpoint_name} Endpoint:")
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} {test_name.replace('_', ' ').title()}")
    
    # Determine overall success
    local_results = all_results.get("Local", {})
    local_passed = sum(1 for result in local_results.values() if result)
    local_total = len(local_results)
    
    print(f"\n🎯 Critical Assessment:")
    print(f"Local API: {local_passed}/{local_total} tests passed")
    
    if local_passed == local_total:
        print("✅ Backend API is fully functional locally")
        return True
    else:
        print("❌ Backend API has issues")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)