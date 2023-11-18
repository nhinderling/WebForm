from flask import Flask, request, jsonify
from flask_cors import CORS

storage = Flask(__name__)
CORS(storage)

# List to store data
submissions = []

@storage.route('/submit-form', methods=['POST'])
def handle_form_submission():
    data = request.json
    submissions.append(data)  # Add the received data to the list
    return jsonify({"message": "Form data received"}), 200

# New route to view the stored submissions
@storage.route('/view-submissions', methods=['GET'])
def view_submissions():
    return jsonify(submissions), 200


if __name__ == '__main__':
    storage.run(debug=True)
