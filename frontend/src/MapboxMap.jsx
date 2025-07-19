import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Overlay from './Overlay';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDropzone } from 'react-dropzone';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MdOutlineFileUpload } from "react-icons/md";
import { MdClose } from "react-icons/md";

// Realistic potted plant SVG icon for marker
const plantSVG = `<svg width="56" height="56" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="20" cy="34" rx="10" ry="4" fill="#795548"/>
  <rect x="15" y="20" width="10" height="14" rx="5" fill="#8BC34A"/>
  <path d="M20 20C20 10 30 10 30 20" stroke="#388E3C" stroke-width="2" fill="none"/>
  <path d="M20 20C20 10 10 10 10 20" stroke="#388E3C" stroke-width="2" fill="none"/>
  <circle cx="20" cy="16" r="3" fill="#4CAF50"/>
</svg>`;

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FpYm9odWFuZyIsImEiOiJjbWQ5ZjBsY3IwNzQ1MnBxMTcwbTU5djNqIn0.EAoOvgDb4m_eShy5rxM72g';

function MapboxMap() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [pendingPin, setPendingPin] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const showPopupRef = useRef(false);
  const [deletePin, setDeletePin] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [alertForCare, setAlertForCare] = useState(false);
  const [favoriteOnMap, setFavoriteOnMap] = useState(false);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [textValue, setTextValue] = useState('');
  // No animation or swipe state
  // No swipe or animation handlers

  const onDrop = (acceptedFiles) => {
    // Only accept image files
    const imageFile = acceptedFiles.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      setUploadedFile(imageFile);
    }
  };
  // Only accept image files in dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleMapClick = (e) => {
    if (showPopup) return;
    const { lng, lat } = e.lngLat;
    // Create a custom realistic plant icon marker
    const el = document.createElement('div');
    el.style.width = '56px';
    el.style.height = '56px';
    el.innerHTML = plantSVG;
    const tempMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
    setPendingPin({ lng, lat, marker: tempMarker });
    setShowPopup(true);
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: [-79.5022, 43.7705],
      zoom: 13,
      config: {
        basemap: { lightPreset: 'night' },
      },
    });

    map.on('load', () => {
      map.addLayer({
        id: 'terrain-data',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-terrain-v2',
        },
        'source-layer': 'contour',
      });
    });

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
    );

    map.on('click', handleMapClick);
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.off('click', handleMapClick);
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.off('click', handleMapClick);
    map.on('click', handleMapClick);
    return () => {
      if (map) map.off('click', handleMapClick);
    };
  }, [showPopup]);

  const setShowPopupAndRef = (val) => {
    showPopupRef.current = val;
    setShowPopup(val);
  };

  const handleSubmit = () => {
    if (!pendingPin || !mapRef.current) return;
    const marker = pendingPin.marker;
    // Make the marker permanent and add click-to-delete logic
    
    marker.getElement().addEventListener('click', (event) => {
      event.stopPropagation();
      setDeletePin({ marker, lng: pendingPin.lng, lat: pendingPin.lat });
      setShowDeletePopup(true);
    });
    markersRef.current.push(marker);
    // Send pin location to backend
    const formData = new FormData();
    formData.append('lat', pendingPin.lat);
    formData.append('lng', pendingPin.lng);
    formData.append('alertForCare', alertForCare);
    formData.append('favoriteOnMap', favoriteOnMap);
    if (uploadedFile) {
      formData.append('file', uploadedFile);
    }
    fetch('http://localhost:8000/admin/add', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));

    setShowPopupAndRef(false);
    setPendingPin(null);
  };

  // Remove the temp marker if popup is closed without submitting
  const handleCancel = () => {
    if (pendingPin && pendingPin.marker) {
      pendingPin.marker.remove();
    }
    setShowPopupAndRef(false);
    setPendingPin(null);
  };

  // Handler for delete button in delete popup
  const handleDelete = () => {
    if (!deletePin) return;
    deletePin.marker.remove();
    markersRef.current = markersRef.current.filter(m => m !== deletePin.marker);
    setShowDeletePopup(false);
    setDeletePin(null);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <div id="map" className="map" style={{ height: '100vh', width: '100vw' }} />
      <Overlay />
      {showPopup && (
        <div
          onTouchStart={() => {}}
          onTouchEnd={() => {}}
          onMouseDown={() => {}}
          onMouseUp={() => {}}
          style={{
          position: 'absolute',
          top: 32,
          right: 32,
          width: 340,
          background: 'rgba(76,175,80,0.10)',
          borderRadius: 32,
          border: '2px solid #fff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '24px 28px 20px 28px',
          gap: 12,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#fff',
        }}>
          <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{margin: 0, fontSize: 32, color: '#fff', fontWeight: 800, letterSpacing: 0.5, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'}}>Log Plant 🌱</h3>
            <button onClick={handleCancel} style={{ 
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
            }} title="Close">×</button>
          </div>
          <div style={{ marginBottom: 8, fontSize: 19, color: '#fff', fontWeight: 600, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
            <span>Location: {pendingPin ? `${pendingPin.lat.toFixed(4)}, ${pendingPin.lng.toFixed(4)}` : ''}</span>
          </div>
          {/* Drag-and-drop file upload area or text field */}
          <div style={{ position: 'relative', width: '100%', height: 'auto', minHeight: 0 }}>
            {inputMode === 'file' ? (
              <div {...getRootProps()}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 24,
                  border: '2px solid rgba(120,120,120,0.35)',
                  background: isDragActive ? 'rgba(80,80,80,0.32)' : 'rgba(80,80,80,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: '12px 0',
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
                  aspectRatio: '1 / 1',
                  borderRadius: 24,
                  border: '2px solid rgba(120,120,120,0.35)',
                  background: 'rgba(80,80,80,0.22)',
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 600,
                  margin: '12px 0',
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
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
              />
            )}
          </div>
          {/* Input mode switch circles (moved below) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 4, marginBottom: 2, width: '100%' }}>
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
          <button onClick={handleSubmit} style={{ 
            padding: '14px 0',
            width: '100%',
            fontSize: 18,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: 32,
            cursor: 'pointer',
            marginTop: 8,
            fontWeight: 700,
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            letterSpacing: 0.2,
            transition: 'background 0.2s',
          }}>Submit</button>
        </div>
      )}
      {showDeletePopup && (
        <div style={{
          position: 'absolute',
          top: 32,
          right: 32,
          width: 340,
          background: 'rgba(76,175,80,0.08)',
          borderRadius: 32,
          border: '2px solid #fff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '24px 28px 20px 28px',
          gap: 12,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#fff',
        }}>
          <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{margin: 0, fontSize: 22, color: '#fff', fontWeight: 700, letterSpacing: 0.5}}>Delete Pin</h3>
            <button onClick={() => { setShowDeletePopup(false); setDeletePin(null); }} style={{ 
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
            }} title="Close">×</button>
          </div>
          <div style={{ marginBottom: 8, fontSize: 16, color: '#fff', fontWeight: 500, letterSpacing: 0.2 }}>
            <span>Lat: {deletePin?.lat?.toFixed(4)}, Lng: {deletePin?.lng?.toFixed(4)}</span>
          </div>
          <button onClick={handleDelete} style={{ 
            padding: '14px 0',
            width: '100%',
            fontSize: 18,
            background: 'rgba(76,175,80,0.08)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: 32,
            cursor: 'pointer',
            marginTop: 8,
            fontWeight: 700,
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            letterSpacing: 0.2,
            transition: 'background 0.2s',
          }}>Delete</button>
        </div>
      )}
      {/* Liquid glass button and search bar hover animation styles */}
      <style>{`
        button:not(.add-plant-btn-glass), .searchbar-white-placeholder, input[placeholder="Search..."] {
          transition: background 2s ease-in-out, color 2s ease-in-out, border 2s ease-in-out, box-shadow 2s ease-in-out, transform 2s ease-in-out, backdrop-filter 2s ease-in-out;
          background: rgba(255,255,255,0.18);
          border: 2px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        button:not(.add-plant-btn-glass):hover, button:not(.add-plant-btn-glass):focus-visible,
        .searchbar-white-placeholder:hover, .searchbar-white-placeholder:focus,
        input[placeholder="Search..."]:hover, input[placeholder="Search..."]:focus {
          transform: scale(1.09);
          box-shadow: 0 8px 32px 0 rgba(76,175,80,0.22), 0 2px 12px 0 rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.28);
          border-color: #aee9c7;
          color: #1b3a2b;
          backdrop-filter: blur(16px) saturate(1.2);
          -webkit-backdrop-filter: blur(16px) saturate(1.2);
        }
      `}</style>
    </div>
  );
}

export default MapboxMap;
