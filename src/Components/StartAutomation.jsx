import React from "react";
import { useState, useRef, useEffect } from "react";
import AutomationMeter from "./AutomationMeter";
import AutomationTime from "./AutomationTime";
const StartAutomation = ({ moveDistancePub, stopAutoPub, odometerValue,cmdVelPub }) => {
  
  return (
    <div>

        <button
          className="btn btn-neutral"
          onClick={() =>
            document.getElementById("start_automation").showModal()
          }
        >
          Start Automation
        </button>
      <dialog id="start_automation" className="modal">
        <div className="modal-box">
          <div className="collapse bg-base-200 mb-2">
            <input type="radio" name="my-accordion-1" defaultChecked />
            <div className="collapse-title text-xl font-medium">
              Automation By Distance
            </div>
            <div className="collapse-content">
            <AutomationMeter moveDistancePub={moveDistancePub} stopAutoPub={stopAutoPub} odometerValue={odometerValue}/>
            </div>
          </div>
          <div className="collapse bg-base-200">
            <input type="radio" name="my-accordion-1" defaultChecked />
            <div className="collapse-title text-xl font-medium">
              Automation By Time
            </div>
            <div className="collapse-content">
            <AutomationTime cmdVelPub={cmdVelPub}/>
            </div>
          </div>
          <form method="dialog">
        <button className="btn btn-block mt-2">Close</button>
      </form>
        </div>
        
      </dialog>
    </div>
  );
};

export default StartAutomation;
