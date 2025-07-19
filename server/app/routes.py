from flask import Blueprint, jsonify, request

bp = Blueprint('main', __name__)

@bp.route('/api/home', methods=['GET'])
def home():
    data = {
        "message": "Welcome to the Flask API connected with React!"
    }
    return jsonify(data)

@bp.route('/api/data', methods=['GET'])
def get_data():
    sample_data = {
        "items": [
            {"id": 1, "name": "Plant A"},
            {"id": 2, "name": "Plant B"},
            {"id": 3, "name": "Plant C"}
        ]
    }
    return jsonify(sample_data)