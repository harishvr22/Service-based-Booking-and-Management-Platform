from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.services import services_bp
from routes.bookings import booking_bp

app = Flask(__name__)
CORS(app)

# Register routes
app.register_blueprint(auth_bp)
app.register_blueprint(services_bp)
app.register_blueprint(booking_bp)

@app.route("/")
def home():
    return "Apartment Service Backend Running"

if __name__ == "__main__":
    app.run(debug=True)