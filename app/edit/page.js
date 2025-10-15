"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Edit.module.css";
import Image from "next/image";

const predefinedFilters = [
  {
    id: "midnight",
    name: "Midnight",
    preview: "/filters/midnight.jpg",
    css: {
      brightness: 80,
      contrast: 120,
      saturate: 90,
      sepia: 10,
      hueRotate: 200,
    },
  },
  {
    id: "noir",
    name: "Noir",
    preview: "/filters/noir.jpg",
    css: {
      brightness: 90,
      contrast: 130,
      saturate: 0,
      sepia: 20,
      hueRotate: 0,
    },
  },
  {
    id: "vintage",
    name: "Vintage",
    preview: "/filters/vintage.jpg",
    css: {
      brightness: 110,
      contrast: 90,
      saturate: 110,
      sepia: 40,
      hueRotate: 15,
    },
  },
  {
    id: "cinematic",
    name: "Cinematic",
    preview: "/filters/cinematic.jpg",
    css: {
      brightness: 95,
      contrast: 115,
      saturate: 105,
      sepia: 15,
      hueRotate: 30,
    },
  },
  {
    id: "dreamy",
    name: "Dreamy",
    preview: "/filters/dreamy.jpg",
    css: {
      brightness: 110,
      contrast: 95,
      saturate: 130,
      sepia: 0,
      hueRotate: 270,
      blur: 1,
    },
  },
];

const overlayEffects = [
  { id: "dust", name: "Dust", className: styles.dust },
  { id: "vignette", name: "Vignette", className: styles.vignette },
  { id: "grain", name: "Grain", className: styles.grain },
];

export default function EditPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [image, setImage] = useState(null);
  const [text, setText] = useState("Your Text");
  const [textColor, setTextColor] = useState("#ffffff");
  const [font, setFont] = useState("Inter");
  const [activeTab, setActiveTab] = useState("filters");
  const [activeEffects, setActiveEffects] = useState([]);
  const imageRef = useRef();
  const canvasRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const applyFilterStyle = () => {
    if (!selectedFilter) return {};
    const base = selectedFilter.css;
    const factor = filterIntensity / 100;
    return {
      filter: `
        brightness(${100 + (base.brightness - 100) * factor}%)
        contrast(${100 + (base.contrast - 100) * factor}%)
        saturate(${100 + (base.saturate - 100) * factor}%)
        sepia(${base.sepia * factor}%)
        hue-rotate(${base.hueRotate * factor}deg)
        ${base.blur ? `blur(${base.blur * factor}px)` : ""}
      `,
    };
  };

  const toggleEffect = (effectId) => {
    setActiveEffects((prev) =>
      prev.includes(effectId)
        ? prev.filter((id) => id !== effectId)
        : [...prev, effectId]
    );
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!img) return;

    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = applyFilterStyle().filter;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Add text
    ctx.font = `bold ${Math.floor(canvas.width / 15)}px ${font}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height - 80);

    const link = document.createElement("a");
    link.download = "edited-image.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        {/* Image Upload */}
        <div className={styles.uploadBox}>
          <label className={styles.uploadLabel}>
            Upload Image
            <input type="file" accept="image/*" onChange={handleUpload} />
          </label>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className={styles.mobileNav}>
          {["filters", "effects", "text"].map((tab) => (
            <button
              key={tab}
              className={`${styles.navBtn} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* FILTERS */}
        {activeTab === "filters" && (
          <div className={styles.section}>
            <h3>Filters</h3>
            <div className={styles.filterGrid}>
              {predefinedFilters.map((f) => (
                <div
                  key={f.id}
                  className={`${styles.filterCard} ${
                    selectedFilter?.id === f.id ? styles.activeFilter : ""
                  }`}
                  onClick={() => setSelectedFilter(f)}
                >
                  <Image
                    src={f.preview}
                    alt={f.name}
                    width={100}
                    height={70}
                    className={styles.filterPreview}
                  />
                  <p>{f.name}</p>
                </div>
              ))}
            </div>

            {selectedFilter && (
              <div className={styles.sliderContainer}>
                <label>
                  Intensity: {filterIntensity}
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filterIntensity}
                    onChange={(e) => setFilterIntensity(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* EFFECTS */}
        {activeTab === "effects" && (
          <div className={styles.section}>
            <h3>Effects</h3>
            <div className={styles.effectGrid}>
              {overlayEffects.map((e) => (
                <div
                  key={e.id}
                  className={`${styles.effectCard} ${
                    activeEffects.includes(e.id) ? styles.activeEffect : ""
                  }`}
                  onClick={() => toggleEffect(e.id)}
                >
                  <div className={`${styles.effectPreview} ${e.className}`} />
                  <p>{e.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEXT */}
        {activeTab === "text" && (
          <div className={styles.section}>
            <h3>Text Overlay</h3>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text"
            />
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              <option>Inter</option>
              <option>Bebas Neue</option>
              <option>Playfair Display</option>
              <option>Roboto</option>
              <option>Lobster</option>
            </select>
          </div>
        )}

        <button
          className={styles.saveBtn}
          onClick={saveImage}
          disabled={!image}
        >
          Save Image (JPG)
        </button>
      </div>

      {/* Preview Section */}
      <div className={styles.preview}>
        {image ? (
          <div className={styles.imageContainer}>
            <img
              src={image}
              ref={imageRef}
              alt="Preview"
              style={applyFilterStyle()}
              className={styles.previewImage}
            />
            {activeEffects.map((id) => (
              <div key={id} className={`${styles.overlay} ${styles[id]}`} />
            ))}
            <div
              className={styles.textOverlay}
              style={{ color: textColor, fontFamily: font }}
            >
              {text}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        ) : (
          <p className={styles.placeholder}>Upload an image to begin editing</p>
        )}
      </div>
    </div>
  );
}
