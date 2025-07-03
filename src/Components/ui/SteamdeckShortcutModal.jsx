import { BiJoystickButton } from "react-icons/bi";
const SteamdeckShortcutModal = () => {
  return (
    <div>
      <button
        className="btn tooltip tooltip-left btn-neutral"
        data-tip="show keyboard shortcuts"
        onClick={() =>
          document.getElementById("steamdeck_shortcut_modal").showModal()
        }
      >
        <BiJoystickButton color="white" size={30}></BiJoystickButton>
      </button>
      <dialog id="steamdeck_shortcut_modal" className="modal">
        <div className="modal-box min-w-[1200px]">
          <div>
            <h3 className="font-bold text-lg text-center mb-5">
              Steam Deck Shortcut
            </h3>
            <img src="./shortcut.png" alt="" />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};
export default SteamdeckShortcutModal;
