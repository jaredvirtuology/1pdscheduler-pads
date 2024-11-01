import requests
import os
from enum import Enum

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Use environment variables for configuration
TIGHTLOCK_IP = os.getenv('TIGHTLOCK_IP', '{ADDRESS}')
API_KEY = os.getenv('TIGHTLOCK_API_KEY', '{EXAMPLE_API_KEY}')

BASE_URL = f"http://{TIGHTLOCK_IP}/api/v1"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

def test_connection():
    """
    Test the connection to the Tightlock API.
    
    :return: Response from the API
    """
    url = f"{BASE_URL}/connect"
    response = requests.post(url, headers=headers)
    return response.text, response.status_code


# Example usage:
if __name__ == "__main__":
    # Test the connection
    response, status_code = test_connection()
    print(f"Connection test response (status {status_code}): {response}")