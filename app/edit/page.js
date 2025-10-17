// app/edit/page.js

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import { Inter, Lobster, Bebas_Neue, Special_Elite } from "next/font/google";
import styles from "./Edit.module.css";

// --- FONT DEFINITIONS ---
const inter = Inter({ subsets: ["latin"] });
const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const specialElite = Special_Elite({ weight: "400", subsets: ["latin"] });

const fonts = [
  { id: "inter", name: "Inter", className: inter.className },
  { id: "lobster", name: "Lobster", className: lobster.className },
  { id: "bebasNeue", name: "Bebas Neue", className: bebasNeue.className },
  {
    id: "specialElite",
    name: "Special Elite",
    className: specialElite.className,
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
  const imageRef = useRef(null); // the <img> preview element
  const wrapperRef = useRef(null); // the preview wrapper we will screenshot
  const canvasRef = useRef(null); // fallback canvas
  const originalImageRef = useRef(null); // HTMLImageElement for fallback drawing
  const uploadInputRef = useRef(null);

  // --- IMAGE UPLOAD ---
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name.split(".").slice(0, -1).join("."));
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImageSrc(dataUrl);

        // Create an HTMLImageElement reference for fallback canvas rendering
        const img = new window.Image();
        // try setting crossOrigin to reduce CORS problems with html2canvas (works with remote images)
        try {
          img.crossOrigin = "anonymous";
        } catch (err) {
          // ignore
        }
        img.src = dataUrl;
        img.onload = () => {
          originalImageRef.current = img;
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // --- CSS filter string generator (same as before) ---
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

  const toggleEffect = (effectId) => {
    setActiveEffects((prev) => ({ ...prev, [effectId]: !prev[effectId] }));
  };

  // --- CAPTURE FUNCTION: returns a JPEG data URL of the edited preview ---
  const captureEditedImage = async () => {
    // Prefer capturing the visible preview (with html2canvas) so mobile browsers
    // that don't respect ctx.filter will still get the exact visual.
    if (!wrapperRef.current) throw new Error("No preview element to capture.");

    // Try html2canvas first
    try {
      const canvas = await html2canvas(wrapperRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2, // increase scale for higher quality
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      return dataUrl;
    } catch (err) {
      console.warn("html2canvas failed, falling back to canvas drawing:", err);
      // fallback - draw original image into offscreen canvas and apply filters & text (your original logic)
    }

    // Fallback: draw using canvas API (works well for desktop)
    if (!originalImageRef.current || !canvasRef.current) {
      throw new Error("No image available to draw in fallback.");
    }

    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas to original image size
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Apply filters using ctx.filter (same filter generator used for preview)
    ctx.filter = getCssFilterString();

    // Draw image at full resolution
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Reset filter, draw text
    ctx.filter = "none";
    const selectedFont =
      fonts.find((f) => f.className === textFont) || fonts[0];

    // Compute scaled text size relative to preview width (fall back if imageRef not present)
    const previewWidth = imageRef.current?.clientWidth || canvas.width;
    const scaledTextSize = Math.max(
      12,
      Math.round(textSize * (canvas.width / previewWidth))
    );
    ctx.font = `${scaledTextSize}px "${selectedFont.name}"`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // You can add drawing of vignette/grain/dust here if you want them baked in.

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    return dataUrl;
  };

  // --- SAVE FUNCTION: uses captureEditedImage() then opens new tab (mobile) or downloads (desktop) ---
  const saveImageFromCapture = async () => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const fileName = `${imageName || "edited-image"}-edited.jpeg`;

    try {
      const dataUrl = await captureEditedImage();

      if (isMobile) {
        // Open in new tab so user can long-press to save on phones
        const newTab = window.open();
        if (!newTab) {
          // Popup blocked
          alert("Please allow popups for this site to save the image.");
          return;
        }
        newTab.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Save Image</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              html,body { height:100%; margin:0; background:#111; color:#fff; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
              .wrap { min-height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; }
              img { max-width:95%; height:auto; border-radius:8px; box-shadow:0 6px 30px rgba(0,0,0,0.6); }
              p { margin-top:18px; text-align:center; color:#eee; }
              .name { color:#ffd54f; font-weight:600; }
            </style>
          </head>
          <body>
            <div class="wrap">
              <img src="${dataUrl}" alt="Edited Image" />
              <p>Long press the image and choose "Save Image" to save to your gallery.<br/><span class="name">${fileName}</span></p>
            </div>
          </body>
          </html>
        `);
        newTab.document.close();
      } else {
        // Desktop: trigger download
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error saving image:", err);
      alert("Something went wrong while saving your image. Please try again.");
    }
  };

  // --- JSX RENDER ---
  return (
    <main className={styles.main}>
      <div className={styles.editorLayout}>
        {/* --- IMAGE PREVIEW --- */}
        <div className={styles.previewContainer}>
          {imageSrc ? (
            <div className={styles.imageWrapper} ref={wrapperRef}>
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Image preview"
                className={styles.imagePreview}
                style={{ filter: getCssFilterString() }}
                // try to help html2canvas with crossOrigin when possible
                crossOrigin="anonymous"
              />
              {/* Overlays for Effects */}
              {activeEffects.vignette && (
                <div className={styles.vignetteOverlay}></div>
              )}
              {activeEffects.dust && <div className={styles.dustOverlay}></div>}
              {activeEffects.grain && (
                <div className={styles.grainOverlay}></div>
              )}

              {/* Text Overlay */}
              <div
                className={`${styles.textOverlay} ${textFont}`}
                style={{ color: textColor, fontSize: `${textSize}px` }}
              >
                {text}
              </div>
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <p>Upload an image to start editing</p>
              <button
                onClick={() => uploadInputRef.current.click()}
                className={styles.uploadButton}
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
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* --- CONTROLS PANEL --- */}
        <div className={styles.controlsContainer}>
          {imageSrc && (
            <>
              <div className={styles.mobileTabs}>
                <button
                  onClick={() => setActiveTab("filters")}
                  className={activeTab === "filters" ? styles.activeTab : ""}
                >
                  Filters
                </button>
                <button
                  onClick={() => setActiveTab("effects")}
                  className={activeTab === "effects" ? styles.activeTab : ""}
                >
                  Effects
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={activeTab === "text" ? styles.activeTab : ""}
                >
                  Text
                </button>
              </div>

              <div className={styles.controlsContent}>
                <div
                  className={`${styles.controlSection} ${
                    activeTab === "filters" ? styles.activeSection : ""
                  }`}
                >
                  <h3 className={styles.sectionTitle}>Filters</h3>
                  <div className={styles.itemGrid}>
                    {filters.map((filter) => (
                      <div
                        key={filter.id}
                        className={styles.filterItem}
                        onClick={() => setSelectedFilter(filter.id)}
                      >
                        <Image
                          src={imageSrc}
                          alt={filter.name}
                          width={80}
                          height={80}
                          style={{ filter: getCssFilterString() }}
                          className={
                            selectedFilter === filter.id
                              ? styles.selectedItem
                              : ""
                          }
                        />
                        <span>{filter.name}</span>
                      </div>
                    ))}
                  </div>
                  {selectedFilter !== "none" && (
                    <div className={styles.sliderContainer}>
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
                  className={`${styles.controlSection} ${
                    activeTab === "effects" ? styles.activeSection : ""
                  }`}
                >
                  <h3 className={styles.sectionTitle}>Effects</h3>
                  <div className={styles.itemGrid}>
                    {effects.map((effect) => (
                      <div
                        key={effect.id}
                        className={styles.effectItem}
                        onClick={() => toggleEffect(effect.id)}
                      >
                        <div
                          className={`${styles.effectPreview} ${
                            styles[effect.id + "Preview"]
                          } ${
                            activeEffects[effect.id] ? styles.selectedItem : ""
                          }`}
                        ></div>
                        <span>{effect.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`${styles.controlSection} ${
                    activeTab === "text" ? styles.activeSection : ""
                  }`}
                >
                  <h3 className={styles.sectionTitle}>Text</h3>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={styles.textInput}
                  />
                  <div className={styles.textSettings}>
                    <div className={styles.colorPickerWrapper}>
                      <label>Color</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className={styles.colorPicker}
                      />
                    </div>
                    <div className={styles.sliderContainer}>
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
                  <div className={styles.fontSelector}>
                    {fonts.map((font) => (
                      <button
                        key={font.id}
                        className={`${font.className} ${
                          textFont === font.className ? styles.selectedFont : ""
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
                onClick={saveImageFromCapture}
                className={styles.saveButton}
              >
                Save Image
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
