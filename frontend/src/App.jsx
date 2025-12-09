import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DoctorList from './pages/DoctorList';
import Register from './pages/Register';
import Login from './pages/Login';
import BookAppointment from './pages/BookAppointment';
import DoctorProfile from './pages/DoctorProfile';
import MyAppointments from './pages/MyAppointments';
import { getUser, logout } from './utils/auth';

export default function App(){
  const user = getUser();
  return (
    <BrowserRouter>
      <header className="nav">
        <div className="container">
          <h1 className="brand">DocSpot</h1>
          <nav>
            <Link to="/">Doctors</Link>
            {user ? (
              <>
                <Link to="/myappointments">My Appointments</Link>
                <span className="muted">{user.name} ({user.role})</span>
                <button className="link-btn" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<DoctorList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book/:id" element={<BookAppointment />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/myappointments" element={<MyAppointments />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}