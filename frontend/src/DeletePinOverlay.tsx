import React from "react";

interface DeletePinOverlayProps {
  lat: number;
  lng: number;
  onDelete: () => void;
  onCancel: () => void;
}

const DeletePinOverlay: React.FC<DeletePinOverlayProps> = ({
  lat,
  lng,
  onDelete,
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
      zIndex: 11,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "24px 28px 20px 28px",
      gap: 12,
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
      <h3 style={{ margin: 0, fontSize: 20 }}>INSERT PLANT NAME</h3>
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
      onClick={onDelete}
      style={{
        padding: "10px 0",
        width: "100%",
        fontSize: 16,
        background: "#c00",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        marginTop: 8,
      }}
    >
      Delete
    </button>
  </div>
);

export default DeletePinOverlay;
