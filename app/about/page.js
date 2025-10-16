"use client";

import { useState, useRef } from "react";
import styles from "./About.module.css";

export default function AboutPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [bwImage, setBwImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Upload image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBwImage(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        setImageName(file.name.split(".").slice(0, -1).join("."));
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert to B&W and reduce size intelligently
  const convertToBlackAndWhite = () => {
    if (!originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.src = originalImage;

    img.onload = () => {
      // Limit max width or height to 1200px to avoid huge files
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = (height * maxDim) / width;
        width = maxDim;
      } else if (height > maxDim) {
        width = (width * maxDim) / height;
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      // Export as JPEG with 0.8 quality → smaller but still clear
      setBwImage(canvas.toDataURL("image/jpeg", 0.8));
    };
  };

  // Save image (optimized for phones)
  const handleSaveImage = () => {
    if (!bwImage) return;

    const link = document.createElement("a");
    link.href = bwImage;
    link.download = `${imageName}-bw.jpg`;

    // ✅ For iPhone and Android — open image in a new tab for “Save Image” option
    if (/iPhone|iPad|Android/i.test(navigator.userAgent)) {
      const newTab = window.open();
      newTab.document.write(`<img src="${bwImage}" style="width:100%">`);
    } else {
      // Desktop → direct download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleUploadClick = () => fileInputRef.current.click();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Black & White Image Converter</h1>
      <p className={styles.description}>
        Upload an image, convert it to black & white, and save. Works on desktop
        and mobile.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className={styles.hiddenInput}
      />

      <button onClick={handleUploadClick} className={styles.button}>
        Upload Image
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <div className={styles.imageContainer}>
        {originalImage && (
          <div className={styles.imageWrapper}>
            <h2 className={styles.imageTitle}>Original</h2>
            <img src={originalImage} alt="Original" className={styles.image} />
            <button
              onClick={convertToBlackAndWhite}
              className={`${styles.button} ${styles.actionButton}`}
            >
              Convert to B&W
            </button>
          </div>
        )}

        {bwImage && (
          <div className={styles.imageWrapper}>
            <h2 className={styles.imageTitle}>Black & White</h2>
            <img src={bwImage} alt="Black and White" className={styles.image} />
            <button
              onClick={handleSaveImage}
              className={`${styles.button} ${styles.saveButton}`}
            >
              Save to Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
