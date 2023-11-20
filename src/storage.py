from flask import Flask, request, jsonify
from flask_cors import CORS

storage = Flask(__name__)

CORS(storage, origins="http://localhost:3000") # change this to localhost

# List to store data
submissions = []
filtered_submissions = {}

@storage.route('/submit-form', methods=['POST'])
def handle_form_submission():
    data = request.json
    submissions.append(data)  # Add the received data to the list

    # Extract date and time from the submission
    date = data.get('date')[:10]
    time = data.get('time')

    # Check if the date is already in the filtered_submissions dictionary
    if date not in filtered_submissions:
        # If not, initialize an empty list for that date
        filtered_submissions[date] = []

    # Add the time to the list for the corresponding date
    filtered_submissions[date].append(time)

    return jsonify({"message": "Form data received"}), 200

#route to complete data set
@storage.route('/view-submissions', methods=['GET'])
def view_submissions():
    return jsonify(submissions), 200

# New route to view the filtered submissions
@storage.route('/view-filtered-submissions', methods=['GET'])
def view_filtered_submissions():
    return jsonify(filtered_submissions), 200


if __name__ == '__main__':
    storage.run(debug=True)
