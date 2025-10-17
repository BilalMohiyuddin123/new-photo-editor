"use client";

import React, { useState, useRef, useEffect } from "react";

// --- INJECT STYLES AND FONTS ---
// We inject a <style> tag into the document's head to handle all styling,
// including font imports, as this is a standalone component without a separate CSS file.
const InjectStyles = () => {
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      /* --- FONT IMPORTS --- */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lobster&family=Bebas+Neue&family=Special+Elite&display=swap');

      /* --- GLOBAL STYLES --- */
      .main {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #121212;
        color: #e0e0e0;
        font-family: 'Inter', sans-serif;
        padding: 1rem;
        box-sizing: border-box;
      }

      .editorLayout {
        display: flex;
        flex-direction: column;
        lg:flex-direction: row;
        width: 100%;
        max-width: 1200px;
        height: 90vh;
        background-color: #1e1e1e;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      
      @media (min-width: 1024px) {
        .editorLayout {
          flex-direction: row;
        }
      }

      /* --- PREVIEW CONTAINER --- */
      .previewContainer {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        background-color: #242424;
        position: relative;
        overflow: hidden;
      }

      .imageWrapper {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100%;
        max-height: 100%;
        user-select: none;
      }

      .imagePreview {
        max-width: 100%;
        max-height: calc(90vh - 4rem);
        object-fit: contain;
        border-radius: 8px;
        transition: filter 0.3s ease-in-out;
      }
      
      .uploadPlaceholder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        color: #888;
        border: 2px dashed #444;
        border-radius: 12px;
        width: 100%;
        height: 100%;
        text-align: center;
      }
      
      .uploadButton {
        background-color: #007aff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .uploadButton:hover {
        background-color: #0056b3;
      }

      /* --- OVERLAYS --- */
      .textOverlay, .vignetteOverlay, .dustOverlay, .grainOverlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        border-radius: 8px; /* Match image border-radius */
      }
      .textOverlay {
        text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
      }
      .vignetteOverlay {
        box-shadow: inset 0 0 10vw rgba(0,0,0,0.8);
      }
      .dustOverlay {
        background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 1%),
                          radial-gradient(circle at 75% 30%, rgba(255,255,255,0.08) 0%, transparent 1.5%),
                          radial-gradient(circle at 90% 95%, rgba(255,255,255,0.05) 0%, transparent 1%),
                          radial-gradient(circle at 40% 50%, rgba(255,255,255,0.09) 0%, transparent 0.8%);
        background-size: 100px 100px;
        opacity: 0.3;
      }
      .grainOverlay {
        background: url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27100%27%20height%3D%27100%27%3E%3Cfilter%20id%3D%27noise%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.85%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noise)%27%2F%3E%3C%2Fsvg%3E');
        opacity: 0.1;
        animation: grain 0.5s steps(1) infinite;
      }
      @keyframes grain {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-2%, -2%); }
        30% { transform: translate(2%, -3%); }
        50% { transform: translate(-3%, 3%); }
        70% { transform: translate(3%, 2%); }
        90% { transform: translate(-2%, 3%); }
      }

      /* --- CONTROLS --- */
      .controlsContainer {
        width: 100%;
        lg:width: 380px;
        background-color: #1e1e1e;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        border-top: 1px solid #333;
      }
      
      @media (min-width: 1024px) {
        .controlsContainer {
            width: 380px;
            border-top: none;
            border-left: 1px solid #333;
        }
      }
      
      .mobileTabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      
      @media (min-width: 1024px) {
        .mobileTabs {
            display: none;
        }
      }
      
      .mobileTabs button {
        flex: 1;
        padding: 0.75rem;
        background-color: #333;
        border: 1px solid #444;
        color: #aaa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .mobileTabs .activeTab {
        background-color: #007aff;
        color: white;
        border-color: #007aff;
      }
      
      .controlSection {
        display: none;
      }
      .activeSection {
        display: block;
      }
      
      @media (min-width: 1024px) {
        .controlSection {
            display: block;
            margin-bottom: 2rem;
        }
      }
      
      .sectionTitle {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.25rem;
        font-weight: bold;
        border-bottom: 1px solid #444;
        padding-bottom: 0.5rem;
      }
      
      .itemGrid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 1rem;
      }
      
      .filterItem, .effectItem {
        text-align: center;
        cursor: pointer;
      }
      
      .filterItem img, .effectPreview {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        border: 2px solid transparent;
        transition: border-color 0.2s;
        margin-bottom: 0.5rem;
      }
      .filterItem:hover img, .effectItem:hover .effectPreview {
        border-color: #aaa;
      }
      
      .selectedItem {
        border-color: #007aff !important;
      }
      
      .effectPreview {
        background-color: #555;
        display: inline-block;
        position: relative;
        overflow: hidden;
      }
      .vignettePreview::after {
         content: '';
         position: absolute;
         top: 0; left: 0; width: 100%; height: 100%;
         box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
      }
       .dustPreview::after {
         content: '';
         position: absolute;
         top: 0; left: 0; width: 100%; height: 100%;
         background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 2%),
                           radial-gradient(circle at 75% 30%, rgba(255,255,255,0.3) 0%, transparent 3%);
        opacity: 0.3;
      }
       .grainPreview::after {
         content: '';
         position: absolute;
         top: 0; left: 0; width: 100%; height: 100%;
         background: url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27100%27%20height%3D%27100%27%3E%3Cfilter%20id%3D%27noise%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.85%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noise)%27%2F%3E%3C%2Fsvg%3E');
         opacity: 0.15;
      }
      
      .sliderContainer {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }
      .sliderContainer input[type="range"] {
        flex: 1;
      }
      
      .textInput {
        width: 100%;
        background-color: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 1rem;
        margin-bottom: 1rem;
      }
      
      .textSettings {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .colorPickerWrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .colorPicker {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 40px;
        height: 40px;
        background-color: transparent;
        border: none;
        cursor: pointer;
      }
      .colorPicker::-webkit-color-swatch {
        border-radius: 50%;
        border: 2px solid #555;
      }
      
      .fontSelector {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .fontSelector button {
        background-color: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
       .fontSelector .selectedFont {
        background-color: #007aff;
        border-color: #007aff;
       }
      
      .saveButton {
        margin-top: auto;
        background-color: #34c759;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .saveButton:hover {
        background-color: #2ca349;
      }
      .saveButton:disabled {
        background-color: #555;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null; // This component only injects styles
};

// --- FONT DEFINITIONS ---
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

export default function EditPage() {
  // --- STATE MANAGEMENT ---
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState("");
  const [activeTab, setActiveTab] = useState("filters");
  const [isSaving, setIsSaving] = useState(false);

  // Editing states
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [activeEffects, setActiveEffects] = useState({});

  // Text states
  const [text, setText] = useState("Your Text");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textFont, setTextFont] = useState(fonts[0].className);
  const [textSize, setTextSize] = useState(50);

  // Refs
  const imageWrapperRef = useRef(null);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageName(file.name.split(".").slice(0, -1).join("."));
      const reader = new FileReader();
      reader.onload = (event) => setImageSrc(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getCssFilterString = () => {
    const filter = filters.find((f) => f.id === selectedFilter);
    if (!filter || filter.id === "none") return "none";
    const getVal = (def, val) =>
      val === undefined ? def : def + (val - def) * (filterIntensity / 100);
    return `brightness(${getVal(
      100,
      filter.properties.brightness
    )}%) contrast(${getVal(
      100,
      filter.properties.contrast
    )}%) saturate(${getVal(
      100,
      filter.properties.saturate
    )}%) grayscale(${getVal(0, filter.properties.grayscale)}%) sepia(${getVal(
      0,
      filter.properties.sepia
    )}%) hue-rotate(${getVal(0, filter.properties["hue-rotate"])}deg)`;
  };

  const toggleEffect = (effectId) =>
    setActiveEffects((prev) => ({ ...prev, [effectId]: !prev[effectId] }));

  const handleSaveImage = async () => {
    if (typeof domtoimage === "undefined" || !imageWrapperRef.current) {
      alert("Editor is not ready, please wait a moment and try again.");
      return;
    }
    setIsSaving(true);
    try {
      const dataUrl = await domtoimage.toJpeg(imageWrapperRef.current, {
        quality: 0.95,
      });
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const fileName = `${imageName || "edited"}-image.jpeg`;
      if (isMobile) {
        const newTab = window.open();
        newTab.document.write(
          `<!DOCTYPE html><html><head><title>Save Your Image</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;background-color:#1a1a1a;color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;box-sizing:border-box}img{max-width:90%;max-height:70vh;height:auto;border:2px solid #333;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,.5);object-fit:contain}p{margin-top:20px;font-size:1.1em;line-height:1.5}.image-name{font-weight:700;color:#ffda47}</style></head><body><img src="${dataUrl}" alt="Your Edited Image"><p>Your image <span class="image-name">"${fileName}"</span> is ready.<br><b>Long press</b> the image above to save it to your photos.</p></body></html>`
        );
        newTab.document.close();
      } else {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Sorry, something went wrong while saving the image.");
    } finally {
      setIsSaving(false);
    }
  };

  const getFontFamily = (className) => {
    switch (className) {
      case "font-lobster":
        return "Lobster, cursive";
      case "font-bebas-neue":
        return '"Bebas Neue", sans-serif';
      case "font-special-elite":
        return '"Special Elite", cursive';
      default:
        return "Inter, sans-serif";
    }
  };

  return (
    <>
      <InjectStyles />
      <main className="main">
        <div className="editorLayout">
          <div className="previewContainer">
            {imageSrc ? (
              <div ref={imageWrapperRef} className="imageWrapper">
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="imagePreview"
                  style={{ filter: getCssFilterString() }}
                />
                {activeEffects.vignette && (
                  <div className="vignetteOverlay"></div>
                )}
                {activeEffects.dust && <div className="dustOverlay"></div>}
                {activeEffects.grain && <div className="grainOverlay"></div>}
                <div
                  className="textOverlay"
                  style={{
                    color: textColor,
                    fontSize: `${textSize}px`,
                    fontFamily: getFontFamily(textFont),
                  }}
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

          <input
            type="file"
            accept="image/*"
            ref={uploadInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

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
                            className={
                              selectedFilter === filter.id ? "selectedItem" : ""
                            }
                            style={{
                              filter: `brightness(${
                                filter.properties.brightness || 100
                              }%) contrast(${
                                filter.properties.contrast || 100
                              }%) saturate(${
                                filter.properties.saturate || 100
                              }%) grayscale(${
                                filter.properties.grayscale || 0
                              }%) sepia(${
                                filter.properties.sepia || 0
                              }%) hue-rotate(${
                                filter.properties["hue-rotate"] || 0
                              }deg)`,
                            }}
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
                          className="colorPicker"
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
                          className={
                            textFont === font.className ? "selectedFont" : ""
                          }
                          onClick={() => setTextFont(font.className)}
                          style={{ fontFamily: getFontFamily(font.className) }}
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
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Image"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
