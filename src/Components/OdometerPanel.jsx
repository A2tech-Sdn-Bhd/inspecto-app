import React from "react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import Odometer from "react-odometerjs";
import * as ROSLIB from "roslib";
const OdometerPanel = ({ ros, connected, setConnected }) => {
  const odometerSub = useRef(null);
  const [odometerValue, setOdometerValue] = useState(0.0);
  const [airSpeedValue, setAirSpeedValue] = useState(0.0);
  const odometerResetPub = useRef(null);
  const airSpeedSub = useRef(null);
  const odomSub = useRef(null);
  useEffect(() => {
    if (!connected) {
      return;
    }

    setConnected(true);
    // subscribe odometer
    odometerSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odometer",
      messageType: "std_msgs/Float64",
    });

    airSpeedSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/airspeed",
      messageType: "std_msgs/Float32",
    });

    odometerSub.current.subscribe((msg) => {
      setOdometerValue(msg.data);
    });
    airSpeedSub.current.subscribe((msg) => {
      setAirSpeedValue(msg.data);
    });

    odomSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odom",
      messageType: "nav_msgs/Odometry",
    });
    odomSub.current.subscribe((msg) => {
      // // console.log(msg);
      setAirSpeedValue(msg.pose.pose.position.x);
    });
    odometerResetPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odometer_reset",
      messageType: "std_msgs/Empty",
    });
  }, [connected]);
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
    <div className="w-screen flex justify-center mt-5">
      <div className="card card-compact bg-base-100">
        <div className="card-body">
          <div className="grid grid-cols-2 gap-10">
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
    </div>
  );
};

export default OdometerPanel;
