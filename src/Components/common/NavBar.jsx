import logo from "../../assets/images/a2tech.png";
import { BsJoystick } from "react-icons/bs";
import ReportForm from "../features/ReportForm";
import WifiSignalIndicatorButton from "./WifiSignalIndicatorButton";
import BtnOption from "../ui/BtnOption";
import KeyboardShortcutModal from "../ui/KeyboardShortcutModal";
import SteamdeckShortcutModal from "../ui/SteamdeckShortcutModal";
import BtnFullscreen from "../ui/BtnFullscreen";
import BtnAutomation from "../features/BtnAutomation";
const NavBar = ({
  connected,
  Logout,
  setShowJoystick,
  showBtnStartTrip,
  showBtnEndTrip,
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
  fullscreenRef,
  moveDistancePub,
  stopAutoPub,
  odometerValue,
  getJoystickInput,
  cmdVelPub,
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
                <h1 className="font-semibold text-lime-400 text-2xl">Online</h1>
              </div>
            ) : (
              <div className="flex gap-1">
                <h1 className="font-semibold text-2xl">Status:</h1>
                <h1 className="font-semibold text-red-600 text-2xl">Offline</h1>
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

        <div className="flex h-full items-center gap-1">
          <WifiSignalIndicatorButton />
          <BtnFullscreen fullscreenRef={fullscreenRef} />
          <KeyboardShortcutModal />
          <SteamdeckShortcutModal />

          <button
            className="btn tooltip tooltip-left btn-neutral"
            data-tip="show joystick"
            onClick={() => {
              setShowJoystick(!showJoystick);
            }}
          >
            <BsJoystick color="white" size={30}></BsJoystick>
          </button>
          <BtnAutomation
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            odometerValue={odometerValue}
            getJoystickInput={getJoystickInput}
            cmdVelPub={cmdVelPub}
          />
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
          <BtnOption />
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
