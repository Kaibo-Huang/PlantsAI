import React, { useState } from 'react';

function PinQueryCard() {
  const [queryType, setQueryType] = useState('near');
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState([]);

  const handleInput = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleQuery = async () => {
    let url = '';
    if (queryType === 'near') {
      url = `http://localhost:8000/pins/near?lat=${inputs.lat}&lon=${inputs.lon}&max_distance=${inputs.max_distance || 1000}`;
    } else if (queryType === 'cluster') {
      url = `http://localhost:8000/pins/cluster?cell_size=${inputs.cell_size || 500}`;
    } else if (queryType === 'bbox') {
      url = `http://localhost:8000/pins/bbox?min_lat=${inputs.min_lat}&min_lon=${inputs.min_lon}&max_lat=${inputs.max_lat}&max_lon=${inputs.max_lon}`;
    }
    const res = await fetch(url);
    setResults(await res.json());
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 12, maxWidth: 400 }}>
      <h3>Query the DB Geospatially...</h3>
      <select value={queryType} onChange={e => { setQueryType(e.target.value); setInputs({}); }}>
        <option value="near">Near</option>
        <option value="cluster">Cluster</option>
        <option value="bbox">Bounding Box</option>
      </select>
      {queryType === 'near' && (
        <>
          <input name="lat" placeholder="Lat" onChange={handleInput} />
          <input name="lon" placeholder="Lon" onChange={handleInput} />
          <input name="max_distance" placeholder="Distance (m)" onChange={handleInput} />
        </>
      )}
      {queryType === 'cluster' && (
        <input name="cell_size" placeholder="Cell Size (m)" onChange={handleInput} />
      )}
      {queryType === 'bbox' && (
        <>
          <input name="min_lat" placeholder="Min Lat" onChange={handleInput} />
          <input name="min_lon" placeholder="Min Lon" onChange={handleInput} />
          <input name="max_lat" placeholder="Max Lat" onChange={handleInput} />
          <input name="max_lon" placeholder="Max Lon" onChange={handleInput} />
        </>
      )}
      <button onClick={handleQuery}>Run Query</button>
      <pre style={{ fontSize: 12, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}

export default PinQueryCard;