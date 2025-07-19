import React from "react";

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
}) => (
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

export default AddPinOverlay;
