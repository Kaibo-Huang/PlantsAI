import React, { useState } from 'react';

const Overlay = () => {
  const [search, setSearch] = useState('');
  return (
    <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
      <div style={{ position: 'relative', width: 420 }}>
        <svg
          width="22" height="22" viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-55%)',
            pointerEvents: 'none',
            opacity: 0.7,
            display: 'block',
          }}
        >
          <circle cx="10" cy="10" r="7" stroke="#fff" strokeWidth="2" />
          <line x1="16" y1="16" x2="21" y2="21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 420,
            padding: '12px 32px 12px 48px',
            borderRadius: 32,
            border: '2px solid #fff',
            fontSize: 16,
            fontWeight: 600,
            outline: 'none',
            background: 'rgba(138, 182, 143, 0.35)',
            color: '#fff',
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            letterSpacing: 0.2,
            transition: 'box-shadow 0.2s',
          }}
          className="searchbar-white-placeholder"
        />
      </div>
      <style>{`
        .searchbar-white-placeholder::placeholder {
          color: #fff !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Overlay;
