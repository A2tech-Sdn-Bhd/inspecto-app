import React, { useState } from 'react';

const LightController = ({lightIntensityPub}) => {
  const [value, setValue] = useState(0); // initial value

  const handleChange = (event) => {
    setValue(event.target.value);
    if(lightIntensityPub.current){
      lightIntensityPub.current.publish({data: parseInt(event.target.value)});
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl me-4 mt-2">
      <div className="card-body">
        <h2 className="card-title justify-center">Light Intensity</h2>
        <div className="card-actions">
          <input 
            type="range" 
            min={0} 
            max="255" 
            value={value} 
            onChange={handleChange} 
            className="range" 
          />
        </div>
      </div>
    </div>
  );
};

export default LightController;