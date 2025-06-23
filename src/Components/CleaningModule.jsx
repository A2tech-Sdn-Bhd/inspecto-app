import React, { useState } from "react";
import * as ROSLIB from "roslib";
import { useRef, useEffect } from "react";
const CleaningModule = ({ connected, setConnected }) => {
  const brushArmPub = useRef(null);
  const brushSpin = useRef(null);
  const [brushStatus, setBrushStatus] = useState(false);
  const ros = useRef(null);
  useEffect(() => {
    if (!connected) {
      return;
    }

    if (brushArmPub) {
      brushArmPub.current = new ROSLIB.Topic({
        ros: ros.current,
        name: "/brush/up_down",
        messageType: "std_msgs/String",
      });
    }
    // publisher for on/off brush
    if (brushSpin) {
      brushSpin.current = new ROSLIB.Topic({
        ros: ros.current,
        name: "/brush/spin",
        messageType: "std_msgs/Bool",
      });
    }
  }, [connected]);
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
  useEffect(() => {
    if (ros.current) {
      return;
    }
    ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });
    ros.current.on("error", function (error) {
      setConnected(false);
    });
    ros.current.on("connection", function () {
      setConnected(true);
    });
  }, []);
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
          <h3 className="text-center mt-1">Control Brush Motor</h3>
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
          <h3 className="text-center mt-1">Shortcut Button</h3>
          <div className="overflow-x-auto">
            <table className="table border-2 border-neutral table-xs">
              <thead className="border-2 border-neutral">
                <tr className="border-2 border-neutral">
                  <th className="border-2 border-neutral text-neutral">Key</th>
                  <th className="border-2 border-neutral text-neutral">
                    Function
                  </th>
                </tr>
              </thead>
              <tbody className="border-2 border-neutral">
                <tr>
                  <td className="border-2 border-neutral">Q</td>
                  <td className="border-2 border-neutral">Start Brush</td>
                </tr>
                <tr>
                  <td className="border-2 border-neutral">F</td>
                  <td className="border-2 border-neutral">Increase Angle</td>
                </tr>
                <tr>
                  <td className="border-2 border-neutral">V</td>
                  <td className="border-2 border-neutral">Decrease Angle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CleaningModule;

// f*v button not work properly
// brush panel not working maybe because of not found ros ws
// remove start auto
