import React, { useState } from 'react';
import { RiPlantFill } from "react-icons/ri";
import { useDropzone } from 'react-dropzone';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const Overlay = () => {
  const [search, setSearch] = useState('');
  const [showAddPlantOverlay, setShowAddPlantOverlay] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [alertForCare, setAlertForCare] = useState(false);
  const [favoriteOnMap, setFavoriteOnMap] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 30, pointerEvents: 'none', width: '100vw', height: '100vh' }}>
        {/* Large Add Plant Overlay */}
        {showAddPlantOverlay && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 440,
              minHeight: 320,
              background: 'rgba(76,175,80,0.10)',
              borderRadius: 48,
              border: '2px solid #fff',
              boxShadow: '0 2px 32px rgba(0,0,0,0.18)',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 32px',
              gap: 24,
              pointerEvents: 'auto',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <button
              onClick={() => setShowAddPlantOverlay(false)}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '9999px',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#fff',
                cursor: 'pointer',
                lineHeight: 1,
                fontWeight: 700,
                boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                transition: 'background 0.2s',
                pointerEvents: 'auto',
              }}
              title="Close"
            >×</button>
            <h2 style={{ 
              color: '#222', 
              fontWeight: 700, 
              fontSize: 32, 
              margin: 0, 
              marginBottom: 16, 
              letterSpacing: 0.5,
              fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
            }}>Add a New Plant</h2>
            {/* Drag-and-drop file upload area */}
            <div {...getRootProps()}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 32,
                border: '2px solid #fff',
                borderRadius: 32,
                background: isDragActive ? 'rgba(40,60,40,0.38)' : 'rgba(40,60,40,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
                margin: '18px 0',
                transition: 'background 0.2s, border 0.2s',
                outline: isDragActive ? '2.5px solid #4caf50' : 'none',
                boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                textAlign: 'center',
                pointerEvents: 'auto',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                letterSpacing: 0.2,
              }}
            >
              <input {...getInputProps()} />
              {uploadedFile ? (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Selected file: <b style={{ color: '#fff', fontWeight: 700 }}>{uploadedFile.name}</b></span>
              ) : isDragActive ? (
                <span style={{ color: '#4caf50', fontWeight: 700, fontSize: 18, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Drop the file here ...</span>
              ) : (
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 18, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Drag & drop a file here, or <span style={{ color: '#4caf50', textDecoration: 'underline', fontWeight: 700 }}>click to upload</span></span>
              )}
            </div>
          </div>
        )}
        {/* Hide these when add-plant overlay is open */}
        {!showAddPlantOverlay && (
          <>
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
                    padding: '15px 32px 15px 48px',
                    borderRadius: 32,
                    border: '2px solid #fff',
                    fontSize: 18,
                    fontWeight: 600,
                    outline: 'none',
                    background: 'rgba(76,175,80,0.10)',
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
                  background: 'rgba(76,175,80,0.08)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
                onClick={() => setShowAddPlantOverlay(true)}
                title="Add Plant"
              >
                <RiPlantFill size={40} style={{ display: 'block' }} />
              </div>
            </div>
          </>
        )}
        <style>{`
          .searchbar-white-placeholder::placeholder {
            color: #fff !important;
            opacity: 1;
          }
          input[placeholder="Search..."]::placeholder {
            color: #fff !important;
            opacity: 1;
          }
          html, body {
            overflow: hidden !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        `}</style>
      </div>
    </>
  );
};

export default Overlay;



