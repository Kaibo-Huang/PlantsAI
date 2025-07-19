import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Overlay from './Overlay';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FpYm9odWFuZyIsImEiOiJjbWQ5ZjBsY3IwNzQ1MnBxMTcwbTU5djNqIn0.EAoOvgDb4m_eShy5rxM72g';

function MapboxMap() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [pendingPin, setPendingPin] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const showPopupRef = useRef(false);
  const [deletePin, setDeletePin] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleMapClick = (e) => {
    if (showPopup) return;
    const { lng, lat } = e.lngLat;
    const tempMarker = new mapboxgl.Marker({ color: '#888' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
    setPendingPin({ lng, lat, marker: tempMarker });
    setShowPopup(true);
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
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
          background: 'rgba(255,255,255,0.25)',
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
            <h3 style={{margin: 0, fontSize: 22, color: '#fff', fontWeight: 700, letterSpacing: 0.5}}>Add Pin</h3>
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
          background: 'rgba(255,255,255,0.25)',
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
            background: 'rgba(255,0,0,0.25)',
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
