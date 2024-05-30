import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
import OdometerPanel from "../Components/OdometerPanel";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
import Draggable from "react-draggable";
import { saveAs } from "file-saver";
import { Button, Modal } from "react-daisyui";
import { GoAlert } from "react-icons/go";

import "../App.css";
import GeneratePDFButton from "../Components/GeneratePDFButton";

import ReportForm from "../Components/ReportForm";
import ListCameraCard from "../Components/ListCameraCard";
import NavBar from "../Components/NavBar";
import MappingModule from "../Components/MappingModule";
import ScanningModule from "../Components/ScanningModule";
import LightController from "../Components/LightController";
const maxLinear = 0.25;
const maxAngular = 1.5;
let twist = new ROSLIB.Message({
  linear: {
    x: 0.0,
    y: 0.0,
    z: 0.0,
  },
  angular: {
    x: 0.0,
    y: 0.0,
    z: 0.0,
  },
});
let move = false;
let arrowMove = false;

let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;

let mediaRecorder = null;
let videoStream = null;
let chunks = [];

function MappingPage({
  ros,
  connected,
  setConnected,
  odometerValue,
  moveDistancePub,
  stopAutoPub,
  cmdVelPub,
  airSpeedValue,
  odometerResetPub,
  edgeFront,
  edgeRear,
  lightIntensityPub
}) {
  const [tripName, settripName] = useState("");
  const [inspectoName, setinspectorName] = useState("");
  const [place, setplace] = useState("");
  const [tripType, settripType] = useState("unselect");
  const [tripNamePrevious, settripNamePrevious] = useState("");
  const [inspectoNamePrevious, setinspectoNamePrevious] = useState("");
  const [placePrevious, setplacePrevious] = useState("");
  const [tripTypePrevious, settripTypePrevious] = useState("");
  const [gamepadState, setGamepadState] = useState(false);
  const [showJoystick, setShowJoystick] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFormLogin, setShowFormLogin] = useState(false);
  const [temperature, setTemperature] = useState(0.0);


  const [cam, setCam] = useState(1);
  const [url, setUrl] = useState("");

  const canvasRefBig = useRef(null);
  const canvasRefSmall = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [intervalId, setIntervalId] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  const [showBtnStartTrip, setShowBtnStartTrip] = useState(true);
  const [showBtnEndTrip, setShowBtnEndTrip] = useState(false);
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["token_app"]);
  const location = useLocation();
  const [mappingModuleAccess, setMappingModuleAccess] = useState(false);
  const [generateReportAccess, setGenerateReportAccess] = useState(false);
  const [handleUseButton, setHandleUseButton] = useState(false);
  const [swapCameraStatus, setSwapCameraStatus] = useState(false);
  const [geninput, setgeninput] = useState({
    n: "",
  });

  const [mappingStatus, setmappingStatus] = useState(false);
  const [scanningStatus, setscanningStatus] = useState(false);
  const handleGeneratePDF = async (e) => {
    window.open("/generatepdf", "_blank");
    setgeninput({
      ...geninput,
      n: "",
    });
    localStorage.setItem("generatepdfyet", true);
  };
  useEffect(() => {
    if (location.pathname === "/") {
      const tripInformation = JSON.parse(
        localStorage.getItem("tripInformation")
      );
      const tripstatuss = localStorage.getItem("tripStatus");
      if (tripstatuss == "false") {
        setShowBtnEndTrip(false);
        setShowBtnStartTrip(true);
      } else if (tripstatuss == "true") {
        setShowBtnEndTrip(true);
        setShowBtnStartTrip(false);
      }

      if (!tripInformation) {
        setShowFormLogin(true);
      }
    }
    return () => {};
  }, [location.pathname]);
  useEffect(() => {
    console.log("edgeFront", edgeFront);
    if (!edgeFront) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [edgeFront]);

  useEffect(() => {
    console.log("edgeRear", edgeRear);
    if (!edgeRear) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [edgeRear]);

  useEffect(() => {
    const verifyCookie = async () => {
      if (!cookies.token_app) {
        navigate("/login");
      } else {
        const { data } = await axios.post(
          `${API_URL}`,
          { fromwhere: "app" },
          { withCredentials: true }
        );
        const { status, up } = data;
        if (up) {
          up.forEach((item) => {
            switch (item.p_id) {
              case "2":
                setMappingModuleAccess(item.up_status === 1);
                break;
              case "4":
                setGenerateReportAccess(item.up_status === 1);
                break;
              default:
                break;
            }
          });
        }
        return status
          ? console.log("")
          : (removeCookie("token_app"),
            navigate("/login"),
            console.log("tak legit"));
      }
    };

    verifyCookie();
  }, [cookies, navigate, removeCookie]);

  const Logout = () => {
    let dates = new Date();
    dates = dates.toISOString();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const tripstatus = localStorage.getItem("tripStatus");
        if (tripstatus == "true") {
          const token = cookies.token;
          axios
            .post(
              `${API_URL}/signout`,
              {
                token: token,
                date: dates,
              },
              { withCredentials: true }
            )
            .then((res) => {
              clearLocalStorageLogout();
              removeCookie("token_app", "");
              navigate("/login");
            });
        } else {
          Swal.fire({
            title: "Seem like you didn't end the trip yet",
            text: "Please end the trip first!",
            icon: "warning",
            confirmButtonText: "End Trip Now",
          }).then((result) => {
            if (result.isConfirmed) {
              endTrip();
            }
          });
        }
      }
    });
  };

  function closeModal() {
    setShowShortcuts(false);
  }

  const handleTripBtns = () => {
    setShowBtnStartTrip(!showBtnStartTrip);
    setShowBtnEndTrip(!showBtnEndTrip);
  };
  const clearLocalStorageModal = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to end the trip?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const tripInformation = JSON.parse(
          localStorage.getItem("tripInformation")
        );
        if (tripInformation) {
          const tripID = tripInformation.tripID;
          const imgstoragekey = `imgSnapshot_${tripID}`;
          const timestoragekey = `endTime_${tripID}`;
          localStorage.removeItem(imgstoragekey);
          localStorage.removeItem(timestoragekey);
          localStorage.removeItem("generatepdfyet");
          localStorage.setItem("tripStatus", true);
          Swal.fire("Ended!", "Your trip has been ended.", "success");
          handleTripBtns();
        }
      }
    });
  };
  const clearLocalStorageLogout = () => {
    const tripInformation = JSON.parse(localStorage.getItem("tripInformation"));
    if (tripInformation) {
      const tripID = tripInformation.tripID;
      const imgstoragekey = `imgSnapshot_${tripID}`;
      const timestoragekey = `endTime_${tripID}`;
      localStorage.removeItem(imgstoragekey);
      localStorage.removeItem(timestoragekey);
      localStorage.removeItem("generatepdfyet");
      localStorage.removeItem("tripInformation");
      localStorage.removeItem("chart")
      localStorage.removeItem("chart_data")
      localStorage.removeItem("tripStatus");
      
    }
  };

  const endTrip = () => {
    const generatepdfyet = localStorage.getItem("generatepdfyet");
    if (generatepdfyet) {
      clearLocalStorageModal();
    } else {
      if (generateReportAccess) {
        Swal.fire({
          title: "Seem like you didn't generate PDF yet",
          text: "Do you want to generate the pdf first?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        }).then((result) => {
          if (result.isConfirmed) {
            handleGeneratePDF();
            Swal.fire(
              "Generate PDF!",
              "Your PDF has been generated. Please end the trip again.",
              "success"
            );
            endTrip();
          } else if (result.isDismissed) {
            clearLocalStorageModal();
          }
        });
      } else {
        clearLocalStorageModal();
      }
    }
  };
  const startTrip = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to start the trip?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      // get value from key tripinformation in localstorage
      if (result.isConfirmed) {
        const tripInformation = JSON.parse(
          localStorage.getItem("tripInformation")
        );
        if (tripInformation) {
          settripNamePrevious(tripInformation.tripName);
          setinspectoNamePrevious(tripInformation.inspectoName);
          setplacePrevious(tripInformation.place);
          settripTypePrevious(tripInformation.tripType);
          settripName(tripInformation.tripName);
          setinspectorName(tripInformation.inspectoName);
          setplace(tripInformation.place);
          settripType(tripInformation.tripType);
          setShowForm(true);
          setHandleUseButton(true);
        } else {
          setHandleUseButton(false);
        }
      }
    });
  };

  useEffect(() => {
    window.addEventListener("load", (event) => {
      const tripInformation = JSON.parse(
        localStorage.getItem("tripInformation")
      );
      if (!tripInformation) {
        setShowForm(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!canvasRefBig.current) {
      return;
    }
    videoStream = canvasRefBig.current.captureStream(30);
    mediaRecorder = new MediaRecorder(videoStream, {
      videoBitsPerSecond: 5000000,
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    mediaRecorder.onstop = function (e) {
      const blob = new Blob(chunks, { type: "video/mp4" });
      chunks = [];
      // console.log(blob);
      // var videoURL = URL.createObjectURL(blob);
      // video.src = videoURL;
      saveAs(blob, "video.mp4");
    };

    return () => {};
  }, [canvasRefBig.current]);

  useEffect(() => {
    if (!canvasRefBig.current) {
      return;
    }
    if (cam === 4) {
      return;
    }

    if (canvasRefBig.current.getContext("2d") === null) {
      return;
    }

    const context = canvasRefBig.current.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";
    let timeoutId;
    let imageLoaded = false; // Add this line
    image.onload = () => {
      clearTimeout(timeoutId);
      imageLoaded = true; // Set the flag to true when the image loads
    };

    image.onerror = () => {
      clearTimeout(timeoutId);
      context.clearRect(
        0,
        0,
        canvasRefBig.current.width,
        canvasRefBig.current.height
      );
      context.fillStyle = "black";
      context.fillRect(
        0,
        0,
        canvasRefBig.current.width,
        canvasRefBig.current.height
      );
    };

    image.src = url;

    timeoutId = setTimeout(() => {
      image.src = ""; // This will trigger the onerror event
    }, 5000); // Set timeout to 5000ms or 5 seconds

    const canvasInterval = setInterval(() => {
      const date = new Date();
      const text = date.toLocaleTimeString();
      const cw = canvasRefBig.current.width;
      const ch = canvasRefBig.current.height;
      context.clearRect(0, 0, cw, ch);
      if (imageLoaded) {
        context.drawImage(image, 0, 0, 1280, 720);
        context.font = "30px Georgia";
        const textWidth = context.measureText(text).width;
        context.globalAlpha = 1.0;
        context.fillStyle = "white";

        context.fillText(text, cw - textWidth - 10, ch - 20);

        if (cam === 1) {
          const text = "Top Camera";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 30);
        } else if (cam === 0) {
          const text = "Crack Detection";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 30);
        } else if (cam === 2) {
          const text = "Front Camera";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 30);
        } else if (cam === 3) {
          const text = "Rear Camera";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 30);
        }
      }
    }, 10);
    return () => {
      clearInterval(canvasInterval);
      clearTimeout(timeoutId);
      image.src = "";
    };
  }, [url, swapCameraStatus]);
  useEffect(() => {
    if (!canvasRefSmall.current) {
      return;
    }
    videoStream = canvasRefSmall.current.captureStream(30);
    mediaRecorder = new MediaRecorder(videoStream, {
      videoBitsPerSecond: 5000000,
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    mediaRecorder.onstop = function (e) {
      const blob = new Blob(chunks, { type: "video/mp4" });
      chunks = [];
      // console.log(blob);
      // var videoURL = URL.createObjectURL(blob);
      // video.src = videoURL;
      saveAs(blob, "video.mp4");
    };

    return () => {};
  }, [canvasRefSmall.current]);

  useEffect(() => {
    if (!canvasRefSmall.current) {
      return;
    }
    if (cam === 4) {
      return;
    }

    if (canvasRefSmall.current.getContext("2d") === null) {
      return;
    }

    const context = canvasRefSmall.current.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";
    let timeoutId;
    let imageLoaded = false; // Add this line
    image.onload = () => {
      clearTimeout(timeoutId);
      imageLoaded = true; // Set the flag to true when the image loads
    };

    image.onerror = () => {
      clearTimeout(timeoutId);
      context.clearRect(
        0,
        0,
        canvasRefSmall.current.width,
        canvasRefSmall.current.height
      );
      context.fillStyle = "black";
      context.fillRect(
        0,
        0,
        canvasRefSmall.current.width,
        canvasRefSmall.current.height
      );
    };

    image.src = url;

    timeoutId = setTimeout(() => {
      image.src = ""; // This will trigger the onerror event
    }, 5000); // Set timeout to 5000ms or 5 seconds

    const canvasInterval = setInterval(() => {
      const date = new Date();
      const text = date.toLocaleTimeString();
      const cw = canvasRefSmall.current.width;
      const ch = canvasRefSmall.current.height;
      context.clearRect(0, 0, cw, ch);
      if (imageLoaded) {
        context.drawImage(image, 0, 0, 1280, 720);
        context.font = "80px Georgia";
        const textWidth = context.measureText(text).width;
        context.globalAlpha = 1.0;
        context.fillStyle = "black";

        context.fillText(text, cw - textWidth - 10, ch - 20);

        if (cam === 1) {
          const text = "Top Camera";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 80);
        } else if (cam === 0) {
          const text = "Crack Detection";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 80);
        } else if (cam === 2) {
          const text = "Front Camera";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 80);
        } else if (cam === 3) {
          const text = "Rear Camera";
          const textWidth = context.measureText(text).width;
          context.fillText(text, cw - textWidth - 10, 80);
        }
      }
    }, 10);
    return () => {
      clearInterval(canvasInterval);
      clearTimeout(timeoutId);
      image.src = "";
    };
  }, [url, swapCameraStatus]);
  const handleStart = (evt) => {
    // console.log("start", evt);

    const newIntervalId = setInterval(() => {
      try {
        cmdVelPub.current.publish(twist);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }, 100);
    setIntervalId(newIntervalId);
  };
  const handleMove = (evt) => {
    // // console.log(evt.y);
    if (showAuto) {
      if (getScaledValue(evt.y, -1, 1, -maxLinear, maxLinear) > 0) {
        setStartPlot(true);
      } else {
        setCam(1);
      }
    }
    twist = new ROSLIB.Message({
      linear: {
        x: getScaledValue(evt.y, -1, 1, -maxLinear, maxLinear),
        y: 0.0,
        z: 0.0,
      },
      angular: {
        x: 0.0,
        y: 0.0,
        z: getScaledValue(evt.x, -1, 1, -maxAngular, maxAngular),
      },
    });
  };

  const handleStop = (evt) => {
    // console.log("stop");
    if (showAuto) {
      setStartPlot(false);
    }
    twist = new ROSLIB.Message({
      linear: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      },
      angular: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      },
    });

    try {
      cmdVelPub.current.publish(twist);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(0);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      var gamepads = navigator.getGamepads();
      // console.log(gamepads[0]);

      if (arrowUp || arrowDown || arrowLeft || arrowRight) {
        console.log("move");
        arrowMove = true;
        let joyTwist = new ROSLIB.Message({
          linear: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
          angular: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        });

        if (arrowUp) {
          if (arrowLeft) {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: maxLinear,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: -maxAngular,
              },
            });
          } else if (arrowRight) {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: maxLinear,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: maxAngular,
              },
            });
          } else if (arrowDown) {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
              },
            });
          } else {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: maxLinear,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
              },
            });
          }
        } else if (arrowDown) {
          if (arrowLeft) {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: -maxLinear,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: maxAngular,
              },
            });
          } else if (arrowRight) {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: -maxLinear,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: -maxAngular,
              },
            });
          } else {
            joyTwist = new ROSLIB.Message({
              linear: {
                x: -maxLinear,
                y: 0.0,
                z: 0.0,
              },
              angular: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
              },
            });
          }
        } else if (arrowLeft) {
          joyTwist = new ROSLIB.Message({
            linear: {
              x: 0.0,
              y: 0.0,
              z: 0.0,
            },
            angular: {
              x: 0.0,
              y: 0.0,
              z: -maxAngular,
            },
          });
        } else if (arrowRight) {
          joyTwist = new ROSLIB.Message({
            linear: {
              x: 0.0,
              y: 0.0,
              z: 0.0,
            },
            angular: {
              x: 0.0,
              y: 0.0,
              z: maxAngular,
            },
          });
        }
        cmdVelPub.current.publish(joyTwist);
        return;
      } else if (arrowMove) {
        arrowMove = false;
        console.log("stop");
        const joyTwist = new ROSLIB.Message({
          linear: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
          angular: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        });
        cmdVelPub.current.publish(joyTwist);
        return;
      }
      if (!gamepads[0]) {
        return;
      }
      if (
        gamepads[0].axes[0] > 0.005 ||
        gamepads[0].axes[0] < -0.005 ||
        gamepads[0].axes[1] > 0.005 ||
        gamepads[0].axes[1] < -0.005 ||
        gamepads[0].axes[2] > 0.005 ||
        gamepads[0].axes[2] < -0.005 ||
        arrowUp ||
        arrowDown ||
        arrowLeft ||
        arrowRight
      ) {
        console.log("move");
        move = true;
        // console.log(gamepads[0].axes);
        let joyTwist = new ROSLIB.Message({
          linear: {
            x: getScaledValue(
              gamepads[0].axes[1],
              -1,
              1,
              -maxLinear,
              maxLinear
            ),
            y: 0.0,
            z: 0.0,
          },
          angular: {
            x: 0.0,
            y: 0.0,
            z: -1 * (getScaledValue(
            gamepads[0].axes[0],
            -1,
            1,
            -maxAngular,
            maxAngular)
          )
          },
        });
        if (gamepads[0].axes[2] > 0.005 || gamepads[0].axes[2] < -0.005) {
          joyTwist.angular.z = (getScaledValue(
            gamepads[0].axes[2],
            -1,
            1,
            -maxAngular,
            maxAngular)
          );
        }

        cmdVelPub.current.publish(joyTwist);
      } else if (move) {
        move = false;
        console.log("stop");
        const joyTwist = new ROSLIB.Message({
          linear: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
          angular: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
        });
        cmdVelPub.current.publish(joyTwist);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    window.addEventListener("gamepadconnected", (event) => {
      // console.log("A gamepad connected:");
      // console.log(event.gamepad);
      setGamepadState(true);
    });

    window.addEventListener("gamepaddisconnected", (event) => {
      // console.log("A gamepad disconnected:");
      // console.log(event.gamepad);
      setGamepadState(false);
    });

    window.addEventListener("keydown", (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return; // Do nothing if an input element has focus
      }
      // console.log(evt.code);
      if (evt.code === "Digit1") {
        console.log("cam 1");
        setCam(1);
        setShowPtzCtrl(false);
      } else if (evt.code === "Digit2") {
        setCam(2);
        setShowPtzCtrl(false);
      } else if (evt.code === "Digit3") {
        setCam(3);
        setShowPtzCtrl(false);
      } else if (evt.code === "Digit4") {
        setCam(4);
        setShowPtzCtrl(true);
      } else if (evt.code === "Digit5") {
        setCam(5);
        setShowPtzCtrl(false);
        55;
      } else if (evt.code === "KeyF") {
        // console.log("brush up");
        handleBrushArm("up");
      } else if (evt.code === "KeyV") {
        // console.log("brush down");
        handleBrushArm("down");
      } else if (evt.code === "KeyQ") {
        brushState.current = !brushState.current;
        // console.log(brushState.current);
        handleBrushSpin(brushState.current);
      } else if (evt.code === "ArrowUp") {
        arrowUp = true;
        // // console.log("up press");
      } else if (evt.code === "ArrowDown") {
        arrowDown = true;
      } else if (evt.code === "ArrowLeft") {
        arrowLeft = true;
      } else if (evt.code === "ArrowRight") {
        arrowRight = true;
      }
    });

    window.addEventListener("keyup", (evt) => {
      if (evt.code === "KeyF" || evt.code === "KeyV") {
        // console.log("brush stop");
        handleBrushArm("stop");
      } else if (evt.code === "ArrowUp") {
        arrowUp = false;
        // // console.log("up lift");
      } else if (evt.code === "ArrowDown") {
        arrowDown = false;
      } else if (evt.code === "ArrowLeft") {
        arrowLeft = false;
      } else if (evt.code === "ArrowRight") {
        arrowRight = false;
      } else if (
        evt.code === "KeyW" ||
        evt.code === "KeyA" ||
        evt.code === "KeyS" ||
        evt.code === "KeyD" ||
        evt.code === "KeyZ" ||
        evt.code === "KeyX"
      ) {
        handlePtz("stop");
      }
    });

    return () => {
      window.addEventListener("keyup", null);
      window.addEventListener("keydown", null);
      window.removeEventListener("gamepadconnected", (event) => {
        // console.log("A gamepad connected:");
        // console.log(event.gamepad);
        setGamepadState(true);
      });

      window.removeEventListener("gamepaddisconnected", (event) => {
        // console.log("A gamepad disconnected:");
        // console.log(event.gamepad);
        setGamepadState(false);
      });
    };
  }, []);

  function swapCamera() {
    // rerender

    if (swapCameraStatus) {
      setSwapCameraStatus(false);
    } else {
      setSwapCameraStatus(true);
    }
  }

  useEffect(() => {
    // // console.log(canvas);
    if (cam == 1) {
      // stopchrome();
      setUrl("http://192.168.88.2:8081/stream");
      // setUrl("http://192.168.0.141:8081/stream");
    } else if (cam == 0) {
      // stopchrome();
      setUrl("http://192.168.88.246/stream");
      // console.log("crack");
    } else if (cam == 2) {
      // stopchrome();
      setUrl("http://192.168.88.2:8082/stream");
    } else if (cam == 3) {
      // stopchrome();
      setUrl("http://192.168.88.2:8083/stream");
    }
  }, [cam]);

  useEffect(() => {
    setCam(1);
  }, []);

  const shutdownInspecto = () => {
    let date = new Date();
    date = date.toLocaleString();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to shutdown the Inspecto?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        removeCookie("token_app", "");
        clearLocalStorageLogout();
        axios.get(`${API_URL}/shutdown`, {
          date: date,
        });
      }
    });
  };
  const restartService = () => {
    let date = new Date();
    date = date.toLocaleString();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to restart the service?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.get(`${API_URL}/restart`, {
          date: date,
        });
      }
    });
  };
  const downloadImage = () => {
    const date = new Date();
    let name = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}.jpg`;
    // console.log(name);
    const imgDataUrl = canvasRefBig.current.toDataURL("image/jpeg", 1);
    fetch(imgDataUrl).then((r) => {
      r.blob().then((blob) => {
        // console.log(r);
        saveAs(blob, name);
      });
    });
    const imgReport = imgDataUrl.replace(/^data:image\/jpg;base64,/, "");
    const tripInformation = JSON.parse(localStorage.getItem("tripInformation"));
    const tripID = tripInformation.tripID;
    const imgID = Math.floor(Math.random() * 1000000000);
    const imgdata = [[imgID, imgReport, odometerValue]];
    console.log("odom" + odometerValue);
    const isImgSnapshotExists =
      localStorage.getItem(`imgSnapshot_${tripID}`) !== null;
    if (isImgSnapshotExists) {
      const newdata = imgdata;

      let existdata = [[]];
      existdata = JSON.parse(localStorage.getItem(`imgSnapshot_${tripID}`)) || [
        [],
      ];
      existdata.push(newdata[0]);
      localStorage.setItem(`imgSnapshot_${tripID}`, JSON.stringify(existdata));

      // console.log("imgsnapshot key exists.");
    } else {
      localStorage.setItem(`imgSnapshot_${tripID}`, JSON.stringify(imgdata));
      // console.log("imgsnapshot key does not exist.");
    }
  };

  return (
    <div
      className="w-screen h-screen bg-slate-800 overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className="grid grid-rows-12 h-screen">
        <div className="row-span-1">
          <NavBar
            ros={ros}
            connected={connected}
            Logout={Logout}
            setShowJoystick={setShowJoystick}
            setShowShortcuts={setShowShortcuts}
            showBtnStartTrip={showBtnStartTrip}
            showBtnEndTrip={showBtnEndTrip}
            restartService={restartService}
            shutdownInspecto={shutdownInspecto}
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
            endTrip={endTrip}
            startTrip={startTrip}
            showJoystick={showJoystick}
            setCam={setCam}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            odometerValue={odometerValue}
          />
        </div>
        <div className="row-span-10 flex ">
          <div className="grid grid-cols-12 gap-4 mb-5 items-center">
            <div className="col-span-2 flex flex-col justify-start h-full">
              <ListCameraCard setCam={setCam} />
              <div className="card bg-base-100 shadow-xl mt-4 ms-4">
                <div className="card-body">
                  <h2 className="card-title justify-center">
                    Media Capture Menu
                  </h2>
                  <div className="mt-2 grid grid-row gap-2 ">
                    <button className="btn btn-neutral" onClick={downloadImage}>
                      {"Snapshot"}
                    </button>
                    <Button
                      color={isRecording ? "error" : "neutral"}
                      onClick={() => {
                        if (!isRecording) {
                          setIsRecording(true);
                          mediaRecorder.start();
                        } else {
                          setIsRecording(false);
                          mediaRecorder.stop();
                        }
                      }}
                    >
                      {!isRecording && "Record"}
                      {isRecording && "Stop"}
                    </Button>
                    {generateReportAccess ? (
                      <GeneratePDFButton
                        handleGeneratePDF={handleGeneratePDF}
                        showBtnStartTrip={showBtnStartTrip}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-7 h-full">
              <div className=" flex flex-col items-center justify-center h-full">
                <div
                  className="w-full h-full"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {swapCameraStatus ? (
                    <canvas
                      className={`object-contain w-full h-full ${
                        cam === 4 ? "hidden" : ""
                      }`}
                      ref={canvasRefBig}
                      width={1280}
                      height={720}
                    ></canvas>
                  ) : (
                    <iframe
                      className={`object-contain h-full`}
                      style={{
                        position: "relative",
                        top: -44,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      id="foxglove"
                      src="http://192.168.88.246:8090/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.88.2%3A8080"
                      title="Web Page"
                    ></iframe>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-start h-full">
              <div className="card bg-base-100 me-4">
                <div className="card-body">
                  <h2 className="card-title justify-center">Mapping Mode</h2>
                  <div className="mt-2 grid grid-cols-2 gap-2 ">
                    <MappingModule
                      mappingStatus={mappingStatus}
                      setmappingStatus={setmappingStatus}
                      scanningstatus={scanningStatus}
                    />
                    <ScanningModule
                      scanningstatus={scanningStatus}
                      setscanningstatus={setscanningStatus}
                      mappingStatus={mappingStatus}
                    />
                  </div>
                  <button
                      className="btn btn-neutral btn-block"
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      {"BACK TO NORMAL MODE"}
                    </button>
                </div>
              </div>
              <LightController lightIntensityPub={lightIntensityPub} />
              <div className="card bg-base-100 shadow-xl mt-4 me-4">
                {swapCameraStatus ? (
                  <div className="card-body">
                    <div
                      className="w-full h-full"
                      style={{
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <iframe
                        className={`object-contain h-full`}
                        style={{
                          position: "relative",
                          top: -44,
                          width: "388px",
                          height: "262px",
                          border: "none",
                        }}
                        id="foxglove"
                        src="http://192.168.88.246:8090/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.88.2%3A8080"
                        title="Web Page"
                      ></iframe>
                      <button
                        className="btn btn-neutral btn-block"
                        style={{
                          position: "relative",
                          top: -20,
                        }}
                        onClick={swapCamera}
                      >
                        Swap View
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card-body">
                    <canvas
                      className={`object-contain w-full h-full ${
                        cam === 4 ? "hidden" : ""
                      }`}
                      ref={canvasRefSmall}
                      width={1280}
                      height={720}
                    ></canvas>
                    <button
                      className="btn btn-neutral btn-block"
                      onClick={swapCamera}
                    >
                      Swap View
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row-span-1">
        <div className="absolute bottom-10 w-fit" style={{left:"40%"}}>
          <OdometerPanel
            setConnected={setConnected}
            odometerValue={odometerValue}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
          />
          </div>
        </div>
        {showJoystick && (
          <>
            <Draggable handle="strong">
              <div className="absolute portrait:bottom-0 portrait:right-[7%] landscape:bottom-[5%] landscape:right-[5%] bg-slate-400 p-2 rounded-3xl">
                <strong>
                  <div className="flex justify-center items-start hover:cursor-move text-black">
                    Joystick
                  </div>
                </strong>
                <div className="pt-2">
                  <Joystick
                    size={150}
                    sticky={false}
                    throttle={10}
                    start={handleStart}
                    move={handleMove}
                    stop={handleStop}
                  ></Joystick>
                </div>
              </div>
            </Draggable>
          </>
        )}
      </div>
      <Modal className="flex justify-center w-60" open={modalVisible}>
        <Modal.Body>
          <div className="flex flex-col gap-1">
            <div className="flex justify-center gap-2">
              {(edgeFront === false || edgeRear === false) && (
                <GoAlert size={40} color="red"></GoAlert>
              )}
            </div>
            <div className="flex flex-col w-full">
              {!edgeFront && (
                <h1 className="w-full items-center">Front Edge Detected</h1>
              )}
              {!edgeRear && (
                <h1 className="w-full items-center">Rear Edge Detected</h1>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
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
      <Modal open={showShortcuts}>
        <form method="dialog">
          <Button
            size="sm"
            color="ghost"
            shape="circle"
            className="absolute right-2 top-2"
            onClick={closeModal}
          >
            x
          </Button>
        </form>
        <Modal.Body>
          <div className="flex justify-center item-center">
            <div className="post__content">
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>KEY</th>
                    <th style={{ textAlign: "center" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: "4px" }}>
                        <kbd>▲</kbd>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <kbd>◄</kbd>
                        <kbd>▼</kbd>
                        <kbd>►</kbd>
                      </div>
                    </td>
                    <td>ROBOT MOVEMENT</td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: "4px" }}>
                        <kbd>W</kbd>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <kbd>A</kbd>
                        <kbd>S</kbd>
                        <kbd>D</kbd>
                      </div>
                    </td>
                    <td>PAN TILT CAMERA</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd>Q</kbd>
                    </td>
                    <td>BRUSH: ON/OFF</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd>F</kbd>
                      <kbd>V</kbd>
                    </td>
                    <td>BRUSH: UP/DOWN</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd>Shift + R</kbd>
                    </td>
                    <td>RESET ODOMETER</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

function getScaledValue(
  value,
  sourceRangeMin,
  sourceRangeMax,
  targetRangeMin,
  targetRangeMax
) {
  let targetRange = targetRangeMax - targetRangeMin;
  let sourceRange = sourceRangeMax - sourceRangeMin;
  return (
    ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin
  );
}

export default MappingPage;
