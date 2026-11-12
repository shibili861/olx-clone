import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h1 className="olx-logo" style={{ textAlign: 'center' }} onClick={() => navigate('/')}>OLX</h1>
      <h2>Login to your account</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          className="input-field" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          className="input-field" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="btn-primary">Login</button>
      </form>
      <p style={{ textAlign: 'center', fontSize: '14px' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#002f34', fontWeight: 'bold' }}>Sign up</Link>
      </p>
    </div>
  );
}