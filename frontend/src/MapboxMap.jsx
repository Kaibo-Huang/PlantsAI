import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Overlay from './Overlay';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDropzone } from 'react-dropzone';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

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
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
    <div style={{ position: 'relative', height: '100%' }}>
      <div id="map" className="map" style={{ height: '100%' }} />
      <Overlay />
      {showPopup && (
        <div style={{
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
            <h3 style={{margin: 0, fontSize: 22, color: '#fff', fontWeight: 700, letterSpacing: 0.5, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'}}>Add Pin</h3>
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
          <div style={{ marginBottom: 8, fontSize: 16, color: '#fff', fontWeight: 500, letterSpacing: 0.2 }}>
            <span>Lat: {pendingPin?.lat.toFixed(4)}, Lng: {pendingPin?.lng.toFixed(4)}</span>
          </div>
          {/* Drag-and-drop file upload area */}
          <div {...getRootProps()}
            style={{
              width: '100%',
              minHeight: 80,
              border: '2px solid #fff',
              borderRadius: 24,
              background: isDragActive ? 'rgba(76,175,80,0.18)' : 'rgba(76,175,80,0.10)',
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
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Selected file: <b style={{ color: '#fff', fontWeight: 700 }}>{uploadedFile.name}</b></span>
            ) : isDragActive ? (
              <span style={{ color: '#4caf50', fontWeight: 700, fontSize: 16, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Drop the file here ...</span>
            ) : (
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 16, letterSpacing: 0.2, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' }}>Drag & drop a file here, or <span style={{ color: '#4caf50', textDecoration: 'underline', fontWeight: 700 }}>click to upload</span></span>
            )}
          </div>
          {/* Toggle switches */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 20, marginTop: 4, justifyContent: 'center', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={alertForCare} onChange={e => setAlertForCare(e.target.checked)} color="success" />}
              label={<span style={{ color: '#fff', fontWeight: 600, fontSize: 15, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif', letterSpacing: 0.2 }}>Alert for care</span>}
              style={{ marginLeft: 0 }}
            />
            <FormControlLabel
              control={<Switch checked={favoriteOnMap} onChange={e => setFavoriteOnMap(e.target.checked)} color="success" />}
              label={<span style={{ color: '#fff', fontWeight: 600, fontSize: 15, fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif', letterSpacing: 0.2 }}>Favorite on Map</span>}
              style={{ marginLeft: 0 }}
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
    </div>
  );
}

export default MapboxMap;
