from flask import Blueprint, jsonify
from db import db

services_bp = Blueprint("services", __name__)

@services_bp.route("/services", methods=["GET"])
def get_services():

    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM services")

    services = cursor.fetchall()

    return jsonify(services)