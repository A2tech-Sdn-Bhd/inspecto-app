import { useState, useEffect, useRef } from "react";
import PtzControl from "./PtzControl";
const API_URL_PTZ = import.meta.env.VITE_API_URL_PTZ;

const PTZPanel = ({}) => {
  const [value, setValue] = useState(
    parseFloat(localStorage.getItem("ptzSpeed")) || 0.5
  );
  const valueRef = useRef(value);
  const ws = useRef(null);
  const movementInterval = useRef(null);
  const keysPressed = useRef(new Set());

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    // Establish WebSocket connection
    ws.current = new WebSocket(API_URL_PTZ.replace(/^http/, "ws"));

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const getDirection = () => {
    if (keysPressed.current.has("KeyW") && keysPressed.current.has("KeyA")) {
      return 6;
    } else if (keysPressed.current.has("KeyW") && keysPressed.current.has("KeyD")) {
      return 7;
    } else if (keysPressed.current.has("KeyS") && keysPressed.current.has("KeyD")) {
      return 8;
    } else if (keysPressed.current.has("KeyS") && keysPressed.current.has("KeyA")) {
      return 5;
    } else if (keysPressed.current.has("KeyW")) {
      return 1;
    } else if (keysPressed.current.has("KeyS")) {
      return 2;
    } else if (keysPressed.current.has("KeyA")) {
      return 3;
    } else if (keysPressed.current.has("KeyD")) {
      return 4;
    } else if (keysPressed.current.has("KeyX")) {
      return 0; 
    } else if (keysPressed.current.has("KeyQ")) {
      return 14;
    } else if (keysPressed.current.has("KeyE")) {
      return 13;
    }
    return null;
  };

  const handleKeyDown = (event) => {
    if (event.repeat) return;
    keysPressed.current.add(event.code);

    const direction = getDirection();
    if (direction !== null) {
      console.log(`start ${event.code.slice(3).toLowerCase()}`);
      if (direction === 0) {
        setHome();
      } else {
        startMovement(direction);
      }
    }
  };

  const handleKeyUp = (event) => {
    keysPressed.current.delete(event.code);

    if (event.code === "KeyX") {
      // Do nothing for KeyQ on keyup
      return;
    }

    const direction = getDirection();
    if (direction !== null) {
      console.log("stop movement");
      stopMovement();
    } else {
      stopMovement();
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

  const sendWebSocketMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket connection is not open");
    }
  };

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
    sendWebSocketMessage({ action: 'ptzMove', x, y, z, timeout: 60 });
    clearInterval(movementInterval.current);  // Clear any existing interval
    movementInterval.current = setInterval(() => {
      sendWebSocketMessage({ action: 'ptzMove', x, y, z, timeout: 60 });
    }, 100);
  };

  const stopMovement = () => {
    clearInterval(movementInterval.current);
    sendWebSocketMessage({ action: 'ptzStop' });
  };

  const setHome = () => {
    sendWebSocketMessage({ action: 'setHome' });
  };

  const handleChange = (event) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue);
    localStorage.setItem("ptzSpeed", newValue);
  };

  return (
    <div className="me-4 mt-4">
      <PtzControl stopMovement={stopMovement} startMovement={startMovement} setHome={setHome} value={value} handleChange={handleChange} />
    </div>
  );
};

export default PTZPanel;
