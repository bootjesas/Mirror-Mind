import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";

let ws = null;

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
        .then(data => {
          //socket.send("capture");
          console.log(data)
        })
        .catch(error => console.error(error));

    setTimeout(()=> {
      setShowingFeedback(false);
    },10000);
  }

  const handleCaptureButtonClick = () => {
    startCountdown();
  }


  useEffect(()=> {
    console.log("useeffect");
    //const WebSocket = require('ws')
      function wsConnect() {
      console.log("wsConnect");
      ws = new W3CWebSocket('ws://192.168.100.1:1880/websocket');
    
      ws.onmessage = function (msg) {
        if (msg.data === "startCountdown") {
          startCountdown();
          console.log(msg);
          ws.send("capture");
        }
      }

      ws.onopen = function () {
        console.log("Connected");
      }

      ws.onclose = function () {
        setTimeout(wsConnect, 3000);
      }

      ws.disconnect = function () {
        console.log("Disconnected");
      }

      

      
}

wsConnect();
    // Create WebSocket connection.
    //socket = new WebSocket("ws://192.168.100.1:1880/ws");

    // Connection opened
    //socket.addEventListener("open", (event) => {
      //
    //});

    // Listen for messages
    //socket.addEventListener("message", (event) => {
    //  console.log("Message from server ", event.data);
    //});

    if (process.browser) { 
        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
      }
  }, [])
  
  return (
    <div className={styles.cameraContainer}>
      <div className={showingFeedback ? styles.videoHidden : styles.videoShow}>
        <div className={styles.overlayContainer}>
          <video className={styles.video} ref={videoRef} autoPlay></video>
          <div className={styles.overlay}></div>
        </div>
        <button id="capture-btn" ref={captureButtonRef} onClick={handleCaptureButtonClick}>Capture</button>
        {countdown !== null && <div className={styles.countdown}>{countdown}</div>}
      </div>
      <div className={showingFeedback ? styles.canvas : styles.canvasHidden }>
         <canvas id="canvas" width={800} height={600} ref={canvasRef}></canvas>
      </div>
    </div>
  );
  
}
