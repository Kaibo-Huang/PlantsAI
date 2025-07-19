import './App.css';
import MapboxMap from './MapboxMap';
import Login from './Login';
import React, { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const handleLogin = (username, password) => {
    // Simple demo: accept any non-empty username/password
    if (username && password) {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  return isAuthenticated ? (
    <MapboxMap />
  ) : (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Blurred background image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/login-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(8px)',
        zIndex: 0,
      }} />
      {/* Overlay content fills the viewport, no box background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}>
        <h2 style={{
          marginBottom: '2.5rem',
          color: '#333',
          fontSize: '3.5rem',
          fontWeight: 600,
          letterSpacing: '1px',
          fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
          textShadow: '0 2px 8px rgba(255,255,255,0.5)'
        }}>IOGarden</h2>
        <Login onLogin={handleLogin} error={loginError} />
      </div>
    </div>
  );
}

export default App;