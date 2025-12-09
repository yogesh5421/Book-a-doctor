import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { useParams, Link } from 'react-router-dom';

export default function DoctorProfile(){
  const { id } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(()=> {
    axios.get(`/doctors/${id}`).then(r => setDoc(r.data)).catch(() => alert('Unable to load'));
  }, [id]);

  if (!doc) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h2>{doc.name}</h2>
      <div className="muted">{doc.specialty} {doc.location ? `— ${doc.location}` : ''}</div>
      <p>{doc.bio}</p>
      <Link to={`/book/${doc._id}`}>Book Appointment</Link>
    </div>
  );
}