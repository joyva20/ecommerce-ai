import requests
import json

def test_recommendation_service():
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Recommendation Service...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health Check: PASSED")
            print(f"   Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Health Check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Health Check: FAILED (Error: {e})")
    
    print("\n" + "=" * 50)
    
    # Test 2: Home endpoint
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✅ Home Endpoint: PASSED")
            data = response.json()
            print(f"   Service: {data.get('service')}")
            print(f"   Total Products: {data.get('total_products')}")
            print(f"   Model Grade: {data.get('model_grade')}")
            print(f"   Performance: {data.get('performance_score')}")
            print(f"   Algorithm: {data.get('algorithm')}")
            print(f"   ML Available: {data.get('ml_available')}")
        else:
            print(f"❌ Home Endpoint: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Home Endpoint: FAILED (Error: {e})")
    
    print("\n" + "=" * 50)
    
    # Test 3: Similar products recommendation
    try:
        test_payload = {"product_name": "Blazer"}
        response = requests.post(
            f"{base_url}/recommendations/similar", 
            json=test_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Similar Products: PASSED")
            data = response.json()
            print(f"   Success: {data.get('success')}")
            print(f"   Algorithm: {data.get('algorithm', 'N/A')}")
            
            if 'recommendations' in data:
                print(f"   Found {len(data['recommendations'])} recommendations:")
                for i, rec in enumerate(data['recommendations'][:3]):
                    print(f"     {i+1}. {rec['nama_pakaian']} ({rec.get('match_percentage', 'N/A')}%)")
            
            if 'reference_product' in data:
                ref = data['reference_product']
                print(f"   Reference: {ref['nama_pakaian']}")
        else:
            print(f"❌ Similar Products: FAILED (Status: {response.status_code})")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Similar Products: FAILED (Error: {e})")
    
    print("\n" + "=" * 50)
    
    # Test 4: Category recommendation
    try:
        response = requests.get(
            f"{base_url}/recommendations/category/women/type/topwear",
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ Category Recommendation: PASSED")
            data = response.json()
            print(f"   Success: {data.get('success')}")
            
            if 'recommendations' in data:
                print(f"   Found {len(data['recommendations'])} recommendations:")
                for i, rec in enumerate(data['recommendations'][:3]):
                    print(f"     {i+1}. {rec['nama_pakaian']}")
        else:
            print(f"❌ Category Recommendation: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Category Recommendation: FAILED (Error: {e})")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_recommendation_service()
