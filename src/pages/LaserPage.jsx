// reference for fix diameter
// ratio for range from diamter
// let say reference 30 and ratio 5%, the min is 25 and max is 35
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
import NavBar from "../Components/NavBar";
import { AiFillSave } from "react-icons/ai";
import { FaTrashCan } from "react-icons/fa6";
import {
  BsJoystick,
  BsFillKeyboardFill,
  BsRocketTakeoff,
} from "react-icons/bs";
import logo from "../assets/a2tech.png";
import Draggable from "react-draggable";
import { saveAs } from "file-saver";
import { Button, Modal } from "react-daisyui";
import { GoAlert } from "react-icons/go";
import "../App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BsFillFileEarmarkBarGraphFill } from "react-icons/bs";
import GeneratePDFButton from "../Components/GeneratePDFButton";

import ReportForm from "../Components/ReportForm";
import ListCameraCard from "../Components/ListCameraCard";
import OdometerPanelLaser from "../Components/OdometerPanellaser";
import LaserModule from "../Components/LaserModule";
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

function LaserPage({ ros, connected, setConnected }) {
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
  const odometerResetPub = useRef(null);
  const startAutoPub = useRef(null);
  const stopAutoPub = useRef(null);
  const moveDistancePub = useRef(null);
  const resetOdomPub = useRef(null);
  const diameterSub = useRef(null);

  const brushState = useRef(false);

  const [cam, setCam] = useState(1);
  const [url, setUrl] = useState("");

  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [laserStatus, setLaserStatus] = useState(false);
  const [odometerValue, setOdometerValue] = useState(0.0);
  const [LaserModuleAccess, setLaserModuleAccess] = useState(false);
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
  const [generateReportAccess, setGenerateReportAccess] = useState(false);
  const [handleUseButton, setHandleUseButton] = useState(false);
  const [showBtnBack, setShowBtnBack] = useState(false);
  const [lowYplot, setLowYplot] = useState(0.1);
  const [highYplot, sethighYplot] = useState(1);
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

  const submitForm = () => {
    console.log(inputDiameter);
    console.log(inputTol);
    if (inputDiameter == "") {
      inputDiameterRef.current.classList.add("input-error");
      inputDiameterRef.current.focus();
    }
    if (inputTol == "") {
      inputTolRef.current.classList.add("input-error");
      inputTolRef.current.focus();
    }
    if (inputDiameter != "" && inputTol != "") {
      inputDiameterRef.current.classList.remove("input-error");
      inputTolRef.current.classList.remove("input-error");
      setStartPlot(true);
    }
  };
  useEffect(() => {
    console.log("edgeFront", edgeFront);
    if (edgeFront) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [edgeFront]);

  useEffect(() => {
    console.log("edgeRear", edgeRear);
    if (edgeRear) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [edgeRear]);
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
        setCam(1);
      } else if (evt.code === "Digit2") {
        setCam(2);
      } else if (evt.code === "Digit3") {
        setCam(3);
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
      } else if (evt.code === "KeyR" && evt.shiftKey) {
        // console.log("Reset");
        const confirmed = window.confirm(
          "Are you sure you want to reset the odometer?"
        );
        if (confirmed) {
          odometerResetPub.current.publish({});
        }
      }
    });

    window.addEventListener("keyup", (evt) => {
      if (evt.code === "ArrowUp") {
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
      setShowBtnBack(true);
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
              case "4":
                setGenerateReportAccess(item.up_status === 1);
                break;
              case "5":
                setLaserModuleAccess(item.up_status === 1);
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
  const [chartWidth, setChartWidth] = useState(1595);
  useEffect(() => {
    window.addEventListener("load", (event) => {
      const tripInformation = JSON.parse(
        localStorage.getItem("tripInformation")
      );
      if (!tripInformation) {
        setShowForm(true);
      }
    });
  });
  useEffect(() => {
    let prevX = null; // Initialize the previous x value
    let counter = 0;
    if (startPlot & laserStatus) {
      diameterSub.current = new ROSLIB.Topic({
        ros: ros.current,
        name: "/diameter_range",
        messageType: "sensor_msgs/Range",
      });

      diameterSub.current.subscribe((msg) => {
        const currentX = msg.field_of_view.toFixed(3);
        if (prevX === null || Math.abs(currentX - prevX) >= 0.02) {
          console.log("plotting ", realtimeData.length);
          var realDiameter = msg.min_range.toFixed(3);
          //+- 20% tolerance
          const inputD = parseFloat(inputDiameter);
          const tol = parseFloat(inputTol / 100);
          const highTol = (inputD + inputD * tol).toFixed(3);
          const lowTol = (inputD - inputD * tol).toFixed(3);
          setLowYplot(lowTol - lowYplot * 0.2);
          sethighYplot(highTol + highYplot * 0.2);
          const newDataPoint = {
            x: currentX,
            diameter: realDiameter,
            lowRange: highTol,
            highRange: lowTol,
          };
          setRealtimeData((prevData) => [...prevData, newDataPoint]);
          if (chartContainerRef.current) {
            chartContainerRef.current.scrollLeft =
              chartContainerRef.current.scrollWidth;
          }
          console.log("new point", newDataPoint);
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

  useEffect(() => {
    if (cam === 4 || cam === 5) {
      return;
    }

    if (canvasRef.current.getContext("2d") === null) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";
    let timeoutId;
    let imageLoaded = false; // Add this line
    image.onload = () => {
      clearTimeout(timeoutId);
      imageLoaded = true; // Set the flag to true when the image loads
    };

    image.onerror = () => {
      if (imageLoaded) {
        clearTimeout(timeoutId);
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
      }
    };

    image.src = url;

    timeoutId = setTimeout(() => {
      image.src = ""; // This will trigger the onerror event
    }, 5000); // Set timeout to 5000ms or 5 seconds

    const canvasInterval = setInterval(() => {
      const date = new Date();
      const text = date.toLocaleTimeString();
      const cw = canvasRef.current.width;
      const ch = canvasRef.current.height;
      context.clearRect(0, 0, cw, ch);
      if (cam != 4 && imageLoaded) {
        if (!showAuto) {
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
    } else if (cam == 5) {
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

  const handleSaveCsvClick = () => {
    if (!autoStart && realtimeData.length) {
      setStartPlot(false);
      const currentDate = new Date();
      const formattedDate = currentDate
        .toLocaleString()
        .replace(/[:/,\s]/g, "_");

      // Generate CSV content
      const csvContent =
        "x(m),lowRange(m),diameter(m),highRange(m)\n" +
        realtimeData
          .map(
            (dataPoint) =>
              `${dataPoint.x},${dataPoint.lowRange},${dataPoint.diameter},${dataPoint.highRange}`
          )
          .join("\n");

      // Create a Blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `data_${formattedDate}.csv`; // Use the formatted date in the filename
      link.click();
    }
    if (startPlot || autoStart || !realtimeData.length) {
      return;
    }
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString().replace(/[:/,\s]/g, "_");

    // Generate CSV content
    const csvContent =
      "x(m),lowRange(m),diameter(m),highRange(m)\n" +
      realtimeData
        .map(
          (dataPoint) =>
            `${dataPoint.x},${dataPoint.lowRange},${dataPoint.diameter},${dataPoint.highRange}`
        )
        .join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `data_${formattedDate}.csv`; // Use the formatted date in the filename
    link.click();
  };

  const handleManualPlot = () => {
    setCam(3);
    // resetOdomPub.current.publish({});
    // if (realtimeData.length) {
    // 	setRealtimeData(prevData => []);
    // }
    setStartPlot(!startPlot);
  };

  return (
    <div
      className="w-screen h-screen bg-slate-800 overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className="grid grid-rows-12">
        <div className="row-span-1">
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
        </div>
        <div className="row-span-3">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-2 flex flex-col justify-center">
              <ListCameraCard
                setCam={setCam}
                setShowPtzCtrl={setShowPtzCtrl}
                showBtnBack={showBtnBack}
              />
              <div className="card bg-base-100 shadow-xl mt-4 ms-4">
                <div className="card-body">
                  <h2 className="card-title justify-center">
                    Media Capture Menu
                  </h2>
                  <div className="mt-2 grid grid-row gap-2 ">
                    <button
                      className="btn btn-neutral btn-md"
                      onClick={downloadImage}
                    >
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
            <div className="col-span-8 flex flex-col items-center justify-center ">
              <div className="">
                {/* Canvas for 2D context */}
                <canvas
                  className={`object-contain ${
                    cam === 4 || cam == 5 ? "hidden" : ""
                  }`}
                  ref={canvasRef}
                  width={1280}
                  height={580}
                ></canvas>
              </div>
            </div>
            <div className="col-span-2 flex flex-col justify-center">
              <div className="card bg-base-100 shadow-xl  me-4">
                <div className="card-body">
                  <h2 className="card-title justify-center">Laser Module</h2>
                  <div className="mt-2 grid grid-row gap-2 ">
                    <LaserModule
                      laserStatus={laserStatus}
                      setLaserStatus={setLaserStatus}
                    />
                    <button
                      className="btn btn-neutral"
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      {"BACK TO NORMAL MODE"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2 me-4">
                <OdometerPanelLaser
                  ros={ros}
                  connected={connected}
                  setConnected={setConnected}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row-span-4">
          <div className="flex flex-col w-full ">
            <div className="grid grid-cols-12 gap-2 mx-2">
              <div className="grid col-span-12">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex flex-row">
                      <div
                        className="ms-4"
                        ref={chartContainerRef}
                        style={{
                          overflowX: "auto",
                        }}
                      >
                        <h1 className="font-bold">Graph Visualization</h1>
                        <>
                          <LineChart
                            width={chartWidth}
                            height={170}
                            data={realtimeData}
                          >
                            <CartesianGrid stroke="#ccc" />
                            <XAxis dataKey="x" interval={1} />
                            <YAxis domain={[0.1, 1]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="lowRange"
                              stroke="#FF00FF"
                            />
                            <Line
                              type="monotone"
                              dataKey="diameter"
                              stroke="#00FFFF"
                            />
                            <Line
                              type="monotone"
                              dataKey="highRange"
                              stroke="#ff5733"
                            />
                          </LineChart>
                        </>
                      </div>
                      <div className="flex flex-cols items-start">
                        <div className="ms-2 ">
                          <div className="grid grid-rows-2 gap-2 ">
                            <div className="col-span-1">
                              <label className="form-control w-44">
                                <div className="label">
                                  <span className="label-text">
                                    Reference Value:
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Insert Diameter"
                                  className="input input-bordered input-sm"
                                  ref={inputDiameterRef}
                                  value={inputDiameter}
                                  onChange={handleInputDiameterChange}
                                />
                              </label>
                            </div>
                            <div className="col-span-1">
                              <label className="form-control w-44">
                                <div className="label">
                                  <span className="label-text">
                                    Ratio Value:
                                  </span>
                                </div>
                                <input
                                  ref={inputTolRef}
                                  type="text"
                                  placeholder="Insert Ratio"
                                  className="input input-bordered input-sm"
                                  value={inputTol}
                                  onChange={handleInputTolChange}
                                />
                              </label>
                            </div>
                          </div>
                          <button
                            className="btn btn-neutral btn-block mt-2 btn-sm"
                            onClick={submitForm}
                            disabled={!laserStatus}
                          >
                            SUBMIT
                          </button>
                        </div>
                      </div>
                      <div className="ms-2  flex flex-col justify-center mt-3">
                        <div className="flex flex-row align-middle ">
                          <button
                            disabled={!laserStatus}
                            className="btn tooltip btn-neutral"
                            style={{
                              width: "30px",
                              height: "30px",
                              padding: "1px",
                              marginTop: "-6px",
                              marginLeft: "8px",
                            }}
                            data-tip="Save"
                            onClick={handleSaveCsvClick}
                          >
                            <AiFillSave color="white" size={25}></AiFillSave>
                          </button>
                        </div>
                        <div className="flex flex-row align-middle ">
                          <button
                            disabled={!laserStatus}
                            className="btn tooltip btn-neutral"
                            style={{
                              width: "30px",
                              height: "30px",
                              padding: "1px",
                              marginTop: "5px",
                              marginLeft: "8px",
                            }}
                            data-tip="Plot in Manual Mode"
                            onClick={handleManualPlot}
                          >
                            <BsFillFileEarmarkBarGraphFill
                              color="white"
                              size={25}
                            ></BsFillFileEarmarkBarGraphFill>
                          </button>
                        </div>
                        <div className="flex flex-row align-middle ">
                          <button
                            disabled={!laserStatus}
                            className="btn tooltip btn-neutral"
                            style={{
                              width: "30px",
                              height: "30px",
                              padding: "1px",
                              marginTop: "5px",
                              marginLeft: "8px",
                            }}
                            data-tip="Clear Graph"
                            onClick={() => {
                              setRealtimeData([]);
                            }}
                          >
                            <FaTrashCan color="white" size={25}></FaTrashCan>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="start_automation" className="modal">
        <div className="modal-box">
          <label className="form-control w-full mb-5">
            <div className="label">
              <span className="label-text">Travel Distance (M)</span>
            </div>
            <input
              type="text"
              placeholder="Insert Distance"
              className="input input-bordered w-full"
            />
          </label>
          <button className="btn btn-block btn-neutral">
            Start Automation
          </button>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* <Modal className="flex justify-center w-60" open={modalVisible}>
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
      </Modal> */}
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
              Z
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

export default LaserPage;
