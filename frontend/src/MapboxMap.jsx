import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FpYm9odWFuZyIsImEiOiJjbWQ5ZjBsY3IwNzQ1MnBxMTcwbTU5djNqIn0.EAoOvgDb4m_eShy5rxM72g';

function MapboxMap() {
  const mapRef = useRef(null);
  const markersRef = useRef([]); // Store marker instances
  const [pendingPin, setPendingPin] = useState(null); // {lng, lat} or null
  const [showPopup, setShowPopup] = useState(false);
  const [deletePin, setDeletePin] = useState(null); // {marker, lng, lat} or null
  const [showDeletePopup, setShowDeletePopup] = useState(false);

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

    // On map click, show popup instead of placing marker
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setPendingPin({ lng, lat });
      setShowPopup(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // Handler for submit button in popup
  const handleSubmit = () => {
    if (!pendingPin || !mapRef.current) return;
    const marker = new mapboxgl.Marker()
      .setLngLat([pendingPin.lng, pendingPin.lat])
      .addTo(mapRef.current);
    marker.getElement().addEventListener('click', (event) => {
      event.stopPropagation();
      setDeletePin({ marker, lng: pendingPin.lng, lat: pendingPin.lat });
      setShowDeletePopup(true);
    });
    markersRef.current.push(marker);
    setShowPopup(false);
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
      {showPopup && (
        <div style={{
          position: 'absolute',
          top: 32,
          right: 32,
          width: 340,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '24px 28px 20px 28px',
          gap: 12,
        }}>
          <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{margin: 0, fontSize: 20}}>Add Pin</h3>
            <button onClick={() => { setShowPopup(false); setPendingPin(null); }} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', lineHeight: 1 }} title="Close">×</button>
          </div>
          <div style={{ marginBottom: 8, fontSize: 15, color: '#444' }}>
            <span>Lat: {pendingPin?.lat.toFixed(4)}, Lng: {pendingPin?.lng.toFixed(4)}</span>
          </div>
          <button onClick={handleSubmit} style={{ padding: '10px 0', width: '100%', fontSize: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 8 }}>Submit</button>
        </div>
      )}
      {showDeletePopup && (
        <div style={{
          position: 'absolute',
          top: 32,
          right: 32,
          width: 340,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '24px 28px 20px 28px',
          gap: 12,
        }}>
          <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{margin: 0, fontSize: 20}}>Delete Pin</h3>
            <button onClick={() => { setShowDeletePopup(false); setDeletePin(null); }} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', lineHeight: 1 }} title="Close">×</button>
          </div>
          <div style={{ marginBottom: 8, fontSize: 15, color: '#444' }}>
            <span>Lat: {deletePin?.lat?.toFixed(4)}, Lng: {deletePin?.lng?.toFixed(4)}</span>
          </div>
          <button onClick={handleDelete} style={{ padding: '10px 0', width: '100%', fontSize: 16, background: '#c00', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 8 }}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default MapboxMap;
