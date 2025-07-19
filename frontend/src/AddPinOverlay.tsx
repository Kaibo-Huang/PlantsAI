import React from "react";

import { useState } from "react";

interface AddPinOverlayProps {
  lat: number;
  lng: number;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddPinOverlay: React.FC<AddPinOverlayProps> = ({
  lat,
  lng,
  onSubmit,
  onCancel,
}) => {
  const [inputMode, setInputMode] = useState<'file' | 'text'>('text');
  const [textValue, setTextValue] = useState('');
  return (
    <div
      style={{
        position: "absolute",
        top: 32,
        right: 32,
        width: 340,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "24px 28px 20px 28px",
        gap: 12,
        animation: 'pulse 0.6s infinite',
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 20 }}>Log Plant</h3>
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#888",
            cursor: "pointer",
            lineHeight: 1,
          }}
          title="Close"
        >
          ×
        </button>
      </div>
      <div style={{ marginBottom: 8, fontSize: 15, color: "#444" }}>
        <span>
          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
        </span>
      </div>
      {/* Input mode switch circles */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 0, marginBottom: 2, width: '100%' }}>
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
      {/* Text field for plant info */}
      {inputMode === 'text' && (
        <textarea
          style={{
            width: '100%',
            minHeight: 180,
            height: 180,
            border: '2px solid rgba(120,120,120,0.35)',
            borderRadius: 16,
            background: 'rgba(80,80,80,0.08)',
            color: '#222',
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 4px 0',
            padding: 18,
            resize: 'none',
            outline: 'none',
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
            letterSpacing: 0.2,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            textAlign: 'left',
          }}
          placeholder="Input plant name and info"
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
        />
      )}
      <button
        onClick={onSubmit}
        style={{
          padding: "10px 0",
          width: "100%",
          fontSize: 16,
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginTop: 8,
          animation: 'pulse 0.6s infinite',
        }}
      >
        Submit
      </button>
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(76,175,80,0.95),
              0 0 0 0 rgba(56,142,60,0.75),
              0 0 0 0 rgba(139,195,74,0.55);
          }
          70% {
            box-shadow:
              0 0 0 60px rgba(76,175,80,0.55),
              0 0 0 90px rgba(56,142,60,0.35),
              0 0 0 120px rgba(139,195,74,0.18);
          }
          100% {
            box-shadow:
              0 0 0 0 rgba(76,175,80,0.95),
              0 0 0 0 rgba(56,142,60,0.75),
              0 0 0 0 rgba(139,195,74,0.55);
          }
        }
      `}</style>
    </div>
  );
};

export default AddPinOverlay;
