import React, { useEffect } from "react";
import logo from "../assets/a2tech.png";
import { BsJoystick, BsFillKeyboardFill } from "react-icons/bs";
import ReportForm from "../Components/ReportForm";
import StartAutomation from "./StartAutomation";
import { useRef,useState } from "react";
import * as ROSLIB from "roslib";
const NavBar = ({
  ros,
  setConnected,
  connected,
  Logout,
  setShowJoystick,
  setShowShortcuts,
  showBtnStartTrip,
  showBtnEndTrip,
  restartService,
  shutdownInspecto,
  showForm,
  setShowForm,
  tripNamePrevious,
  inspectoNamePrevious,
  tripTypePrevious,
  placePrevious,
  setShowBtnEndTrip,
  setShowBtnStartTrip,
  handleGeneratePDF,
  handleUseButton,
  setShowFormLogin,
  showFormLogin,
  handleTripBtns,
  endTrip,
  startTrip,
  showJoystick,
  setCam,
  moveDistancePub,
  stopAutoPub,
  odometerValue,
  getJoystickInput,
  cmdVelPub
}) => {
  const [temperature, setTemperature] = useState(0.0);
  const temperatureSub = useRef(null);
  useEffect(() =>{
    if (!connected) {
      return;
    }
    try {
      temperatureSub.current = new ROSLIB.Topic({
        ros: ros.current,
        name: "/temperature",
        messageType: "sensor_msgs/Temperature",
      });
      temperatureSub.current.subscribe((msg) => {
        setTemperature(msg.temperature);
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  },[connected]);
  return (
    <div>
      <div className="flex bg-slate-500 w-full h-14 justify-between px-3">
        <div className="flex h-full items-center gap-8">
          <div className="h-full">
            <img className="object-scale-down h-full" src={logo}></img>
          </div>
          <div className="flex h-full items-center">
            {connected ? (
              <div className="flex gap-1">
                <h1 className="font-semibold text-2xl">Status:</h1>
                <h1 className="font-semibold text-lime-400 text-2xl">
                  Connected
                </h1>
              </div>
            ) : (
              <div className="flex gap-1">
                <h1 className="font-semibold text-2xl">Status:</h1>
                <h1 className="font-semibold text-red-600 text-2xl">
                  Disconnected
                </h1>
              </div>
            )}
          </div>
          <div className="flex h-full items-center">
            <div className="flex gap-1">
              <h1 className="font-semibold text-2xl">Robot Temperature:</h1>
              <h1 className="font-semibold text-2xl">{temperature}</h1>
              <h1 className="font-semibold  text-2xl">°C</h1>
            </div>
          </div>
        </div>
        <div className="flex h-full items-center gap-4">
            
          <button
            className="btn tooltip tooltip-left btn-neutral"
            data-tip="show keyboard shortcuts"
            onClick={() => setShowShortcuts(true)}
          >
            <BsFillKeyboardFill color="white" size={30}></BsFillKeyboardFill>
          </button>

          <button
            className="btn tooltip tooltip-left btn-neutral"
            data-tip="show joystick"
            onClick={() => {
              setShowJoystick(!showJoystick);
            }}
          >
            <BsJoystick color="white" size={30}></BsJoystick>
          </button>
          <StartAutomation moveDistancePub={moveDistancePub} stopAutoPub={stopAutoPub} odometerValue={odometerValue} getJoystickInput={getJoystickInput} cmdVelPub={cmdVelPub}/>
          {showBtnStartTrip && (
            <button
              className="btn btn-neutral"
              onClick={(handleTripBtns, endTrip)}
            >
              End Trip
            </button>
          )}
          {showBtnEndTrip && (
            <button
              className="btn btn-neutral"
              onClick={(handleTripBtns, startTrip)}
              style={{ backgroundColor: "#a3e635", color: "black" }}
            >
              Start Trip
            </button>
          )}
          <details className="dropdown">
            <summary className="m-1 btn btn-neutral">Option</summary>
            <ul className="dropdown-content z-[1] menu p-2 shadow btn-neutral rounded-box w-52">
              {/* <li>
                  <a className="bg-base-900 hover:bg-slate-700 text-white hover:text-slate-300">
                    View Subscription Status
                  </a>
                </li> */}
              <li>
                <a
                  onClick={restartService}
                  className="bg-base-900 hover:bg-slate-700 text-white hover:text-slate-300"
                >
                  Restart Inspecto
                </a>
              </li>
              <li>
                <a
                  className="bg-red-700 text-black hover:bg-red-600"
                  onClick={shutdownInspecto}
                >
                  Shutdown Inspecto
                </a>
              </li>
            </ul>
          </details>
          <button className="btn btn-neutral" onClick={Logout}>
            Log Out
          </button>
        </div>
      </div>
      <ReportForm
        showForm={showForm}
        setShowForm={setShowForm}
        tripNamePrevious={tripNamePrevious}
        inspectoNamePrevious={inspectoNamePrevious}
        tripTypePrevious={tripTypePrevious}
        placePrevious={placePrevious}
        setShowBtnEndTrip={setShowBtnEndTrip}
        setShowBtnStartTrip={setShowBtnStartTrip}
        handleGeneratePDF={handleGeneratePDF}
        handleUseButton={handleUseButton}
        setShowFormLogin={setShowFormLogin}
        showFormLogin={showFormLogin}
      />
    </div>
  );
};

export default NavBar;
