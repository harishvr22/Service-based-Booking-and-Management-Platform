import requests

payload = {
    "title": "Test",
    "message": "Hello from admin",
    "audience": "All",
    "created_by": "Admin"
}

resp = requests.post("http://localhost:5000/notifications", json=payload)
print("Status:", resp.status_code)
print("Response:", resp.text)
