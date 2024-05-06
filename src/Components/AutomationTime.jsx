import { local } from "d3";
import { useState, useRef, useEffect } from "react";
import * as ROSLIB from "roslib";
import Swal from "sweetalert2";
const AutomationTime = ({ cmdVelPub }) => {
  const [startAuto, setStartAuto] = useState(false);
  const [inputHour, setInputHour] = useState("");
  const inputHourRef = useRef(null);
  const [inputMinute, setInputMinute] = useState("");
  const inputMinuteRef = useRef(null);
  const [inputSecond, setInputSecond] = useState("");
  const inputSecondRef = useRef(null);
  const intervalAutomation = useRef();
  const remainingTimeInterval = useRef();
  const [movement, setMovement] = useState(0);

  useEffect(() => {
    const automationOperation = localStorage.getItem("automationOperation");
    if (automationOperation) {
      setStartAuto(true);
      const duration = localStorage.getItem("remainingTime");
      const time = localStorage.getItem("automationTime");
      // check if time is not null
      if (time) {
        const movement = time.split(",")[1];
        setMovement(movement);
      }
      
      // change duration to hour,minute,and second
      const hour = Math.floor((duration/1000) / 3600);
      const minute = Math.floor(((duration/1000) % 3600) / 60);
      const second = Math.floor((duration/1000) % 60);
      setInputHour(hour);
      setInputMinute(minute);
      setInputSecond(second);
      Swal.fire({
        title: "Automation is running",
        text: `The automation remaining time is in ${hour} hour, ${minute} minute, and ${second} second`,
        showDenyButton: true,
        confirmButtonText: "Continue",
        denyButtonText: "Stop",
      }).then((result) => {
        if (result.isConfirmed) {
          continueAutomation(hour,minute,second,movement);
          Swal.fire("Automation continue again!", "", "success");

        } else if (result.isDenied) {
          handleStopAutomation();
          Swal.fire("Automation stop immediately", "", "info");
          
        }
      });

    }
  }, []);

  const handleInputHourChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputHour(sanitizedValue);

    if (sanitizedValue !== "") {
      inputHourRef.current.classList.remove("input-error");
    }
  };

  const handleInputMinuteChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputMinute(sanitizedValue);

    if (sanitizedValue !== "") {
      inputMinuteRef.current.classList.remove("input-error");
    }
  };
  const handleInputSecondChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputSecond(sanitizedValue);

    if (sanitizedValue !== "") {
      inputSecondRef.current.classList.remove("input-error");
    }
  };

  const continueAutomation = (hour,minute,second,movement) => {
    setStartAuto(!startAuto);
      localStorage.setItem("automationOperation", true);
      localStorage.removeItem("automationTime");
      localStorage.removeItem("remainingTime");
      localStorage.removeItem("endTime");
      const time = hour * 3600 + minute * 60 + second;
      // set the time and movement value in localstorage with key automationTime
      localStorage.setItem("automationTime", [time, movement]);
      let maxLinear = 0.25;
      if (movement == 0) {
        maxLinear *= 1;
      } else if (movement == 1) {
        maxLinear *= -1;
      }
      let joyTwist = new ROSLIB.Message({
        linear: {
          x: maxLinear,
          y: 0.0,
          z: 0.0,
        },
        angular: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
        },
      });
      const duration = time * 1000; // calculate duration directly


      const startTime = Date.now();
      const endTime = startTime + duration;

      intervalAutomation.current = setInterval(() => {
        console.log("running");
        cmdVelPub.current.publish(joyTwist);
      }, 100);

      // Save the end time to localStorage
      localStorage.setItem("endTime", endTime);

      // Clear the interval after the specified duration
      const timeoutId = setTimeout(() => {
        clearInterval(intervalAutomation.current);
        setStartAuto(false);
        localStorage.removeItem("automationInterval");
        localStorage.removeItem("automationOperation");
        localStorage.removeItem("automationTime");
        localStorage.removeItem("remainingTime");
        localStorage.removeItem("endTime");
      }, duration);

      // Function to get the remaining time
      const getRemainingTime = () => {
        const now = Date.now();
        const endTime = localStorage.getItem("endTime");
        const remainingTime = endTime - now;
        return remainingTime;
      };

      // Save the remaining time to localStorage every second
      remainingTimeInterval.current = setInterval(() => {
        const remainingTime = getRemainingTime();
        localStorage.setItem("remainingTime", remainingTime);
      }, 1000);

      // Clear the remainingTimeInterval when the timeout ends
      setTimeout(() => {
        clearInterval(remainingTimeInterval);
        localStorage.removeItem("remainingTime");
      }, duration);

  }
  
  const handleStartAutomation = () => {
    if (inputHour === "" && inputMinute === "" && inputSecond === "") {
      const inputhourbox = inputHourRef.current;
      const inputminutebox = inputMinuteRef.current;
      const inputsecondbox = inputSecondRef.current;
      // add className to the input
      inputhourbox.classList.add("input-error");
      inputminutebox.classList.add("input-error");
      inputsecondbox.classList.add("input-error");
      alert("Please fill one of the input");
    } else {
      setStartAuto(!startAuto);
      localStorage.setItem("automationOperation", true);
      localStorage.removeItem("automationTime");
      localStorage.removeItem("remainingTime");
      localStorage.removeItem("endTime");
      const time = inputHour * 3600 + inputMinute * 60 + inputSecond;
      setMovement(document.querySelector(".select-movement").value);
      // set the time and movement value in localstorage with key automationTime
      localStorage.setItem("automationTime", [time, movement]);
      let maxLinear = 0.25;
      if (movement == 0) {
        maxLinear *= 1;
      } else if (movement == 1) {
        maxLinear *= -1;
      }
      let joyTwist = new ROSLIB.Message({
        linear: {
          x: maxLinear,
          y: 0.0,
          z: 0.0,
        },
        angular: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
        },
      });
      const duration = time * 1000; // calculate duration directly


      const startTime = Date.now();
      const endTime = startTime + duration;

      intervalAutomation.current = setInterval(() => {
        console.log("running");
        cmdVelPub.current.publish(joyTwist);
      }, 100);

      // Save the end time to localStorage
      localStorage.setItem("endTime", endTime);

      // Clear the interval after the specified duration
      const timeoutId = setTimeout(() => {
        clearInterval(intervalAutomation.current);
        setStartAuto(false);
        localStorage.removeItem("automationInterval");
        localStorage.removeItem("automationOperation");
        localStorage.removeItem("automationTime");
        localStorage.removeItem("remainingTime");
        localStorage.removeItem("endTime");
      }, duration);

      // Function to get the remaining time
      const getRemainingTime = () => {
        const now = Date.now();
        const endTime = localStorage.getItem("endTime");
        const remainingTime = endTime - now;
        return remainingTime;
      };

      // Save the remaining time to localStorage every second
      remainingTimeInterval.current = setInterval(() => {
        const remainingTime = getRemainingTime();
        localStorage.setItem("remainingTime", remainingTime);
      }, 1000);

      // Clear the remainingTimeInterval when the timeout ends
      setTimeout(() => {
        clearInterval(remainingTimeInterval);
        localStorage.removeItem("remainingTime");
      }, duration);
    }
  };
  const handleStopAutomation = () => {
    clearInterval(intervalAutomation.current);
    clearInterval(remainingTimeInterval.current);
    localStorage.removeItem("automationInterval");
    localStorage.removeItem("automationOperation");
    localStorage.removeItem("automationTime");
    localStorage.removeItem("remainingTime");
    localStorage.removeItem("endTime");
    setStartAuto(false);
    console.log("clear interval by button");
  };
  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (startAuto && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key)) {
        handleStopAutomation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [startAuto]);
  return (
    <>
      <div>
        <div className="grid grid-cols-3 gap-2">
          <label className="form-control mb-2">
            <div className="label">
              <span className="label-text">Hour</span>
            </div>
            <input
              className="input input-bordered input-hour"
              ref={inputHourRef}
              type="text"
              placeholder="Insert Hour"
              value={inputHour}
              onChange={handleInputHourChange}
            />
          </label>
          <label className="form-control mb-2">
            <div className="label">
              <span className="label-text">Minute</span>
            </div>
            <input
              className="input input-bordered input-minute"
              ref={inputMinuteRef}
              type="text"
              placeholder="Insert Minute"
              value={inputMinute}
              onChange={handleInputMinuteChange}
            />
          </label>
          <label className="form-control mb-2">
            <div className="label">
              <span className="label-text">Second</span>
            </div>
            <input
              className="input input-bordered input-minute"
              ref={inputSecondRef}
              type="text"
              placeholder="Insert Second"
              value={inputSecond}
              onChange={handleInputSecondChange}
            />
          </label>
        </div>
        <label className="form-control w-full mb-4">
          <div className="label">
            <span className="label-text">Movement Direction</span>
          </div>
          <select className="select select-bordered w-full select-movement">
            <option selected value={0}>
              Forward
            </option>
            <option value={1}>Reverse</option>
          </select>
        </label>
        {startAuto ? (
          <button
            className="btn btn-block btn-neutral"
            onClick={handleStopAutomation}
          >
            Stop Automation
          </button>
        ) : (
          <button
            className="btn btn-block btn-primary"
            onClick={handleStartAutomation}
          >
            Start Automation
          </button>
        )}
      </div>
    </>
  );
};

export default AutomationTime;
