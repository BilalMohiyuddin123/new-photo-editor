"use client";

import { useState, useRef } from "react";
import styles from "./About.module.css";

export default function AboutPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [bwImage, setBwImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
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

  // Convert image to black and white and compress
  const convertToBlackAndWhite = () => {
    if (!originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.src = originalImage;

    img.onload = () => {
      // Resize large images to avoid huge downloads
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

      // Convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);

      // Save as compressed JPEG
      setBwImage(canvas.toDataURL("image/jpeg", 0.8));
    };
  };

  // Save image — hybrid behavior
  const handleSaveImage = () => {
    if (!bwImage) return;

    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // ✅ Mobile behavior: open in new tab for “Save Image”
      const newTab = window.open();
      newTab.document.write(`<img src="${bwImage}" style="width:100%">`);
    } else {
      // ✅ Desktop behavior: auto-download directly
      const link = document.createElement("a");
      link.href = bwImage;
      link.download = `${imageName}-bw.jpg`;
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
        Upload an image, convert it to black & white, and save it. Works
        perfectly on desktop and mobile.
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
              Save Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
