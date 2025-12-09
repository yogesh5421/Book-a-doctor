import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from '../api/axiosConfig';
import { Link } from 'react-router-dom';

export default function DoctorList(){
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(()=> {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDoctors() {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (q) params.search = q;
      if (specialty) params.specialty = specialty;
      const res = await axios.get('/doctors', { params });
      setDoctors(res.data);
    } catch (err) {
      setError('Unable to fetch doctors');
    } finally {
      setLoading(false);
    }
  }

  // Debounce live searching while keeping the Search button for explicit submit
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDoctors();
    }, 450);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, specialty]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const specialties = useMemo(() => {
    const setS = new Set();
    doctors.forEach(d => { if (d.specialty) setS.add(d.specialty); });
    return Array.from(setS).slice(0, 8); // show up to 8 chips
  }, [doctors]);

  const clearFilters = () => {
    setQ('');
    setSpecialty('');
    fetchDoctors();
  };

  // Simple styles (inline for quick iteration)
  const styles = {
    container: { maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'Segoe UI, Roboto, Arial' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    form: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
    input: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', minWidth: 160 },
    button: { padding: '8px 12px', borderRadius: 6, border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' },
    clearBtn: { padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' },
    chips: { marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' },
    chip: (active) => ({ padding: '6px 10px', borderRadius: 20, background: active ? '#007bff' : '#f1f3f5', color: active ? '#fff' : '#222', cursor: 'pointer', border: 'none' }),
    card: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 8, border: '1px solid #eee', marginBottom: 12, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
    avatar: { width: 64, height: 64, borderRadius: 8, background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#495057' },
    meta: { flex: 1 },
    name: { margin: '4px 0', fontSize: 18 },
    muted: { color: '#6c757d', marginBottom: 6 },
    bio: { margin: 0, color: '#333' },
    actions: { marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' },
    linkBtn: { textDecoration: 'none', padding: '6px 10px', borderRadius: 6, background: '#f8f9fa', color: '#007bff', border: '1px solid #e9ecef' },
    spinner: { marginLeft: 8, color: '#007bff' },
    emptyCard: { padding: 20, borderRadius: 8, border: '1px dashed #e0e0e0', textAlign: 'center', color: '#6c757d' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{margin:0}}>Find a Doctor</h2>
        <div style={{color:'#6c757d', fontSize:13}}>{loading ? 'Loading…' : `${doctors.length} result${doctors.length===1 ? '' : 's'}`}</div>
      </div>

      <form onSubmit={onSearch} style={{ ...styles.form }}>
        <input
          placeholder="Search name or specialty"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={styles.input}
          aria-label="Search doctors"
        />
        <input
          placeholder="Specialty (optional)"
          value={specialty}
          onChange={e=>setSpecialty(e.target.value)}
          style={styles.input}
          aria-label="Filter by specialty"
        />
        <button style={styles.button} type="submit">Search</button>
        <button type="button" onClick={clearFilters} style={styles.clearBtn}>Clear</button>
      </form>

      <div style={styles.chips}>
        {specialties.map(s => (
          <button
            key={s}
            onClick={() => setSpecialty(prev => prev === s ? '' : s)}
            style={styles.chip(s === specialty)}
            aria-pressed={s === specialty}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div style={{color:'#c53030', marginBottom:12}}>{error}</div>}

      {loading && <div style={{marginBottom:12}}>Searching<span style={styles.spinner}>•</span></div>}

      {!loading && doctors.length === 0 && (
        <div style={styles.emptyCard}>
          No doctors found. Try different keywords or <Link to="/add">add a new doctor</Link>.
        </div>
      )}

      {doctors.map(d => (
        <div key={d._id} className="card inline" style={styles.card}>
          <div style={styles.avatar}>
            {d.name ? d.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : 'DR'}
          </div>

          <div style={styles.meta}>
            <h3 style={styles.name}>{d.name}</h3>
            <div style={styles.muted}>{d.specialty} {d.location ? `— ${d.location}` : ''}</div>
            <p style={styles.bio}>{d.bio || 'No profile description provided.'}</p>

            <div style={styles.actions}>
              <Link to={`/doctor/${d._id}`} style={styles.linkBtn}>View profile</Link>
              <Link to={`/book/${d._id}`} style={{...styles.linkBtn, background:'#007bff', color:'#fff', borderColor:'#007bff'}}>Book appointment</Link>
              <div style={{marginLeft:'auto', color:'#6c757d', fontSize:13}}>{d.yearsExperience ? `${d.yearsExperience} yrs` : ''}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}