import requests

payload = {"resident_id": "1", "service_id": "1"}

resp = requests.post("http://localhost:5000/book-service", json=payload)
print("Status:", resp.status_code)
print("Response:", resp.text)
