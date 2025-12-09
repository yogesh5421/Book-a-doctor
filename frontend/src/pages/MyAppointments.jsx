import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

export default function MyAppointments(){
  const [appts, setAppts] = useState([]);
  const nav = useNavigate();
  const user = getUser();

  useEffect(()=> {
    if (!user) { nav('/login'); return; }
    load();
    // eslint-disable-next-line
  }, []);

  async function load(){
    try {
      const res = await axios.get('/appointments/me');
      setAppts(res.data);
    } catch (err) {
      alert('Error loading appointments');
    }
  }

  async function cancel(id){
    if (!confirm('Cancel this appointment?')) return;
    try {
      await axios.put(`/appointments/${id}/cancel`);
      alert('Cancelled');
      load();
    } catch (err) { alert('Error cancelling'); }
  }

  return (
    <div>
      <h2>My Appointments</h2>
      {appts.length === 0 && <div className="card">No appointments</div>}
      {appts.map(a => (
        <div key={a._id} className="card">
          <div className="inline">
            <div style={{flex:1}}>
              <strong>{a.doctor?.name || 'Unknown Doctor'}</strong>
              <div className="muted">{new Date(a.date).toLocaleString()}</div>
              <div>Status: {a.status}</div>
              <div>Notes: {a.notes}</div>
            </div>
            <div>
              {a.status === 'booked' && <button onClick={()=>cancel(a._id)}>Cancel</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}