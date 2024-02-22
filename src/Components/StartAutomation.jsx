import React from "react";
import { useState, useRef, useEffect } from "react";

const StartAutomation = ({
  moveDistancePub,
  stopAutoPub,
  odometerValue,
}) => {
  const [autoStart, setAutoStart] = useState(false);
  const [startOdo, setStartOdo] = useState(0.0);
  const [currentOdo, setCurrentOdo] = useState(0.0);
  const [inputValue, setInputValue] = useState("");
  const inputValueRef = useRef(null);
  const [getJoystickInput, setGetJoystickInput] = useState(false);

  const handleInputChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputValue(sanitizedValue);
  };
  const handleAuto = () => {
    setStartOdo(odometerValue);
    if (autoStart) {
      setAutoStart(false);
      stopAutoPub.current.publish({});
    } else {
      if (inputValue == "") {
        inputValueRef.current.focus();
        inputValueRef.current.classList.add("input-error");
        setTimeout(() => {
          inputValueRef.current.classList.remove("input-error");
        }, 1000);
        return;
      }
      moveDistancePub.current.publish({ data: parseFloat(inputValue) });
      setAutoStart(true);
      document.getElementById("start_automation").close();
    }
  };

  useEffect(() => {
    if (autoStart) {
      const positiveInputValue = Math.abs(parseFloat(inputValue));

      const decimalPlaces = (positiveInputValue.toString().split(".")[1] || [])
        .length;
      const factor = Math.pow(10, decimalPlaces);
      const roundedCurrentOdo = Math.round(odometerValue * factor) / factor;
      const roundedStartOdo = Math.round(startOdo * factor) / factor;
      console.log(roundedCurrentOdo, roundedStartOdo, positiveInputValue);
      setCurrentOdo(roundedCurrentOdo);
      if (
        Math.abs(roundedCurrentOdo - roundedStartOdo - positiveInputValue) <
        0.00001
      ) {
        console.log("stop automation");
        setAutoStart(false);
        stopAutoPub.current.publish({});
      }
    }
  }, [autoStart, odometerValue]);

  useEffect(() => {
    if (getJoystickInput && autoStart) {
      stopAutoPub.current.publish({});
      setAutoStart(false);
    }
  }, [getJoystickInput]);
  let move = false;
  useEffect(() => {
    const intervalId = setInterval(() => {
      var gamepads = navigator.getGamepads();
      if(gamepads[0] != null){
        if (
          gamepads[0].axes[0] > 0.005 ||
          gamepads[0].axes[0] < -0.005 ||
          gamepads[0].axes[1] > 0.005 ||
          gamepads[0].axes[1] < -0.005 ||
          gamepads[0].axes[2] > 0.005 ||
          gamepads[0].axes[2] < -0.005
        ) {
          setGetJoystickInput(true);
          console.log("move");
          move = true;
        } else if (move) {
          move = false;
          console.log("stop");
          setGetJoystickInput(false);
        }  
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {autoStart ? (
        <button className="btn btn-warning" onClick={handleAuto}>
          Stop Automation
        </button>
      ) : (
        <button
          className="btn btn-neutral"
          onClick={() =>
            document.getElementById("start_automation").showModal()
          }
        >
          Start Automation
        </button>
      )}
      <dialog id="start_automation" className="modal">
        <div className="modal-box">
          <label className="form-control w-full mb-5">
            <div className="label">
              <span className="label-text">Travel Distance (M)</span>
            </div>
            <input
              className="input input-bordered w-full"
              ref={inputValueRef}
              type="text"
              placeholder="Insert Distance"
              value={inputValue}
              onChange={handleInputChange}
            />
          </label>
          <button className="btn btn-block btn-neutral" onClick={handleAuto}>
            Start Automation
          </button>
          <form method="dialog">
            <button className="btn btn-block mt-2">Close</button>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default StartAutomation;
