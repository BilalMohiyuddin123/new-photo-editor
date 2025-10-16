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

      // ✨ CHANGE 1: Use JPEG format with 90% quality for smaller file size
      setBwImage(canvas.toDataURL("image/jpeg", 0.9));
    };
  };

  /**
   * ✨ CHANGE 2: Updated save handler for better mobile experience.
   * Triggers the download or opens the native share sheet.
   */
  const handleSaveImage = async () => {
    if (!bwImage) return;

    const fileName = `${imageName}-bw.jpg`; // Use .jpg extension

    try {
      // Convert data URL to a blob, then to a file object
      const response = await fetch(bwImage);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });

      // Check if the Web Share API is available (common on mobile)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Converted Image",
          text: "Here is your black and white image.",
        });
      } else {
        // Fallback for desktops or browsers that don't support Web Share API
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob); // Use blob URL for more robust downloading
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // Clean up the blob URL
      }
    } catch (error) {
      console.error("Error saving or sharing the image:", error);
      // If sharing fails (e.g., user cancels), provide a fallback download
      const link = document.createElement("a");
      link.href = bwImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
