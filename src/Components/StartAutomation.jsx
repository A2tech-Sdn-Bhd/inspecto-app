import React from "react";
import { useState, useRef } from "react";
const StartAutomation = () => {
  const [autoStart, setAutoStart] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputValueRef = useRef(null);
  const handleInputChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputValue(sanitizedValue);
  };
  const handleAuto = () => {
    if (autoStart) {
      setAutoStart(false);
      setStartPlot(false);
      // setInputValue('');
      // setInputDiameter('');
      // setInputTol('');
      stopAutoPub.current.publish({});
    } else {
      if (inputValue == "") {
        inputValueRef.current.focus();
        inputValueRef.current.classList.add("red-input");
        setTimeout(() => {
          inputValueRef.current.classList.remove("red-input");
        }, 300);
        return;
      }
      if (inputDiameter == "") {
        inputDiameterRef.current.focus();
        inputDiameterRef.current.classList.add("red-input");
        setTimeout(() => {
          inputDiameterRef.current.classList.remove("red-input");
        }, 300);
        return;
      }
      if (inputTol == "") {
        inputTolRef.current.focus();
        inputTolRef.current.classList.add("red-input");
        setTimeout(() => {
          inputTolRef.current.classList.remove("red-input");
        }, 300);
        return;
      }
      setCam(3);
      // resetOdomPub.current.publish({});
      // if (realtimeData.length) {
      // 	setRealtimeData(prevData => []);
      // }
      moveDistancePub.current.publish({ data: parseFloat(inputValue) });
      if (parseFloat(inputValue) <= 0) {
        console.log("clear graph");
      } else {
        setStartPlot(true);
        setAutoStart(true);
      }
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
