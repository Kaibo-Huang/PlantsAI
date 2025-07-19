import React, { useState } from 'react';

function PinQueryCard() {
  const [queryType, setQueryType] = useState('near');
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState([]);

  const handleInput = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleQuery = async () => {
    let url = '';
    if (queryType === 'near') {
      url = `http://localhost:8000/pins/near?lat=${inputs.lat}&lon=${inputs.lon}&max_distance=${inputs.max_distance || 1000}`;
    } else if (queryType === 'cluster') {
      url = `http://localhost:8000/pins/cluster?cell_size=${inputs.cell_size || 500}`;
    } else if (queryType === 'bbox') {
      url = `http://localhost:8000/pins/bbox?min_lat=${inputs.min_lat}&min_lon=${inputs.min_lon}&max_lat=${inputs.max_lat}&max_lon=${inputs.max_lon}`;
    }
    const res = await fetch(url);
    setResults(await res.json());
  };

  return (
    <div style={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      color: '#fff',
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    }}>
      <h3 style={{ 
        margin: 0, 
        fontSize: 24, 
        fontWeight: 800, 
        color: '#fff', 
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 8,
      }}>Query the DB Geospatially</h3>
      
      <select 
        value={queryType} 
        onChange={e => { setQueryType(e.target.value); setInputs({}); }}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 12,
          border: '2px solid rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          letterSpacing: 0.2,
        }}
      >
        <option value="near" style={{ background: '#4caf50', color: '#fff' }}>Near</option>
        <option value="cluster" style={{ background: '#4caf50', color: '#fff' }}>Cluster</option>
        <option value="bbox" style={{ background: '#4caf50', color: '#fff' }}>Bounding Box</option>
      </select>
      
      {queryType === 'near' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input 
            name="lat" 
            placeholder="Lat" 
            onChange={handleInput}
            style={{
              width: '91.5%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
          <input 
            name="lon" 
            placeholder="Lon" 
            onChange={handleInput}
            style={{
              width: '91.5%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
          <input 
            name="max_distance" 
            placeholder="Distance (m)" 
            onChange={handleInput}
            style={{
              width: '91.5%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
        </div>
      )}
      
      {queryType === 'cluster' && (
        <input 
          name="cell_size" 
          placeholder="Cell Size (m)" 
          onChange={handleInput}
          style={{
            width: '91.5%',
            padding: '8px 12px',
            borderRadius: 12,
            border: '2px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            outline: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            letterSpacing: 0.2,
          }}
        />
      )}
      
      {queryType === 'bbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input 
            name="min_lat" 
            placeholder="Min Lat" 
            onChange={handleInput}
            style={{
              width: '80%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
          <input 
            name="min_lon" 
            placeholder="Min Lon" 
            onChange={handleInput}
            style={{
              width: '80%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
          <input 
            name="max_lat" 
            placeholder="Max Lat" 
            onChange={handleInput}
            style={{
              width: '80%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
          <input 
            name="max_lon" 
            placeholder="Max Lon" 
            onChange={handleInput}
            style={{
              width: '80%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              letterSpacing: 0.2,
            }}
          />
        </div>
      )}
      
      <button 
        onClick={handleQuery}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 12,
          border: '2px solid rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 0.2,
          cursor: 'pointer',
          outline: 'none',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          transition: 'background 0.2s, transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
        }}
      >
        Run Query
      </button>
      
      {results.length > 0 && (
        <pre style={{ 
          fontSize: 12, 
          maxHeight: 200, 
          overflow: 'auto',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 12,
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          margin: 0,
        }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default PinQueryCard;