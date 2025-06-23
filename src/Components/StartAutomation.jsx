import React from "react";
import { useState, useRef, useEffect } from "react";
import * as ROSLIB from "roslib";
const StartAutomation = (connected, ros) => {
  const [autoStart, setAutoStart] = useState(false);
  const stopAutoPub = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const moveDistancePub = useRef(null);
  const inputValueRef = useRef(null);
  const handleInputChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputValue(sanitizedValue);
  };
  useEffect(() => {
    if (!connected) {
      return;
    }
    stopAutoPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/stop_auto",
      messageType: "std_msgs/Empty",
    });
    moveDistancePub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/move_distance",
      messageType: "std_msgs/Float32",
    });
  }, [connected]);

  const handleAuto = () => {
    if (autoStart) {
      setAutoStart(false);
      stopAutoPub.current.publish({});
    } else {
      if (inputValue == "") {
        inputValueRef.current.focus();
        inputValueRef.current.classList.add("red-input");
        setTimeout(() => {
          inputValueRef.current.classList.re
          setShowForm,
          tripNamePrevious,
          inspectoNamePrevious,
          tripTypePrevious,
          placePrevious,
          setShowBtnEndTrip,move("red-input");
        }, 300);
        return;
      }
      moveDistancePub.current.publish({ data: parseFloat(inputValue) });
    }
  };

  return (
    <div>
      <button
        className="btn btn-neutral"
        onClick={() => document.getElementById("start_automation").showModal()}
      >
        Start Automation
      </button>
      <dialog id="start_automation" className="modal">
        <div className="modal-box">
          <label className="form-control w-full mb-5">
            <div className="label">
              <span className="label-text">Travel Distance (M)</span>
            </div>
            <input
              type="number"
              placeholder="Distance (-value to go backward, otherwise go forward)"
              ref={inputValueRef}
              className="input input-bordered w-full"
              value={inputValue}
              onChange={handleInputChange}
            />
          </label>
          <button className="btn btn-block btn-neutral" onClick={handleAuto}>
            Start Automation
          </button>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-block">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default StartAutomation;
