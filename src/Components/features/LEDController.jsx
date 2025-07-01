import { useState, useEffect } from "react";
import * as ROSLIB from "roslib";
import { toast } from "react-toastify";
const LEDController = ({
  connected,
  ledControlBackPub,
  ledControlFrontPub,
}) => {
  const [intensity, setIntensity] = useState(() => {
    // Get initial value from localStorage or default to 25
    const saved = localStorage.getItem("ledIntensity");
    return saved !== null ? parseInt(saved) : 25;
  });

  // Publish intensity to ROS topics
  const publishIntensity = (value) => {
    if (!connected) {
      return;
    }
    const floatValue = value / 100;
    const message = new ROSLIB.Message({
      data: floatValue,
    });
    ledControlFrontPub.current.publish(message);
    ledControlBackPub.current.publish(message);
  };

  // Initialize with stored value
  useEffect(() => {
    if (!connected) {
      return;
    }
    publishIntensity(intensity);
  }, []); // Empty dependency array for mount only

  const handleIntensityChange = (event) => {
    const value = parseInt(event.target.value);
    setIntensity(value);
    localStorage.setItem("ledIntensity", value.toString());
    publishIntensity(value);
  };

  useEffect(() => {
    let decreaseIntensityShown = false;
    let increaseIntensityShown = false;
    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
      if (evt.code === "KeyZ" && !decreaseIntensityShown) {
        // Decrease intensity
        decreaseIntensityShown = true;
        toast.dismiss();
        toast.info("Decrease intensity");
        setIntensity((prevIntensity) => {
          if (prevIntensity <= 0) {
            // Do nothing if intensity is already at minimum
            return prevIntensity;
          }
          const newIntensity = Math.max(0, prevIntensity - 10); // Decrease by 10, minimum 0
          localStorage.setItem("ledIntensity", newIntensity.toString());
          publishIntensity(newIntensity);
          console.log("Decrease intensity");
          return newIntensity;
        });
      } else if (evt.code === "KeyC" && !increaseIntensityShown) {
        // Increase intensity
        increaseIntensityShown = true;
        toast.dismiss();
        toast.info("increase intensity");
        setIntensity((prevIntensity) => {
          if (prevIntensity >= 100) {
            // Do nothing if intensity is already at maximum
            return prevIntensity;
          }
          const newIntensity = Math.min(100, prevIntensity + 10); // Increase by 10, maximum 100
          localStorage.setItem("ledIntensity", newIntensity.toString());
          publishIntensity(newIntensity);
          console.log("Increase intensity");
          return newIntensity;
        });
      }
    };
    const handleKeyUp = (evt) => {
      if (evt.code === "KeyZ") {
        decreaseIntensityShown = false;
      } else if (evt.code === "KeyC") {
        increaseIntensityShown = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="card bg-base-100 ms-4 mt-4 card-compact relative z-10">
      <div className="card-body">
        <h2 className="card-title justify-center">LED Control</h2>
        <h3 className="text-center mt-1">Intensity</h3>
        <input
          type="range"
          min={0}
          max={100}
          value={intensity}
          className="range z-20"
          step="1"
          onChange={handleIntensityChange}
        />
      </div>
    </div>
  );
};

export default LEDController;
