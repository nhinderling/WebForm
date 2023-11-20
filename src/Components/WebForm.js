import React, { useState } from 'react';
import './WebForm.css';
import './Confirmation.css';
import './BaseLayout.css'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const allPossibleTimes = [];
  for (let hour = 8; hour < 19; hour++) {
   const time = hour < 10 ? `0${hour}:00` : `${hour}:00`;
   allPossibleTimes.push(time);
  }

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
    setSelectedDate(null)
    setIsSubmitted(false);
  };

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, Submission] = useState({});

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);


  
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const fetchFilteredSubmissions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/view-filtered-submissions'); // Replace with your backend URL
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const filteredSubmissionsData = await response.json();
      return filteredSubmissionsData;
    } catch (error) {
      console.error('Error fetching filtered submissions:', error);
      return null;
    }

  };


  const handleDateChange = async (date) => {
    try {
      // Update the selected date
      setSelectedDate(date);
  
      // Fetch filtered submissions data and wait for it to resolve
      const filteredSubmissionsData = await fetchFilteredSubmissions();
  
      // Calculate available times based on the selected date
      const selectedDateString = date.toISOString().substring(0, 10);
      const bookedTimes = filteredSubmissionsData[selectedDateString] || [];
      const updatedAvailableTimes = allPossibleTimes.filter((time) => !bookedTimes.includes(time));
  
      // Update the available times state
      setAvailableTimes(updatedAvailableTimes);
      console.log(updatedAvailableTimes);

      // Update the formData.date
      setFormData({
        ...formData,
        date: date.toISOString().substring(0, 10), // Format the selected date as yyyy-MM-dd
      });
    } catch (error) {
      console.error('Error handling date change:', error);
    }
  };

  const notAvailableDate = (date) => {
      return date.getDay() === 0;
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
      <div className="form">
        <div className="header">
          <h4>We have received your request!</h4>
          <p>Thank you, {submittedData.firstName} {submittedData.lastName}, for your interest.</p>
          <p> We will get back to you shortly to confirm your booking.</p>
       </div>
       <div class="CenterForm">
        <div className="DetailsGroup">
          <h6>Your Booking details</h6>
            <Detail label="Email" value={submittedData.email} />
            <Detail label="Number of People" value={submittedData.numberOfPeople} />
            <Detail label="Date" value={submittedData.date.toString().substring(0,10)} />
            <Detail label="Time" value={submittedData.time} />
            <Detail label="Comments" value={submittedData.comments} />
          </div>
        </div>
        {renderButton('Make Another Reservation', ResetForm)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="header">
        <h1>Laser Tag Super Fun</h1>
        <p>You can book your session here!</p>
      </div>
      <div class="CenterForm">
        <div className="allInput">
          <div className="form-row">
          {renderFormGroup('First Name', 'text', 'firstName', formData.firstName, handleChange, 1, true)}
          {renderFormGroup('Last Name', 'text', 'lastName', formData.lastName, handleChange,1, true)}
          </div>

          {renderFormGroup('Email Address', 'email', 'email', formData.email, handleChange, 1,true)}
          {renderFormGroup('Number of People', 'number', 'numberOfPeople', formData.numberOfPeople, handleChange, 1, true)}

          <div className="form-row">
            <div className="form-group">
              <label>Date<span class="required">*</span></label>
              <DatePicker
                selected={selectedDate}
                onChange={date => handleDateChange(date)}
                filterDate={date => !notAvailableDate(date)}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="form-group ">
              <label>Time <span class="required">*</span></label>
              <select name="time" value={formData.time} onChange={handleChange} required>
                <option value=""></option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {renderFormGroup('Additional Comments', 'textarea', 'comments', formData.comments, handleChange,false, 4)}
          {renderButton('Submit Reservation', )}
        </div>
      </div>
    </form>
  );
      
}

function Detail({ label, value }) {
  return (
    <section className="details">
      <p>{label}: {value}</p>
    </section>
  );
}

const renderFormGroup = (label, type, name, value, onChange,required,rows) => (
  <div className="form-group">
    <label>{label}{required && <span className="required">*</span>}</label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows} // Add rows attribute for textarea
        required={required}
      ></textarea>
    ) : (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
    )}
  </div>
);

const renderButton = (label, onClick) => (
  <div className="button-container">
    <button className="submit-button" onClick={onClick}>{label}</button>
  </div>
);

export default WebForm;

