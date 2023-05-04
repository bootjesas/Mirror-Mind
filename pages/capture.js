import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [stream, setStream] = useState(null);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureButtonRef = useRef(null);

  const constraints = {
    video: true
  };

  const handleSuccess = (stream) => {
    videoRef.current.srcObject = stream;
    setStream(stream);
  }

  const handleError = (error) => {
    console.error('Error accessing media devices.', error);
  }

  const startCountdown = () => {
    let timer = 5;
    setCountdown(timer);

    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        capture();
      }
    }, 1000);
  }

  const capture = () => {
    // Maak de canvaselementen even groot als de videoresolutie
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    // Teken de video op het canvas
    canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0);

    setShowingFeedback(true);
    setCountdown(null);

    // save image
    const dataUrl = canvasRef.current.toDataURL('image/png');
    fetch('/api/save-image', {
        method: 'POST',
        body: JSON.stringify({ image: dataUrl }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));

    setTimeout(()=> {
      setShowingFeedback(false);
    },10000);
  }

  const handleCaptureButtonClick = () => {
    startCountdown();
  }

  useEffect(()=> {
    if (process.browser) { 
        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
      }
  }, [])
  
  return (
    <div className={styles.cameraContainer}>
      <div className={showingFeedback ? styles.videoHidden : styles.videoShow}>
        <video className={styles.video} ref={videoRef} autoPlay></video>
        <button id="capture-btn" ref={captureButtonRef} onClick={handleCaptureButtonClick}>Capture</button>
        {countdown !== null && <div className={styles.countdown}>{countdown}</div>}
      </div>
      <div className={showingFeedback ? styles.canvas : styles.canvasHidden }>
         <canvas id="canvas" width={800} height={600} ref={canvasRef}></canvas>
      </div>
     
    </div>
  );
}
