import { useState, useEffect, useRef } from "react";
import { transcript } from "./transcript";
import Image from "next/image";
import styles from '../styles/Home.module.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";


export let answer = "";

async function translateToDutch(text) {
  const response = await fetch("https://api.mymemory.translated.net/get?q=" + text + "&langpair=en|nl");
  const data = await response.json();
  return data.responseData.translatedText;
}

export default function MyPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imageCount, setImageCount] = useState(0);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  console.log('hallao')

  useEffect(()=> {
    //const WebSocket = require('ws')
    function wsConnect() {
      console.log("wsConnect");
      let ws = new W3CWebSocket('ws://192.168.100.1:1880/speak');
    
      ws.onmessage = function (msg) {
        console.log(msg)
        console.log(msg.data);
        if (msg.data === 'capture') {
          setImageCount(imageCount+1)
          window.location.reload();
        } else if (msg.data === 'speak') {
          handleSpeech();
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

  }, [])


  let animationInterval = null;
  function onLoadImage() {
  


      
      startAnimation();
    }
  
    function startAnimation() {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      const ctx = canvas.getContext("2d");
  
      canvas.width = 800;
      canvas.height = 600;
  
        console.log('aaa')
        console.log(img);
        // Teken de afbeelding op canvas2
        ctx.drawImage(img, 0, 0, 800, 600, 0, 0, 800, 600);
        canvas.style.display = "block"; // maak #canvas2 zichtbaar
      // Handmatig invoeren van de coördinaten van de rechthoek
      const x = 220;
      const y = 315;
      const width = 200;
      const height = 140;

      // Animatie van de uitgesneden rechthoek
      let offset = 0;
      let direction = "omhoog";

      animationInterval = setInterval(() => {
        // Teken een deel van de afbeelding in de rechthoek
        ctx.clearRect(x, y, width, height);
        ctx.drawImage(
          img,
          x,
          y + offset,
          width,
          height, // broncoördinaten
          x,
          y,
          width,
          height // doelcoördinaten
        );
        // Pas de offset aan om de positie van de tekening te veranderen
        if (direction === "omhoog") {
          offset = offset - 1;
          if (offset < -7) {
            direction = "omlaag";
          }
        } else {
          offset = offset + 1;
          if (offset > 0) {
            direction = "omhoog";
          }
        }
      }, 50);
    }
    function stopAnimation() {
      clearInterval(animationInterval)
    }

  async function handleSubmit(transcript) {
    setIsLoading(true);
    console.log(transcript);
    const response = await fetch("/api/get-answer", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: transcript })
    });
    const data = await response.json();
    answer = data.text.trim();
    const translatedAnswer = await translateToDutch(answer);
    answer = translatedAnswer;
    setIsLoading(false);

    // Use the Web Speech API to speak the answer out loud with a scary voice
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.pitch = 0.5; // Low pitch
    utterance.rate = 0.8; // Slow speed
    utterance.volume = 1; // Loud volume
    utterance.voice = speechSynthesis.getVoices().find((voice) => voice.name === "Whisper"); // Find the "Whisper" voice
    speechSynthesis.speak(utterance);
  }

  function handleChange(e) {
    setPrompt(e.target.value);
  }

  function handleSpeech() {
    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "nl-NL";
    recognition.start();
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setPrompt(transcript);
      setIsListening(false);
      handleSubmit(transcript);
    };
  }

  return (
    <div className="container">
  
      <canvas id="canvas" width={900} height={700} ref={canvasRef}></canvas>
    
      {prompt}
      <div className="speech-button-container">
        <button className="speech-button" onClick={handleSpeech} disabled={isLoading || isListening}>
          {isListening ? "Luisteren..." : "Spreek uw vraag in"}
        </button>
      </div>

      {isLoading && <div className="loading-spinner"></div>}

      <div className="answer-area">{answer}</div>
      <Image className={styles.image} src={"/captured-image.png?cache=" +Date.now()} ref={imgRef} onLoad={onLoadImage} width={1200} height={900}/>
     

    
    </div>
  );
}

