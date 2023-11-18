import React, { useState } from 'react';
import './WebForm.css';
import './Confirmation.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function WebForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    numberOfPeople: '',
    date: new Date(),
    time: '',
    comments: ''
  });



  const ResetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      numberOfPeople: '',
      date: new Date(),
      time: '',
      comments: ''
    });
    setIsSubmitted(false);
  };

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, Submission] = useState({});

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  

  const notAvailableDate = (date) => {
  
      return date.getDay() === 0;
    

  };

  // Generate time options from 8 AM to 7 PM
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 19; hour++) {
      const time = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      options.push(<option key={time} value={time}>{time}</option>);
    }
    return options;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/submit-form', { // Replace with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),

      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log(responseData); //  handle the response here
    } catch (error) {
      console.error('There was an error submitting the form:', error);
    }
   
    Submission(formData);
    setIsSubmitted(true); // Set the form as submitted
    
  };


  if (isSubmitted) {
    return (
      <div className="submission-details">
        <h4>We have received your request!</h4>
        <p>Thank you, {submittedData.firstName} {submittedData.lastName}, for your interest.</p>
        <p> We will get back to you shortly to confirm your booking.</p>
       
       <div className="DetailsGroup">
        <h6>Your Booking details</h6>
          <div className="details">
            <p>Email: {submittedData.email}</p>
          </div>
          <div className="details">
          <p>Number of People: {submittedData.numberOfPeople}</p>
          </div>
          <div className="details">
          <p>Date: {submittedData.date.toString()}</p>
          </div>
          <div className="details">
          <p>Time: {submittedData.time}</p>
          </div>
          <div className="details">
          <p>Comments: {submittedData.comments}</p>
          </div>
        </div>
        <button className="submit-button" onClick={ResetForm}>Make Another Reservation</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="reservation-form">
      <div className="header">
        <h1>Laser Tag Super Fun</h1>
        <p>You can book your session here!</p>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>First Name<span class="required">*</span></label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name <span class="required">*</span></label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label>Email Address<span class="required">*</span></label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Number of People<span class="required">*</span></label>
        <input type="number" name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date<span class="required">*</span></label>
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            filterDate={date => !notAvailableDate(date)}
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="form-group ">
          <label>Time <span class="required">*</span></label>
          <select name="time" value={formData.time} onChange={handleChange} required>
            <option value="">Select a time</option>
            {generateTimeOptions()}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Additional Comments</label>
        <textarea name="comments" value={formData.comments} onChange={handleChange} rows="4"></textarea>
      </div>

      <div className="button-container">
         <button type="submit" className="submit-button">Submit Reservation</button>
      </div>
    </form>
  );
      
}

export default WebForm;

