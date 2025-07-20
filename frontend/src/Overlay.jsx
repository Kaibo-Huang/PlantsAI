import React, { useState } from "react";
import { RiPlantFill } from "react-icons/ri";
import { useDropzone } from "react-dropzone";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { MdOutlineFileUpload } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { getUserLocation } from "./getUserLocation";
import { GiArtificialIntelligence } from "react-icons/gi";

const Overlay = ({ onSearchResultClick, onAddRoseMarker, onAddRandomMarkers }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddPlantOverlay, setShowAddPlantOverlay] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputMode, setInputMode] = useState("file");
  const [showGeminiOverlay, setShowGeminiOverlay] = useState(false);

  // Only show Rose after 1s when search bar is focused
  const handleRoseDropdown = () => {
    setTimeout(() => {
      setSearchResults([[43.6532, -79.3832]]);
    }, 300);
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 30,
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
        }}
      >
        {/* Large Add Plant Overlay */}
        {showAddPlantOverlay && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 440,
              minHeight: 220,
              background: "rgba(76,175,80,0.10)",
              borderRadius: 48,
              border: "2px solid #fff",
              boxShadow: "0 2px 32px rgba(0,0,0,0.18)",
              zIndex: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 18px",
              gap: 10,
              pointerEvents: "auto",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <button
              onClick={() => setShowAddPlantOverlay(false)}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.4)",
                borderRadius: "9999px",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#fff",
                cursor: "pointer",
                lineHeight: 1,
                fontWeight: 700,
                boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                transition: "background 0.2s",
                pointerEvents: "auto",
              }}
              title="Close"
            >
              ×
            </button>
            <h2
              style={{
                color: "#222",
                fontWeight: 700,
                fontSize: 37,
                margin: 0,
                marginBottom: 0,
                letterSpacing: 0.5,
                fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
              }}
            >
              Log a New Plant 🌱{" "}
            </h2>
            {/* Show current location */}
            <div
              style={{
                marginBottom: 12,
                marginTop: 0,
                fontSize: 19,
                color: "#fff",
                fontWeight: 600,
                letterSpacing: 0.2,
                fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
              }}
            >
              {/* Location logic removed as per edit hint */}
            </div>
            {/* Drag-and-drop file upload area or text input */}
            {inputMode === "file" ? (
              <div
                {...getRootProps()}
                style={{
                  width: "100%",
                  minHeight: 180,
                  height: 400,
                  border: "2px solid rgba(120,120,120,0.35)",
                  borderRadius: 24,
                  background: isDragActive
                    ? "rgba(80,80,80,0.32)"
                    : "rgba(80,80,80,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  margin: "12px 0 4px 0",
                  transition: "background 0.2s, border 0.2s",
                  outline: isDragActive ? "2.5px solid #4caf50" : "none",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                  textAlign: "center",
                  pointerEvents: "auto",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  letterSpacing: 0.2,
                }}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 16,
                        letterSpacing: 0.2,
                        fontFamily:
                          "system-ui, Avenir, Helvetica, Arial, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <MdOutlineFileUpload size={22} color="#4caf50" />
                      Photo uploaded
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        marginLeft: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                      title="Remove file"
                    >
                      <MdClose size={22} color="#fff" />
                    </button>
                  </span>
                ) : isDragActive ? (
                  <span
                    style={{
                      color: "#4caf50",
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: 0.2,
                      fontFamily:
                        "system-ui, Avenir, Helvetica, Arial, sans-serif",
                    }}
                  >
                    Drop the file here ...
                  </span>
                ) : (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <MdOutlineFileUpload size={28} color="#4caf50" />
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 16,
                        fontFamily:
                          "system-ui, Avenir, Helvetica, Arial, sans-serif",
                        letterSpacing: 0.2,
                      }}
                    >
                      Upload plant image
                    </span>
                  </span>
                )}
              </div>
            ) : (
              <textarea
                style={{
                  width: "100%",
                  minHeight: 180,
                  height: 400,
                  border: "2px solid rgba(120,120,120,0.35)",
                  borderRadius: 24,
                  background: "rgba(80,80,80,0.22)",
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: 600,
                  margin: "12px 0 4px 0",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  resize: "none",
                  outline: "none",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                  fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
                  letterSpacing: 0.2,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  textAlign: "center",
                }}
                placeholder="Input plant name and info"
              />
            )}
            {/* Input mode switch circles */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
                marginTop: 0,
                marginBottom: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setInputMode("file")}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  border: "2px solid #bbb",
                  background: inputMode === "file" ? "#f5f5f5" : "#bdbdbd",
                  margin: 0,
                  padding: 0,
                  cursor: "pointer",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border 0.2s, background 0.2s",
                }}
                title="Upload image"
                aria-label="Upload image"
              />
              <button
                type="button"
                onClick={() => setInputMode("text")}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  border: "2px solid #bbb",
                  background: inputMode === "text" ? "#f5f5f5" : "#bdbdbd",
                  margin: 0,
                  padding: 0,
                  cursor: "pointer",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border 0.2s, background 0.2s",
                }}
                title="Input text"
                aria-label="Input text"
              />
            </div>
            {/* Submit button */}
            <div
              style={{ display: "flex", flexDirection: "row", width: "100%" }}
            >
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "14px 0",
                  marginTop: 8,
                  borderRadius: 32,
                  border: "2px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.2,
                  fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  outline: "none",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
                onClick={() => {
                  /* TODO: handle submit */
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
        {/* Hide these when add-plant overlay is open */}
        {!showAddPlantOverlay && (
          <>
            {/* Top search bar */}
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                width: 420,
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: 420,
                  position: "relative",
                  pointerEvents: "auto",
                }}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={handleRoseDropdown}
                  style={{
                    width: 420,
                    padding: "15px 32px 15px 48px",
                    borderRadius:
                      searchResults.length > 0 ? "32px 32px 0 0" : "32px",
                    border: "1px solid #fff",
                    fontSize: 18,
                    fontWeight: 600,
                    outline: "none",
                    background: "rgba(76,175,80,0.10)",
                    color: "#fff",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    letterSpacing: 0.2,
                    transition: "box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  className="searchbar-white-placeholder"
                />
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      width: 420,
                      background: "rgba(76,175,80,0.10)",
                      color: "#222",
                      borderRadius: "0 0 24px 24px",
                      zIndex: 200,
                      padding: 16,
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      borderTop: "none",
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      transition: "box-shadow 0.2s, background 0.2s",
                      boxSizing: "border-box",
                    }}
                  >
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {searchResults.map((coords, idx) => (
                        <li key={idx}>
                          <button
                            className="search-dropdown-btn"
                            style={{
                              width: "100%",
                              padding: "14px",
                              margin: "8px 0",
                              borderRadius: 18,
                              border: "1.5px solid rgba(255,255,255,0.35)",
                              background: "rgba(255,255,255,0.28)",
                              color: "#1b3a2b",
                              fontWeight: 700,
                              fontSize: 17,
                              cursor: "pointer",
                              boxShadow: "0 2px 16px rgba(31,38,135,0.10)",
                              backdropFilter: "blur(12px)",
                              WebkitBackdropFilter: "blur(12px)",
                              transition: "background 0.2s, box-shadow 0.2s",
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                            onClick={() => {
                              if (typeof onAddRoseMarker === 'function') onAddRoseMarker();
                              onSearchResultClick(coords[0], coords[1]);
                              setSearchResults([]);
                            }}
                          >
                            <RiPlantFill size={22} color="#43a047" style={{ marginRight: 4, flexShrink: 0 }} />
                            <span>🌹 Rose</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* Bottom left add plant button and Gemini button */}
            <div
              style={{
                position: "absolute",
                left: 40,
                bottom: 48,
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "row",
                gap: 18,
              }}
            >
              <div
                className="add-plant-btn-glass"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80px",
                  width: "80px",
                  minWidth: "80px",
                  minHeight: "80px",
                  maxWidth: "80px",
                  maxHeight: "80px",
                  aspectRatio: "1 / 1",
                  borderRadius: "9999px",
                  backdropFilter: "blur(6px)",
                  background: "rgba(76,175,80,0.08)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  userSelect: "none",
                  boxSizing: "border-box",
                  flexShrink: 0,
                  transition:
                    "background 0.35s cubic-bezier(.4,1.3,.6,1), color 0.35s cubic-bezier(.4,1.3,.6,1), border 0.35s cubic-bezier(.4,1.3,.6,1), box-shadow 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1), backdrop-filter 0.35s cubic-bezier(.4,1.3,.6,1)",
                }}
                onClick={() => setShowAddPlantOverlay(true)}
                title="Add Plant"
              >
                <RiPlantFill size={40} style={{ display: "block" }} />
              </div>
              {/* Gemini button restored */}
              <div
                className="gemini-btn-glass"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80px",
                  width: "80px",
                  minWidth: "80px",
                  minHeight: "80px",
                  maxWidth: "80px",
                  maxHeight: "80px",
                  aspectRatio: "1 / 1",
                  borderRadius: "9999px",
                  backdropFilter: "blur(6px)",
                  background: "rgba(33,150,243,0.10)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  userSelect: "none",
                  boxSizing: "border-box",
                  flexShrink: 0,
                  transition:
                    "background 0.35s cubic-bezier(.4,1.3,.6,1), color 0.35s cubic-bezier(.4,1.3,.6,1), border 0.35s cubic-bezier(.4,1.3,.6,1), box-shadow 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1), backdrop-filter 0.35s cubic-bezier(.4,1.3,.6,1)",
                }}
                onClick={() => setShowGeminiOverlay(true)}
                title="Gemini Gardening Guidebook"
              >
                <GiArtificialIntelligence size={38} style={{ display: "block" }} />
              </div>
            </div>
          </>
        )}
        {/* Gemini Result Overlay */}
        {showGeminiOverlay && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 420,
              minHeight: 220,
              background: "rgba(67,175,80,0.10)",
              borderRadius: 48,
              border: "2px solid #fff",
              boxShadow: "0 2px 32px rgba(0,0,0,0.18)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 18px 32px 18px",
              gap: 10,
              pointerEvents: "auto",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <button
              onClick={() => setShowGeminiOverlay(false)}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.4)",
                borderRadius: "9999px",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#fff",
                cursor: "pointer",
                lineHeight: 1,
                fontWeight: 700,
                boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                transition: "background 0.2s",
                pointerEvents: "auto",
              }}
              title="Close"
            >
              ×
            </button>
            <h2
              style={{
                color: "#43a047",
                fontWeight: 700,
                fontSize: 32,
                margin: 0,
                marginBottom: 0,
                letterSpacing: 0.5,
                fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
              }}
            >
              Gemini Gardening Guidebook 🧠
            </h2>
            <div
              style={{
                marginBottom: 12,
                marginTop: 0,
                fontSize: 19,
                color: "#fff",
                fontWeight: 600,
                letterSpacing: 0.2,
                fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
                textAlign: "center",
              }}
            >
              <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 340 }}>
                <div style={{ fontWeight: 700, color: '#43a047', fontSize: 20, marginBottom: 8 }}>🌱 Recommended Plants for Your Area:</div>
                <ul style={{ color: '#fff', fontSize: 17, marginBottom: 16, paddingLeft: 22 }}>
                  <li><b>Lavender</b></li>
                  <li><b>Tomato</b></li>
                  <li><b>Rosemary</b></li>
                  <li><b>Hosta</b></li>
                  <li><b>Peony</b></li>
                </ul>
                <div style={{ fontWeight: 700, color: '#43a047', fontSize: 20, marginBottom: 8 }}>💡 General Gardening Advice:</div>
                <ul style={{ color: '#fff', fontSize: 17, marginBottom: 0, paddingLeft: 22 }}>
                  <li>Water early in the morning to reduce evaporation.</li>
                  <li>Mulch around plants to retain moisture and suppress weeds.</li>
                  <li>Test your soil pH before planting for best results.</li>
                  <li>Rotate crops each year to prevent soil depletion.</li>
                  <li>Encourage beneficial insects by planting a variety of flowers.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <style>{`
          .searchbar-white-placeholder::placeholder {
            color: #fff !important;
            opacity: 1;
          }
          input[placeholder="Search..."]::placeholder {
            color: #fff !important;
            opacity: 1;
          }
          html, body {
            overflow: hidden !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .add-plant-btn-glass {
            transition: background 0.35s cubic-bezier(.4,1.3,.6,1), color 0.35s cubic-bezier(.4,1.3,.6,1), border 0.35s cubic-bezier(.4,1.3,.6,1), box-shadow 0.35s cubic-bezier(.4,1.3,.6,1), transform 0.35s cubic-bezier(.4,1.3,.6,1), backdrop-filter 0.35s cubic-bezier(.4,1.3,.6,1);
          }
          .add-plant-btn-glass:hover, .add-plant-btn-glass:focus-visible {
            transform: scale(1.09);
            box-shadow: 0 8px 32px 0 rgba(76,175,80,0.22), 0 2px 12px 0 rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.28);
            border-color: #aee9c7;
            color: #1b3a2b;
            backdrop-filter: blur(16px) saturate(1.2);
            -webkit-backdrop-filter: blur(16px) saturate(1.2);
          }
          /* Search dropdown button hover effect for liquid glass aesthetic */
          .search-dropdown-btn {
            transition: border 0.22s cubic-bezier(.4,1.3,.6,1), box-shadow 0.22s cubic-bezier(.4,1.3,.6,1);
          }
          .search-dropdown-btn:hover, .search-dropdown-btn:focus-visible {
            border: 2.5px solid #bfc9d1 !important;
            box-shadow: 0 4px 24px 0 rgba(76,175,80,0.13), 0 2px 12px 0 rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.32) !important;
            outline: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default Overlay;
