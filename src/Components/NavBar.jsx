import React from "react";
import logo from "../assets/a2tech.png";
import { BsJoystick, BsFillKeyboardFill } from "react-icons/bs";
import ReportForm from "../Components/ReportForm";
import { BsWifi1, BsWifi2, BsWifi } from "react-icons/bs";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import { BiJoystickButton } from "react-icons/bi";


const NavBar = ({
  connected,
  Logout,
  setShowJoystick,
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
  toggleWifiPopup
}) => {


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
          {/* <div className="flex h-full items-center">
            <div className="flex gap-1">
              <h1 className="font-semibold text-2xl">Robot Temperature:</h1>
              <h1 className="font-semibold text-2xl">{temperature}</h1>
              <h1 className="font-semibold  text-2xl">°C</h1>
            </div>
          </div> */}
        </div>
        <div className="flex h-full items-center gap-4">

          <div className="indicator" onClick={() => { toggleWifiPopup() }}>
            <span className="indicator-item indicator-bottom indicator-start badge badge-secondary bg-amber-300 border-amber-300"></span>
            <button className="btn btn-neutral">
              <BsWifi className="" color="oklch(87.9% 0.169 91.605)" size={30} />
            </button>
          </div>

          <button
            className="btn tooltip tooltip-left btn-neutral"
            data-tip="show keyboard shortcuts"
            onClick={() => document.getElementById("keyboard_shortcut_modal").showModal()}
          >
            <BsFillKeyboardFill color="white" size={30}></BsFillKeyboardFill>
          </button>

          <button
            className="btn tooltip tooltip-left btn-neutral"
            data-tip="show keyboard shortcuts"
            onClick={() => document.getElementById("steamdeck_shortcut_modal").showModal()}
          >
            <BiJoystickButton color="white" size={30}></BiJoystickButton>
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
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="keyboard_shortcut_modal" className="modal">
        <div className="modal-box">
          <div>
            <h3 className="font-bold text-lg text-center">Keyboard Shortcut</h3>
            <div className="overflow-x-auto mt-4">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th className="text-center">Key</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="flex justify-center w-full">
                        <kbd className="kbd text-black">▲</kbd>
                      </div>
                      <div className="flex justify-center w-full">
                        <kbd className="kbd text-black">◀︎</kbd>
                        <kbd className="kbd text-black">▼</kbd>
                        <kbd className="kbd text-black">▶︎</kbd>
                      </div>
                    </td>
                    <td className="text-center">Robot Movement</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center">
                        <kbd className="kbd text-black">SHIFT</kbd>
                        <span className="font-bold text-lg">+</span>
                        <kbd className="kbd text-black">R</kbd>
                      </div>
                    </td>
                    <td className="text-center">Reset Odometer</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center">
                        <kbd className="kbd text-black">Q</kbd>
                      </div>
                    </td>
                    <td className="text-center">Start brush</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center items-center gap-2">
                        <kbd className="kbd text-black">F</kbd> /{" "}
                        <kbd className="kbd text-black">V</kbd>
                      </div>
                    </td>
                    <td className="text-center">Increase/Decrease Angle</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center items-center gap-2">
                        <kbd className="kbd text-black">A</kbd> /{" "}
                        <kbd className="kbd text-black">D</kbd>
                      </div>
                    </td>
                    <td className="text-center">Increase/Decrease Brush Speed</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center items-center gap-2">
                        <kbd className="kbd text-black">Z</kbd> /{" "}
                        <kbd className="kbd text-black">C</kbd>
                      </div>
                    </td>
                    <td className="text-center">Increase/Decrease Light Intensity</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center items-center gap-2">
                        <kbd className="kbd text-black">1</kbd>
                        <kbd className="kbd text-black">2</kbd>
                        <kbd className="kbd text-black">3</kbd>
                      </div>
                    </td>
                    <td className="text-center">Camera Switch</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center items-center gap-2">
                        <kbd className="kbd text-black">J</kbd> /
                        <kbd className="kbd text-black">L</kbd>
                      </div>
                    </td>
                    <td className="text-center">Snapshot/Record</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <dialog id="steamdeck_shortcut_modal" className="modal">
        <div className="modal-box min-w-[1200px]">
          <div>
            <h3 className="font-bold text-lg text-center mb-5">Steam Deck Shortcut</h3>
            <img src="./public/shortcut.png" alt="" />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default NavBar;
