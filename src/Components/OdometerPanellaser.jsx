import React from "react";
import { useEffect } from "react";
import Odometer from "react-odometerjs";
const OdometerPanelLaser = ({odometerValue, airSpeedValue, odometerResetPub}) => {

  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
      if (evt.code === "KeyR" && evt.shiftKey) {
        const confirmed = window.confirm(
          "Are you sure you want to reset the odometer?"
        );
        if (confirmed) {
          odometerResetPub.current.publish({});
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <div className="grid grid-row-2 gap-5">
          <div className="col-span-1">
            <div className="flex flex-col items-center">
              <div>
                <h2 style={{ fontWeight: "bold" }}>ODOMETER</h2>
              </div>
              <div>
                <Odometer
                  value={odometerValue}
                  format="(,ddd).dd"
                  duration="50"
                  style={{ cursor: "pointer", fontSize: "1.5em" }}
                  className="odometer"
                />
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="flex flex-col items-center">
              <div>
                <h2 style={{ fontWeight: "bold" }}>FORWARD DISTANCE</h2>
              </div>
              <div>
                <Odometer
                  value={airSpeedValue}
                  format="(,ddd).dd"
                  duration="50"
                  style={{ cursor: "pointer", fontSize: "1.5em" }}
                  className="odometer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OdometerPanelLaser;
