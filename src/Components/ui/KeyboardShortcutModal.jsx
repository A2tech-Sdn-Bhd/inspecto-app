import { BsFillKeyboardFill } from "react-icons/bs";
const KeyboardShortcutModal = () => {
  return (
    <div>
      <button
        className="btn tooltip tooltip-left btn-neutral"
        data-tip="show keyboard shortcuts"
        onClick={() =>
          document.getElementById("keyboard_shortcut_modal").showModal()
        }
      >
        <BsFillKeyboardFill color="white" size={30}></BsFillKeyboardFill>
      </button>
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
                    <td className="text-center">Start/Stop brush</td>
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
                    <td className="text-center">
                      Increase/Decrease Brush Speed
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex justify-center items-center gap-2">
                        <kbd className="kbd text-black">Z</kbd> /{" "}
                        <kbd className="kbd text-black">C</kbd>
                      </div>
                    </td>
                    <td className="text-center">
                      Increase/Decrease Light Intensity
                    </td>
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
    </div>
  );
};

export default KeyboardShortcutModal;
