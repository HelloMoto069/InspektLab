// import React, { useState, useRef } from 'react';

// const CameraCapture = () => {
//   const [frontCamera, setFrontCamera] = useState(false);
//   const [zoom, setZoom] = useState(1);
//   const [aspectRatio, setAspectRatio] = useState('16:9');
//   const videoContainerRef = useRef(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [capturedImages, setCapturedImages] = useState([]);

//   const startCamera = async () => {
//     try {
//       const constraints = {
//         audio: false,
//         video: { facingMode: frontCamera ? 'user' : 'environment' }
//       };
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       videoRef.current.srcObject = stream;
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//     }
//   };

//   const captureImage = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');

//     const { width, height } = video;
//     canvas.width = width;
//     canvas.height = height;
//     context.drawImage(video, 0, 0, width, height);

//     // Convert the captured image to a data URL
//     const dataURL = canvas.toDataURL('image/png');

//     // Use the dataURL as needed (e.g., add it to the gallery)
//     setCapturedImages(prevImages => [...prevImages, dataURL]);
//   };

//   const handleZoomChange = (event) => {
//     setZoom(parseFloat(event.target.value));
//   };

//   const handleAspectRatioChange = (event) => {
//     setAspectRatio(event.target.value);
//   };

//   return (
//     <div>
//       <div>
//         <label htmlFor="zoom">Zoom:</label>
//         <input type="range" id="zoom" name="zoom" min="1" max="3" step="0.1" value={zoom} onChange={handleZoomChange} />
//       </div>
//       <div>
//         <label htmlFor="aspectRatio">Aspect Ratio:</label>
//         <select id="aspectRatio" value={aspectRatio} onChange={handleAspectRatioChange}>
//           <option value="16:9">16:9</option>
//           <option value="4:3">4:3</option>
//           <option value="1:1">1:1</option>
//         </select>
//       </div>
//       <div ref={videoContainerRef} style={{ overflow: 'hidden', width: '100%', height: 'auto', aspectRatio: aspectRatio }}>
//         <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
//       </div>
//       <canvas ref={canvasRef} style={{ display: 'none' }} />
//       <div>
//         <button onClick={() => setFrontCamera(prev => !prev)}>
//           {frontCamera ? 'Switch to Back Camera' : 'Switch to Front Camera'}
//         </button>
//         <button onClick={startCamera}>Start Camera</button>
//         <button onClick={captureImage}>Capture Image</button>
//       </div>
//       <div className="gallery">
//         {capturedImages.map((image, index) => (
//           <div key={index} className="gallery-item">
//             <img
//               src={image}
//               alt={`Captured ${index}`}
//               style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s', cursor: 'pointer' }}
//               className="zoomable-image"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CameraCapture;

// import "./CameraCapture.css";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import Modal from 'react-modal';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

const CameraCapture = () => {
  const [frontCamera, setFrontCamera] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('capturedImages')) || [];
    setCapturedImages(savedImages);
  }, []);

  const startCamera = () => {
    setCameraStarted(true);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const updatedImages = [...capturedImages, { original: imageSrc }];
      localStorage.setItem('capturedImages', JSON.stringify(updatedImages));
      setCapturedImages(updatedImages);
    } else {
      console.error('Failed to capture image.');
    }
  }, [capturedImages]);

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
    localStorage.setItem('capturedImages', JSON.stringify(updatedImages));
    setCapturedImages(updatedImages);
  };

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    setModalIsOpen(false);
  };

  return (
    <div>
      <div>
        <label htmlFor="zoom">Zoom:</label>
        <input type="range" id="zoom" name="zoom" min="1" max="3" step="0.1" value={zoom} onChange={handleZoomChange} />
      </div>
      <div>
        <label htmlFor="aspectRatio">Aspect Ratio:</label>
        <select id="aspectRatio" value={aspectRatio} onChange={handleAspectRatioChange}>
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
          <div className="webcam-container">
            <Webcam
              ref={webcamRef}
              mirrored={frontCamera}
              audio={false}
              screenshotFormat="image/png"
              style={{ width: '100%', height: 'auto', aspectRatio: aspectRatio, transform: `scale(${zoom})` }}
            />
          </div>
          <div>
            <button onClick={() => setFrontCamera(prev => !prev)}>
              {frontCamera ? 'Switch to Back Camera' : 'Switch to Front Camera'}
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
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s', cursor: 'pointer' }}
              className="zoomable-image"
              onClick={() => openModal(index)}
            />
            <button onClick={() => deleteImage(index)}>Delete</button>
          </div>
        ))}
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Captured Image Modal">
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
              <button onClick={() => deleteImage(selectedImageIndex)}>Delete</button>
            </>
          )}
        />
      </Modal>
    </div>
  );
};

export default CameraCapture;






