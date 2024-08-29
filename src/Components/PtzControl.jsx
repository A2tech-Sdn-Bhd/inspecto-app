import { useNavigate } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { GoHomeFill } from "react-icons/go";

const PtzControl = ({
  stopMovement,
  startMovement,
  setHome,
  value,
  handleChange,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="card card-compact bg-white">
        <div className="text-lg font-bold text-center mt-4">PTZ Control</div>
        <div className="card-body">
          <div className="flex flex-col gap-2">
            <div className="col-span-3 items-center justify-center flex">
              <div className="tooltip" data-tip="W">
                <button
                  className="btn btn-primary"
                  onMouseDown={() => startMovement(1)}
                  onMouseUp={() => stopMovement()}
                >
                  <FiArrowUp size={25} className="text-base-100" />
                </button>
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-center">
              <div
                className="tooltip tooltip-left flex justify-end"
                data-tip="A"
              >
                <button
                  className="btn btn-primary"
                  onMouseDown={() => startMovement(3)}
                  onMouseUp={() => stopMovement()}
                >
                  <FiArrowLeft size={25} className="text-base-100" />
                </button>
              </div>
              <div className="tooltip tooltip-bottom" data-tip="S">
                <button
                  className="btn btn-primary"
                  onMouseDown={() => startMovement(2)}
                  onMouseUp={() => stopMovement()}
                >
                  <FiArrowDown size={25} className="text-base-100" />
                </button>
              </div>
              <div className="tooltip tooltip-right" data-tip="D">
                <button
                  className="btn btn-primary"
                  onMouseDown={() => startMovement(4)}
                  onMouseUp={() => stopMovement()}
                >
                  <FiArrowRight size={25} className="text-base-100" />
                </button>
              </div>
            </div>
            <div className="flex flex-row justify-center gap-2">
              <div className="tooltip tooltip-left" data-tip="Q">
                <button
                  className="btn btn-primary"
                  onMouseDown={() => startMovement(14)}
                  onMouseUp={() => stopMovement()}
                >
                  <FiZoomOut size={25} className="text-base-100" />
                </button>
              </div>
              <div className="tooltip" data-tip="X">
                <button className="btn btn-primary" onClick={() => setHome()}>
                  <GoHomeFill size={25} className="text-base-100" />
                </button>
              </div>
              <div className="tooltip tooltip-right" data-tip="E">
                <button
                  className="btn btn-primary"
                  onMouseDown={() => startMovement(13)}
                  onMouseUp={() => stopMovement()}
                >
                  <FiZoomIn size={25} className="text-base-100" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-xl font-black text-center mt-4">PTZ Speed</div>
          <div className="">
            <input
              type="range"
              min={0.1}
              max={1.0}
              value={value}
              className="range"
              onChange={handleChange}
              step={0.1}
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
          </div>
          <div>
            <button
              className="btn btn-neutral btn-wide"
              onClick={() => {
                navigate("/");
              }}
            >
              {"BACK TO NORMAL MODE"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PtzControl;
