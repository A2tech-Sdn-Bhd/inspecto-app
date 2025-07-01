import { MdFullscreen } from "react-icons/md";
import { BiExitFullscreen } from "react-icons/bi";
import { useState } from "react";

const BtnFullscreen = ({ fullscreenRef }) => {

    const [enterFullscreen, setEnterFullscreen] = useState(false);
  const toggleFullscreen = () => {
    console.log("toggleFullscreen called", fullscreenRef.current); // Debug: Check if function runs and ref is defined

    if (!fullscreenRef.current) {
      console.error("Fullscreen ref is not defined");
      return;
    }

    if (!document.fullscreenElement) {
      // Enter fullscreen
      try {
        const requestFullscreen =
          fullscreenRef.current.requestFullscreen ||
          fullscreenRef.current.webkitRequestFullscreen || // Safari
          fullscreenRef.current.mozRequestFullScreen || // Firefox
          fullscreenRef.current.msRequestFullscreen; // IE/Edge

        if (requestFullscreen) {
        setEnterFullscreen(true)

          requestFullscreen.call(fullscreenRef.current).catch((err) => {
            console.error(`Error entering fullscreen: ${err.message}`);
          });
        } else {
            
          console.error("Fullscreen API is not supported in this browser");
        }
      } catch (err) {
        console.error(`Fullscreen request failed: ${err.message}`);
      }
    } else {
        setEnterFullscreen(false)
      // Exit fullscreen
      try {
        const exitFullscreen =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen;

        if (exitFullscreen) {
          exitFullscreen.call(document).catch((err) => {
            console.error(`Error exiting fullscreen: ${err.message}`);
          });
        } else {
          console.error("Fullscreen exit API is not supported in this browser");
        }
      } catch (err) {
        console.error(`Fullscreen exit failed: ${err.message}`);
      }
    }
  };

  return (
    <button
      id="BtnFullscreen"
      className="btn btn-neutral tooltip tooltip-bottom"
      data-tip="Toggle Fullscreen"
      onClick={toggleFullscreen}
    >
    {!enterFullscreen?(<MdFullscreen color="white" size={30} />): ( <BiExitFullscreen color="white" size={30} />)}
      
     
    </button>
  );
};

export default BtnFullscreen;