import MapboxMap from './MapboxMap';
import React, { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  if (isAuthenticated) return <MapboxMap />;

  return (
    <>
      <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background image */}
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
          zIndex: 0,
        }} />
        {/* Login form with glassmorphism style */}
        <div style={{
          zIndex: 1,
          position: 'relative',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '2.5rem 2.5rem',
          minWidth: 320,
          maxWidth: 340,
          width: 320,
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0,
        }}>
          {/* Logo placeholder */}
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(76,175,80,0.12)', margin: '0 auto', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, color: '#4caf50' }}>
            {/* You can replace this with an <img src=... /> for a real logo */}
            <span style={{ fontWeight: 700 }}>🌱</span>
          </div>
          {/* App name */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '3.2rem',
            fontWeight: 800,
            color: '#333',
            letterSpacing: '1.5px',
            fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
            textShadow: '0 2px 8px rgba(255,255,255,0.5)',
            marginBottom: 36,
          }}>
            IOGarden
          </div>
          <div style={{ flex: 1 }} />
          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.25)',
                color: '#222',
                fontSize: 18,
                fontWeight: 500,
                outline: 'none',
                marginBottom: 0,
                boxShadow: '0 2px 8px 0 rgba(31,38,135,0.07)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderBottom: '2.5px solid rgba(255,255,255,0.25)',
                transition: 'border 0.2s',
                boxSizing: 'border-box',
                animation: 'pulse 0.6s infinite',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.25)',
                color: '#222',
                fontSize: 18,
                fontWeight: 500,
                outline: 'none',
                marginBottom: 0,
                boxShadow: '0 2px 8px 0 rgba(31,38,135,0.07)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderBottom: '2.5px solid rgba(255,255,255,0.25)',
                transition: 'border 0.2s',
                boxSizing: 'border-box',
                animation: 'pulse 0.6s infinite',
              }}
            />
            <button type="submit" style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              border: 'none',
              background: 'rgba(255,255,255,0.35)',
              color: '#222',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 0.2,
              cursor: 'pointer',
              marginTop: 8,
              boxShadow: '0 2px 8px 0 rgba(31,38,135,0.07)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'background 0.2s',
              boxSizing: 'border-box',
            }}>Login</button>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{
                color: '#222',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 0.2,
                cursor: 'pointer',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                transition: 'color 0.2s',
                userSelect: 'none',
                fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
              }}>Sign Up</span>
              <span style={{
                color: '#4caf50',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 0.2,
                cursor: 'pointer',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                transition: 'color 0.2s',
                userSelect: 'none',
                fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
              }}>Forgot my password</span>
            </div>
          </form>
        </div>
      </div>
      {/* Sliding bar at the bottom with scrolling text */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: 32,
        background: 'rgba(255,255,255,0.35)',
        boxShadow: '0 -2px 12px 0 rgba(31,38,135,0.07)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 10,
      }}>
        <div style={{
          whiteSpace: 'nowrap',
          display: 'inline-block',
          animation: 'scroll-left-right 16s linear infinite',
          fontSize: 15,
          fontWeight: 600,
          color: '#388e3c',
          paddingLeft: '100vw',
          fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        }}>
          Built on React.JS ⚛️ &nbsp; &nbsp; | &nbsp; &nbsp; MongoDB 🌱 &nbsp; &nbsp; | &nbsp; &nbsp; Google Gemini 🧠 &nbsp; &nbsp; | &nbsp; &nbsp; Flask 🧪 &nbsp; &nbsp; | &nbsp; &nbsp; MapBox 🗺️ &nbsp; &nbsp; | &nbsp; &nbsp; PlantNet 🪴 &nbsp; &nbsp; | &nbsp; &nbsp; WeatherAPI ☁️
        </div>
      </div>
      <style>{`
        @keyframes scroll-left-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(76,175,80,0.95),
              0 0 0 0 rgba(56,142,60,0.75),
              0 0 0 0 rgba(139,195,74,0.55);
          }
          70% {
            box-shadow:
              0 0 0 60px rgba(76,175,80,0.55),
              0 0 0 90px rgba(56,142,60,0.35),
              0 0 0 120px rgba(139,195,74,0.18);
          }
          100% {
            box-shadow:
              0 0 0 0 rgba(76,175,80,0.95),
              0 0 0 0 rgba(56,142,60,0.75),
              0 0 0 0 rgba(139,195,74,0.55);
          }
        }
        input::placeholder {
          color: #fff !important;
          opacity: 1;
        }
      `}</style>
    </>
  );
}

// Keyframes for scrolling animation
// This must be outside the component return
const style = document.createElement('style');
style.innerHTML = `@keyframes scroll-left-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`;
document.head.appendChild(style);

export default App;