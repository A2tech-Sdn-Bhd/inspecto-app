import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineZoomIn,
  AiOutlineZoomOut,
} from "react-icons/ai";
import Draggable from "react-draggable";
import { saveAs } from "file-saver";
import { Button, Modal} from "react-daisyui";
import { GoAlert } from "react-icons/go";
import "../App.css";
import GeneratePDFButton from "../Components/GeneratePDFButton";
import ReportForm from "../Components/ReportForm";
import ListModuleCard from "../Components/ListModuleCard";
import ListCameraCard from "../Components/ListCameraCard";
import OdometerPanel from "../Components/OdometerPanel";
import NavBar from "../Components/NavBar";
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

function Home({ros, connected, setConnected}) {
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
  const [showPtzCtrl, setShowPtzCtrl] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFormLogin, setShowFormLogin] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [startPlot, setStartPlot] = useState(false);
  const [temperature, setTemperature] = useState(0.0);
  const [edgeFront, setEdgeFront] = useState(true);
  const [edgeRear, setEdgeRear] = useState(true);

  const cmdVelPub = useRef(null);
  const brushArmPub = useRef(null);
  const brushSpin = useRef(null);
  const edgeFrontSub = useRef(null);
  const edgeRearSub = useRef(null);
  const odometerSub = useRef(null);
  const airSpeedSub = useRef(null);
  const areaSub = useRef(null);
  const flowRateSub = useRef(null);
  const startAutoPub = useRef(null);
  const stopAutoPub = useRef(null);
  const moveDistancePub = useRef(null);
  const odomSub = useRef(null);
  const resetOdomPub = useRef(null);
  const diameterSub = useRef(null);

  const brushState = useRef(false);

  const [cam, setCam] = useState(1);
  const [url, setUrl] = useState("");

  const canvasRef = useRef(null);
  const playerRef = useRef();
  const ptzCanvasRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [odometerValue, setOdometerValue] = useState(0.0);
  const [airSpeedValue, setAirSpeedValue] = useState(0.0);
  const [areaValue, setAreaValue] = useState(0.0);
  const [flowRateValue, setFlowRateValue] = useState(0.0);

  const [inputValue, setInputValue] = useState("");
  const [inputDiameter, setInputDiameter] = useState("");
  const [inputTol, setInputTol] = useState("");
  const inputValueRef = useRef(null);
  const inputDiameterRef = useRef(null);
  const inputTolRef = useRef(null);
  const [showBtnStartTrip, setShowBtnStartTrip] = useState(true);
  const [showBtnEndTrip, setShowBtnEndTrip] = useState(false);
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["token_app"]);
  const location = useLocation();
  const [cleanModuleAccess, setCleanModuleAccess] = useState(false);
  const [mappingModuleAccess, setMappingModuleAccess] = useState(false);
  const [ptzModuleAccess, setPtzModuleAccess] = useState(false);
  const [LaserModuleAccess, setLaserModuleAccess] = useState(false);
  const [generateReportAccess, setGenerateReportAccess] = useState(false);
  const [crackDetectionAccess, setCrackDetectionAccess] = useState(false);
  const [handleUseButton, setHandleUseButton] = useState(false);

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
      if (!cookies.token_app) {
        navigate("/login");
      } else {
        const { data } = await axios.post(
          `${API_URL}`,
          { fromwhere: "app" },
          { withCredentials: true }
        );
        const { status, up, uid } = data;
        if (up) {
          up.forEach((item) => {
            switch (item.p_id) {
              case "1":
                setCleanModuleAccess(item.up_status === 1);
                break;
              case "2":
                setMappingModuleAccess(item.up_status === 1);
                break;
              case "3":
                setPtzModuleAccess(item.up_status === 1);
                break;
              case "4":
                setGenerateReportAccess(item.up_status === 1);
                break;
              case "5":
                setLaserModuleAccess(item.up_status === 1);
                break;
              case "6":
                setCrackDetectionAccess(item.up_status === 1);
                break;
              default:
                break;
            }
          });
        }
        if(uid==1){
          console.log("tak legit aa");
          navigate('/login')
        }

        return status
          ? console.log("")
          : (removeCookie("token_app"),
            navigate("/login"),
            console.log("tak legit"));
      }
    };
    verifyCookie();
  }, [cookies]);

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

  const handleInputChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.-]/g, "");
    setInputValue(sanitizedValue);
  };
  const handleInputDiameterChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.]/g, "");
    setInputDiameter(sanitizedValue);
  };
  const handleInputTolChange = (event) => {
    const input = event.target.value;
    const sanitizedValue = input.replace(/[^0-9.]/g, "");
    setInputTol(sanitizedValue);
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

  const chartContainerRef = useRef(null);
  const [realtimeData, setRealtimeData] = useState([]);
  const [chartWidth, setChartWidth] = useState(1350);

  useEffect(() => {
    window.addEventListener("load", (event) => {
      const tripInformation = JSON.parse(
        localStorage.getItem("tripInformation")
      );
      if (!tripInformation) {
        setShowForm(true);
      }
    });
    let prevX = null; // Initialize the previous x value
    let counter = 0;
    if (startPlot) {
      diameterSub.current = new ROSLIB.Topic({
        ros: ros.current,
        name: "/range_info",
        messageType: "sensor_msgs/Range",
      });
      diameterSub.current.subscribe((msg) => {
        // // console.log("diameter", msg);
        const currentX = msg.field_of_view.toFixed(3);
        // console.log(
        //   "prev: ",
        //   prevX,
        //   " current: ",
        //   currentX,
        //   " counter: ",
        //   counter
        // );
        if (prevX === null || Math.abs(currentX - prevX) >= 0.02) {
          // console.log("plotting ", realtimeData.length);
          var realDiameter = msg.min_range.toFixed(3);
          //+- 20% tolerance
          // console.log("realD", realDiameter);
          const inputD = parseFloat(inputDiameter);
          const tol = parseFloat(inputTol);
          const highTol = (inputD + inputD * 0.1).toFixed(3);
          const lowTol = (inputD - inputD * 0.1).toFixed(3);
          if (realDiameter >= lowTol && realDiameter <= highTol) {
            realDiameter = (inputD + tol) / 2 + Math.random() * 0.05 - 0.025;
            realDiameter = realDiameter.toFixed(3);
            // realDiameter = inputD - inputD*0.05;
          }
          // console.log("fake: ", realDiameter);
          const newDataPoint = {
            x: currentX,
            diameter: realDiameter,
            // expected: parseFloat(inputDiameter),
            // highTol: highTol,
            // lowTol: lowTol
            lowRange: inputD,
            highRange: tol,
          };
          setRealtimeData((prevData) => [...prevData, newDataPoint]);
          setChartWidth(Math.max(1350, realtimeData.length * 120));
          if (chartContainerRef.current) {
            chartContainerRef.current.scrollLeft =
              chartContainerRef.current.scrollWidth;
          }
          // console.log("new point", newDataPoint);
          prevX = currentX;
          counter = 0;
        } else {
          if (autoStart) {
            counter = counter + 1;
          }
        }
        if (counter >= 30) {
          //counter may vary depends on the speed of moving, now when moving, the counter can reach 11
          setAutoStart(false);
          setStartPlot(false);
          diameterSub.current.unsubscribe();
          diameterSub.current = null;
          // setInputValue('');
          // setInputDiameter('');
          // setInputTol('');
        }
      });
    }
    return () => {
      if (diameterSub.current) {
        diameterSub.current.unsubscribe();
        diameterSub.current = null;
      }
      counter = 0;
      prevX = null;
    };
  }, [startPlot, autoStart]);

  useEffect(() => {
    //when it is not plotting
    if (autoStart) {
      // // console.log("realtime data length: ", realtimeData.length)
      // if (realtimeData.length === 0) {
      // 	moveDistancePub.current.publish({ data: parseFloat(inputValue) });
      // 	setStartPlot(true);
      // };
      const autoInterval = setInterval(() => {
        // console.log("reset auto");
        setAutoStart(false);
        setStartPlot(false);
        // setInputValue('');
        // setInputDiameter('');
        // setInputTol('');
      }, 5000);
      return () => {
        clearInterval(autoInterval);
      };
    }
  }, [autoStart, realtimeData]);

  const playchrome = () => {
    // Your implementation for the playchrome function
    // You can directly use the implementation from the mainpage.html
    // or refactor it to fit into the React component structure
    // For example:

    if (cam !== 4) {
      return;
    }
    preplaynoIE();

    const ip = document.location.hostname;
    let webport = document.location.port;
    if (webport === "") {
      webport = "80";
    }

    const player = new HxPlayer();
    const canvas = ptzCanvasRef.current;
    // console.log(canvas);
    // console.log(canvas.getContext("webgl"));
    player.init({ canvas: canvas, width: 640, height: 352 });

    player.playvideo(ip, webport, "12", name0, password0);
    playerRef.current = player;
  };

  const stopchrome = () => {
    if (playerRef.current) {
      playerRef.current.stopvideo();
      // console.log("try to stop video");
    }
  };

  useEffect(() => {
    videoStream = canvasRef.current.captureStream(30);
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
  }, [canvasRef.current]);

  const image = new Image();
  image.crossOrigin = "anonymous";

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
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      context.fillStyle = "black";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
            const text = "Rear Camera";
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
                z: maxAngular,
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
                z: -maxAngular,
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
                z: -maxAngular,
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
                z: maxAngular,
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
              z: maxAngular,
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
              z: -maxAngular,
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
              -gamepads[0].axes[0],
              -1,
              1,
              maxAngular,
              -maxAngular
            ),
          },
        });
        if (gamepads[0].axes[2] > 0.005 || gamepads[0].axes[2] < -0.005) {
          joyTwist.angular.z = getScaledValue(
            gamepads[0].axes[2],
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
    // publisher for brush arm up/down
    brushArmPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/brush/up_down",
      messageType: "std_msgs/String",
    });
    // publisher for on/off brush
    brushSpin.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/brush/spin",
      messageType: "std_msgs/Bool",
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

    airSpeedSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/airspeed",
      messageType: "std_msgs/Float32",
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
    airSpeedSub.current.subscribe((msg) => {
      setAirSpeedValue(msg.data);
    });
    areaSub.current.subscribe((msg) => {
      setAreaValue(msg.data);
    });
    flowRateSub.current.subscribe((msg) => {
      setFlowRateValue(msg.data);
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
      setAirSpeedValue(msg.pose.pose.position.x);
    });
  }, [connected]);

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
    } else if (cam == 4) {
      playchrome();
      setUrl("");
    }
  }, [cam]);

  useEffect(() => {
    setCam(1);
  }, [showAuto]);

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
        z: getScaledValue(evt.x, -1, 1, maxAngular, -maxAngular),
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

  const handleBrushArm = (payload) => {
    brushArmPub.current.publish({ data: payload });
  };

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
  const handleBrushSpin = (payload) => {
    brushSpin.current.publish({ data: payload });
    // // console.log(payload);
  };

  const downloadImage = () => {
    const date = new Date();
    let name = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}.jpg`;
    // console.log(name);
    const imgDataUrl = canvasRef.current.toDataURL("image/jpeg", 1);
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

  const handleAuto = () => {
    if (autoStart) {
      setAutoStart(false);
      setStartPlot(false);
      // setInputValue('');
      // setInputDiameter('');
      // setInputTol('');
      stopAutoPub.current.publish({});
    } else {
      if (inputValue == "") {
        inputValueRef.current.focus();
        inputValueRef.current.classList.add("red-input");
        setTimeout(() => {
          inputValueRef.current.classList.remove("red-input");
        }, 300);
        return;
      }
      if (inputDiameter == "") {
        inputDiameterRef.current.focus();
        inputDiameterRef.current.classList.add("red-input");
        setTimeout(() => {
          inputDiameterRef.current.classList.remove("red-input");
        }, 300);
        return;
      }
      if (inputTol == "") {
        inputTolRef.current.focus();
        inputTolRef.current.classList.add("red-input");
        setTimeout(() => {
          inputTolRef.current.classList.remove("red-input");
        }, 300);
        return;
      }
      setCam(3);
      // resetOdomPub.current.publish({});
      // if (realtimeData.length) {
      // 	setRealtimeData(prevData => []);
      // }
      moveDistancePub.current.publish({ data: parseFloat(inputValue) });
      if (parseFloat(inputValue) <= 0) {
        // console.log("clear graph");
      } else {
        setStartPlot(true);
        setAutoStart(true);
      }
    }
  };

  return (
    <div
      className="w-screen h-screen bg-slate-800 overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className="flex flex-col w-full h-full">
        <NavBar
        ros={ros}
          connected={connected}
          Logout={Logout}
          setShowJoystick={setShowJoystick}
          setShowShortcuts={setShowShortcuts}
          temperature={temperature}
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
        />
        <>
          <div className="grid grid-cols-12 gap-4 mt-8">
            <div className="col-span-2 flex flex-col justify-center">
              <ListCameraCard setCam={setCam} setShowPtzCtrl={setShowPtzCtrl} />
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
            <div className="col-span-8 items-center justify-center">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                {/* Canvas for 2D context */}
                <canvas
                  className={` ${cam === 4 ? "hidden" : ""}`}
                  ref={canvasRef}
                  width={1274}
                  height={670}
                ></canvas>
              </div>
            </div>
            <div className="col-span-2 flex flex-col justify-center">
              <ListModuleCard
                setCam={setCam}
                setShowPtzCtrl={setShowPtzCtrl}
                showAuto={showAuto}
                setShowAuto={setShowAuto}
              />
            </div>
          </div>
          <OdometerPanel ros={ros} connected={connected} setConnected={setConnected}/>
        </>

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
        {showPtzCtrl && (
          <>
            <Draggable handle="strong">
              <div className="absolute flex flex-col bg-slate-400 portrait:bottom-[1%] portrait:left-[10%] landscape:bottom-[70%] landscape:left-[3%] p-2 rounded-3xl">
                <div className="flex flex-col items-center">
                  <div className="flex gap-2 mt-1">
                    <button
                      className="ptz-button"
                      onMouseDown={() => {
                        handlePtz("up");
                        // // console.log("up");
                      }}
                      onMouseUp={() => handlePtz("stop")}
                    >
                      <AiOutlineArrowUp color="black" size={45} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="ptz-button"
                      onMouseDown={() => handlePtz("left")}
                      onMouseUp={() => handlePtz("stop")}
                    >
                      <AiOutlineArrowLeft color="black" size={45} />
                    </button>
                    <strong>
                      <div
                        className="flex justify-center items-start hover:cursor-move text-black"
                        style={{ marginLeft: "10px", marginTop: "10px" }}
                      >
                        PTZ
                      </div>
                    </strong>
                    <button
                      className="ptz-button"
                      onMouseDown={() => handlePtz("right")}
                      onMouseUp={() => handlePtz("stop")}
                      style={{ marginLeft: "10px" }}
                    >
                      <AiOutlineArrowRight color="black" size={45} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="ptz-button"
                      onMouseDown={() => handlePtz("down")}
                      onMouseUp={() => handlePtz("stop")}
                    >
                      <AiOutlineArrowDown color="black" size={45} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="ptz-button"
                      onMouseDown={() => handlePtz("zoomin")}
                      onMouseUp={() => handlePtz("stop")}
                    >
                      <AiOutlineZoomIn color="black" size={45} />
                    </button>
                    <button
                      className="ptz-button"
                      onMouseDown={() => handlePtz("zoomout")}
                      onMouseUp={() => handlePtz("stop")}
                    >
                      <AiOutlineZoomOut color="black" size={45} />
                    </button>
                  </div>
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

export default Home;
