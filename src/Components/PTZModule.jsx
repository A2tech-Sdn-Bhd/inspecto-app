import React from "react";

const PTZModule = ({setCam, setShowPtzCtrl}) => {
  return (
    <button
      className="btn btn-neutral "
      onClick={() => {
        setCam(4);
        setShowPtzCtrl(true);
      }}
      
    >
      {"PTZ CONTROLLER"}
    </button>
  );
};

export default PTZModule;
