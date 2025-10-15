// In app/edit/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Edit.module.css";
import { Lobster, Playfair_Display, Roboto_Mono } from "next/font/google";

// --- FONT SETUP ---
const lobster = Lobster({ subsets: ["latin"], weight: "400" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const fonts = [
  { name: "Lobster", className: lobster.className },
  { name: "Playfair Display", className: playfair.className },
  { name: "Roboto Mono", className: robotoMono.className },
];

// --- PREDEFINED FILTERS ---
const FILTERS = [
  {
    name: "Midnight",
    properties: {
      brightness: 0.85,
      contrast: 1.2,
      saturate: 0.8,
      sepia: 0.15,
      "hue-rotate": -10,
    },
  },
  {
    name: "Noir",
    properties: { grayscale: 1, contrast: 1.5, brightness: 0.9 },
  },
  {
    name: "Cinematic",
    properties: { saturate: 1.2, contrast: 1.1, sepia: 0.25, brightness: 0.95 },
  },
  {
    name: "Vintage",
    properties: { sepia: 0.6, contrast: 0.9, brightness: 1.05, saturate: 0.8 },
  },
  {
    name: "Sun-kissed",
    properties: { contrast: 1.1, saturate: 1.3, brightness: 1.1, sepia: 0.1 },
  },
];

// --- PREDEFINED EFFECTS ---
const EFFECTS = [
  { name: "None", style: {} },
  {
    name: "Dust",
    style: {
      backgroundImage:
        "url(https://www.transparenttextures.com/patterns/dust.png)",
      backgroundSize: "cover",
      opacity: 0.15,
    },
  },
  {
    name: "Light Leak",
    style: {
      background:
        "linear-gradient(to top left, rgba(255, 220, 150, 0.4) 0%, rgba(255, 100, 100, 0) 70%)",
      opacity: 0.6,
    },
  },
  {
    name: "Vintage Film",
    style: {
      backgroundImage:
        "url(https://www.transparenttextures.com/patterns/clean-gray-paper.png)",
      backgroundSize: "cover",
      mixBlendMode: "overlay",
      opacity: 0.2,
    },
  },
];

export default function EditPage() {
  // --- STATE MANAGEMENT ---
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState("Filters");

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [filterIntensity, setFilterIntensity] = useState(100);

  // Effect State
  const [selectedEffect, setSelectedEffect] = useState("None");

  // Text State
  const [text, setText] = useState("Your Text Here");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textFont, setTextFont] = useState(fonts[0].className);
  const [textSize, setTextSize] = useState(48);

  // --- REFS ---
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setSelectedFilter(null); // Reset filter on new image
      setFilterIntensity(100);
    }
  };

  const getCssFilterString = () => {
    if (!selectedFilter) return "none";
    const filter = FILTERS.find((f) => f.name === selectedFilter);
    if (!filter) return "none";

    const intensityRatio = filterIntensity / 100;

    let filterString = "";
    for (const prop in filter.properties) {
      let value = filter.properties[prop];
      let defaultValue = prop === "grayscale" || prop === "sepia" ? 0 : 1;
      if (prop === "hue-rotate") defaultValue = 0;

      const finalValue = defaultValue + (value - defaultValue) * intensityRatio;

      if (prop === "hue-rotate") {
        filterString += `hue-rotate(${finalValue}deg) `;
      } else {
        filterString += `${prop}(${finalValue}) `;
      }
    }
    return filterString.trim();
  };

  const handleDownload = () => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for external URLs if needed
    img.src = image;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Apply filter to canvas context
      ctx.filter = getCssFilterString();
      ctx.drawImage(img, 0, 0);

      // --- Draw overlays (Effects & Text) on top ---
      // Effects will be drawn by CSS backgrounds, which is tricky on canvas.
      // A simple text overlay is more straightforward.
      // For production, you'd draw the effect images/gradients onto the canvas.

      // Reset filter for text
      ctx.filter = "none";

      // Draw Text
      const textX = canvas.width / 2;
      const textY = canvas.height / 2;
      ctx.font = `${textSize}px ${textFont
        .split(" ")[0]
        .replace("font-family:", "")}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, textX, textY);

      // Create download link
      const link = document.createElement("a");
      link.download = "edited-image.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.9); // Convert to JPG
      link.click();
    };
  };

  const renderControls = () => {
    switch (activeTab) {
      case "Filters":
        return (
          <div>
            <div className={styles.previewGrid}>
              {FILTERS.map((filter) => (
                <div
                  key={filter.name}
                  className={styles.previewTile}
                  onClick={() => setSelectedFilter(filter.name)}
                >
                  <img
                    src="/placeholder-image.jpg"
                    alt={filter.name}
                    style={{ filter: getCssFilterString(filter) }}
                  />
                  <span
                    className={`${styles.previewLabel} ${
                      selectedFilter === filter.name ? styles.activeLabel : ""
                    }`}
                  >
                    {filter.name}
                  </span>
                </div>
              ))}
            </div>
            {selectedFilter && (
              <div className={styles.sliderContainer}>
                <label htmlFor="intensity">Intensity</label>
                <input
                  type="range"
                  id="intensity"
                  min="0"
                  max="150"
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(Number(e.target.value))}
                  className={styles.slider}
                />
                <span>{filterIntensity}%</span>
              </div>
            )}
          </div>
        );
      case "Effects":
        return (
          <div className={styles.previewGrid}>
            {EFFECTS.map((effect) => (
              <div
                key={effect.name}
                className={styles.previewTile}
                onClick={() => setSelectedEffect(effect.name)}
              >
                <div
                  className={styles.effectPreview}
                  style={effect.style}
                ></div>
                <span
                  className={`${styles.previewLabel} ${
                    selectedEffect === effect.name ? styles.activeLabel : ""
                  }`}
                >
                  {effect.name}
                </span>
              </div>
            ))}
          </div>
        );
      case "Text":
        return (
          <div className={styles.textControls}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.textInput}
            />
            <div className={styles.textSetting}>
              <label>Font</label>
              <select
                onChange={(e) => setTextFont(e.target.value)}
                value={textFont}
                className={styles.selectInput}
              >
                {fonts.map((f) => (
                  <option key={f.name} value={f.className}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.textSetting}>
              <label>Size</label>
              <input
                type="range"
                min="12"
                max="120"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className={styles.slider}
              />
              <span>{textSize}px</span>
            </div>
            <div className={styles.textSetting}>
              <label>Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className={styles.colorInput}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const effectStyle =
    EFFECTS.find((e) => e.name === selectedEffect)?.style || {};

  return (
    <main className={styles.main}>
      {!image ? (
        <div className={styles.uploadContainer}>
          <h1 className={styles.title}>Midnight Photo Editor</h1>
          <button
            onClick={() => fileInputRef.current.click()}
            className={styles.uploadButton}
          >
            Upload a Picture to Start
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div className={styles.editorLayout}>
          {/* --- PREVIEW AREA --- */}
          <div className={styles.previewArea}>
            <div className={styles.imageContainer}>
              <img
                ref={imageRef}
                src={image}
                alt="Preview"
                className={styles.imagePreview}
                style={{ filter: getCssFilterString() }}
              />
              {/* Effect Overlay */}
              <div className={styles.effectOverlay} style={effectStyle}></div>
              {/* Text Overlay */}
              <div className={styles.textOverlay}>
                <span
                  className={textFont}
                  style={{ fontSize: `${textSize}px`, color: textColor }}
                >
                  {text}
                </span>
              </div>
            </div>
          </div>

          {/* --- EDITOR PANEL (Desktop) --- */}
          <div className={styles.editorPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Editor</h2>
              <button onClick={handleDownload} className={styles.saveButton}>
                Save Image
              </button>
            </div>
            <div className={styles.desktopTabs}>
              <button
                onClick={() => setActiveTab("Filters")}
                className={activeTab === "Filters" ? styles.activeTab : ""}
              >
                Filters
              </button>
              <button
                onClick={() => setActiveTab("Effects")}
                className={activeTab === "Effects" ? styles.activeTab : ""}
              >
                Effects
              </button>
              <button
                onClick={() => setActiveTab("Text")}
                className={activeTab === "Text" ? styles.activeTab : ""}
              >
                Text
              </button>
            </div>
            <div className={styles.controls}>{renderControls()}</div>
          </div>

          {/* --- MOBILE NAVIGATION --- */}
          <div className={styles.mobileNav}>
            <button
              onClick={() => setActiveTab("Filters")}
              className={activeTab === "Filters" ? styles.activeTab : ""}
            >
              Filters
            </button>
            <button
              onClick={() => setActiveTab("Effects")}
              className={activeTab === "Effects" ? styles.activeTab : ""}
            >
              Effects
            </button>
            <button
              onClick={() => setActiveTab("Text")}
              className={activeTab === "Text" ? styles.activeTab : ""}
            >
              Text
            </button>
            <button
              onClick={handleDownload}
              className={styles.saveButtonMobile}
            >
              Save
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </main>
  );
}
