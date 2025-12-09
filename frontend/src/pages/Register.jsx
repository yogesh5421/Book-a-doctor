import React, { useState } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../utils/auth';

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', password:'', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', form);
      saveAuth(res.data);
      nav('/');
    } catch (err) {
      alert(err.response?.data?.msg || err.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /><br/><br/>
        <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /><br/><br/>
        <input type="password" placeholder="Password (min 6)" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required /><br/><br/>
        <label>Role: </label>
        <select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select><br/><br/>
        <button disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}