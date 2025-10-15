// app/edit/page.js

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [activeEffects, setActiveEffects] = useState({});
  const [text, setText] = useState("Your Text");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textFont, setTextFont] = useState(fonts[0].className);
  const [textSize, setTextSize] = useState(50);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const uploadInputRef = useRef(null);

  // --- IMAGE & FILTER LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          originalImageRef.current = img;
        };
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

  const toggleEffect = (effectId) => {
    setActiveEffects((prev) => ({ ...prev, [effectId]: !prev[effectId] }));
  };

  // ==========================================================
  // --- ⬇️ MODIFIED SAVE/SHARE IMAGE FUNCTION ⬇️ ---
  // ==========================================================
  const handleSaveImage = async () => {
    if (!originalImageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = originalImageRef.current;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.filter = getCssFilterString();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.filter = "none";
    const selectedFont =
      fonts.find((f) => f.className === textFont) || fonts[0];
    const scaledTextSize =
      textSize * (canvas.width / imageRef.current.clientWidth);
    ctx.font = `${scaledTextSize}px ${selectedFont.name}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Convert canvas to a Blob object, which is needed for the Web Share API
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "edited-image.png", { type: "image/png" });
      const filesArray = [file];

      // **Check if the Web Share API is available and can share files**
      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        try {
          // **Use the native share dialog on mobile**
          await navigator.share({
            files: filesArray,
            title: "My Edited Image",
            text: "Check out this image I edited with Midnight Editor!",
          });
        } catch (error) {
          console.error("Sharing failed:", error);
        }
      } else {
        // **Fallback for desktop browsers (or mobile browsers that don't support sharing)**
        const link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href); // Clean up the object URL from memory
      }
    }, "image/png");
  };

  // --- JSX RENDER ---
  return (
    <main className={styles.main}>
      <div className={styles.editorLayout}>
        {/* --- IMAGE PREVIEW --- */}
        <div className={styles.previewContainer}>
          {imageSrc ? (
            <div className={styles.imageWrapper}>
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Image preview"
                className={styles.imagePreview}
                style={{ filter: getCssFilterString() }}
              />
              {activeEffects.vignette && (
                <div className={styles.vignetteOverlay}></div>
              )}
              {activeEffects.dust && <div className={styles.dustOverlay}></div>}
              {activeEffects.grain && (
                <div className={styles.grainOverlay}></div>
              )}
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
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

        {/* --- CONTROLS PANEL --- */}
        <div className={styles.controlsContainer}>
          {imageSrc && (
            <>
              {/* Mobile Tab Navigation */}
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
                {/* Filters Section */}
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
                          style={{
                            filter: getCssFilterString(), // This seems complex for a preview, but let's keep it
                          }}
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

                {/* Effects Section */}
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

                {/* Text Section */}
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

              {/* --- MODIFIED BUTTON TEXT --- */}
              <button onClick={handleSaveImage} className={styles.saveButton}>
                Save or Share Image
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
