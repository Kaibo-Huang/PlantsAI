import React, { useState, useEffect } from 'react';
import { RiPlantFill } from "react-icons/ri";
import { useDropzone } from 'react-dropzone';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MdOutlineFileUpload } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { getUserLocation } from './getUserLocation';

const Overlay = ({ onSearchResultClick }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddPlantOverlay, setShowAddPlantOverlay] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [alertForCare, setAlertForCare] = useState(false);
  const [favoriteOnMap, setFavoriteOnMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [geminiOverlayOpen, setGeminiOverlayOpen] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const res = await fetch(`http://localhost:8000/admin/search?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    console.log('Search results:', data); // Debug: log the results
    setSearchResults(data);
  };

  useEffect(() => {
    if (showAddPlantOverlay) {
      getUserLocation()
        .then(loc => {
          setUserLocation(loc);
          setLocationError(null);
        })
        .catch(err => {
          setUserLocation(null);
          setLocationError('Location unavailable');
        });
    }
  }, [showAddPlantOverlay]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Add Gemini button handler
  const handleGeminiLocation = async () => {
    setGeminiOverlayOpen(true);
    setGeminiLoading(true);
    setGeminiResult(null);
    if (!navigator.geolocation) {
      setGeminiResult("Geolocation is not supported by your browser.");
      setGeminiLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch('http://localhost:8001/gemini/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });
        const data = await res.json();
        setGeminiResult(data.response || data.error);
      } catch (err) {
        setGeminiResult('Error contacting Gemini backend.');
      } finally {
        setGeminiLoading(false);
      }
    });
  };

  // Helper to parse Gemini result into Plants (list) and Technical Tips (blurb)
  function parseGeminiResult(result) {
    if (!result) return { plants: [], tips: '' };
    const lines = result.split('\n');
    let plants = [];
    let tipsLines = [];
    let foundList = false;
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Recognize bulleted (-, *) or numbered (1., 2., etc.) lists
      if (line.trim().match(/^([-*]\s+|\d+\.\s+)/)) {
        if (!foundList) {
          foundList = true;
          inList = true;
        }
        if (inList && foundList) {
          plants.push(line.trim().replace(/^([-*]\s+|\d+\.\s+)/, ''));
        }
      } else if (inList && foundList && line.trim() === '') {
        // End of list
        inList = false;
      } else {
        if (!foundList || !inList) {
          tipsLines.push(line);
        }
      }
    }
    // Remove empty lines from tips
    tipsLines = tipsLines.filter(l => l.trim() !== '');
    return { plants, tips: tipsLines.join('\n') };
  }

  // Add a thick, bold white question mark SVG for the Gemini button (no outline)
  const BrainSVG = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="19" y="30" textAnchor="middle" fontSize="38" fontWeight="900" fill="#fff" fontFamily="Arial Black, Arial, Helvetica, sans-serif">?</text>
    </svg>
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 30,
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
        }}
      >
        {/* Large Add Plant Overlay */}
        {showAddPlantOverlay && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 440,
              minHeight: 220,
              background: 'rgba(76,175,80,0.10)',
              borderRadius: 48,
              border: '2px solid #fff',
              boxShadow: '0 2px 32px rgba(0,0,0,0.18)',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 18px',
              gap: 10,
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
              fontSize: 37,
              margin: 0,
              marginBottom: 0,
              letterSpacing: 0.5,
              fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
            }}>Log a New Plant 🌱 </h2>
            {/* Show current location */}
            <div style={{ marginBottom: 12, marginTop: 0, fontSize: 19, color: '#fff', fontWeight: 600, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
              {userLocation ? (
                <span>Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
              ) : locationError ? (
                <span style={{ color: '#f44336' }}>Location unavailable</span>
              ) : (
                <span>Getting location...</span>
              )}
            </div>
            {/* Drag-and-drop file upload area or text input */}
            {inputMode === 'file' ? (
              <div {...getRootProps()}
                style={{
                  width: '100%',
                  minHeight: 180,
                  height: 400,
                  border: '2px solid rgba(120,120,120,0.35)',
                  borderRadius: 24,
                  background: isDragActive ? 'rgba(80,80,80,0.32)' : 'rgba(80,80,80,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: '12px 0 4px 0',
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: 0.2,
                      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <MdOutlineFileUpload size={22} color="#4caf50" />
                      Photo uploaded
                    </span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        marginLeft: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      title="Remove file"
                    >
                      <MdClose size={22} color="#fff" />
                    </button>
                  </span>
                ) : isDragActive ? (
                  <span style={{ color: '#4caf50', fontWeight: 700, fontSize: 16, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Drop the file here ...</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MdOutlineFileUpload size={28} color="#4caf50" />
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 16, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif', letterSpacing: 0.2 }}>
                      Upload plant image
                    </span>
                  </span>
                )}
              </div>
            ) : (
              <textarea
                style={{
                  width: '100%',
                  minHeight: 180,
                  height: 400,
                  border: '2px solid rgba(120,120,120,0.35)',
                  borderRadius: 24,
                  background: 'rgba(80,80,80,0.22)',
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 600,
                  margin: '12px 0 4px 0',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  resize: 'none',
                  outline: 'none',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                  letterSpacing: 0.2,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  textAlign: 'center',
                }}
                placeholder="Input plant name and info"
              />
            )}
            {/* Input mode switch circles */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 0, marginBottom: 2 }}>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: '50%',
                  border: '2px solid #bbb',
                  background: inputMode === 'file' ? '#f5f5f5' : '#bdbdbd',
                  margin: 0,
                  padding: 0,
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border 0.2s, background 0.2s',
                }}
                title="Upload image"
                aria-label="Upload image"
              />
              <button
                type="button"
                onClick={() => setInputMode('text')}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: '50%',
                  border: '2px solid #bbb',
                  background: inputMode === 'text' ? '#f5f5f5' : '#bdbdbd',
                  margin: 0,
                  padding: 0,
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border 0.2s, background 0.2s',
                }}
                title="Input text"
                aria-label="Input text"
              />
            </div>
            {/* Submit and Gemini buttons */}
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 10 }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  marginTop: 8,
                  borderRadius: 32,
                  border: '2px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.2,
                  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  outline: 'none',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
                onClick={() => {/* TODO: handle submit */ }}
              >
                Submit
              </button>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  marginTop: 8,
                  borderRadius: 32,
                  border: '2px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.2,
                  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  outline: 'none',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  marginLeft: 10,
                }}
                onClick={handleGeminiLocation}
              >
                Gemini
              </button>
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
                  width: 420,
                  position: 'relative',
                  pointerEvents: 'auto',
                }}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                  style={{
                    width: 420,
                    padding: '15px 32px 15px 48px',
                    borderRadius: searchResults.length > 0 ? '32px 32px 0 0' : '32px',
                    border: '1px solid #fff',
                    fontSize: 18,
                    fontWeight: 600,
                    outline: 'none', // Remove outline
                    background: 'rgba(76,175,80,0.10)',
                    color: '#fff',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    letterSpacing: 0.2,
                    transition: 'box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  className="searchbar-white-placeholder"
                />
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%', // flush with search bar
                    left: 0,
                    width: 420,
                    background: 'rgba(76,175,80,0.10)',
                    color: '#222',
                    borderRadius: '0 0 24px 24px',
                    zIndex: 200,
                    padding: 16,
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    borderTop: 'none', // connect to search bar
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    transition: 'box-shadow 0.2s, background 0.2s',
                    boxSizing: 'border-box',
                  }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {searchResults.map((coords, idx) => (
                        <li key={idx}>
                          <button
                            className="search-dropdown-btn"
                            style={{
                              width: '100%',
                              padding: '14px',
                              margin: '8px 0',
                              borderRadius: 18,
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              background: 'rgba(255,255,255,0.28)',
                              color: '#1b3a2b',
                              fontWeight: 700,
                              fontSize: 17,
                              cursor: 'pointer',
                              boxShadow: '0 2px 16px rgba(31,38,135,0.10)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              transition: 'background 0.2s, box-shadow 0.2s',
                            }}
                            onClick={() => onSearchResultClick(coords[0], coords[1])}
                          >
                            Location: {coords[0]?.toFixed(4)},{coords[1]?.toFixed(4)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* Bottom left add plant button and Gemini button */}
            <div style={{ position: 'absolute', left: 40, bottom: 48, pointerEvents: 'auto', display: 'flex', flexDirection: 'row', gap: 18 }}>
              <div
                className="add-plant-btn-glass"
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
                  transition: 'background 0.35s cubic-bezier(.4,1.3,.6,1), color 0.35s cubic-bezier(.4,1.3,.6,1), border 0.35s cubic-bezier(.4,1.3,.6,1), box-shadow 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1), backdrop-filter 0.35s cubic-bezier(.4,1.3,.6,1)',
                }}
                onClick={() => setShowAddPlantOverlay(true)}
                title="Add Plant"
              >
                <RiPlantFill size={40} style={{ display: 'block' }} />
              </div>
              <div
                className="add-plant-btn-glass"
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
                  transition: 'background 0.35s cubic-bezier(.4,1.3,.6,1), color 0.35s cubic-bezier(.4,1.3,.6,1), border 0.35s cubic-bezier(.4,1.3,.6,1), box-shadow 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1), backdrop-filter 0.35s cubic-bezier(.4,1.3,.6,1)',
                }}
                onClick={handleGeminiLocation}
                title="Gemini Location"
              >
                <BrainSVG />
              </div>
            </div>
          </>
        )}
        {/* Gemini Result Overlay */}
        {geminiOverlayOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(2px)',
          }}>
            <div style={{
              minWidth: 340,
              maxWidth: 540,
              minHeight: 180,
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 32,
              border: '2px solid #fff',
              boxShadow: '0 2px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 32px 28px 32px',
              gap: 18,
              pointerEvents: 'auto',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#222',
              fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
              position: 'relative',
            }}>
              <button
                onClick={() => setGeminiOverlayOpen(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: '9999px',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#222',
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
              <h2 style={{ fontWeight: 800, fontSize: 28, margin: 0, marginBottom: 10, letterSpacing: 0.5, color: '#388e3c' }}>Localized Gardening Guidebook</h2>
              {geminiLoading ? (
                <div style={{ fontSize: 20, color: '#4caf50', margin: '32px 0' }}>Loading...</div>
              ) : (
                (() => {
                  const { plants, tips } = parseGeminiResult(geminiResult);
                  return (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'flex-start' }}>
                      {/* Plants column */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#222', marginBottom: 8, marginTop: 8, textAlign: 'left' }}>Plants</div>
                        {plants.length > 0 ? (
                          <ul style={{ fontSize: 17, color: '#222', margin: 0, marginBottom: 18, paddingLeft: 24 }}>
                            {plants.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ fontSize: 17, color: '#888', marginBottom: 18 }}>No plant list found.</div>
                        )}
                      </div>
                      {/* Technical Tips column */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#222', marginBottom: 8, marginTop: 8, textAlign: 'left' }}>Technical Tips</div>
                        <div style={{ fontSize: 17, color: '#222', whiteSpace: 'pre-line', textAlign: 'left' }}>{tips || 'No technical tips found.'}</div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
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
          .add-plant-btn-glass {
            transition: background 0.35s cubic-bezier(.4,1.3,.6,1), color 0.35s cubic-bezier(.4,1.3,.6,1), border 0.35s cubic-bezier(.4,1.3,.6,1), box-shadow 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1), backdrop-filter 0.35s cubic-bezier(.4,1.3,.6,1);
          }
          .add-plant-btn-glass:hover, .add-plant-btn-glass:focus-visible {
            transform: scale(1.09);
            box-shadow: 0 8px 32px 0 rgba(76,175,80,0.22), 0 2px 12px 0 rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.28);
            border-color: #aee9c7;
            color: #1b3a2b;
            backdrop-filter: blur(16px) saturate(1.2);
            -webkit-backdrop-filter: blur(16px) saturate(1.2);
          }
          /* Search dropdown button hover effect for liquid glass aesthetic */
          .search-dropdown-btn {
            transition: border 0.22s cubic-bezier(.4,1.3,.6,1), box-shadow 0.22s cubic-bezier(.4,1.3,.6,1);
          }
          .search-dropdown-btn:hover, .search-dropdown-btn:focus-visible {
            border: 2.5px solid #bfc9d1 !important;
            box-shadow: 0 4px 24px 0 rgba(76,175,80,0.13), 0 2px 12px 0 rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.32) !important;
            outline: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default Overlay;