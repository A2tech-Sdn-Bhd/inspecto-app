import { useState, useEffect } from 'react';
import * as ROSLIB from "roslib";

const LEDController = ({ connected,ledControlBackPub, ledControlFrontPub }) => {
  const [intensity, setIntensity] = useState(() => {
    // Get initial value from localStorage or default to 25
    const saved = localStorage.getItem('ledIntensity');
    return saved !== null ? parseInt(saved) : 25;
  });

  // Publish intensity to ROS topics
  const publishIntensity = (value) => {
    const floatValue = value / 100;
    const message = new ROSLIB.Message({
      data: floatValue
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
    localStorage.setItem('ledIntensity', value.toString());
    publishIntensity(value);
  };

  return (
    <div className="card bg-base-100 ms-4 mt-4">
      <div className="card-body">
        <h2 className="card-title justify-center">LED Controller</h2>
        <h3 className="text-center mt-1">Control LED light</h3>
        <input
          type="range"
          min={0}
          max={100}
          value={intensity}
          className="range"
          step="1"
          onChange={handleIntensityChange}
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
          <span>0.0</span>
          <span>1.0</span>
        </div>
      </div>
    </div>
  );
};

export default LEDController;