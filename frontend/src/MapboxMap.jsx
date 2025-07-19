import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import Overlay from './Overlay';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDropzone } from 'react-dropzone';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MdOutlineFileUpload } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { MdLocationOn, MdOpacity, MdScience, MdDeviceThermostat, MdWarning } from "react-icons/md";
import PinQueryCard from './PinQueryCard';

// Realistic potted plant SVG icon for marker (shaft is now orange, base is separate for animation)
const plantSVG = `<svg width="56" height="56" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse class="plant-base" cx="20" cy="34" rx="10" ry="4" fill="#795548"/>
  <g class="plant-top">
    <rect x="15" y="20" width="10" height="14" rx="5" fill="#ff9800"/>
    <path d="M20 20C20 10 30 10 30 20" stroke="#388E3C" stroke-width="2" fill="none"/>
    <path d="M20 20C20 10 10 10 10 20" stroke="#388E3C" stroke-width="2" fill="none"/>
    <circle cx="20" cy="16" r="3" fill="#4CAF50"/>
  </g>
</svg>`;

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FpYm9odWFuZyIsImEiOiJjbWQ5ZjBsY3IwNzQ1MnBxMTcwbTU5djNqIn0.EAoOvgDb4m_eShy5rxM72g';

const MapboxMap = forwardRef((props, ref) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [pins, setPins] = useState([]);
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
  const [isEndangered, setIsEndangered] = useState(true); // Example: set dynamically
  const [isInvasive, setIsInvasive] = useState(true);     // Example: set dynamically

  // No animation or swipe state
  // No swipe or animation handlers

  // Track the last selected marker for robust cleanup
  const lastSelectedMarkerRef = useRef(null);

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
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    const inner = document.createElement('div');
    inner.className = 'pending-marker';
    inner.innerHTML = plantSVG;
    el.appendChild(inner);
    // Function to emit dirt
    function emitDirt() {
      const dirtContainer = document.createElement('div');
      dirtContainer.className = 'dirt-container';
      for (let i = 0; i < 10; i++) {
        const dirt = document.createElement('div');
        dirt.className = 'dirt-pixel';
        // Randomize angle and distance
        const angle = Math.random() * Math.PI - Math.PI / 2; // -90deg to +90deg
        const dist = 18 + Math.random() * 18; // px
        const x = Math.cos(angle) * dist;
        const y = -Math.abs(Math.sin(angle) * dist) - 8; // always up
        const delay = Math.random() * 0.18;
        dirt.style.setProperty('--dirt-x', `${x}px`);
        dirt.style.setProperty('--dirt-y', `${y}px`);
        dirt.style.animationDelay = `${delay}s`;
        dirtContainer.appendChild(dirt);
      }
      el.appendChild(dirtContainer);
      setTimeout(() => {
        if (dirtContainer && dirtContainer.parentNode) {
          dirtContainer.parentNode.removeChild(dirtContainer);
        }
      }, 700);
    }
    // Start dirt emission interval
    emitDirt();
    const dirtInterval = setInterval(emitDirt, 700);
    el._dirtInterval = dirtInterval;
    const tempMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
    setPendingPin({ lng, lat, marker: tempMarker });
    setShowPopup(true);
  };

  useEffect(() => {
    fetch('http://localhost:8000/admin/view')
      .then(res => res.json())
      .then(data => setPins(data));
  }, []);

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

    let geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.addControl(geolocateControl);

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
      // Automatically trigger geolocation on load
      geolocateControl.trigger();
      // Hide the geolocate button after triggering
      const geoBtn = document.querySelector('.mapboxgl-ctrl-geolocate');
      if (geoBtn) geoBtn.style.display = 'none';
    });

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

  useEffect(() => {
    if (!mapRef.current || !pins || !Array.isArray(pins)) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each pin
    pins.forEach(pin => {
      if (
        pin.geometry &&
        pin.geometry.coordinates &&
        pin.geometry.coordinates.length === 2
      ) {
        const [lat, lon] = pin.geometry.coordinates;
        const el = document.createElement('div');
        el.innerHTML = plantSVG;
        el.style.width = '56px';
        el.style.height = '56px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lon, lat])
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    });
  }, [pins]);

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
      // Add shake to selected marker (after popup is shown)
      setTimeout(() => {
        const el = marker.getElement();
        if (el) {
          // Find the correct inner div (pending or not)
          let inner = el.querySelector('.pending-marker');
          if (!inner) inner = el.querySelector('div');
          if (inner && !inner.classList.contains('pending-marker')) inner.classList.add('pending-marker');
          // Start dirt emission interval for selected marker
          if (!el._dirtInterval) {
            function emitDirt() {
              const dirtContainer = document.createElement('div');
              dirtContainer.className = 'dirt-container';
              for (let i = 0; i < 10; i++) {
                const dirt = document.createElement('div');
                dirt.className = 'dirt-pixel';
                const angle = Math.random() * Math.PI - Math.PI / 2;
                const dist = 18 + Math.random() * 18;
                const x = Math.cos(angle) * dist;
                const y = -Math.abs(Math.sin(angle) * dist) - 8;
                const delay = Math.random() * 0.18;
                dirt.style.setProperty('--dirt-x', `${x}px`);
                dirt.style.setProperty('--dirt-y', `${y}px`);
                dirt.style.animationDelay = `${delay}s`;
                dirtContainer.appendChild(dirt);
              }
              el.appendChild(dirtContainer);
              setTimeout(() => {
                if (dirtContainer && dirtContainer.parentNode) {
                  dirtContainer.parentNode.removeChild(dirtContainer);
                }
              }, 700);
            }
            emitDirt();
            el._dirtInterval = setInterval(emitDirt, 700);
          }
          lastSelectedMarkerRef.current = el;
        }
      }, 0);
    });
    // Remove the pending-marker class from the inner div so it stops shaking
    const el = marker.getElement();
    if (el) {
      const inner = el.querySelector('.pending-marker');
      if (inner) inner.classList.remove('pending-marker');
      // Stop dirt emission
      if (el._dirtInterval) {
        clearInterval(el._dirtInterval);
        el._dirtInterval = null;
      }
    }
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
      // Stop dirt emission
      const el = pendingPin.marker.getElement();
      if (el && el._dirtInterval) {
        clearInterval(el._dirtInterval);
        el._dirtInterval = null;
      }
      pendingPin.marker.remove();
    }
    setShowPopupAndRef(false);
    setPendingPin(null);
  };

  // Handler for delete button in delete popup
  const handleDelete = () => {
    if (!deletePin) return;
    // Remove shake from marker
    const el = deletePin.marker.getElement();
    if (el) {
      let inner = el.querySelector('.pending-marker');
      if (!inner) inner = el.querySelector('div');
      if (inner && inner.classList.contains('pending-marker')) inner.classList.remove('pending-marker');
      // Stop dirt emission
      if (el._dirtInterval) {
        clearInterval(el._dirtInterval);
        el._dirtInterval = null;
      }
      // Play pullout animation
      if (inner) {
        // Add marker-pullout class to the wrapper
        inner.classList.add('marker-pullout');
        // Animate plant-top and plant-base separately
        const svg = inner.querySelector('svg');
        if (svg) {
          const top = svg.querySelector('.plant-top');
          const base = svg.querySelector('.plant-base');
          if (top) top.classList.add('marker-pullout-top');
          if (base) base.classList.add('marker-pullout-base');
        }
        setTimeout(() => {
          deletePin.marker.remove();
          markersRef.current = markersRef.current.filter(m => m !== deletePin.marker);
          setShowDeletePopup(false);
          setDeletePin(null);
        }, 700);
        return;
      }
    }
    // fallback if no inner
    deletePin.marker.remove();
    markersRef.current = markersRef.current.filter(m => m !== deletePin.marker);
    setShowDeletePopup(false);
    setDeletePin(null);
  };

  // Remove shake and dirt when delete popup is closed (not deleted)
  useEffect(() => {
    if (!showDeletePopup && lastSelectedMarkerRef.current) {
      const el = lastSelectedMarkerRef.current;
      let inner = el.querySelector('.pending-marker');
      if (!inner) inner = el.querySelector('div');
      if (inner && inner.classList.contains('pending-marker')) inner.classList.remove('pending-marker');
      if (el._dirtInterval) {
        clearInterval(el._dirtInterval);
        el._dirtInterval = null;
      }
      lastSelectedMarkerRef.current = null;
    }
    // eslint-disable-next-line
  }, [showDeletePopup]);

  // Utility: get color based on percent (0-1)
  function getStatusColor(percent) {
    if (percent > 0.6) return "#4caf50"; // green
    if (percent > 0.3) return "#ffb300"; // yellow
    return "#e53935"; // red
  }

  // CircularIndicator: icon in center, progress ring around
  function CircularIndicator({ percent, icon, size = 32 }) {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(1, percent));
    const strokeColor = getStatusColor(progress);

    return (
      <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
        <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke 0.3s, stroke-dashoffset 0.3s" }}
          />
        </svg>
        <span style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {icon}
        </span>
      </span>
    );
  }

  useImperativeHandle(ref, () => ({
    flyToLocation: (lat, lng) => {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 16, essential: true });
      }
    }
  }));

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <div id="map" className="map" style={{ height: '100vh', width: '100vw' }} />
      <div style={{
        position: 'fixed',
        left: '50%',
        bottom: 32,
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(76,175,80,0.10)',
        borderRadius: 32,
        border: '2px solid #fff',
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#fff',
        padding: '24px 28px 20px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        minWidth: 320,
        maxWidth: 400,
      }}>
        <PinQueryCard />
      </div>
      <Overlay />
      {showPopup && (
        <div
          onTouchStart={() => { }}
          onTouchEnd={() => { }}
          onMouseDown={() => { }}
          onMouseUp={() => { }}
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
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 32, color: '#fff', fontWeight: 800, letterSpacing: 0.5, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Log Plant 🌱</h3>
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
          }}>Submit</button>
        </div>
      )}
      {showDeletePopup && (
        <div style={{
          position: 'absolute',
          top: 32,
          right: 32,
          width: 340,
          // Overlay tint logic: red if endangered, yellow if invasive, else green
          background: isEndangered
            ? 'rgba(229,57,53,0.13)'
            : isInvasive
              ? 'rgba(255,179,0,0.13)'
              : 'rgba(76,175,80,0.08)',
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
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 22, color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>INSERT PLANT NAME</h3>
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
          {/* --- Added Plant Status Indicators --- */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            margin: '8px 0 0 0'
          }}>
            {/* Location Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 12,
                padding: '8px 12px',
                fontWeight: 600,
                fontSize: 15,
                color: '#fff',
                transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                cursor: 'pointer'
              }}
              className="indicator-hover"
            >
              {/* Icon */}
              <MdLocationOn size={20} color="#2196f3" style={{ flexShrink: 0 }} />
              {/* Removed blue dot */}
              <span>
                Lat: <span style={{ fontWeight: 700 }}>{deletePin?.lat?.toFixed(4)}</span>, Lng: <span style={{ fontWeight: 700 }}>{deletePin?.lng?.toFixed(4)}</span>
              </span>
            </div>
            {/* Next Water Timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 12,
                padding: '8px 12px',
                fontWeight: 600,
                fontSize: 15,
                color: '#fff',
                transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                cursor: 'pointer'
              }}
              className="indicator-hover"
            >
              <CircularIndicator
                percent={0.7}
                icon={<MdOpacity size={18} color={getStatusColor(0.7)} />}
              />
              <span>
                <span style={{ color: "#fff" }}>Next watering in</span> <span style={{ fontWeight: 700, color: getStatusColor(0.7) }}>DATE</span>
              </span>
            </div>
            {/* pH Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 12,
                padding: '8px 12px',
                fontWeight: 600,
                fontSize: 15,
                color: '#fff',
                transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                cursor: 'pointer'
              }}
              className="indicator-hover"
            >
              <CircularIndicator
                percent={0.5}
                icon={<MdScience size={18} color={getStatusColor(0.5)} />}
              />
              <span>
                <span style={{ color: "#fff" }}>Soil pH:</span> <span style={{ fontWeight: 700, color: getStatusColor(0.5) }}>INSERT SOIL PH</span>
                <span style={{ color: getStatusColor(0.5), fontWeight: 700, marginLeft: 4 }}>{0.5 > 0.3 ? 'Good' : 'Bad'}</span>
              </span>
            </div>
            {/* Temperature Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 12,
                padding: '8px 12px',
                fontWeight: 600,
                fontSize: 15,
                color: '#fff',
                transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                cursor: 'pointer'
              }}
              className="indicator-hover"
            >
              <CircularIndicator
                percent={0.2}
                icon={<MdDeviceThermostat size={18} color={getStatusColor(0.2)} />}
              />
              <span>
                <span style={{ color: "#fff" }}>Temperature:</span> <span style={{ fontWeight: 700, color: getStatusColor(0.2) }}>TEMPERATURE°C</span>
                <span style={{ color: getStatusColor(0.2), fontWeight: 700, marginLeft: 4 }}>{0.2 > 0.3 ? 'Good' : 'Too Low'}</span>
              </span>
            </div>
            {/* Endangered Indicator */}
            {isEndangered && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.10)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#fff',
                  transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                  cursor: 'pointer'
                }}
                className="indicator-hover"
              >
                <MdWarning size={20} color="#e53935" style={{ flexShrink: 0 }} />
                <span>
                  <span style={{ fontWeight: 700, color: '#e53935' }}>Endangered</span>
                </span>
              </div>
            )}
            {/* Invasive Indicator */}
            {isInvasive && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.10)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#fff',
                  transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                  cursor: 'pointer'
                }}
                className="indicator-hover"
              >
                <MdWarning size={20} color="#ffb300" style={{ flexShrink: 0 }} />
                <span>
                  <span style={{ fontWeight: 700, color: '#ffb300' }}>Invasive</span>
                </span>
              </div>
            )}
            {/* Summary Header */}
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: '#fff',
                marginTop: 8,
                marginBottom: 2,
                letterSpacing: 0.2,
                fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
                // No hover/transition/cursor here
              }}
            >
              Summary
            </div>
            {/* Plant Description */}
            <div
              style={{
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 12,
                padding: '12px 14px',
                fontWeight: 500,
                fontSize: 15,
                color: '#fff',
                marginTop: 2,
                minHeight: 60,
                lineHeight: 1.5,
                letterSpacing: 0.1,
                fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                transition: 'transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)',
                cursor: 'pointer'
              }}
              className="indicator-hover"
            >
              {/* Replace with actual plant description */}
              <span>
                This is a placeholder for a plant description. It should be up to 50 words and provide information about the plant, its habitat, care requirements, and any interesting facts or notes relevant to its identification or conservation.
              </span>
            </div>
          </div>
          {/* --- End Plant Status Indicators --- */}
          <button
            onClick={handleDelete}
            style={{
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
              transition: 'background 0.2s, transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s cubic-bezier(.4,1.3,.6,1)'
            }}
            className="indicator-hover"
          >Delete</button>
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
        /* Hide Mapbox logo and attribution (development only) */
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
        /* Indicator hover effect */
        .indicator-hover:hover {
          transform: scale(1.045);
          box-shadow: 0 4px 18px 0 rgba(76,175,80,0.13), 0 2px 8px 0 rgba(255,255,255,0.13);
        }
        /* Removed searchbar hover/focus animation */
        /*
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
        */
      `}</style>
      {/* Pending marker and dirt animation style */}
      <style>{`
        .pending-marker {
          animation: shake-grow 0.7s infinite;
          transform: scale(1.18);
          z-index: 9999 !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes shake-grow {
          0% { transform: scale(1.18) translateX(0); }
          20% { transform: scale(1.18) translateX(-4px); }
          40% { transform: scale(1.18) translateX(4px); }
          60% { transform: scale(1.18) translateX(-4px); }
          80% { transform: scale(1.18) translateX(4px); }
          100% { transform: scale(1.18) translateX(0); }
        }
        .dirt-container {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          pointer-events: none;
        }
        .dirt-pixel {
          position: absolute;
          left: 0;
          top: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6d4c2b;
          opacity: 0.85;
          box-shadow: 0 1px 2px #3e2723;
          animation: dirt-fly 0.7s cubic-bezier(.4,1.3,.6,1) forwards;
        }
        @keyframes dirt-fly {
          0% {
            opacity: 0.85;
            transform: translate(0,0) scale(1);
          }
          60% {
            opacity: 1;
            transform: translate(var(--dirt-x), var(--dirt-y)) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--dirt-x), var(--dirt-y)) scale(0.7);
          }
        }
      `}</style>
      {/* Marker pullout animation style */}
      <style>{`
        .marker-pullout {
          /* no-op, just for targeting */
        }
        .marker-pullout-top {
          animation: marker-pullout-top-anim 0.7s cubic-bezier(.4,1.3,.6,1) forwards;
        }
        .marker-pullout-base {
          animation: marker-pullout-base-anim 0.7s cubic-bezier(.4,1.3,.6,1) forwards;
        }
        @keyframes marker-pullout-top-anim {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          60% {
            opacity: 1;
            transform: translateY(-18px);
          }
          100% {
            opacity: 0;
            transform: translateY(-48px);
          }
        }
        @keyframes marker-pullout-base-anim {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});

export default MapboxMap;
