import axios from "axios";

import { useState, useEffect, useRef } from "react";
import PtzControl from "./PtzControl";
const API_URL_PTZ = import.meta.env.VITE_API_URL_PTZ;

const PTZPanel = ({}) => {
  const [value, setValue] = useState(
    parseFloat(localStorage.getItem("ptzSpeed")) || 0.5
  );
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.repeat) return;

    const keyMap = {
      KeyW: 1,
      KeyS: 0,
      KeyA: 3,
      KeyD: 4,
      KeyQ: 6,
      KeyE: 7,
      KeyZ: 5,
      KeyX: 2,
      KeyC: 8,
      KeyR: 14,
      KeyT: 13,
    };

    const direction = keyMap[event.code];
    if (direction !== undefined) {
      console.log(`start ${event.code.slice(3).toLowerCase()}`);
      direction == 0 ? setHome() : startMovement(direction);
    }
  };

  const handleKeyUp = (event) => {
    const keyMap = {
      KeyW: 1,
      KeyS: 0,
      KeyA: 3,
      KeyD: 4,
      KeyQ: 6,
      KeyE: 7,
      KeyZ: 5,
      KeyX: 2,
      KeyC: 8,
      KeyR: 14,
      KeyT: 13,
    };

    if (keyMap[event.code] !== undefined) {
      console.log("stop movement");
      if(keyMap[event.code] == 0){
        setHome();
      }else{
        stopMovement();
      
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const makeRequest = (x, y, z) => {
    axios
      .get(API_URL_PTZ + `/ptz?x=${x}&y=${y}&z=${z}`)
      .then((response) => {
        // Handle successful response
      })
      .catch((error) => {
        console.error(error);
      });
  };

  let timeoutId = null;
  const startMovement = (direction) => {
    const movementMap = {
      1: [0, 1, 0],
      2: [0, -1, 0],
      3: [-1, 0, 0],
      4: [1, 0, 0],
      5: [-1, -1, 0],
      6: [-1, 1, 0],
      7: [1, 1, 0],
      8: [1, -1, 0],
      13: [0, 0, 1],
      14: [0, 0, -1],
    };
    const [x, y, z] = movementMap[direction].map(
      (coord) => coord * valueRef.current
    );
    makeRequest(x, y, z);
    timeoutId = setInterval(() => makeRequest(x, y, z), 100);
  };

  const stopMovement = () => {
    clearInterval(timeoutId);
    makeRequest(0, 0, 0);
    axios.get(API_URL_PTZ + "/ptz/stop").catch(console.error);
  };

  const setHome = () => {
    axios.get(API_URL_PTZ + "/ptz/setHome").catch(console.error);
  };

  const handleChange = (event) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue);
    localStorage.setItem("ptzSpeed", newValue);
  };

  return (
    <div className="me-4 mt-4">
      <PtzControl stopMovement={stopMovement} startMovement={startMovement} setHome={setHome} value={value} handleChange={handleChange}/>
    </div>
  );
};
export default PTZPanel;
