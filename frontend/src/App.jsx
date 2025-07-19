import './App.css';
import MapboxMap from './MapboxMap';
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const {
    isLoading, // Loading state, the SDK needs to reach Auth0 on load
    isAuthenticated,
    error,
    loginWithRedirect: login, // Starts the login flow
    logout: auth0Logout, // Starts the logout flow
    user, // User profile
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) return "Loading...";

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
      backgroundImage: 'url(/login-background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
    }}>
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backdropFilter: 'blur(16px)',
        background: 'rgba(55, 95, 72, 0.55)',
        borderRadius: '32px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: '3rem 4rem',
      }}>
        <h2 style={{
          marginBottom: '2.5rem',
          color: '#333',
          fontSize: '3.5rem', // increased from 2.5rem
          fontWeight: 600,
          letterSpacing: '1px',
          fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
          textShadow: '0 2px 8px rgba(255,255,255,0.5)'
        }}>IOGarden</h2>
        <button
          onClick={login}
          style={{
            padding: '1.5rem 4rem',
            fontSize: '2rem',
            margin: '1rem',
            borderRadius: '18px',
            border: 'none',
            background: 'rgba(76,175,80,0.8)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 24px 0 rgba(76,175,80,0.5)',
            transition: 'background 0.2s, transform 0.2s',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontWeight: 600,
            letterSpacing: '1px',
            borderBottom: '2px solid rgba(76,175,80,0.5)',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(56,142,60,0.45)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(76,175,80,0.35)'}
        >
          Log In
        </button>
        <button
          onClick={signup}
          style={{
            padding: '1.5rem 4rem',
            fontSize: '2rem',
            margin: '1rem',
            borderRadius: '18px',
            border: 'none',
            background: 'rgba(33,150,243,0.651)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 24px 0 rgba(33,150,243,0.25)',
            transition: 'background 0.2s, transform 0.2s',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontWeight: 600,
            letterSpacing: '1px',
            borderBottom: '2px solid rgba(33,150,243,0.5)',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(21,101,192,0.45)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(33,150,243,0.35)'}
        >
          Sign Up
        </button>
        {error && <div style={{ color: 'red', marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 500 }}>{error.message}</div>}
      </div>
    </div>
  );
}

export default App;