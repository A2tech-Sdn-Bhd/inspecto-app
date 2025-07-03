import { useState, useEffect, useRef } from "react"; // Add useRef
import * as ROSLIB from "roslib";
import { toast } from "react-toastify";

const LEDController = ({
  connected,
  ledControlBackPub,
  ledControlFrontPub,
}) => {
  const [intensity, setIntensity] = useState(() => {
    const saved = localStorage.getItem("ledIntensity");
    return saved !== null ? parseInt(saved) : 25;
  });

  // Use refs to store the latest publishIntensity and connected values
  const publishIntensityRef = useRef();
  const connectedRef = useRef(connected);

  // Update refs when connected or pubs change
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  // Update publishIntensity function when dependencies change
  useEffect(() => {
    publishIntensityRef.current = (value) => {
      if (!connectedRef.current) {
        return;
      }
      const floatValue = value / 100;
      const message = new ROSLIB.Message({
        data: floatValue,
      });
      ledControlFrontPub.current.publish(message);
      ledControlBackPub.current.publish(message);
    };
  }, [ledControlFrontPub, ledControlBackPub]);

  // Initialize with stored value
  useEffect(() => {
    if (!connected) {
      return;
    }
    publishIntensityRef.current(intensity);
  }, []); // Empty dependency array for mount only

  const handleIntensityChange = (event) => {
    const value = parseInt(event.target.value);
    setIntensity(value);
    localStorage.setItem("ledIntensity", value.toString());
    publishIntensityRef.current(value);
  };

  useEffect(() => {
    let decreaseIntensityShown = false;
    let increaseIntensityShown = false;
    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
      if (evt.code === "KeyZ" && !decreaseIntensityShown) {
        decreaseIntensityShown = true;
        toast.dismiss();
        toast.info("Decrease intensity");
        setIntensity((prevIntensity) => {
          if (prevIntensity <= 0) {
            return prevIntensity;
          }
          const newIntensity = Math.max(0, prevIntensity - 10);
          localStorage.setItem("ledIntensity", newIntensity.toString());
          publishIntensityRef.current(newIntensity);
          console.log("Decrease intensity");
          return newIntensity;
        });
      } else if (evt.code === "KeyC" && !increaseIntensityShown) {
        increaseIntensityShown = true;
        toast.dismiss();
        toast.info("Increase intensity");
        setIntensity((prevIntensity) => {
          if (prevIntensity >= 100) {
            return prevIntensity;
          }
          const newIntensity = Math.min(100, prevIntensity + 10);
          localStorage.setItem("ledIntensity", newIntensity.toString());
          publishIntensityRef.current(newIntensity);
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
  }, []); // Empty dependency array is fine here

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