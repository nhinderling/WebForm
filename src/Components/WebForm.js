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

  const [state, setState] = useState({
    isSubmitted: false,
    submittedData: {},
    selectedDate: null,
    availableTimes: [],
    formData: {
      firstName: '',
      lastName: '',
      email: '',
      numberOfPeople: '',
      date: currentDate,
      time: '',
      comments: '',
    },
  });

  const ResetForm = () => {
    setState({
      isSubmitted: false,
      submittedData: {},
      selectedDate: null,
      availableTimes: [],
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        numberOfPeople: '',
        date: currentDate,
        time: '',
        comments: '',
      },
    });
  };


  const handleChange = (event) => { // Change of inputs
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  const handleDateChange = async (date) => { // Change of Data input
    try {
         setState((prevState) => ({
          ...prevState,
          selectedDate: date, // Update the selected date
        }));
  
      // Fetch filtered submissions data 

      const filteredSubmissionsData = await fetchFilteredSubmissions();
      const selectedDateString = date.toISOString().substring(0, 10);
      const bookedTimes = filteredSubmissionsData[selectedDateString] || [];
      const updatedAvailableTimes = allPossibleTimes.filter((time) => !bookedTimes.includes(time));

      setState((prevState) => ({
        ...prevState,
        availableTimes: updatedAvailableTimes,
        formData: {
          ...prevState.formData,
          date: date.toISOString().substring(0, 10),
        },
      }));
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
        body: JSON.stringify(state.formData),

      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log(responseData); 
    } catch (error) {
      console.error('There was an error submitting the form:', error);
    }
   
    setState((prevState) => ({
      ...prevState,
      isSubmitted: true,
      submittedData: { ...prevState.formData },
    }));
    
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
  if (state.isSubmitted) {
    return (
      <div className="form">
        <div className="header">
          <h4>We have received your request!</h4>
          <p>Thank you, {state.submittedData.firstName} {state.submittedData.lastName}, for your interest.</p>
          <p> We will get back to you shortly to confirm your booking.</p>
       </div>
       <div className="CenterForm">
        <div className="DetailsGroup">
          <h6>your booking details</h6>
            <Detail label="Email" value={state.submittedData.email} />
            <Detail label="Number of People" value={state.submittedData.numberOfPeople} />
            <Detail label="Date" value={state.submittedData.date.toString().substring(0,10)} />
            <Detail label="Time" value={state.submittedData.time} />
            <Detail label="Comments" value={state.submittedData.comments} />
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
      <div className="CenterForm">
        <div className="allInput">
          <div className="form-row">
          {renderFormGroup('First Name', 'text', 'firstName', state.firstName, handleChange, true,1)}
          {renderFormGroup('Last Name', 'text', 'lastName', state.lastName, handleChange, true,1)}
          </div>

          {renderFormGroup('Email Address', 'email', 'email', state.email, handleChange, true,1)}
          {renderFormGroup('Number of People', 'number', 'numberOfPeople', state.numberOfPeople, handleChange,  true,1)}

          <div className="form-row">
            <div className="form-group">
              <label>Date<span className="required">*</span></label>
              <DatePicker 
                selected={state.selectedDate}
                onChange={date => handleDateChange(date)}
                filterDate={date => !notAvailableDate(date)}
                minDate={currentDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="yyyy-MM-dd" 
              />
            </div>
            <div className="form-group ">
              <label>Time <span className="required">*</span></label>
              <select name="time" value={state.time} onChange={handleChange} required>
                <option value=""></option>
                {state.availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {renderFormGroup('Additional Comments', 'textarea', 'comments', state.comments, handleChange,false, 4)}
          {renderButton('Submit Reservation', )}
        </div>
      </div>
    </form>
  );
    }

// RETURN FUNCTIONS // 

//Submission Page
const renderFormGroup = (label, type, name, value, onChange,required,rows) => (
  <div className="form-group">
    <label>{label}{required && <span className="required">*</span>}</label>
    {type === 'textarea' ? ( // textarea
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
        ></textarea>
      ) : (
        <input // all other inputs
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

//Confirmation Page
function Detail({ label, value }) {
  return (
    <section className="details">
      <p>{label}: {value}</p>
    </section>
  );
}

export default WebForm;

