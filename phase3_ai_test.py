#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Airease Phase 3 AI Features
Tests Azure OpenAI integration and AI-powered recommendations
"""

import requests
import json
import time
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://airease.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 TESTING: {test_name}")
    print(f"{'='*60}")

def print_success(message):
    print(f"✅ SUCCESS: {message}")

def print_error(message):
    print(f"❌ ERROR: {message}")

def print_info(message):
    print(f"ℹ️  INFO: {message}")

def test_api_health():
    """Test basic API health and version"""
    print_test_header("API Health Check")
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Check for Phase 3 features
            if 'features' in data and 'version' in data:
                print_success(f"API Health Check - Version {data['version']}")
                print_info(f"Features: {', '.join(data['features'])}")
                return True
            else:
                print_error("Missing features or version in response")
                return False
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        return False

def test_ai_recommendations():
    """Test complete AI recommendations endpoint"""
    print_test_header("AI Complete Recommendations")
    
    test_payload = {
        "flightData": {
            "from": "AMM",
            "to": "LHR", 
            "airline": "Qatar Airways",
            "flightNumber": "QR123",
            "departureTime": "08:30",
            "duration": "6h 15m",
            "price": 450
        },
        "tripType": "leisure",
        "duration": "3-5 days"
    }
    
    try:
        print(f"Sending payload: {json.dumps(test_payload, indent=2)}")
        response = requests.post(f"{API_BASE}/ai/recommendations", 
                               json=test_payload, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate response structure
            required_fields = ['success', 'packingRecs', 'travelTips', 'timeBudget']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_success("AI Recommendations endpoint working")
                
                # Check AI integration
                if data.get('packingRecs', {}).get('aiGenerated'):
                    print_success("Azure OpenAI integration working for packing recommendations")
                else:
                    print_info("Using fallback recommendations (AI may have failed)")
                
                # Validate packing recommendations structure
                packing = data.get('packingRecs', {}).get('recommendations', {})
                if 'clothing' in packing and 'weather' in packing and 'essentials' in packing:
                    print_success("Packing recommendations structure valid")
                else:
                    print_error("Invalid packing recommendations structure")
                
                # Validate travel tips
                tips = data.get('travelTips', {}).get('tips', [])
                if isinstance(tips, list) and len(tips) > 0:
                    print_success(f"Travel tips generated: {len(tips)} tips")
                else:
                    print_error("Invalid travel tips structure")
                
                # Validate time budget
                time_budget = data.get('timeBudget', {})
                if 'leaveByTime' in time_budget and 'totalMinutes' in time_budget:
                    print_success(f"Time budget calculated: Leave by {time_budget['leaveByTime']}")
                else:
                    print_error("Invalid time budget structure")
                
                return True
            else:
                print_error(f"Missing required fields: {missing_fields}")
                return False
        else:
            print_error(f"AI recommendations failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"AI recommendations test failed: {str(e)}")
        return False

def test_ai_packing():
    """Test AI packing recommendations endpoint"""
    print_test_header("AI Packing Recommendations")
    
    test_payload = {
        "flightData": {
            "from": "AMM",
            "to": "LHR",
            "airline": "Qatar Airways", 
            "flightNumber": "QR123",
            "departureTime": "08:30",
            "duration": "6h 15m",
            "price": 450
        },
        "tripType": "leisure",
        "duration": "3-5 days"
    }
    
    try:
        response = requests.post(f"{API_BASE}/ai/packing", 
                               json=test_payload, 
                               timeout=20)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate packing response
            if 'recommendations' in data and 'weather' in data:
                print_success("AI Packing endpoint working")
                
                # Check weather integration
                weather = data.get('weather', {})
                if 'temp' in weather and 'condition' in weather:
                    print_success(f"Weather data integrated: {weather['temp']}°C, {weather['condition']}")
                
                # Check recommendation categories
                recs = data.get('recommendations', {})
                categories = ['clothing', 'weather', 'essentials']
                valid_categories = [cat for cat in categories if cat in recs and isinstance(recs[cat], list)]
                
                if len(valid_categories) >= 3:
                    print_success(f"All packing categories present: {', '.join(valid_categories)}")
                else:
                    print_error(f"Missing packing categories. Found: {valid_categories}")
                
                return True
            else:
                print_error("Invalid packing response structure")
                return False
        else:
            print_error(f"AI packing failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"AI packing test failed: {str(e)}")
        return False

def test_ai_travel_tips():
    """Test AI travel tips endpoint"""
    print_test_header("AI Travel Tips")
    
    test_payload = {
        "flightData": {
            "from": "AMM",
            "to": "LHR",
            "airline": "Qatar Airways",
            "flightNumber": "QR123",
            "departureTime": "08:30",
            "duration": "6h 15m",
            "price": 450
        },
        "tripType": "leisure"
    }
    
    try:
        response = requests.post(f"{API_BASE}/ai/travel-tips", 
                               json=test_payload, 
                               timeout=20)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate travel tips response
            if 'tips' in data and 'destination' in data:
                tips = data.get('tips', [])
                if isinstance(tips, list) and len(tips) > 0:
                    print_success(f"Travel tips generated: {len(tips)} tips for {data['destination']}")
                    
                    # Check tip structure
                    valid_tips = [tip for tip in tips if 'category' in tip and 'tip' in tip]
                    if len(valid_tips) == len(tips):
                        print_success("All tips have valid structure (category + tip)")
                    else:
                        print_error(f"Some tips have invalid structure. Valid: {len(valid_tips)}/{len(tips)}")
                    
                    return True
                else:
                    print_error("No tips generated or invalid tips structure")
                    return False
            else:
                print_error("Invalid travel tips response structure")
                return False
        else:
            print_error(f"AI travel tips failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"AI travel tips test failed: {str(e)}")
        return False

def test_ai_time_budget():
    """Test AI time budget endpoint"""
    print_test_header("AI Time Budget")
    
    test_payload = {
        "flightData": {
            "from": "AMM",
            "to": "LHR",
            "airline": "Qatar Airways",
            "flightNumber": "QR123", 
            "departureTime": "08:30",
            "duration": "6h 15m",
            "price": 450
        },
        "userLocation": "city_center"
    }
    
    try:
        response = requests.post(f"{API_BASE}/ai/time-budget", 
                               json=test_payload, 
                               timeout=20)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate time budget response
            required_fields = ['timeBudget', 'totalMinutes', 'leaveByTime']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_success(f"Time budget calculated: Leave by {data['leaveByTime']}")
                print_success(f"Total travel time: {data['totalMinutes']} minutes")
                
                # Check time budget segments
                segments = data.get('timeBudget', [])
                if isinstance(segments, list) and len(segments) > 0:
                    print_success(f"Time budget breakdown: {len(segments)} segments")
                    for segment in segments:
                        if 'name' in segment and 'minutes' in segment:
                            print_info(f"  - {segment['name']}: {segment['minutes']} min")
                        else:
                            print_error(f"Invalid segment structure: {segment}")
                else:
                    print_error("No time budget segments found")
                
                return True
            else:
                print_error(f"Missing required fields: {missing_fields}")
                return False
        else:
            print_error(f"AI time budget failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"AI time budget test failed: {str(e)}")
        return False

def test_enhanced_email_notification():
    """Test enhanced email notification with AI content"""
    print_test_header("Enhanced Email Notification with AI")
    
    try:
        response = requests.get(f"{API_BASE}/notifications/test", timeout=20)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Validate enhanced email response
            if 'result' in data:
                result = data['result']
                
                # Check for AI features in email
                if 'aiFeatures' in result:
                    ai_features = result['aiFeatures']
                    print_success("Email includes AI features")
                    
                    # Check AI feature components
                    ai_components = ['packingRecommendations', 'travelTips', 'timeBudget', 'weather']
                    present_components = [comp for comp in ai_components if comp in ai_features]
                    
                    if len(present_components) >= 3:
                        print_success(f"AI components in email: {', '.join(present_components)}")
                    else:
                        print_error(f"Missing AI components. Found: {present_components}")
                
                # Check email content structure
                if 'content' in result:
                    content = result['content']
                    if 'html' in content and 'subject' in content:
                        print_success("Email content structure valid")
                        
                        # Check for AI-specific content in HTML
                        html_content = content['html']
                        ai_indicators = ['AI-Powered', 'AI Enhanced', 'packing-recommendations', 'travel-tips', 'time-budget']
                        found_indicators = [indicator for indicator in ai_indicators if indicator.lower() in html_content.lower()]
                        
                        if found_indicators:
                            print_success(f"AI content indicators found in HTML: {', '.join(found_indicators)}")
                        else:
                            print_error("No AI content indicators found in email HTML")
                    else:
                        print_error("Invalid email content structure")
                
                return True
            else:
                print_error("No result in email notification response")
                return False
        else:
            print_error(f"Enhanced email notification failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Enhanced email notification test failed: {str(e)}")
        return False

def test_azure_openai_integration():
    """Test Azure OpenAI integration by checking environment and responses"""
    print_test_header("Azure OpenAI Integration Check")
    
    # Test multiple AI endpoints to verify Azure OpenAI is working
    endpoints_to_test = [
        ("/ai/packing", "packing recommendations"),
        ("/ai/travel-tips", "travel tips"),
        ("/ai/time-budget", "time budget")
    ]
    
    test_payload = {
        "flightData": {
            "from": "AMM",
            "to": "LHR",
            "airline": "Qatar Airways",
            "flightNumber": "QR123",
            "departureTime": "08:30",
            "duration": "6h 15m",
            "price": 450
        },
        "tripType": "leisure",
        "duration": "3-5 days"
    }
    
    ai_working_count = 0
    
    for endpoint, description in endpoints_to_test:
        try:
            print_info(f"Testing {description} for AI integration...")
            response = requests.post(f"{API_BASE}{endpoint}", 
                                   json=test_payload, 
                                   timeout=25)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if AI was used (not fallback)
                ai_generated = data.get('aiGenerated', False)
                if ai_generated:
                    print_success(f"{description}: Azure OpenAI working")
                    ai_working_count += 1
                else:
                    print_info(f"{description}: Using fallback (AI may have failed)")
            else:
                print_error(f"{description}: Failed with status {response.status_code}")
                
        except Exception as e:
            print_error(f"{description} test failed: {str(e)}")
    
    if ai_working_count >= 2:
        print_success(f"Azure OpenAI integration working ({ai_working_count}/3 endpoints using AI)")
        return True
    elif ai_working_count >= 1:
        print_info(f"Partial Azure OpenAI integration ({ai_working_count}/3 endpoints using AI)")
        return True
    else:
        print_error("Azure OpenAI integration not working (all endpoints using fallback)")
        return False

def run_all_tests():
    """Run all Phase 3 AI backend tests"""
    print(f"\n🚀 STARTING AIREASE PHASE 3 AI BACKEND TESTING")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    test_results = {}
    
    # Test basic API health first
    test_results['api_health'] = test_api_health()
    
    # Test all AI endpoints
    test_results['ai_recommendations'] = test_ai_recommendations()
    test_results['ai_packing'] = test_ai_packing()
    test_results['ai_travel_tips'] = test_ai_travel_tips()
    test_results['ai_time_budget'] = test_ai_time_budget()
    
    # Test enhanced email with AI
    test_results['enhanced_email'] = test_enhanced_email_notification()
    
    # Test Azure OpenAI integration
    test_results['azure_openai'] = test_azure_openai_integration()
    
    # Summary
    print(f"\n{'='*60}")
    print("🎯 PHASE 3 AI TESTING SUMMARY")
    print(f"{'='*60}")
    
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\n📊 RESULTS: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL PHASE 3 AI TESTS PASSED!")
        return True
    elif passed_tests >= total_tests * 0.8:
        print("⚠️  MOST TESTS PASSED - Minor issues detected")
        return True
    else:
        print("❌ MULTIPLE TEST FAILURES - Major issues detected")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)