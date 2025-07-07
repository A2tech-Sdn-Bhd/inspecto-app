import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import LEDController from "../Components/features/LEDController";
import VideoStreamPanel from "../Components/ui/VideoStreamPanel";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
import { saveAs } from "file-saver";
import { Modal } from "react-daisyui";
import { GoAlert } from "react-icons/go";
import "../styles/App.css";
import CleaningModule from "../Components/features/CleaningModule";
import ReportForm from "../Components/features/ReportForm";
import ListCameraCard from "../Components/ui/ListCameraCard";
import OdometerPanel from "../Components/ui/OdometerPanel";
import NavBar from "../Components/common/NavBar";
import MediaPanel from "../Components/ui/MediaPanel";
const maxLinear = 0.25;
const maxAngular = 0.7;
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


let videoStream = null;
let chunks = [];

function Home() {
  const [tripName, settripName] = useState("");
  const [inspectoName, setinspectorName] = useState("");
  const [place, setplace] = useState("");
  const [tripType, settripType] = useState("unselect");
  const [tripNamePrevious, settripNamePrevious] = useState("");
  const [inspectoNamePrevious, setinspectoNamePrevious] = useState("");
  const [placePrevious, setplacePrevious] = useState("");
  const [tripTypePrevious, settripTypePrevious] = useState("");
  const [intervalId, setIntervalId] = useState(0);
  const [gamepadState, setGamepadState] = useState(false);
  const [showJoystick, setShowJoystick] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFormLogin, setShowFormLogin] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [startPlot, setStartPlot] = useState(false);
  const [connected, setConnected] = useState(false);
  const [temperature, setTemperature] = useState(0.0);
  const [edgeFront, setEdgeFront] = useState(true);
  const [edgeRear, setEdgeRear] = useState(true);

  const ros = useRef(null);

  const cmdVelPub = useRef(null);
  const temperatureSub = useRef(null);
  const edgeFrontSub = useRef(null);
  const edgeRearSub = useRef(null);
  const odometerSub = useRef(null);
  const airSpeedSub = useRef(null);
  const areaSub = useRef(null);
  const flowRateSub = useRef(null);
  const odometerResetPub = useRef(null);
  const startAutoPub = useRef(null);
  const stopAutoPub = useRef(null);
  const moveDistancePub = useRef(null);
  const odomSub = useRef(null);
  const resetOdomPub = useRef(null);
  const ledControlFrontPub = useRef(null);
  const ledControlBackPub = useRef(null);
  const fullscreenRef = useRef(null);

  const [cam, setCam] = useState(1);
  const [url, setUrl] = useState("");

  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [odometerValue, setOdometerValue] = useState(0.0);
  const [showBtnStartTrip, setShowBtnStartTrip] = useState(true);
  const [showBtnEndTrip, setShowBtnEndTrip] = useState(false);
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["token_app"]);
  const location = useLocation();
  const [generateReportAccess, setGenerateReportAccess] = useState(false);
  const [handleUseButton, setHandleUseButton] = useState(false);
  const mediaRecorderRef = useRef(null); // Store mediaRecorder in a ref

  const [geninput, setgeninput] = useState({
    n: "",
  });
  const handleGeneratePDF = async (e) => {
    window.open("/generatepdf", "_blank");
    setgeninput({
      ...geninput,
      n: "",
    });
    localStorage.setItem("generatepdfyet", true);
    localStorage.setItem("chart_data", JSON.stringify(realtimeData));
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
    const verifyCookie = async () => {
      console.log("start verify");

      if (!cookies.token_app) {
        console.log("token not avail");
        navigate("/login");
      } else {
        console.log("token avail");
        const { data } = await axios.post(
          `${API_URL}`,
          { fromwhere: "app" },
          { withCredentials: true }
        );
        const { status, up } = data;
        if (up) {
          up.forEach((item) => {
            switch (item.p_id) {
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

    //verifyCookie();
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
    videoStream = canvasRef.current.captureStream(30);
    console.log("videoStream",videoStream);
    
    mediaRecorderRef.current = new MediaRecorder(videoStream, {
      videoBitsPerSecond: 5000000,
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    mediaRecorderRef.current.onstop = function (e) {
      const blob = new Blob(chunks, { type: "video/webm" });
      chunks = [];
      saveAs(blob, "video.webm");
    };

    return () => {};
  }, [canvasRef.current]);

  const image = new Image();
  image.crossOrigin = "anonymous";
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      setIsCanvasReady(true);
      console.log("✅ Canvas is ready:", canvasRef.current);
    } else {
      console.warn("⚠️ Canvas is still null!");
    }
  }, []);
  image.onerror = () => {
    clearTimeout(timeoutId);

    if (!isCanvasReady || !canvasRef.current) {
      console.error("❌ Canvas is still not ready. Skipping error handling.");
      return;
    }

    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
  useEffect(() => {
    if (cam === 4) {
      return;
    }

    if (canvasRef.current.getContext("2d") === null) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    let timeoutId;
    let imageLoaded = false;

    image.onload = () => {
      clearTimeout(timeoutId);
      imageLoaded = true;
    };

    image.onerror = () => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        console.log("canvasRef:", canvasRef);
        console.log("canvasRef.current:", canvasRef.current);

        if (!canvasRef.current) {
          console.error("❌ Canvas reference is still null! Waiting...");
          return;
        }

        const context = canvasRef.current.getContext("2d");
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        context.fillStyle = "black";
        context.fillRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }, 100); // Wait 100ms before accessing canvasRef
    };

    image.src = url;

    timeoutId = setTimeout(() => {
      image.src = "";
    }, 5000);

    const canvasInterval = setInterval(() => {
      const date = new Date();
      const text = date.toLocaleTimeString();
      const cw = canvasRef.current.width;
      const ch = canvasRef.current.height;
      context.clearRect(0, 0, cw, ch);
      if (cam != 4 && imageLoaded) {
        if (!showAuto) {
          context.drawImage(image, 0, 0, 1414.668, 670);
          context.font = "30px Georgia";
          const textWidth = context.measureText(text).width;
          context.globalAlpha = 1.0;
          context.fillStyle = "white";

          context.fillText(text, cw - textWidth - 10, ch - 20);

          if (cam === 1) {
            const text = "Front Camera";
            const textWidth = context.measureText(text).width;
            context.fillText(text, cw - textWidth - 10, 30);
          } else if (cam === 0) {
            const text = "Crack Detection";
            const textWidth = context.measureText(text).width;
            context.fillText(text, cw - textWidth - 10, 30);
          } else if (cam === 2) {
            const text = "Arm Camera";
            const textWidth = context.measureText(text).width;
            context.fillText(text, cw - textWidth - 10, 30);
          } else if (cam === 3) {
            const text = "Rear Camera";
            const textWidth = context.measureText(text).width;
            context.fillText(text, cw - textWidth - 10, 30);
          }
        } else {
          context.drawImage(image, 0, 0, 680, 420);
        }
      }
    }, 10);
    return () => {
      clearInterval(canvasInterval);
      clearTimeout(timeoutId);
      image.src = "";
    };
  }, [url]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      var gamepads = navigator.getGamepads();
      // // console.log(gamepads[0]);

      if (arrowUp || arrowDown || arrowLeft || arrowRight) {
        // console.log("move");
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
        // console.log("stop");
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
        // console.log("move");
        move = true;
        // // console.log(gamepads[0].axes);
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
            z: getScaledValue(
              gamepads[0].axes[0],
              -1,
              1,
              maxAngular,
              -maxAngular
            ),
          },
        });
        if (gamepads[0].axes[2] > 0.005 || gamepads[0].axes[2] < -0.005) {
          joyTwist.angular.z = getScaledValue(
            -gamepads[0].axes[2],
            -1,
            1,
            maxAngular,
            -maxAngular
          );
        }

        cmdVelPub.current.publish(joyTwist);

        if (showAuto) {
          if (
            getScaledValue(gamepads[0].axes[1], -1, 1, -maxLinear, maxLinear) >
            0
          ) {
            // console.log("plot joystick");
            setStartPlot(true);
            setCam(3);
          } else {
            setCam(1);
          }
        }
      } else if (move) {
        if (showAuto) {
          setStartPlot(false);
        }
        move = false;
        // console.log("stop");
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
  }, [showAuto]);

  useEffect(() => {
    if (ros.current) {
      return;
    }
    // ros.current = new ROSLIB.Ros({ url: "ws://192.168.0.141:9090" });
    ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });
    // ros.current = new ROSLIB.Ros({ url: "ws://localhost:9090" });
    ros.current.on("error", function (error) {
      // console.log(error);
      setConnected(false);
    });
    ros.current.on("connection", function () {
      // console.log("Connection made!");
      setConnected(true);
    });

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
  }, []);
  useEffect(() => {
    let arrowUpShown = false;
    let arrowDownShown = false;
    let arrowLeftShown = false;
    let arrowRightShown = false;
    let camFrontShown = false;
    let camArmShown = false;
    let camRearShown = false;

    const handleKeyDown = (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return; // Do nothing if an input element has focus
      }

      if (evt.code === "Digit1" && !camFrontShown) {
        setCam(1);
        camFrontShown = true;
        toast.dismiss();
        toast.info("Cam front");
      } else if (evt.code === "Digit2" && !camArmShown) {
        setCam(2);
        camArmShown = true;
        toast.dismiss();
        toast.info("Cam arm");
      } else if (evt.code === "Digit3" && !camRearShown) {
        setCam(3);
        camRearShown = true;
        toast.dismiss();
        toast.info("Cam rear");
      } else if (evt.code === "ArrowUp" && !arrowUpShown) {
        arrowUp = true;
        arrowUpShown = true;
        console.log("forward");
        toast.dismiss();
        toast.info("Move forward");
      } else if (evt.code === "ArrowDown" && !arrowDownShown) {
        arrowDown = true;
        arrowDownShown = true;
        toast.dismiss();
        toast.info("Move backward");
      } else if (evt.code === "ArrowLeft" && !arrowLeftShown) {
        arrowLeft = true;
        arrowLeftShown = true;
        toast.dismiss();
        toast.info("Move left");
      } else if (evt.code === "ArrowRight" && !arrowRightShown) {
        arrowRight = true;
        arrowRightShown = true;
        toast.dismiss();
        toast.info("Move right");
      } else if (evt.code === "KeyR" && evt.shiftKey) {
        console.log("Reset");
        const confirmed = window.confirm(
          "Are you sure you want to reset the odometer?"
        );
        if (confirmed) {
          if (odometerResetPub.current) {
            odometerResetPub.current.publish({});
          } else {
            console.error("odometerResetPub.current is null");
          }
        }
      }
    };

    const handleKeyUp = (evt) => {
      if (evt.code === "ArrowUp") {
        arrowUp = false;
        arrowUpShown = false; // Reset flag when key is released
      } else if (evt.code === "ArrowDown") {
        arrowDown = false;
        arrowDownShown = false; // Reset flag when key is released
      } else if (evt.code === "ArrowLeft") {
        arrowLeft = false;
        arrowLeftShown = false; // Reset flag when key is released
      } else if (evt.code === "ArrowRight") {
        arrowRight = false;
        arrowRightShown = false; // Reset flag when key is released
      } else if (evt.code === "Digit1") {
        camFrontShown = false;
      } else if (evt.code === "Digit2") {
        camArmShown = false;
      } else if (evt.code === "Digit3") {
        camRearShown = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  useEffect(() => {
    if (!connected) {
      return;
    }

    setConnected(true);
    // publisher for robot movement
    cmdVelPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    // subscribe to temperature topic
    temperatureSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/temperature",
      messageType: "sensor_msgs/Temperature",
    });
    temperatureSub.current.subscribe((msg) => {
      setTemperature(msg.temperature);
    });

    // subscribe edge front
    edgeFrontSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/edge/front",
      messageType: "std_msgs/Bool",
    });
    edgeFrontSub.current.subscribe((msg) => {
      setEdgeFront(msg.data);
    });

    // subscribe edge rear
    edgeRearSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/edge/rear",
      messageType: "std_msgs/Bool",
    });
    edgeRearSub.current.subscribe((msg) => {
      setEdgeRear(msg.data);
    });

    // subscribe odometer
    odometerSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odometer",
      messageType: "std_msgs/Float64",
    });

    areaSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/area",
      messageType: "std_msgs/Float32",
    });

    flowRateSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/flowrate",
      messageType: "std_msgs/Float32",
    });

    odometerSub.current.subscribe((msg) => {
      setOdometerValue(msg.data);
    });
    areaSub.current.subscribe((msg) => {
      setAreaValue(msg.data);
    });
    flowRateSub.current.subscribe((msg) => {
      setFlowRateValue(msg.data);
    });

    odometerResetPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odometer_reset",
      messageType: "std_msgs/Empty",
    });
    startAutoPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/start_auto",
      messageType: "std_msgs/Empty",
    });
    stopAutoPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/stop_auto",
      messageType: "std_msgs/Empty",
    });
    resetOdomPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/reset_odom",
      messageType: "std_msgs/Empty",
    });
    moveDistancePub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/move_distance",
      messageType: "std_msgs/Float32",
    });

    odomSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odom",
      messageType: "nav_msgs/Odometry",
    });
    odomSub.current.subscribe((msg) => {
      // // console.log(msg);
      
    });
    ledControlFrontPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/led/front",
      messageType: "std_msgs/Float32",
    });
    ledControlBackPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/led/back",
      messageType: "std_msgs/Float32",
    });
  }, [connected]);

  useEffect(() => {
    // // console.log(canvas);
    if (cam == 1) {
      // stopchrome();
      setUrl("http://192.168.88.2:8081/stream");
      // setUrl("http://192.168.0.141:8081/stream");
    } else if (cam == 2) {
      // stopchrome();
      setUrl("http://192.168.88.2:8082/stream");
    } else if (cam == 3) {
      // stopchrome();
      setUrl("http://192.168.88.2:8083/stream");
    }
  }, [cam]);
  useEffect(() => {
    if (!edgeFront) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [edgeFront]);

  useEffect(() => {
    if (!edgeRear) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [edgeRear]);

  const handleMove = (evt) => {
    // // console.log(evt.y);
    if (showAuto) {
      if (getScaledValue(evt.y, -1, 1, -maxLinear, maxLinear) > 0) {
        setStartPlot(true);
        setCam(3);
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

  

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const aspectRatio = 16 / 10;
    // const wrapper = canvas.parentElement;
    const wrapperWidth = wrapper.offsetWidth;
    const wrapperHeight = wrapper.offsetHeight;
    const wrapper = canvasRef.current?.parentElement;
    console.log("Parent width:", wrapper?.offsetWidth);
    console.log("Parent height:", wrapper?.offsetHeight);

    if (wrapperHeight / wrapperWidth > aspectRatio) {
      canvas.height = wrapperHeight;
      canvas.width = wrapperHeight * aspectRatio;
    } else {
      canvas.width = wrapperWidth;
      canvas.height = wrapperWidth / aspectRatio;
    }

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Optionally redraw content here
    ctx.fillStyle = "gray";
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    useEffect(() => {
      resizeCanvas();
      console.log("Home component mounted!");
      window.eventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);
  };

  return (
    <div
    ref={fullscreenRef}
      className="w-screen h-screen bg-slate-800 overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className="flex flex-col w-full h-full">
        <NavBar
          connected={connected}
          Logout={Logout}
          setShowJoystick={setShowJoystick}
          setShowShortcuts={setShowShortcuts}
          temperature={temperature}
          showBtnStartTrip={showBtnStartTrip}
          showBtnEndTrip={showBtnEndTrip}
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
          ros={ros}
          fullscreenRef={fullscreenRef}
          moveDistancePub={moveDistancePub}
          stopAutoPub={stopAutoPub}
          odometerValue={odometerValue}
        />
        <>
          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-2 flex flex-col">
              <ListCameraCard setCam={setCam} />
              <MediaPanel
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                showBtnStartTrip={showBtnStartTrip}
                generateReportAccess={generateReportAccess}
                canvasRef={canvasRef}
                mediaRecorderRef={mediaRecorderRef}
                odometerValue={odometerValue}
              />
              <LEDController
                connected={connected}
                ledControlBackPub={ledControlBackPub}
                ledControlFrontPub={ledControlFrontPub}
              />
            </div>
            <VideoStreamPanel canvasRef={canvasRef} cam={cam} />

            <div className="col-span-2 flex flex-col">
              <CleaningModule
                connected={connected}
                setConnected={setConnected}
              />

              {showJoystick && (
                <>
                  <div className="card bg-base-100 mt-4 me-4">
                    <div className="card-body">
                      <h2 className="card-title justify-center">Joystick</h2>
                      <div className="flex justify-center">
                        <Joystick
                          size={120}
                          sticky={false}
                          throttle={10}
                          start={handleStart}
                          move={handleMove}
                          stop={handleStop}
                        ></Joystick>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-10">
            <OdometerPanel />
          </div>
        </>
      </div>
      <ToastContainer position="top-center" theme="dark" />

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

export default Home;
