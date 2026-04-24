from flask import Flask
from flask_cors import CORS
from socketio_instance import socketio

from routes.auth import auth_bp
from routes.services import services_bp
from routes.bookings import booking_bp
from routes.notifications import notifications_bp
from routes.admins import admins_bp

app = Flask(__name__)
CORS(app)
socketio.init_app(app, cors_allowed_origins="*")

# Register routes
app.register_blueprint(auth_bp)
app.register_blueprint(services_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(admins_bp)

@app.route("/")
def home():
    return "Apartment Service Backend Running"

if __name__ == "__main__":
    socketio.run(app, debug=True)