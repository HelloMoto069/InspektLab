import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import Modal from "react-modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const CameraCapture = () => {
  const [frontCamera, setFrontCamera] = useState(true); // Default to front camera
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const savedImages =
      JSON.parse(localStorage.getItem("capturedImages")) || [];
    setCapturedImages(savedImages);
  }, []);

  const startCamera = () => {
    setCameraStarted(true);
  };

  // const capture = useCallback(() => {
  //   const imageSrc = webcamRef.current.getScreenshot();
  //   if (imageSrc) {
  //     const updatedImages = [...capturedImages, { original: imageSrc }];
  //     localStorage.setItem("capturedImages", JSON.stringify(updatedImages));
  //     setCapturedImages(updatedImages);
  //   } else {
  //     console.error("Failed to capture image.");
  //   }
  // }, [capturedImages]);

  const capture = useCallback(() => {
    const container = webcamRef.current.video;
    const canvas = document.createElement("canvas");

    // Calculate the dimensions of the visible portion inside the webcam container
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const zoomedWidth = containerWidth / zoom;
    const zoomedHeight = containerHeight / zoom;
    const offsetX = (containerWidth - zoomedWidth) / 2;
    const offsetY = (containerHeight - zoomedHeight) / 2;

    // Set canvas dimensions
    canvas.width = zoomedWidth;
    canvas.height = zoomedHeight;

    // Draw the webcam video frame on the canvas with applied zoom
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      container,
      offsetX,
      offsetY,
      zoomedWidth,
      zoomedHeight,
      0,
      0,
      zoomedWidth,
      zoomedHeight
    );

    // Convert canvas to image
    const imageSrc = canvas.toDataURL("image/png");

    // Save the captured image
    if (imageSrc) {
      const updatedImages = [...capturedImages, { original: imageSrc }];
      localStorage.setItem("capturedImages", JSON.stringify(updatedImages));
      setCapturedImages(updatedImages);
    } else {
      console.error("Failed to capture image.");
    }
  }, [capturedImages, zoom]);

  const handleZoomChange = (event) => {
    setZoom(parseFloat(event.target.value));
  };

  const handleAspectRatioChange = (event) => {
    const newAspectRatio = event.target.value;
    setAspectRatio(newAspectRatio);
  };

  const deleteImage = (index) => {
    const updatedImages = [...capturedImages];
    updatedImages.splice(index, 1);
    localStorage.setItem("capturedImages", JSON.stringify(updatedImages));
    setCapturedImages(updatedImages);
  };

  const switchCamera = () => {
    setFrontCamera((prev) => !prev);
    setCameraStarted(false); // Restart camera with the new facing mode
  };

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    setModalIsOpen(false);

    // Check if there are no more images left to show
    if (selectedImageIndex === null && capturedImages.length === 0) {
      setModalIsOpen(false);
    }
  };

  return (
    <div
      style={{
        overflow: "hidden",
        width: "fit-content",
      }}
    >
      <div>
        <label htmlFor="zoom">Zoom:</label>
        <input
          type="range"
          id="zoom"
          name="zoom"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={handleZoomChange}
        />
      </div>
      <div>
        <label htmlFor="aspectRatio">Aspect Ratio:</label>
        <select
          id="aspectRatio"
          value={aspectRatio}
          onChange={handleAspectRatioChange}
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
        </select>
      </div>
      {!cameraStarted && (
        <div>
          <button onClick={startCamera}>Start Camera</button>
        </div>
      )}
      {cameraStarted && (
        <>
          <div
            className="webcam-container"
            style={{ width: "100%", height: "auto", overflow: "hidden" }}
          >
            <Webcam
              ref={webcamRef}
              videoConstraints={{
                facingMode: frontCamera ? "user" : "environment",
              }}
              audio={false}
              screenshotFormat="image/png"
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: aspectRatio,
                transform: `scale(${zoom})`,
              }}
            />
          </div>
          <div>
            <button onClick={switchCamera}>
              {frontCamera ? "Switch to Back Camera" : "Switch to Front Camera"}
            </button>
            <button onClick={capture}>Capture Image</button>
          </div>
        </>
      )}
      <div className="gallery">
        {capturedImages.map((image, index) => (
          <div key={index} className="gallery-item">
            <img
              src={image.original}
              alt={`Captured ${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              className="zoomable-image"
              onClick={() => openModal(index)}
            />
            <button onClick={() => deleteImage(index)}>Delete</button>
          </div>
        ))}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Captured Image Modal"
      >
        <ImageGallery
          items={capturedImages}
          showPlayButton={false}
          showFullscreenButton={false}
          showNav={true}
          startIndex={selectedImageIndex}
          onThumbnailClick={closeModal}
          renderCustomControls={() => (
            <>
              <button onClick={closeModal}>Close</button>
              <button onClick={() => deleteImage(selectedImageIndex)}>
                Delete
              </button>
            </>
          )}
        />
      </Modal>
    </div>
  );
};

export default CameraCapture;
