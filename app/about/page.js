"use client";

import { useState, useRef } from "react";
import styles from "./About.module.css";

export default function AboutPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [bwImage, setBwImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  /**
   * Handles the file input change event when a user selects an image.
   * @param {React.ChangeEvent<HTMLInputElement>} e The event object.
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset the state for a new image upload
      setBwImage(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        // Store the file name without its extension for the download
        setImageName(file.name.split(".").slice(0, -1).join("."));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Converts the uploaded image to black and white using an HTML canvas.
   */
  const convertToBlackAndWhite = () => {
    if (!originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.src = originalImage;

    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get the image data to manipulate pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Loop through each pixel and apply a grayscale formula
      for (let i = 0; i < data.length; i += 4) {
        // Using the luminosity formula for better visual results
        const average =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = average; // Red
        data[i + 1] = average; // Green
        data[i + 2] = average; // Blue
      }
      // Put the modified data back onto the canvas
      ctx.putImageData(imageData, 0, 0);
      setBwImage(canvas.toDataURL("image/png"));
    };
  };

  /**
   * Triggers the download of the black and white image.
   */
  const handleSaveImage = () => {
    if (!bwImage) return;

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = bwImage;
    link.download = `${imageName}-bw.png`; // Suggests a filename

    // Append, click, and remove the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * A handler to trigger the hidden file input when the custom button is clicked.
   */
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Black & White Image Converter</h1>
      <p className={styles.description}>
        Upload an image, convert it to black and white, and save it. Works on
        desktops, Android, and iOS.
      </p>

      {/* The actual file input is hidden and controlled by a custom button */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className={styles.hiddenInput}
      />

      {/* This button triggers the file selection dialog */}
      <button onClick={handleUploadClick} className={styles.button}>
        Upload Image
      </button>

      {/* A hidden canvas is used for the image processing */}
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
