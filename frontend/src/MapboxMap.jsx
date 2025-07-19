import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FpYm9odWFuZyIsImEiOiJjbWQ5ZjBsY3IwNzQ1MnBxMTcwbTU5djNqIn0.EAoOvgDb4m_eShy5rxM72g';

function MapboxMap() {
  const mapRef = useRef(null);
  const markersRef = useRef([]); // Store marker instances

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

    // Add marker on map click
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  return <div id="map" className="map" />;
}

export default MapboxMap;
