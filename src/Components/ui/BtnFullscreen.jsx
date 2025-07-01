import { MdFullscreen } from "react-icons/md";
import { BiExitFullscreen } from "react-icons/bi";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const BtnFullscreen = ({ fullscreenRef }) => {
  const [enterFullscreen, setEnterFullscreen] = useState(false);

  useEffect(() => {
    let fullscreenShown = false;
    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
      if (evt.code === "F11" && !fullscreenShown) {
        evt.preventDefault();
        fullscreenShown = true;
        // Show toast based on the new fullscreen state
        if (!enterFullscreen) {
          setEnterFullscreen(true);
          toast.dismiss(); // Clear any existing toasts
          toast.info("Enter Fullscreen");
        } else {
          setEnterFullscreen(false);
          toast.dismiss(); // Clear any existing toasts
          toast.info("Exit Fullscreen");
        }
        toggleFullscreen();
      }
    };

    const handleKeyUp = (evt) => {
      if (evt.code === "F11") {
        fullscreenShown = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enterFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setEnterFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = () => {
    console.log("toggleFullscreen called", fullscreenRef.current);

    if (!fullscreenRef.current) {
      console.error("Fullscreen ref is not defined");
      return;
    }

    if (!document.fullscreenElement) {
      try {
        const requestFullscreen =
          fullscreenRef.current.requestFullscreen ||
          fullscreenRef.current.webkitRequestFullscreen ||
          fullscreenRef.current.mozRequestFullScreen ||
          fullscreenRef.current.msRequestFullscreen;

        if (requestFullscreen) {
          setEnterFullscreen(true);
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
      try {
        const exitFullscreen =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen;

        if (exitFullscreen) {
          setEnterFullscreen(false);
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
      {!enterFullscreen ? (
        <MdFullscreen color="white" size={30} />
      ) : (
        <BiExitFullscreen color="white" size={30} />
      )}
    </button>
  );
};

export default BtnFullscreen;
