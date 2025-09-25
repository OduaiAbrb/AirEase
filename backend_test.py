#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Airease Application
Testing the completely rebuilt application with Emergent LLM integration for PRODUCTION environment
"""

import requests
import json
import time
import os
import sys
from datetime import datetime

# Production URL configuration
BASE_URL = "https://airease.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_health_check():
    """Test GET /api/ - Health check endpoint"""
    print("🔍 Testing API Health Check...")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        
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
            "email": "test@airease.com"
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
                required_fields = ["id", "from", "to", "targetPrice", "active", "createdAt", "lastCheck"]
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
                            return True, watchlists
                        else:
                            print_test_result("Watchlist Retrieval API", False, f"Missing fields in watchlist data: {missing_fields}")
                            return False, []
                    else:
                        print_test_result("Watchlist Retrieval API", True, "Retrieved empty watchlist (valid state)")
                        return True, []
                else:
                    print_test_result("Watchlist Retrieval API", False, "Watchlists is not a list")
                    return False, []
            else:
                print_test_result("Watchlist Retrieval API", False, f"Invalid response structure: {data}")
                return False, []
        else:
            print_test_result("Watchlist Retrieval API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False, []
            
    except Exception as e:
        print_test_result("Watchlist Retrieval API", False, f"Exception: {str(e)}")
        return False, []

def test_email_notification_system():
    """Test GET /api/notifications/test - Test email notification system"""
    print("🔍 Testing Email Notification System...")
    try:
        response = requests.get(f"{API_BASE}/notifications/test", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "message" in data and "result" in data:
                result = data["result"]
                
                # Check if email service returned expected structure
                if (result.get("success") and 
                    "emailId" in result and 
                    result.get("message") == "Test email sent successfully"):
                    
                    print_test_result("Email Notification System", True, 
                                    f"Email system working. Email ID: {result['emailId']}")
                    return True
                else:
                    print_test_result("Email Notification System", False, f"Invalid email service response: {result}")
                    return False
            else:
                print_test_result("Email Notification System", False, f"Invalid response structure: {data}")
                return False
        else:
            print_test_result("Email Notification System", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Email Notification System", False, f"Exception: {str(e)}")
        return False

def test_price_monitoring():
    """Test GET /api/flights/check-prices - Trigger manual price monitoring"""
    print("🔍 Testing Price Monitoring System...")
    try:
        response = requests.get(f"{API_BASE}/flights/check-prices", timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "message" in data and "result" in data:
                result = data["result"]
                
                # Check if price monitoring returned expected structure
                if (result.get("success") and 
                    "watchesChecked" in result and 
                    "notificationsSent" in result and
                    "timestamp" in result):
                    
                    watches_checked = result["watchesChecked"]
                    notifications_sent = result["notificationsSent"]
                    
                    print_test_result("Price Monitoring System", True, 
                                    f"Checked {watches_checked} watches, sent {notifications_sent} notifications")
                    return True
                else:
                    print_test_result("Price Monitoring System", False, f"Invalid price monitoring response: {result}")
                    return False
            else:
                print_test_result("Price Monitoring System", False, f"Invalid response structure: {data}")
                return False
        else:
            print_test_result("Price Monitoring System", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Price Monitoring System", False, f"Exception: {str(e)}")
        return False


def run_all_tests():
    """Run all backend API tests for cleaned up version"""
    print("🚀 Starting Airease Backend API Tests - Cleaned Up Version")
    print("=" * 60)
    
    print(f"\n🔍 Testing Endpoint: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("-" * 60)
    
    results = {}
    watch_id = None
    watchlists = []
    
    # Core Tests
    print("\n📋 CORE API TESTS (Cleaned Up Version)")
    print("-" * 40)
    
    # Test 1: Health Check
    results["health_check"] = test_health_check()
    
    # Test 2: Flight Search
    results["flight_search"] = test_flight_search()
    
    # Test 3: Watchlist Creation
    watchlist_created, watch_id = test_watchlist_creation()
    results["watchlist_creation"] = watchlist_created
    
    # Test 4: Watchlist Retrieval
    watchlist_retrieved, watchlists = test_watchlist_retrieval()
    results["watchlist_retrieval"] = watchlist_retrieved
    
    # Test 5: Email Notification System
    results["email_notification"] = test_email_notification_system()
    
    # Test 6: Price Monitoring
    results["price_monitoring"] = test_price_monitoring()
    
    # Summary
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Overall Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY - CLEANED UP VERSION")
    print("=" * 60)
    
    print("\nCore API Endpoints:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} {test_name.replace('_', ' ').title()}")
    
    print(f"\n🎯 Assessment:")
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ Backend API is fully functional - All cleaned up endpoints working!")
        return True
    else:
        print(f"❌ Backend API has issues - {total - passed} test(s) failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)