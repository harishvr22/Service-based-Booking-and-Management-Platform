import requests
import sys

BASE_URL = "http://localhost:5000"

def get_stats():
    resp = requests.get(f"{BASE_URL}/admin/dashboard")
    if resp.status_code != 200:
        print("Failed to get admin dashboard stats")
        sys.exit(1)
    return resp.json()["stats"]

def main():
    print("--- 1. Fetching current stats ---")
    initial_stats = get_stats()
    print("Initial Stats:", initial_stats)

    print("\n--- 2. Booking a service (Plumber, ID: 1, Price should be $80) ---")
    booking_payload = {
        "resident_id": 1,
        "service_id": 1,
        "priority": "high",
        "apartment_id": "A-101",
        "mobile_number": "1234567890",
        "problem_description": "Test plumbing issue for revenue tracking verification.",
        "time_duration": "1 hour",
        "preferred_date": "2026-06-01",
        "preferred_time": "10:00:00",
        "additional_notes": "None"
    }
    
    book_resp = requests.post(f"{BASE_URL}/book-service", json=booking_payload)
    print("Booking Status Code:", book_resp.status_code)
    print("Booking Response:", book_resp.text)
    
    if book_resp.status_code != 200 or "booking_created" not in book_resp.text:
        print("Failed to create booking")
        sys.exit(1)
        
    print("\n--- 3. Fetching bookings to get the newly created booking ID ---")
    bookings_resp = requests.get(f"{BASE_URL}/bookings?resident_id=1")
    bookings = bookings_resp.json()
    newest_booking = bookings[0]
    booking_id = newest_booking["id"]
    print(f"Created Booking ID: {booking_id}")
    print(f"Service Name stored in DB: {newest_booking.get('service_name')}")
    print(f"Amount stored in DB: {newest_booking.get('amount')}")
    print(f"Payment Status in DB: {newest_booking.get('payment_status')}")
    print(f"Booking Status in DB: {newest_booking.get('status')}")

    print("\n--- 4. Checking stats after booking (Pending payments should increase) ---")
    post_booking_stats = get_stats()
    print("Post-Booking Stats:", post_booking_stats)

    print("\n--- 5. Completing the service (Updating status to 'completed') ---")
    status_payload = {
        "booking_id": booking_id,
        "status": "completed"
    }
    status_resp = requests.put(f"{BASE_URL}/update-status", json=status_payload)
    print("Update Status Response:", status_resp.text)

    print("\n--- 6. Simulating Payment Done (Updating payment_status to 'paid') ---")
    pay_resp = requests.post(f"{BASE_URL}/bookings/{booking_id}/pay")
    print("Pay Booking Response:", pay_resp.text)

    print("\n--- 7. Checking stats after payment (Total Revenue & Paid Bookings should increase, Pending payments should decrease) ---")
    final_stats = get_stats()
    print("Final Stats:", final_stats)

    # Verification assertions
    diff_rev = int(final_stats["revenue"].replace("$", "")) - int(initial_stats["revenue"].replace("$", ""))
    diff_paid = final_stats["paid_bookings"] - initial_stats["paid_bookings"]
    
    print("\n--- Summary Verification ---")
    print(f"Revenue Increase: ${diff_rev} (Expected: $80)")
    print(f"Paid Bookings Increase: {diff_paid} (Expected: 1)")
    
    if diff_rev == 80 and diff_paid == 1:
        print("\nSUCCESS: All simulated revenue calculations verified perfectly!")
    else:
        print("\nFAILURE: Stats verification failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
