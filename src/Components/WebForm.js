import React, { useState } from 'react';
import './WebForm.css';
import './Confirmation.css';
import './BaseLayout.css'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// "STATIC" DATA //

const allPossibleTimes = []; // opening hours
  for (let hour = 8; hour < 19; hour++) {
   const time = hour < 10 ? `0${hour}:00` : `${hour}:00`;
   allPossibleTimes.push(time);
  }

const currentDate = new Date(); 
currentDate.setDate(currentDate.getDate() + 1); // day after today

// WEBFORM //

function WebForm() {

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, Submission] = useState({});

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
 
  const [formData, setFormData] = useState({ // data storage
    firstName: '',
    lastName: '',
    email: '',
    numberOfPeople: '',
    date: currentDate,
    time: '',
    comments: ''
  });


  const ResetForm = () => { // reset data upon making another reservation
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      numberOfPeople: '',
      date: currentDate,
      time: '',
      comments: ''
    });
    setAvailableTimes([])
    setSelectedDate(null)
    setIsSubmitted(false);
  };


  const handleChange = (event) => { // Change of inputs
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleDateChange = async (date) => { // Change of Data input
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
        date: date.toISOString().substring(0, 10), 
      });
    } catch (error) {
      console.error('Error handling date change:', error);
    }
  };

  const notAvailableDate = (date) => { // on Sundays we are closed
      return date.getDay() === 0;
  };


  // SUBMISSION OF DATA //
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
      console.log(responseData); 
    } catch (error) {
      console.error('There was an error submitting the form:', error);
    }
   
    Submission(formData);
    setIsSubmitted(true); // Set the form as submitted 
    
  };

  // FETCH FILTERED DATA //

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

  // RETURN //

  // Confirmation Page //
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
          <h6>your booking details</h6>
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

  // Submission Page, Default Page //
  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="header">
        <h1>Laser Tag Super Fun</h1>
        <p>You can book your session here!</p>
      </div>
      <div class="CenterForm">
        <div className="allInput">
          <div className="form-row">
          {renderFormGroup('First Name', 'text', 'firstName', formData.firstName, handleChange, true,1)}
          {renderFormGroup('Last Name', 'text', 'lastName', formData.lastName, handleChange, true,1)}
          </div>

          {renderFormGroup('Email Address', 'email', 'email', formData.email, handleChange, true,1)}
          {renderFormGroup('Number of People', 'number', 'numberOfPeople', formData.numberOfPeople, handleChange,  true,1)}

          <div className="form-row">
            <div className="form-group">
              <label>Date<span class="required">*</span></label>
              <DatePicker 
                selected={selectedDate}
                onChange={date => handleDateChange(date)}
                filterDate={date => !notAvailableDate(date)}
                minDate={currentDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="yyyy-MM-dd" 
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

// RETURN FUNCTIONS // 

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
          rows={rows}
          required={required}
        ></textarea>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          min={type === 'number' ? 1 : undefined} //set min number of people to 1
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

