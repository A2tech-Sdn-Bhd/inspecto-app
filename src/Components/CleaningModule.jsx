import React, { useState, useRef, useEffect } from "react";
import * as ROSLIB from "roslib";

const CleaningModule = ({ connected, setConnected }) => {
  const brushForward = useRef(null);
  const brushReverse = useRef(null);
  const armUp = useRef(null);
  const armDown = useRef(null);
  const brushSpeed = useRef(null);
  const [brushStatus, setBrushStatus] = useState(() => {
    const saved = localStorage.getItem("brushStatus");
    return saved ? JSON.parse(saved) : false;
  });
  const [rotationDirection, setRotationDirection] = useState(() => {
    const saved = localStorage.getItem("rotationDirection");
    return saved ? JSON.parse(saved) : "forward";
  });
  const [speedValue, setSpeedValue] = useState(() => {
    const saved = localStorage.getItem("speedValue");
    return saved ? parseFloat(JSON.parse(saved)) : 0.1;
  });
  const ros = useRef(null);

  useEffect(() => {
    if (!connected) {
      return;
    }
    if (!ros.current) {
      return;
    }
    brushForward.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/brush/forward",
      messageType: "std_msgs/Bool",
    });
    brushReverse.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/brush/reverse",
      messageType: "std_msgs/Bool",
    });
    brushSpeed.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/brush/speed",
      messageType: "std_msgs/Float32",
    });
    armUp.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/actuator/up",
      messageType: "std_msgs/Bool",
    });
    armDown.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/actuator/down",
      messageType: "std_msgs/Bool",
    });
  }, [connected]);

  useEffect(() => {
    if (ros.current) {
      return;
    }
    ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });
    ros.current.on("error", () => {
      setConnected(false);
    });
    ros.current.on("connection", () => {
      setConnected(true);
    });
  }, [setConnected]);

  useEffect(() => {
    localStorage.setItem("brushStatus", JSON.stringify(brushStatus));
  }, [brushStatus]);

  useEffect(() => {
    localStorage.setItem("rotationDirection", JSON.stringify(rotationDirection));
  }, [rotationDirection]);

  useEffect(() => {
    localStorage.setItem("speedValue", JSON.stringify(speedValue));
  }, [speedValue]);

  const handleBrushArmUp = (payload) => {
    if (armUp.current) {
      armUp.current.publish(new ROSLIB.Message({ data: payload }));
    }
  };

  const handleBrushArmDown = (payload) => {
    if (armDown.current) {
      armDown.current.publish(new ROSLIB.Message({ data: payload }));
    }
  };

  const handleBrushSpin = (start) => {
    if (start) {
      if (rotationDirection === "forward" && brushForward.current) {
        console.log("forward starting");
        brushForward.current.publish(new ROSLIB.Message({ data: true }));
        brushReverse.current.publish(new ROSLIB.Message({ data: false }));
      } else if (rotationDirection === "reverse" && brushReverse.current) {
        console.log("reverse starting");
        brushReverse.current.publish(new ROSLIB.Message({ data: true }));
        brushForward.current.publish(new ROSLIB.Message({ data: false }));
      }
      if (brushSpeed.current) {
        console.log("adjust brush speed");
        brushSpeed.current.publish(new ROSLIB.Message({ data: speedValue }));
      }
    } else {
      if (brushForward.current) {
        brushForward.current.publish(new ROSLIB.Message({ data: false }));
      }
      if (brushReverse.current) {
        brushReverse.current.publish(new ROSLIB.Message({ data: false }));
      }
      if (brushSpeed.current) {
        brushSpeed.current.publish(new ROSLIB.Message({ data: 0.0 }));
      }
    }
  };

  const handleSpeedChange = (e) => {
    const value = parseFloat(e.target.value) / 100;
    const scaledValue = 0.1 + value * (1.0 - 0.1);
    setSpeedValue(scaledValue);
    if (brushStatus && brushSpeed.current) {
      brushSpeed.current.publish(new ROSLIB.Message({ data: scaledValue }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
      if (evt.code === "KeyF") {
        handleBrushArmUp(true);
      } else if (evt.code === "KeyV") {
        handleBrushArmDown(true);
      } else if (evt.code === "KeyQ") {
        handleBrushSpin(!brushStatus);
        setBrushStatus(!brushStatus);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [brushStatus]);

  useEffect(() => {
    const handleKeyUp = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
      if (evt.code === "KeyF") {
        handleBrushArmUp(false);
      } else if (evt.code === "KeyV") {
        handleBrushArmDown(false);
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="card bg-base-100 me-4">
      <div className="card-body">
        <h2 className="card-title justify-center">Brush Control</h2>
        <h3 className="text-center mt-1">Control Brush Angle</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn btn-neutral"
            onMouseDown={() => handleBrushArmUp(true)}
            onMouseUp={() => handleBrushArmUp(false)}
          >
            UP
          </button>
          <button
            className="btn btn-neutral"
            onMouseDown={() => handleBrushArmDown(true)}
            onMouseUp={() => handleBrushArmDown(false)}
          >
            DOWN
          </button>
        </div>
        <h3 className="text-center mt-1">Control Brush Speed</h3>
        <input
          type="range"
          min={0}
          max={100}
          value={(speedValue - 0.1) * (100 / (1.0 - 0.1))}
          className="range"
          onChange={handleSpeedChange}
        />
        <div className="w-full flex justify-between text-xs px-2">
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
          <span>|</span>
        </div>
        <div className="w-full flex justify-between text-xs px-2">
          <span>0.1</span>
          <span>1.0</span>
        </div>
        {/* <h3 className="text-center mt-1">Control Brush Rotation</h3>
        <div className="w-full flex justify-center items-center">
          <div className="tabs tabs-boxed w-fit flex justify-center items-center">
            <a
              className={`tab ${rotationDirection === "forward" ? "tab-active" : ""}`}
              onClick={() => setRotationDirection("forward")}
            >
              Forward
            </a>
            <a
              className={`tab ${rotationDirection === "reverse" ? "tab-active" : ""}`}
              onClick={() => setRotationDirection("reverse")}
            >
              Reverse
            </a>
          </div>
        </div> */}
        <h3 className="text-center mt-1">Control Brush Motor</h3>
        <div className="grid grid-cols-1 gap-2">
          {brushStatus ? (
            <button
              className="btn btn-error btn-block"
              onClick={() => {
                handleBrushSpin(false);
                setBrushStatus(false);
              }}
            >
              STOP BRUSH
            </button>
          ) : (
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                handleBrushSpin(true);
                setBrushStatus(true);
              }}
            >
              START BRUSH
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleaningModule;