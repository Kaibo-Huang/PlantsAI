import React, { useState } from 'react';
import { RiPlantFill } from "react-icons/ri";

const Overlay = () => {
  const [search, setSearch] = useState('');
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 30, pointerEvents: 'none', width: '100vw', height: '100vh' }}>
        {/* Top search bar */}
        <div style={{ position: 'absolute', top: 24, left: 24, width: 420, pointerEvents: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 520,
              position: 'relative',
              pointerEvents: 'auto',
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 420,
                padding: '18px 32px 18px 48px',
                borderRadius: 32,
                border: '2px solid #fff',
                fontSize: 22,
                fontWeight: 600,
                outline: 'none',
                background: 'rgba(255,255,255,0.35)',
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
        </div>
        {/* Bottom left add plant button */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            bottom: 48,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80px',
              width: '80px',
              minWidth: '80px',
              minHeight: '80px',
              maxWidth: '80px',
              maxHeight: '80px',
              aspectRatio: '1 / 1',
              borderRadius: '9999px',
              backdropFilter: 'blur(6px)',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              overflow: 'hidden',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
            onClick={() => {/* handle add plant click here */}}
            title="Add Plant"
          >
            <RiPlantFill size={40} style={{ display: 'block' }} />
          </div>
        </div>
        <style>{`
          .searchbar-white-placeholder::placeholder {
            color: #fff !important;
            opacity: 1;
          }
        `}</style>
      </div>
    </>
  );
};

export default Overlay;



