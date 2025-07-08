import { useState, useRef, useEffect } from "react";

const BtnAutomationDistance = ({
  moveDistancePub,
  stopAutoPub,
  odometerValue,
}) => {
  const [startOdo, setStartOdo] = useState(0.0);
  const [currentOdo, setCurrentOdo] = useState(0.0);
  const [inputValue, setInputValue] = useState("");
  const inputValueRef = useRef(null);
  const [getJoystickInput, setGetJoystickInput] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [distanceLeft, setDistanceLeft] = useState(0.0);
  const [keyboardInput, setKeyboardInput] = useState(false);

  // Load automation state from memory on component mount
  useEffect(() => {
    const savedAutoState = sessionStorage.getItem('automationState');
    if (savedAutoState) {
      const { isRunning, targetDistance, startOdometer } = JSON.parse(savedAutoState);
      if (isRunning) {
        setAutoStart(true);
        setInputValue(targetDistance.toString());
        setStartOdo(startOdometer);
      }
    }
  }, []);

  // Save automation state to memory
  const saveAutomationState = (isRunning, targetDistance = 0, startOdometer = 0) => {
    const state = {
      isRunning,
      targetDistance,
      startOdometer,
      timestamp: Date.now()
    };
    sessionStorage.setItem('automationState', JSON.stringify(state));
  };

  // Clear automation state
  const clearAutomationState = () => {
    sessionStorage.removeItem('automationState');
  };

  const handleInputChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputValue(sanitizedValue);
  };

  const handleAuto = () => {
    setStartOdo(odometerValue);
    if (autoStart) {
      setAutoStart(false);
      clearAutomationState();
      stopAutoPub.current.publish({
        data: true,
      });
    } else {
      if (inputValue == "") {
        inputValueRef.current.focus();
        inputValueRef.current.classList.add("input-error");
        setTimeout(() => {
          inputValueRef.current.classList.remove("input-error");
        }, 1000);
        return;
      }
      const targetDistance = parseFloat(inputValue);
      moveDistancePub.current.publish({ data: targetDistance });
      setAutoStart(true);
      saveAutomationState(true, targetDistance, odometerValue);
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
      
      const traveledDistance = Math.abs(roundedCurrentOdo - roundedStartOdo);
      const remainingDistance = Math.max(0, positiveInputValue - traveledDistance);
      
      console.log(roundedCurrentOdo, roundedStartOdo, positiveInputValue);
      setCurrentOdo(roundedCurrentOdo);
      setDistanceLeft(remainingDistance);
      
      if (
        Math.abs(roundedCurrentOdo - roundedStartOdo - positiveInputValue) <
        0.00001
      ) {
        console.log("stop automation");
        setAutoStart(false);
        setDistanceLeft(0);
        clearAutomationState();
        stopAutoPub.current.publish({
          data: true,
        });
      }
    } else {
      setDistanceLeft(0);
    }
  }, [autoStart, odometerValue]);

  useEffect(() => {
    if ((getJoystickInput || keyboardInput) && autoStart) {
      stopAutoPub.current.publish({
        data: true,
      });
      setAutoStart(false);
      clearAutomationState();
    }
  }, [getJoystickInput, keyboardInput]);

  let move = false;
  useEffect(() => {
    const intervalId = setInterval(() => {
      var gamepads = navigator.getGamepads();
      if (gamepads[0] != null) {
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

  // Keyboard arrow key detection
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setKeyboardInput(true);
        console.log("Arrow key pressed:", event.key);
      }
    };

    const handleKeyUp = (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setTimeout(() => {
          setKeyboardInput(false);
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div>
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
      
      {autoStart && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">Distance Left:</span>
            <span className="text-blue-900 font-bold text-lg">
              {distanceLeft.toFixed(3)} M
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(0, Math.min(100, ((parseFloat(inputValue) - distanceLeft) / parseFloat(inputValue)) * 100))}%`
              }}
            ></div>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Target: {inputValue} M | Traveled: {((parseFloat(inputValue) - distanceLeft) || 0).toFixed(3)} M
          </div>
        </div>
      )}

      {autoStart ? (
        <button className="btn btn-warning btn-block" onClick={handleAuto}>
          Stop Automation
        </button>
      ) : (
        <button className="btn btn-block btn-primary" onClick={handleAuto}>
          Start Automation
        </button>
      )}
    </div>
  );
};

export default BtnAutomationDistance;