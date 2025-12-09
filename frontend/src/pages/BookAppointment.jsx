import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { getUser } from '../utils/auth';

export default function BookAppointment(){
  const { id } = useParams();
  const nav = useNavigate();
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const user = getUser();

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { alert('Please login as patient to book'); nav('/login'); return; }
    try {
      await axios.post('/appointments', { doctorId: id, date, notes });
      alert('Appointment booked!');
      nav('/myappointments');
    } catch (err) {
      alert(err.response?.data?.msg || err.message || 'Error booking');
    }
  };

  return (
    <div className="card">
      <h2>Book Appointment</h2>
      <form onSubmit={submit}>
        <label>Date & Time</label><br/>
        <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} required /><br/><br/>
        <textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} /><br/><br/>
        <button>Book</button>
      </form>
    </div>
  );
}