import { useState, useEffect, useRef } from "react";
import { transcript } from "./transcript";
import Image from "next/image";
import styles from '../styles/Home.module.css';

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

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  console.log('hallao')

  useEffect(()=> {
    // Create WebSocket connection.
    const socket = new WebSocket("ws://localhost:8080");

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      // if event msg is bepaalde knop
      // handleSpeech()
    });

  }, [])

  function onLoadImage() {
    const canvas = canvasRef.current;
    const img = imgRef.current;

    canvas.width = 800;
    canvas.height = 600;

      console.log('aaa')
      const ctx = canvas.getContext("2d");
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
      setInterval(() => {
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
      <Image className={styles.image} src="/captured-image.png" ref={imgRef} onLoad={onLoadImage} width={900} height={700}/>
     

    
    </div>
  );
}

