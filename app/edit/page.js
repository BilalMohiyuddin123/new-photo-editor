"use client";

import React, { useState, useRef, useEffect } from "react";

// --- FONT DEFINITIONS ---
// We define class names that we'll use in our CSS.
const fonts = [
  { id: "inter", name: "Inter", className: "font-inter" },
  { id: "lobster", name: "Lobster", className: "font-lobster" },
  { id: "bebasNeue", name: "Bebas Neue", className: "font-bebas-neue" },
  {
    id: "specialElite",
    name: "Special Elite",
    className: "font-special-elite",
  },
];

// --- PREDEFINED FILTERS & EFFECTS ---
const filters = [
  { id: "none", name: "None", properties: {} },
  {
    id: "midnight",
    name: "Midnight",
    properties: { brightness: 85, contrast: 120, saturate: 80, sepia: 20 },
  },
  {
    id: "noir",
    name: "Noir",
    properties: { grayscale: 100, contrast: 150, brightness: 90 },
  },
  {
    id: "cinematic",
    name: "Cinematic",
    properties: { sepia: 40, contrast: 110, brightness: 95, saturate: 120 },
  },
  {
    id: "vintage",
    name: "Vintage",
    properties: { sepia: 70, contrast: 90, brightness: 110 },
  },
  {
    id: "daydream",
    name: "Daydream",
    properties: { brightness: 110, saturate: 130, "hue-rotate": -10 },
  },
];

const effects = [
  { id: "vignette", name: "Vignette" },
  { id: "dust", name: "Dust & Scratches" },
  { id: "grain", name: "Film Grain" },
];

// --- STYLES COMPONENT ---
// All styles are now included directly in the component to avoid external file errors.
const Styles = () => (
  <style>{`
    /* FONT IMPORTS */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');

    /* FONT CLASSES */
    .font-inter { font-family: 'Inter', sans-serif; }
    .font-lobster { font-family: 'Lobster', cursive; }
    .font-bebas-neue { font-family: 'Bebas Neue', cursive; }
    .font-special-elite { font-family: 'Special Elite', cursive; }
    
    /* GENERAL STYLES */
    .main {
      font-family: 'Inter', sans-serif;
      background-color: #1a1a1a;
      color: #f0f0f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .appTitle {
        text-align: center;
        font-family: 'Bebas Neue', cursive;
        font-size: 2rem;
        letter-spacing: 2px;
        color: #f0f0f0;
        padding: 0.5rem;
        background-color: #252525;
        margin: 0;
    }
    .editorLayout {
      display: flex;
      flex-grow: 1;
      width: 100%;
      overflow: hidden; /* Prevent layout shifts from scrollbars */
    }
    .previewContainer {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background-color: #111;
      position: relative;
    }
    .imageWrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .imagePreview {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    /* OVERLAYS */
    .vignetteOverlay, .dustOverlay, .grainOverlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      border-radius: 8px;
    }
    .vignetteOverlay {
       box-shadow: inset 0 0 10vw 2vw #000;
    }
    .grainOverlay {
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.15"/></svg>');
    }
    .dustOverlay {
      background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
    }

    .textOverlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
      padding: 1rem;
      pointer-events: none;
      white-space: nowrap;
    }

    .uploadPlaceholder {
      text-align: center;
      padding: 2rem;
      border: 2px dashed #444;
      border-radius: 12px;
    }
    .uploadButton, .saveButton {
      background-color: #4a4aef;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
      margin-top: 1rem;
    }
    .uploadButton:hover, .saveButton:hover {
      background-color: #6a6aff;
      transform: translateY(-2px);
    }
    .saveButton {
        width: calc(100% - 2rem);
        margin: 1rem;
    }
    .saveButton:disabled {
      background-color: #555;
      cursor: not-allowed;
    }

    /* CONTROLS */
    .controlsContainer {
      width: 350px;
      background-color: #252525;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .mobileTabs { display: none; }
    .controlsContent { flex-grow: 1; }
    .controlSection { padding: 1.5rem; }
    .sectionTitle {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
      border-bottom: 1px solid #444;
      padding-bottom: 0.75rem;
    }
    .itemGrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
    }
    .filterItem, .effectItem { text-align: center; cursor: pointer; }
    .filterItem img, .effectPreview {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      border: 3px solid transparent;
      transition: border-color 0.2s;
      object-fit: cover;
    }
    .filterItem span, .effectItem span {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.8rem;
    }
    .selectedItem {
      border-color: #4a4aef;
    }
    .sliderContainer { margin-top: 1.5rem; }
    .sliderContainer label { margin-right: 1rem; }

    /* EFFECTS */
    .effectPreview {
      background-color: #555;
      display: inline-block;
      position: relative;
      overflow: hidden;
    }
    .vignettePreview {
       box-shadow: inset 0 0 20px 5px #000;
    }
    .dustPreview {
        background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
    }
    .grainPreview::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.3"/></svg>');
    }
    
    /* TEXT */
    .textInput {
      width: 100%;
      background: #333;
      border: 1px solid #555;
      color: white;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .textSettings { display: flex; align-items: center; gap: 1.5rem; margin: 1.5rem 0; }
    .colorPickerWrapper { display: flex; align-items: center; gap: 0.5rem; }
    .fontSelector { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .fontSelector button {
      background: #333;
      border: 1px solid #555;
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .selectedFont { background: #4a4aef !important; }

    /* RESPONSIVE STYLES */
    @media (max-width: 768px) {
      .appTitle { font-size: 1.5rem; padding: 0.75rem; }
      .editorLayout { flex-direction: column; }
      .controlsContainer { width: 100%; height: 50vh; border-top: 2px solid #444; }
      .imagePreview { max-height: 45vh; }
      .mobileTabs {
          display: flex;
          justify-content: space-around;
          background-color: #1a1a1a;
      }
      .mobileTabs button {
          padding: 1rem;
          background: none;
          border: none;
          color: #aaa;
          font-size: 1rem;
          cursor: pointer;
          flex-grow: 1;
          border-bottom: 3px solid transparent;
          transition: color 0.2s, border-color 0.2s;
      }
      .mobileTabs .activeTab {
          color: white;
          border-bottom-color: #4a4aef;
      }
      .controlSection { display: none; }
      .activeSection { display: block; }
    }
  `}</style>
);

export default function EditPage() {
  // --- STATE MANAGEMENT ---
  const [imageSrc, setImageSrc] = useState(null);
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [activeEffects, setActiveEffects] = useState({});
  const [text, setText] = useState("Your Text");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textFont, setTextFont] = useState(fonts[0].className);
  const [textSize, setTextSize] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [isLibraryReady, setIsLibraryReady] = useState(false);
  const imageWrapperRef = useRef(null); // Ref for the element to capture
  const uploadInputRef = useRef(null);

  // Dynamically load the html2canvas library and manage its ready state
  useEffect(() => {
    if (window.html2canvas) {
      setIsLibraryReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => setIsLibraryReady(true);
    script.onerror = () => console.error("Failed to load html2canvas library.");
    document.body.appendChild(script);

    return () => {
      // Check if the script is still in the body before trying to remove it
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // --- IMAGE & FILTER LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCssFilterString = () => {
    const filter = filters.find((f) => f.id === selectedFilter);
    if (!filter || filter.id === "none") return "none";
    const getVal = (defaultValue, filterValue) => {
      if (filterValue === undefined) return defaultValue;
      const difference = filterValue - defaultValue;
      return defaultValue + difference * (filterIntensity / 100);
    };
    let filterString = "";
    filterString += `brightness(${getVal(
      100,
      filter.properties.brightness
    )}%) `;
    filterString += `contrast(${getVal(100, filter.properties.contrast)}%) `;
    filterString += `saturate(${getVal(100, filter.properties.saturate)}%) `;
    filterString += `grayscale(${getVal(0, filter.properties.grayscale)}%) `;
    filterString += `sepia(${getVal(0, filter.properties.sepia)}%) `;
    filterString += `hue-rotate(${getVal(
      0,
      filter.properties["hue-rotate"]
    )}deg)`;
    return filterString;
  };

  const getThumbnailFilterString = (filter) => {
    if (!filter || filter.id === "none") return "none";
    let filterString = "";
    const props = filter.properties;
    if (props.brightness !== undefined)
      filterString += `brightness(${props.brightness}%) `;
    if (props.contrast !== undefined)
      filterString += `contrast(${props.contrast}%) `;
    if (props.saturate !== undefined)
      filterString += `saturate(${props.saturate}%) `;
    if (props.grayscale !== undefined)
      filterString += `grayscale(${props.grayscale}%) `;
    if (props.sepia !== undefined) filterString += `sepia(${props.sepia}%) `;
    if (props["hue-rotate"] !== undefined)
      filterString += `hue-rotate(${props["hue-rotate"]}deg)`;
    return filterString.trim();
  };

  const toggleEffect = (effectId) => {
    setActiveEffects((prev) => ({ ...prev, [effectId]: !prev[effectId] }));
  };

  const handleSaveImage = async () => {
    if (!imageWrapperRef.current || !isLibraryReady) {
      alert("Editor is not ready yet, please wait a moment.");
      return;
    }

    setIsSaving(true);

    try {
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const canvasScale = isIOS ? 1 : 2; // Use lower scale on iOS to prevent memory issues

      const canvas = await html2canvas(imageWrapperRef.current, {
        useCORS: true,
        scale: canvasScale,
        backgroundColor: "#111", // Important for proper rendering
        // Remove allowTaint as it prevents canvas data extraction
      });

      const triggerDownload = (imageUrl) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "edited-image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsSaving(false);
            alert("Failed to create image file.");
            return;
          }

          const file = new File([blob], "edited-image.jpg", {
            type: "image/jpeg",
          });
          const imageUrl = URL.createObjectURL(blob);

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: "Edited Image",
                text: "Check out this image I created!",
              });
            } catch (error) {
              // This can happen if the user cancels the share. Fallback to download.
              if (error.name !== "AbortError") {
                console.log("Share failed, falling back to download.", error);
                triggerDownload(imageUrl);
              }
            }
          } else {
            triggerDownload(imageUrl);
          }

          URL.revokeObjectURL(imageUrl);
          setIsSaving(false);
        },
        "image/jpeg",
        0.9
      ); // Use JPEG with 90% quality for smaller file size
    } catch (error) {
      console.error("Failed to capture image:", error);
      alert("Sorry, something went wrong while saving the image.");
      setIsSaving(false);
    }
  };

  // --- JSX RENDER ---
  return (
    <>
      <Styles />
      <main className="main">
        <h1 className="appTitle">Photo Editor Pro</h1>
        <div className="editorLayout">
          {/* --- IMAGE PREVIEW --- */}
          <div className="previewContainer">
            {imageSrc ? (
              <div className="imageWrapper" ref={imageWrapperRef}>
                <img
                  src={imageSrc}
                  crossOrigin="anonymous" /* Crucial for canvas capturing */
                  alt="Image preview"
                  className="imagePreview"
                  style={{ filter: getCssFilterString() }}
                />
                {activeEffects.vignette && (
                  <div className="vignetteOverlay"></div>
                )}
                {activeEffects.dust && <div className="dustOverlay"></div>}
                {activeEffects.grain && <div className="grainOverlay"></div>}
                <div
                  className={`textOverlay ${textFont}`}
                  style={{ color: textColor, fontSize: `${textSize}px` }}
                >
                  {text}
                </div>
              </div>
            ) : (
              <div className="uploadPlaceholder">
                <p>Upload an image to start editing</p>
                <button
                  onClick={() => uploadInputRef.current.click()}
                  className="uploadButton"
                >
                  Choose Image
                </button>
              </div>
            )}
          </div>

          {/* --- HIDDEN ELEMENTS --- */}
          <input
            type="file"
            accept="image/*"
            ref={uploadInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          {/* --- CONTROLS PANEL --- */}
          <div className="controlsContainer">
            {imageSrc && (
              <>
                <div className="mobileTabs">
                  <button
                    onClick={() => setActiveTab("filters")}
                    className={activeTab === "filters" ? "activeTab" : ""}
                  >
                    Filters
                  </button>
                  <button
                    onClick={() => setActiveTab("effects")}
                    className={activeTab === "effects" ? "activeTab" : ""}
                  >
                    Effects
                  </button>
                  <button
                    onClick={() => setActiveTab("text")}
                    className={activeTab === "text" ? "activeTab" : ""}
                  >
                    Text
                  </button>
                </div>

                <div className="controlsContent">
                  <div
                    className={`controlSection ${
                      activeTab === "filters" ? "activeSection" : ""
                    }`}
                  >
                    <h3 className="sectionTitle">Filters</h3>
                    <div className="itemGrid">
                      {filters.map((filter) => (
                        <div
                          key={filter.id}
                          className="filterItem"
                          onClick={() => setSelectedFilter(filter.id)}
                        >
                          <img
                            src={imageSrc}
                            alt={filter.name}
                            width="80"
                            height="80"
                            style={{
                              filter: getThumbnailFilterString(filter),
                            }}
                            className={
                              selectedFilter === filter.id ? "selectedItem" : ""
                            }
                          />
                          <span>{filter.name}</span>
                        </div>
                      ))}
                    </div>
                    {selectedFilter !== "none" && (
                      <div className="sliderContainer">
                        <label>Intensity</label>
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={filterIntensity}
                          onChange={(e) => setFilterIntensity(e.target.value)}
                        />
                        <span>{filterIntensity}%</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`controlSection ${
                      activeTab === "effects" ? "activeSection" : ""
                    }`}
                  >
                    <h3 className="sectionTitle">Effects</h3>
                    <div className="itemGrid">
                      {effects.map((effect) => (
                        <div
                          key={effect.id}
                          className="effectItem"
                          onClick={() => toggleEffect(effect.id)}
                        >
                          <div
                            className={`effectPreview ${effect.id}Preview ${
                              activeEffects[effect.id] ? "selectedItem" : ""
                            }`}
                          ></div>
                          <span>{effect.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`controlSection ${
                      activeTab === "text" ? "activeSection" : ""
                    }`}
                  >
                    <h3 className="sectionTitle">Text</h3>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="textInput"
                    />
                    <div className="textSettings">
                      <div className="colorPickerWrapper">
                        <label>Color</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                        />
                      </div>
                      <div className="sliderContainer">
                        <label>Size</label>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          value={textSize}
                          onChange={(e) => setTextSize(e.target.value)}
                        />
                        <span>{textSize}px</span>
                      </div>
                    </div>
                    <div className="fontSelector">
                      {fonts.map((font) => (
                        <button
                          key={font.id}
                          className={`${font.className} ${
                            textFont === font.className ? "selectedFont" : ""
                          }`}
                          onClick={() => setTextFont(font.className)}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveImage}
                  className="saveButton"
                  disabled={isSaving || !isLibraryReady}
                >
                  {isSaving
                    ? "Saving..."
                    : !isLibraryReady
                    ? "Editor Loading..."
                    : "Save or Share Image"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
