#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Airease Application
Testing all new enhancements including missed flight recovery and enhanced realistic data
"""

import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta

# Production URL configuration
BASE_URL = "https://tripmonitor-2.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class AireaseProductionTester:
    def __init__(self):
        self.test_results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Airease-Production-Tester/1.0'
        })
        
    def log_test(self, test_name, success, details, response_data=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()

    def test_api_health_check(self):
        """Test 1: API Health Check - should return version 2.0 with AI features"""
        try:
            print("🔍 Testing API Health Check...")
            response = self.session.get(f"{API_BASE}/")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check version 2.0
                if data.get('version') == '2.0':
                    version_check = True
                else:
                    version_check = False
                    
                # Check emergentLlm flag
                if data.get('emergentLlm') is True:
                    llm_check = True
                else:
                    llm_check = False
                    
                # Check AI features in features list
                features = data.get('features', [])
                ai_features = ['AI Recommendations', 'Flight Search', 'Price Monitoring', 'Email Alerts']
                features_check = all(feature in features for feature in ai_features)
                
                if version_check and llm_check and features_check:
                    self.log_test(
                        "API Health Check", 
                        True, 
                        f"Version 2.0 with AI features confirmed. Features: {features}",
                        data
                    )
                else:
                    issues = []
                    if not version_check:
                        issues.append(f"Version is {data.get('version')}, expected 2.0")
                    if not llm_check:
                        issues.append(f"emergentLlm is {data.get('emergentLlm')}, expected true")
                    if not features_check:
                        issues.append(f"Missing AI features. Got: {features}")
                    
                    self.log_test(
                        "API Health Check", 
                        False, 
                        f"Issues found: {'; '.join(issues)}",
                        data
                    )
            else:
                self.log_test(
                    "API Health Check", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code, "text": response.text}
                )
                
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")

    def test_flight_search_enhanced(self):
        """Test 2: Flight Search with Enhanced Mock Data"""
        try:
            print("🔍 Testing Enhanced Flight Search...")
            
            search_params = {
                "from": "AMM",
                "to": "LHR", 
                "departDate": "2025-12-01",
                "maxPrice": 600
            }
            
            response = self.session.post(f"{API_BASE}/flights/search", json=search_params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if we got flights
                flights = data.get('flights', [])
                if len(flights) == 6:
                    flights_count_check = True
                else:
                    flights_count_check = False
                
                # Check enhanced mock data features
                enhanced_features_found = 0
                for flight in flights:
                    # Check for quality ratings
                    if 'quality' in flight:
                        enhanced_features_found += 1
                    # Check for amenities
                    if 'amenities' in flight:
                        enhanced_features_found += 1
                    # Check for realistic airline data
                    if flight.get('airline') in ['Qatar Airways', 'Emirates', 'Turkish Airlines', 'Lufthansa', 'British Airways', 'KLM']:
                        enhanced_features_found += 1
                        
                # Check if flights are sorted by price
                prices = [flight.get('price', 0) for flight in flights]
                sorted_check = prices == sorted(prices)
                
                if flights_count_check and enhanced_features_found >= 10 and sorted_check:
                    sample_flight = flights[0] if flights else {}
                    self.log_test(
                        "Enhanced Flight Search", 
                        True, 
                        f"6 flights returned with enhanced data, sorted by price. Sample: {sample_flight.get('airline')} {sample_flight.get('flightNumber')} - ${sample_flight.get('price')}",
                        {"flights_count": len(flights), "sample_flight": sample_flight}
                    )
                else:
                    issues = []
                    if not flights_count_check:
                        issues.append(f"Expected 6 flights, got {len(flights)}")
                    if enhanced_features_found < 10:
                        issues.append(f"Enhanced features insufficient: {enhanced_features_found}/18+ expected")
                    if not sorted_check:
                        issues.append("Flights not sorted by price")
                        
                    self.log_test(
                        "Enhanced Flight Search", 
                        False, 
                        f"Issues: {'; '.join(issues)}",
                        data
                    )
            else:
                self.log_test(
                    "Enhanced Flight Search", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_test("Enhanced Flight Search", False, f"Exception: {str(e)}")

    def test_ai_recommendations(self):
        """Test 3: AI Recommendations using Emergent LLM"""
        try:
            print("🔍 Testing AI Recommendations...")
            
            flight_data = {
                "flightData": {
                    "from": "AMM",
                    "to": "LHR",
                    "airline": "Qatar Airways",
                    "flightNumber": "QR123",
                    "departureTime": "14:30",
                    "price": 445
                }
            }
            
            response = self.session.post(f"{API_BASE}/flights/ai-recommendations", json=flight_data)
            
            if response.status_code == 200:
                data = response.json()
                
                recommendations = data.get('recommendations', {})
                
                # Check for required AI recommendation components
                required_components = ['packingList', 'travelTips', 'timeManagement', 'weatherInfo']
                components_found = sum(1 for comp in required_components if comp in recommendations)
                
                # Check for emergentLlm flag
                emergent_llm_check = recommendations.get('emergentLlm', False)
                ai_generated_check = recommendations.get('aiGenerated', False)
                
                # Check packing list structure
                packing_list = recommendations.get('packingList', {})
                packing_categories = ['clothing', 'weather', 'essentials']
                packing_check = sum(1 for cat in packing_categories if cat in packing_list) >= 2
                
                # Check travel tips
                travel_tips = recommendations.get('travelTips', [])
                tips_check = len(travel_tips) >= 3
                
                if components_found >= 3 and emergent_llm_check and packing_check and tips_check:
                    self.log_test(
                        "AI Recommendations", 
                        True, 
                        f"AI recommendations generated successfully with Emergent LLM. Components: {components_found}/4, Tips: {len(travel_tips)}",
                        {"components": list(recommendations.keys()), "emergentLlm": emergent_llm_check}
                    )
                else:
                    issues = []
                    if components_found < 3:
                        issues.append(f"Missing components: {components_found}/4")
                    if not emergent_llm_check:
                        issues.append("emergentLlm flag not set")
                    if not packing_check:
                        issues.append("Packing list incomplete")
                    if not tips_check:
                        issues.append(f"Insufficient travel tips: {len(travel_tips)}")
                        
                    self.log_test(
                        "AI Recommendations", 
                        False, 
                        f"Issues: {'; '.join(issues)}",
                        data
                    )
            else:
                self.log_test(
                    "AI Recommendations", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_test("AI Recommendations", False, f"Exception: {str(e)}")

    def test_enhanced_email_notifications(self):
        """Test 4: Enhanced Email Notifications with AI"""
        try:
            print("🔍 Testing Enhanced Email Notifications...")
            
            response = self.session.get(f"{API_BASE}/notifications/test")
            
            if response.status_code == 200:
                data = response.json()
                
                result = data.get('result', {})
                
                # Check for AI enhancement indicators
                ai_recommendations = result.get('aiRecommendations')
                success_check = result.get('success', False)
                
                # Check for AI recommendations structure
                if ai_recommendations:
                    # Check for required AI components in recommendations
                    required_components = ['packingList', 'travelTips', 'timeManagement', 'weatherInfo']
                    ai_components_count = sum(1 for comp in required_components if comp in ai_recommendations)
                    
                    # Check for emergentLlm flag
                    emergent_llm_check = ai_recommendations.get('emergentLlm', False)
                    ai_generated_check = ai_recommendations.get('aiGenerated', False)
                    
                    if success_check and ai_components_count >= 3 and emergent_llm_check and ai_generated_check:
                        self.log_test(
                            "Enhanced Email Notifications", 
                            True, 
                            f"AI-enhanced email generated successfully. AI components: {ai_components_count}/4, emergentLlm: {emergent_llm_check}",
                            {"ai_components": ai_components_count, "emergentLlm": emergent_llm_check, "success": success_check}
                        )
                    else:
                        issues = []
                        if not success_check:
                            issues.append("Email sending failed")
                        if ai_components_count < 3:
                            issues.append(f"Insufficient AI components: {ai_components_count}/4")
                        if not emergent_llm_check:
                            issues.append("emergentLlm flag not set")
                        if not ai_generated_check:
                            issues.append("aiGenerated flag not set")
                            
                        self.log_test(
                            "Enhanced Email Notifications", 
                            False, 
                            f"Issues: {'; '.join(issues)}",
                            data
                        )
                else:
                    self.log_test(
                        "Enhanced Email Notifications", 
                        False, 
                        "No AI recommendations found in email response",
                        data
                    )
            else:
                self.log_test(
                    "Enhanced Email Notifications", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_test("Enhanced Email Notifications", False, f"Exception: {str(e)}")

    def test_ai_enhanced_price_monitoring(self):
        """Test 5: AI-Enhanced Price Monitoring"""
        try:
            print("🔍 Testing AI-Enhanced Price Monitoring...")
            
            response = self.session.get(f"{API_BASE}/flights/check-prices")
            
            if response.status_code == 200:
                data = response.json()
                
                result = data.get('result', {})
                
                # Check for AI enhancement flag
                ai_enhanced_check = result.get('aiEnhanced', False)
                success_check = result.get('success', False)
                
                # Check monitoring results
                watches_checked = result.get('watchesChecked', 0)
                matches_found = result.get('matchesFound', 0)
                
                if success_check and ai_enhanced_check and watches_checked > 0:
                    self.log_test(
                        "AI-Enhanced Price Monitoring", 
                        True, 
                        f"AI-enhanced price monitoring completed. Checked {watches_checked} watches, found {matches_found} matches",
                        {"aiEnhanced": ai_enhanced_check, "watchesChecked": watches_checked}
                    )
                else:
                    issues = []
                    if not success_check:
                        issues.append("Price monitoring failed")
                    if not ai_enhanced_check:
                        issues.append("AI enhancement not indicated")
                    if watches_checked == 0:
                        issues.append("No watches checked")
                        
                    self.log_test(
                        "AI-Enhanced Price Monitoring", 
                        False, 
                        f"Issues: {'; '.join(issues)}",
                        data
                    )
            else:
                self.log_test(
                    "AI-Enhanced Price Monitoring", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_test("AI-Enhanced Price Monitoring", False, f"Exception: {str(e)}")

    def test_watchlist_creation_ai_enhanced(self):
        """Test 6: Watchlist Creation with AI Enhancement"""
        try:
            print("🔍 Testing AI-Enhanced Watchlist Creation...")
            
            watchlist_data = {
                "from": "AMM",
                "to": "LHR",
                "targetPrice": 500,
                "email": "test@airease.com"
            }
            
            response = self.session.post(f"{API_BASE}/watchlist", json=watchlist_data)
            
            if response.status_code == 200:
                data = response.json()
                
                success_check = data.get('success', False)
                watch = data.get('watch', {})
                message = data.get('message', '')
                
                # Check for AI enhancement indicators
                ai_enhanced_check = watch.get('aiEnhanced', False)
                
                # Check required fields
                required_fields = ['id', 'from', 'to', 'targetPrice', 'active', 'createdAt']
                fields_present = sum(1 for field in required_fields if field in watch)
                
                # Check for AI-enhanced message
                ai_message_check = 'smart notifications' in message.lower() or 'ai' in message.lower()
                
                if success_check and ai_enhanced_check and fields_present >= 5 and ai_message_check:
                    self.log_test(
                        "AI-Enhanced Watchlist Creation", 
                        True, 
                        f"AI-enhanced watchlist created successfully. Route: {watch.get('from')} → {watch.get('to')} at ${watch.get('targetPrice')}",
                        {"aiEnhanced": ai_enhanced_check, "fields": fields_present, "watch_id": watch.get('id')}
                    )
                else:
                    issues = []
                    if not success_check:
                        issues.append("Watchlist creation failed")
                    if not ai_enhanced_check:
                        issues.append("AI enhancement not indicated")
                    if fields_present < 5:
                        issues.append(f"Missing required fields: {fields_present}/6")
                    if not ai_message_check:
                        issues.append("No AI enhancement in message")
                        
                    self.log_test(
                        "AI-Enhanced Watchlist Creation", 
                        False, 
                        f"Issues: {'; '.join(issues)}",
                        data
                    )
            else:
                self.log_test(
                    "AI-Enhanced Watchlist Creation", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_test("AI-Enhanced Watchlist Creation", False, f"Exception: {str(e)}")

    def test_cors_and_production_readiness(self):
        """Test 7: CORS Headers and Production Readiness"""
        try:
            print("🔍 Testing CORS and Production Readiness...")
            
            # Test OPTIONS request for CORS
            response = self.session.options(f"{API_BASE}/")
            
            cors_headers_present = False
            if response.status_code == 200:
                headers = response.headers
                cors_headers = [
                    'Access-Control-Allow-Origin',
                    'Access-Control-Allow-Methods', 
                    'Access-Control-Allow-Headers'
                ]
                cors_headers_present = all(header in headers for header in cors_headers)
            
            # Test external URL accessibility
            health_response = self.session.get(f"{API_BASE}/")
            external_access = health_response.status_code == 200
            
            if cors_headers_present and external_access:
                self.log_test(
                    "CORS and Production Readiness", 
                    True, 
                    "CORS headers configured correctly and external URL accessible",
                    {"cors_headers": cors_headers_present, "external_access": external_access}
                )
            else:
                issues = []
                if not cors_headers_present:
                    issues.append("CORS headers missing or incomplete")
                if not external_access:
                    issues.append("External URL not accessible")
                    
                self.log_test(
                    "CORS and Production Readiness", 
                    False, 
                    f"Issues: {'; '.join(issues)}",
                    {"cors_headers": cors_headers_present, "external_access": external_access}
                )
                
        except Exception as e:
            self.log_test("CORS and Production Readiness", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all production tests"""
        print("🚀 Starting Airease Production Testing Suite")
        print("=" * 60)
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        print()
        
        # Run all tests
        self.test_api_health_check()
        self.test_flight_search_enhanced()
        self.test_ai_recommendations()
        self.test_enhanced_email_notifications()
        self.test_ai_enhanced_price_monitoring()
        self.test_watchlist_creation_ai_enhanced()
        self.test_cors_and_production_readiness()
        
        # Summary
        print("=" * 60)
        print("🎯 PRODUCTION TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Tests Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - PRODUCTION READY!")
        else:
            print("⚠️  SOME TESTS FAILED - REVIEW REQUIRED")
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['details']}")
        
        print()
        return passed == total

if __name__ == "__main__":
    tester = AireaseProductionTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)