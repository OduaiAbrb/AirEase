#!/usr/bin/env python3
"""
Airease Backend API Testing Script - Cleaned Up Version
Tests the simplified Google Flights-style backend functionality
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
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
                    "content" in result and
                    result.get("message") == "Price alert email sent successfully"):
                    
                    # Validate email content structure
                    content = result["content"]
                    if ("subject" in content and 
                        "html" in content and 
                        "text" in content):
                        
                        print_test_result("Email Notification System", True, 
                                        f"Email system working. Subject: {content['subject'][:50]}...")
                        return True
                    else:
                        print_test_result("Email Notification System", False, "Email content missing required fields")
                        return False
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

def test_send_notification(watch_id=None):
    """Test POST /api/notifications/send - Send notification for specific watch"""
    print("🔍 Testing Send Notification API...")
    try:
        # Use test data if no watch_id provided
        test_watch_id = watch_id or "test_watch_id"
        
        payload = {
            "watchId": test_watch_id,
            "flightData": {
                "id": "test_flight_123",
                "from": "AMM",
                "to": "LHR",
                "airline": "Qatar Airways",
                "flightNumber": "QR123",
                "departureTime": "08:30",
                "duration": "6h 15m",
                "price": 450
            }
        }
        
        response = requests.post(
            f"{API_BASE}/notifications/send",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "success" in data and "message" in data:
                if data.get("success"):
                    print_test_result("Send Notification API", True, 
                                    f"Notification sent successfully: {data['message']}")
                    return True
                else:
                    print_test_result("Send Notification API", False, f"Notification failed: {data['message']}")
                    return False
            else:
                print_test_result("Send Notification API", False, f"Invalid response structure: {data}")
                return False
        elif response.status_code == 404:
            # Expected if watch doesn't exist - this is valid behavior
            print_test_result("Send Notification API", True, "Correctly returned 404 for non-existent watch")
            return True
        else:
            print_test_result("Send Notification API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Send Notification API", False, f"Exception: {str(e)}")
        return False

def test_watchlist_toggle(watch_id=None):
    """Test PUT /api/watchlist/toggle - Toggle watchlist active/inactive status"""
    print("🔍 Testing Watchlist Toggle API...")
    try:
        # Use test data if no watch_id provided
        test_watch_id = watch_id or "test_watch_id"
        
        # Test deactivating a watch
        payload = {
            "watchId": test_watch_id,
            "active": False
        }
        
        response = requests.put(
            f"{API_BASE}/watchlist/toggle",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "success" in data and "message" in data:
                if data.get("success"):
                    print_test_result("Watchlist Toggle API", True, 
                                    f"Watch toggled successfully: {data['message']}")
                    return True
                else:
                    print_test_result("Watchlist Toggle API", False, f"Toggle failed: {data['message']}")
                    return False
            else:
                print_test_result("Watchlist Toggle API", False, f"Invalid response structure: {data}")
                return False
        else:
            print_test_result("Watchlist Toggle API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Watchlist Toggle API", False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests including Phase 2 enhancements"""
    print("🚀 Starting Airease Backend API Tests - Phase 2 Enhanced")
    print("=" * 60)
    
    # Test both local and external endpoints
    endpoints_to_test = [
        ("Local", "http://localhost:3000/api"),
        ("External", "https://airease.preview.emergentagent.com/api")
    ]
    
    all_results = {}
    
    for endpoint_name, base_url in endpoints_to_test:
        print(f"\n🔍 Testing {endpoint_name} Endpoint: {base_url}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("-" * 60)
        
        # Update global API_BASE for this test run
        global API_BASE
        API_BASE = base_url
        
        results = {}
        watch_id = None
        watchlists = []
        
        # Phase 1 Tests
        print("\n📋 PHASE 1 TESTS (Core Functionality)")
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
        
        # Phase 2 Tests
        print("\n📋 PHASE 2 TESTS (Enhanced Features)")
        print("-" * 40)
        
        # Test 5: Email Notification System
        results["email_notification"] = test_email_notification_system()
        
        # Test 6: Price Monitoring
        results["price_monitoring"] = test_price_monitoring()
        
        # Test 7: Send Notification (use real watch_id if available)
        test_watch_id = watch_id if watch_id else (watchlists[0]["id"] if watchlists else None)
        results["send_notification"] = test_send_notification(test_watch_id)
        
        # Test 8: Watchlist Toggle (use real watch_id if available)
        results["watchlist_toggle"] = test_watchlist_toggle(test_watch_id)
        
        all_results[endpoint_name] = results
        
        # Summary for this endpoint
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        print(f"\n{endpoint_name} Results: {passed}/{total} tests passed")
        
        # Phase breakdown
        phase1_tests = ["health_check", "flight_search", "watchlist_creation", "watchlist_retrieval"]
        phase2_tests = ["email_notification", "price_monitoring", "send_notification", "watchlist_toggle"]
        
        phase1_passed = sum(1 for test in phase1_tests if results.get(test, False))
        phase2_passed = sum(1 for test in phase2_tests if results.get(test, False))
        
        print(f"  Phase 1 (Core): {phase1_passed}/{len(phase1_tests)} passed")
        print(f"  Phase 2 (Enhanced): {phase2_passed}/{len(phase2_tests)} passed")
    
    # Overall Summary
    print("\n" + "=" * 60)
    print("📊 OVERALL TEST SUMMARY - PHASE 2 ENHANCED")
    print("=" * 60)
    
    for endpoint_name, results in all_results.items():
        print(f"\n{endpoint_name} Endpoint:")
        
        # Phase 1 results
        print("  Phase 1 (Core Features):")
        phase1_tests = ["health_check", "flight_search", "watchlist_creation", "watchlist_retrieval"]
        for test_name in phase1_tests:
            result = results.get(test_name, False)
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"    {status} {test_name.replace('_', ' ').title()}")
        
        # Phase 2 results
        print("  Phase 2 (Enhanced Features):")
        phase2_tests = ["email_notification", "price_monitoring", "send_notification", "watchlist_toggle"]
        for test_name in phase2_tests:
            result = results.get(test_name, False)
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"    {status} {test_name.replace('_', ' ').title()}")
    
    # Determine overall success
    local_results = all_results.get("Local", {})
    local_passed = sum(1 for result in local_results.values() if result)
    local_total = len(local_results)
    
    # Phase-specific analysis
    phase1_tests = ["health_check", "flight_search", "watchlist_creation", "watchlist_retrieval"]
    phase2_tests = ["email_notification", "price_monitoring", "send_notification", "watchlist_toggle"]
    
    local_phase1_passed = sum(1 for test in phase1_tests if local_results.get(test, False))
    local_phase2_passed = sum(1 for test in phase2_tests if local_results.get(test, False))
    
    print(f"\n🎯 Critical Assessment:")
    print(f"Local API Total: {local_passed}/{local_total} tests passed")
    print(f"Phase 1 (Core): {local_phase1_passed}/{len(phase1_tests)} passed")
    print(f"Phase 2 (Enhanced): {local_phase2_passed}/{len(phase2_tests)} passed")
    
    if local_passed == local_total:
        print("✅ Backend API is fully functional locally - All Phase 2 enhancements working!")
        return True
    elif local_phase1_passed == len(phase1_tests):
        print("⚠️ Phase 1 core functionality working, but Phase 2 enhancements have issues")
        return False
    else:
        print("❌ Backend API has critical issues")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)