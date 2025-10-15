"use client";

import { useState, useRef } from "react";
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
  {
    id: "dust",
    name: "Dust",
    url: "https://www.transparenttextures.com/patterns/dust.png",
  },
  { id: "vignette", name: "Vignette" }, // drawn procedurally
  {
    id: "grain",
    name: "Grain",
    url: "https://www.transparenttextures.com/patterns/noise.png",
  },
];

function composeCanvasFilterString(baseCss, intensityFactor) {
  if (!baseCss) return "none";
  const b = baseCss;
  const factor = intensityFactor;
  const blurPart = b.blur ? ` blur(${b.blur * factor}px)` : "";
  return [
    `brightness(${100 + (b.brightness - 100) * factor}%)`,
    `contrast(${100 + (b.contrast - 100) * factor}%)`,
    `saturate(${100 + (b.saturate - 100) * factor}%)`,
    `sepia(${(b.sepia || 0) * factor}%)`,
    `hue-rotate(${(b.hueRotate || 0) * factor}deg)`,
    blurPart,
  ].join(" ");
}

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
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const toggleEffect = (effectId) => {
    setActiveEffects((prev) =>
      prev.includes(effectId)
        ? prev.filter((id) => id !== effectId)
        : [...prev, effectId]
    );
  };

  // async helper to load overlay images
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });

  // Draws the edited image onto canvas (returns canvas). This is async because overlays may need to load
  const drawEditedImage = async () => {
    const imgEl = imageRef.current;
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return null;

    // prepare natural resolution canvas using devicePixelRatio
    const naturalW = imgEl.naturalWidth || imgEl.width;
    const naturalH = imgEl.naturalHeight || imgEl.height;
    const dpr = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = Math.round(naturalW * dpr);
    canvas.height = Math.round(naturalH * dpr);
    canvas.style.width = `${naturalW}px`;
    canvas.style.height = `${naturalH}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // keep drawing coordinates in natural px

    // Apply filters into canvas
    const factor = filterIntensity / 100;
    const filterString = selectedFilter
      ? composeCanvasFilterString(selectedFilter.css, factor)
      : "none";
    // canvas2d filter accepts values similar to CSS
    ctx.filter = filterString || "none";

    // draw base image
    ctx.drawImage(imgEl, 0, 0, naturalW, naturalH);

    // reset filter for overlays/text
    ctx.filter = "none";

    // draw overlay images (grain/dust) with alpha
    const overlayPromises = [];
    if (activeEffects.includes("dust"))
      overlayPromises.push(
        loadImage(
          "https://www.transparenttextures.com/patterns/dust.png"
        ).catch(() => null)
      );
    if (activeEffects.includes("grain"))
      overlayPromises.push(
        loadImage(
          "https://www.transparenttextures.com/patterns/noise.png"
        ).catch(() => null)
      );
    const loadedOverlays = await Promise.all(overlayPromises);

    let overlayIndex = 0;
    if (activeEffects.includes("dust")) {
      const img = loadedOverlays[overlayIndex++];
      if (img) {
        ctx.globalAlpha = 0.2;
        // tile the pattern to cover whole canvas:
        const pattern = ctx.createPattern(img, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, naturalW, naturalH);
        ctx.globalAlpha = 1;
      }
    }

    if (activeEffects.includes("grain")) {
      const img = loadedOverlays[overlayIndex++];
      if (img) {
        ctx.globalAlpha = 0.12;
        const pattern = ctx.createPattern(img, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, naturalW, naturalH);
        ctx.globalAlpha = 1;
      }
    }

    if (activeEffects.includes("vignette")) {
      const gradient = ctx.createRadialGradient(
        naturalW / 2,
        naturalH / 2,
        Math.min(naturalW, naturalH) / 4,
        naturalW / 2,
        naturalH / 2,
        Math.max(naturalW, naturalH)
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, naturalW, naturalH);
    }

    // Draw text overlay (keep responsive to natural resolution)
    const fontSize = Math.floor(naturalW / 15);
    ctx.font = `bold ${fontSize}px ${font}, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    // text shadow
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = Math.max(2, fontSize * 0.1);
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, naturalW / 2, naturalH - Math.min(80, naturalH * 0.08));

    // reset shadows
    ctx.shadowColor = "transparent";

    return canvas;
  };

  // Existing download button behavior — kept intact externally. Uses new draw routine internally.
  const saveImage = async () => {
    const canvas = await drawEditedImage();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    const link = document.createElement("a");
    link.download = "edited-image.jpg";
    link.href = dataUrl;

    // For browsers that support clicking an anchor to download
    try {
      link.click();
    } catch (e) {
      // fallback: open in new tab
      window.open(dataUrl, "_blank");
    }
  };

  // NEW: Save to Gallery — aims for best mobile UX:
  const saveToGallery = async () => {
    const canvas = await drawEditedImage();
    if (!canvas) return;

    // convert to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          return;
        }

        const fileName = "edited-image.jpg";
        const file = new File([blob], fileName, { type: "image/jpeg" });

        // Preferred: Web Share API with files (modern mobile browsers). This opens native sharing sheet (user can save to Photos/Gallery).
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Edited Image",
              text: "Save or share this image",
            });
            return;
          }
          // Some browsers don't have canShare but allow share with files (try and catch)
          if (navigator.share) {
            try {
              await navigator.share({
                files: [file],
                title: "Edited Image",
                text: "Save or share this image",
              });
              return;
            } catch (shareErr) {
              // continue to fallback
            }
          }
        } catch (err) {
          // ignore and proceed to fallback
          console.warn("Web Share with files failed or is unsupported:", err);
        }

        // Fallbacks:
        const blobUrl = URL.createObjectURL(blob);

        // iOS-specific fallback: open in new tab so user can long-press -> "Add to Photos"
        const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isiOS) {
          const newTab = window.open(blobUrl, "_blank", "noopener,noreferrer");
          // help user: set short message in new tab (some mobile browsers show image directly)
          try {
            if (newTab) {
              newTab.document.title = "Long-press the image -> Add to Photos";
              // If possible inject a tiny helpful message (best-effort)
              const div = newTab.document.createElement("div");
              div.style.position = "fixed";
              div.style.left = "8px";
              div.style.top = "8px";
              div.style.zIndex = 9999;
              div.style.background = "rgba(0,0,0,0.6)";
              div.style.color = "white";
              div.style.padding = "6px 8px";
              div.style.borderRadius = "6px";
              div.style.fontSize = "14px";
              div.innerText = "Long-press the image → Add to Photos";
              newTab.document.body.appendChild(div);
            }
          } catch (e) {
            // ignore cross-window write failures
          }
          // release object URL after some time
          setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
          return;
        }

        // Android / desktop fallback: attempt direct download via anchor
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        // For some browsers attaching to DOM helps
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      },
      "image/jpeg",
      0.95
    );
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
                    onChange={(e) => setFilterIntensity(Number(e.target.value))}
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
                  <div className={`${styles.effectPreview} ${styles[e.id]}`} />
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

        <button
          className={styles.saveBtnGallery}
          onClick={saveToGallery}
          disabled={!image}
        >
          📱 Save to Gallery
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
              style={
                selectedFilter
                  ? {
                      filter: composeCanvasFilterString(
                        selectedFilter.css,
                        filterIntensity / 100
                      ),
                    }
                  : {}
              }
              className={styles.previewImage}
              crossOrigin="anonymous"
            />
            {activeEffects.includes("vignette") && (
              <div className={`${styles.overlay} ${styles.vignette}`} />
            )}
            {activeEffects.includes("dust") && (
              <div className={`${styles.overlay} ${styles.dust}`} />
            )}
            {activeEffects.includes("grain") && (
              <div className={`${styles.overlay} ${styles.grain}`} />
            )}
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
