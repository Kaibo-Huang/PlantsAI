import React, { useState } from 'react';

function Login({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Always allow login, even if fields are empty
    onLogin(username, password);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: '#eaf6f0',
      overflow: 'hidden' // Prevent scrolling
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', minWidth: 320 }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Login</h2>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#4caf50', color: '#fff', fontSize: 16, border: 'none', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  );
}

export default Login;