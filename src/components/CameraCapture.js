import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import Modal from "react-modal";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageGallery from "react-image-gallery";
import Slider from "@mui/material/Slider";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Card from "@mui/joy/Card";
import CardCover from "@mui/joy/CardCover";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import "react-image-gallery/styles/css/image-gallery.css";
// import "./CameraCapture.css";

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
    <div>
      <div
        style={{
          marginLeft: 17,
        }}
      >
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <ZoomInRoundedIcon />
          <label htmlFor="zoom">Zoom:</label>
          <Box sx={{ width: 200 }}>
            <Stack
              spacing={2}
              direction="row"
              sx={{ mb: 1 }}
              alignItems="center"
            >
              <RemoveCircleRoundedIcon />
              <Slider
                aria-label="zoom"
                value={zoom}
                onChange={handleZoomChange}
                step={0.1}
                marks
                min={1}
                max={4}
              />
              <AddCircleRoundedIcon />
            </Stack>
          </Box>
        </Stack>
        {/* <input
          type="range"
          id="zoom"
          name="zoom"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={handleZoomChange}
        /> */}
        {/* <Box sx={{ width: 200 }}>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <RemoveCircleRoundedIcon />
            <Slider
              aria-label="zoom"
              value={zoom}
              onChange={handleZoomChange}
              step={0.1}
              marks
              min={1}
              max={4}
            />
            <AddCircleRoundedIcon />
          </Stack>
        </Box> */}
      </div>
      <div
        style={{
          marginLeft: 17,
        }}
      >
        {/* <label htmlFor="aspectRatio">Aspect Ratio:</label>
        <select
          id="aspectRatio"
          value={aspectRatio}
          onChange={handleAspectRatioChange}
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
        </select> */}
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="aspectRatio">Aspect Ratio:</InputLabel>
          <Select
            labelId="aspectRatio"
            id="aspectRatio"
            value={aspectRatio}
            label="Aspect Ratio:"
            onChange={handleAspectRatioChange}
          >
            <MenuItem value={"16:9"}>16:9</MenuItem>
            <MenuItem value={"4:3"}>4:3</MenuItem>
            <MenuItem value={"1:1"}>1:1</MenuItem>
          </Select>
        </FormControl>
      </div>

      {!cameraStarted && (
        <div
          style={{
            marginLeft: 17,
          }}
        >
          {/* <button onClick={startCamera}>Start Camera</button> */}
          <Button color="secondary" onClick={startCamera}>
            Start Camera
          </Button>
        </div>
      )}
      {cameraStarted && (
        <>
          <div
            style={{
              width: "50%",
              marginLeft: "25%",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="webcam-container"
              style={{
                width: "100%",
                height: 0,
                paddingBottom:
                  aspectRatio === "16:9"
                    ? "56.25%"
                    : aspectRatio === "4:3"
                    ? "75%"
                    : "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Webcam
                ref={webcamRef}
                videoConstraints={{
                  facingMode: frontCamera ? "user" : "environment",
                }}
                audio={false}
                screenshotFormat="image/png"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${zoom})`,
                }}
              />
            </div>
            <div>
              <button onClick={switchCamera}>
                {frontCamera
                  ? "Switch to Back Camera"
                  : "Switch to Front Camera"}
              </button>
              <button onClick={capture}>Capture Image</button>
            </div>
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
            {/* <button onClick={() => deleteImage(index)}>Delete</button> */}
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => deleteImage(index)}
            >
              Delete
            </Button>
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
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => deleteImage(selectedImageIndex)}
              >
                Delete
              </Button>
            </>
          )}
        />
      </Modal>
    </div>
  );
};

export default CameraCapture;
