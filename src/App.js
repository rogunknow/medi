import React, { useState, useRef, useReducer } from "react";
import * as tmImage from '@teachablemachine/image';

const URLss = "https://teachablemachine.withgoogle.com/models/uDVea6lIg/";
let labelContainer, webcam;

const machine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" } },
    loadingModel: { on: { next: "modelReady" } },
    modelReady: { on: { next: "imageReady" } },
    imageReady: { on: { next: "identifying" } },
    identifying: { on: { next: "complete" } },
    complete: { on: { next: "modelReady" }, showResults: true }
    
  }
};


function App() {
  const [results, setResults] = useState([]);
  const [model, setModel] = useState(null);
  
  const reducer = (state, event) =>
    machine.states[state].on[event] || machine.initial;

  const [appState, dispatch] = useReducer(reducer, machine.initial);
  const next = () => dispatch("next");

  const loadModel = async () => {
    next();
    const modelURL = URLss + "model.json";
    const metadataURL = URLss + "metadata.json";

    const model = await tmImage.load(modelURL, metadataURL);
    setModel(model);
    next();
  };
  const identify = async () => {
   next()
   webcam.update(); 
    const results = await model.predict(webcam.canvas);
    console.log("prediction");
    setResults(results);
    next();
  };

  const reset = async () => {
    setResults([]);
     window.location.reload(false);
    next();
  };
  const loop = async () => {
   webcam.update(); // update the webcam frame
   window.requestAnimationFrame(loop);
}

  const upload = async () => {
   const flip = true; // whether to flip the webcam
       webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
       await webcam.setup(); // request access to the webcam
       await webcam.play();
       window.requestAnimationFrame(loop);
       document.getElementById("webcam-container").appendChild(webcam.canvas);
       labelContainer = document.getElementById("label-container");
       next();
      };

       const actionButton = {
         initial: { action: loadModel, text: "Load Model" },
         loadingModel: { text: "Loading Model..." },
         modelReady: { action: upload, text: "Upload Image" },
         imageReady: { action: identify, text: "Identify Breed" },
         identifying: { text: "Identifying..." },
         complete: { action: reset, text: "Reset" }
       };
     

  const { showResults } = machine.states[appState];

  return (
    <div>
      {showResults && (
        <ul>
          {results.map(({ className, probability }) => (
            <li key={className}>{`${className}: %${(probability * 100).toFixed(
              2
            )}`}</li>
          ))}
        </ul>
      )}
      <button onClick={actionButton[appState].action || (() => {})}>
        {actionButton[appState].text}
      </button>
      
<div id="webcam-container"></div>
<div id="label-container"></div>
    </div>
  );
}

export default App;
