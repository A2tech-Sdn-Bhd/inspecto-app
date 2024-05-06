import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const CleaningModule = ({ brushArmPub, brushSpin, motorSpeed }) => {
  const [brushStatus, setBrushStatus] = useState(false);
  const [motorSpeedValue, setMotorSpeedValue] = useState(0);
  const navigate = useNavigate();

  const handleBrushArm = (payload) => {
    if (brushArmPub.current) {
      brushArmPub.current.publish({ data: payload });
    }
  };
  const handleBrushSpin = (payload) => {
    if (brushSpin.current) {
      brushSpin.current.publish({ data: payload });
    }
  };
  const handleChange = (event) => {
    setMotorSpeedValue(event.target.value);
    if (motorSpeed.current) {
      motorSpeed.current.publish({ data: event.target.value });
    }
  };
  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return; // Do nothing if an input element has focus
      }
      if (evt.code === "KeyF") {
        handleBrushArm("up");
      } else if (evt.code === "KeyV") {
        handleBrushArm("down");
      } else if (evt.code === "KeyQ") {
        if (brushStatus) {
          handleBrushSpin(false);
          setBrushStatus(false);
        } else {
          handleBrushSpin(true);
          setBrushStatus(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [brushStatus, handleBrushArm, handleBrushSpin, setBrushStatus]); // Add any dependencies here

  useEffect(() => {
    const handleKeyUp = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return; // Do nothing if an input element has focus
      }
      if (evt.code === "KeyF" || evt.code === "KeyV") {
        handleBrushArm("stop");
      }
    };

    window.addEventListener("keyup", handleKeyUp);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleBrushArm]); // Add any dependencies here

  return (
    <>
      <div className="card bg-base-100 me-4">
        <div className="card-body">
          <h2 className="card-title justify-center">Brush Controller</h2>
          <h3 className="text-center mt-1">Control Brush Angle</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn btn-neutral"
              onMouseDown={() => {
                handleBrushArm("up");
              }}
              onMouseUp={() => {
                handleBrushArm("stop");
              }}
            >
              UP
            </button>
            <button
              className="btn btn-neutral"
              onMouseDown={() => {
                handleBrushArm("down");
              }}
              onMouseUp={() => {
                handleBrushArm("stop");
              }}
            >
              DOWN
            </button>
          </div>
          <h3 className="text-center mt-1">Control Brush Motor Speed</h3>
          <input 
            type="range" 
            min={0} 
            max="255" 
            value={motorSpeedValue} 
            onChange={handleChange} 
            className="range" 
          />
          <h3 className="text-center mt-1">Brush Motor Status</h3>
          <div className="grid grid-cols-1 gap-2">
            {brushStatus ? (
              <button
                className="btn btn-error btn-block"
                onClick={() => {
                  handleBrushSpin(false);
                  setBrushStatus(!brushStatus);
                }}
              >
                STOP BRUSH
              </button>
            ) : (
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  handleBrushSpin(true);
                  setBrushStatus(!brushStatus);
                }}
              >
                START BRUSH
              </button>
            )}
          </div>
          <button
            className="btn btn-neutral"
            onClick={() => {
              navigate("/");
            }}
          >
            {"BACK TO NORMAL MODE"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CleaningModule;
