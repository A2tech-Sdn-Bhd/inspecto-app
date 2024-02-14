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
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlineArrowLeft,
  AiOutlineClear,
  AiOutlineArrowRight,
  AiOutlineZoomIn,
  AiOutlineZoomOut,
  AiFillSave,
} from "react-icons/ai";
import {
  BsJoystick,
  BsFillKeyboardFill,
  BsRocketTakeoff,
} from "react-icons/bs";
import { BiReset } from "react-icons/bi";
import { VscGraph } from "react-icons/vsc";
import logo from "../assets/a2tech.png";
import Draggable from "react-draggable";
import { saveAs } from "file-saver";
import { Button, Modal, Accordion } from "react-daisyui";
import { GoAlert } from "react-icons/go";
import Odometer from "react-odometerjs";
import "../App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  ZAxis,
} from "recharts";

import CleaningModule from "../Components/CleaningModule";
import GeneratePDFButton from "../Components/GeneratePDFButton";

import ReportForm from "../Components/ReportForm";
import ListModuleCard from "../Components/ListModuleCard";
import ListCameraCard from "../Components/ListCameraCard";

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

function LaserPage() {
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
  const [startPlot, setStartPlot] = useState(true);
  const [connected, setConnected] = useState(false);
  const [temperature, setTemperature] = useState(0.0);
  const [edgeFront, setEdgeFront] = useState(true);
  const [edgeRear, setEdgeRear] = useState(true);

  const ros = useRef(null);

  const cmdVelPub = useRef(null);
  const brushArmPub = useRef(null);
  const brushSpin = useRef(null);
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
  const [showBtnBack, setShowBtnBack] = useState(false);
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

    window.addEventListener("keydown", (evt) => {
      if (document.activeElement.tagName === "INPUT") {
        return; // Do nothing if an input element has focus
      }

      // console.log(evt.code);
      if (evt.code === "Digit1") {
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
      } else if (evt.code === "KeyW") {
        handlePtz("up");
      } else if (evt.code === "KeyA") {
        handlePtz("left");
      } else if (evt.code === "KeyS") {
        handlePtz("down");
      } else if (evt.code === "KeyD") {
        handlePtz("right");
      } else if (evt.code === "KeyZ") {
        handlePtz("zoomin");
      } else if (evt.code === "KeyX") {
        handlePtz("zoomout");
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
  const [chartWidth, setChartWidth] = useState(1100);
  // const chartData = [
  //   {
  //     "x(m)": 1.195,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.433,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.167,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.412,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.143,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.424,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.122,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.443,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.099,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.429,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.078,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.418,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.052,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.432,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.032,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.428,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 1.01,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.417,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.99,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.437,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.968,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.416,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.948,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.393,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.92,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.413,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.9,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.399,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.88,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.405,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.859,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.416,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.838,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.409,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.812,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.419,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.792,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.412,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.77,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.387,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.748,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.413,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.728,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.413,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.696,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.409,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.67,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.412,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.643,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.391,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.622,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.42,
  //     "highRange(m)": 0.45,
  //   },
  //   {
  //     "x(m)": 0.6,
  //     "lowRange(m)": 0.35,
  //     "diameter(m)": 0.417,
  //     "highRange(m)": 0.45,
  //   },
  // // ];
  // const sortedChartData = chartData.sort((a, b) => a["x(m)"] - b["x(m)"]);
  // const data = sortedChartData.map((point) => ({
  //   x: parseFloat(point["x(m)"]).toFixed(2),
  //   diameter: point["diameter(m)"],
  //   lowRange: point["lowRange(m)"],
  //   highRange: point["highRange(m)"],
  // }));

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
      console.log(ros.current);
      diameterSub.current = new ROSLIB.Topic({
        ros: ros.current,
        name: "/diameter_range",
        messageType: "sensor_msgs/Range",
      });
      console.log("diameter", diameterSub.current);
      diameterSub.current.subscribe((msg) => {
        console.log("diameter value", msg);
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
    } else if (cam == 5) {
      setUrl("");
    }
  }, [cam]);

  useEffect(() => {
    setCam(3);
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

  const handlePtz = async (action) => {
    try {
      await axios.get(`http://192.168.88.2:4000/ptzctrl?direction=${action}`);
    } catch (error) {
      console.error("camera Connection lost");
    }
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
          <div className="flex bg-slate-500 w-full h-14 justify-between px-3">
            <div className="flex h-full items-center gap-8">
              <div
                className="h-full hover:cursor-pointer"
                onClick={() => navigate("/")}
              >
                <img className="object-scale-down h-full" src={logo}></img>
              </div>
              <div className="flex h-full items-center">
                {connected ? (
                  <div className="flex gap-1">
                    <h1 className="font-semibold text-2xl">Status:</h1>
                    <h1 className="font-semibold text-lime-400 text-2xl">
                      Connected
                    </h1>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <h1 className="font-semibold text-2xl">Status:</h1>
                    <h1 className="font-semibold text-red-600 text-2xl">
                      Disconnected
                    </h1>
                  </div>
                )}
              </div>
              <div className="flex h-full items-center">
                <div className="flex gap-1">
                  <h1 className="font-semibold text-2xl">Robot Temperature:</h1>
                  <h1 className="font-semibold text-2xl">{temperature}</h1>
                  <h1 className="font-semibold  text-2xl">°C</h1>
                </div>
              </div>
            </div>
            <div className="flex h-full items-center gap-4">
              <button
                className="btn tooltip tooltip-left btn-neutral"
                data-tip="show keyboard shortcuts"
                onClick={() => setShowShortcuts(true)}
              >
                <BsFillKeyboardFill
                  color="white"
                  size={30}
                ></BsFillKeyboardFill>
              </button>

              <button
                className="btn tooltip tooltip-left btn-neutral"
                data-tip="show joystick"
                onClick={() => {
                  setShowJoystick(!showJoystick);
                }}
              >
                <BsJoystick color="white" size={30}></BsJoystick>
              </button>
              <button
                className="btn btn-neutral"
                onClick={() =>
                  document.getElementById("start_automation").showModal()
                }
              >
                Start Automation
              </button>
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
              <details className="dropdown">
                <summary className="m-1 btn btn-neutral">Option</summary>
                <ul className="dropdown-content z-[1] menu p-2 shadow btn-neutral rounded-box w-52">
                  {/* <li>
                  <a className="bg-base-900 hover:bg-slate-700 text-white hover:text-slate-300">
                    View Subscription Status
                  </a>
                </li> */}
                  <li>
                    <a
                      onClick={restartService}
                      className="bg-base-900 hover:bg-slate-700 text-white hover:text-slate-300"
                    >
                      Restart Inspecto
                    </a>
                  </li>
                  <li>
                    <a
                      className="bg-red-700 text-black hover:bg-red-600"
                      onClick={shutdownInspecto}
                    >
                      Shutdown Inspecto
                    </a>
                  </li>
                </ul>
              </details>
              <button className="btn btn-neutral" onClick={Logout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
        <div className="row-span-3">
          <div className="grid grid-cols-12 gap-4 mb-5">
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
              <ListModuleCard
                setCam={setCam}
                setShowPtzCtrl={setShowPtzCtrl}
                showAuto={showAuto}
                setShowAuto={setShowAuto}
              />
            </div>
          </div>
        </div>
        <div className="row-span-4">
          <div className="flex flex-col w-full ">
            <div className="grid grid-cols-12 gap-4 mx-4">
              <div className="grid col-span-10">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex flex-row justify-between ">
                      <div
                        ref={chartContainerRef}
                        style={{
                          overflowX: "auto",
                          minWidth: "100px",
                        }}
                      >
                        <h1 className="font-bold">Graph Visualization</h1>
                        <>
                          <LineChart
                            width={chartWidth}
                            height={180}
                            data={realtimeData}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" interval={1} />
                            {/* <YAxis domain={[0.5225, parseFloat(inputDiameter) + parseFloat(inputTol) / 100 * parseFloat(inputDiameter)]} /> */}
                            <YAxis domain={[0.1, 0.8]} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="diameter"
                              stroke="#00FFFF"
                            />
                            {/* <Line type="monotone" dataKey="expected" stroke="#FF00FF" /> */}
                            <Line
                              type="monotone"
                              dataKey="lowRange"
                              stroke="#FF00FF"
                            />
                            <Line
                              type="monotone"
                              dataKey="highRange"
                              stroke="#ff5733"
                            />
                          </LineChart>
                        </>
                      </div>
                      <div className="ms-2  flex flex-col justify-center">
                        <div className="flex flex-row align-middle ">
                          {/* <AiFillSave color="black" size={30}></AiFillSave> */}
                          <button
                            className="btn btn-neutral btn-block  tooltip mb-2"
                            data-tip="Save"
                            onClick={handleSaveCsvClick}
                          >
                            Save Graph
                          </button>
                        </div>
                        <div className="flex flex-row align-middle ">
                          {/* <VscGraph color="black" size={25}></VscGraph> */}
                          <button
                            className="btn btn-neutral btn-block  tooltip mb-2"
                            style={{
                              backgroundColor: startPlot ? "aquamarine" : "",
                            }}
                            data-tip="Plot in Manual Mode"
                            onClick={handleManualPlot}
                          >
                            Plot In Manual Mode
                          </button>
                        </div>
                        <div className="flex flex-row align-middle ">
                          {/* <AiOutlineClear
                          color="black"
                          size={25}
                        ></AiOutlineClear> */}
                          <button
                            className="btn btn-neutral btn-block tooltip"
                            data-tip="Clear Graph"
                            onClick={() => {
                              setRealtimeData([]);
                            }}
                          >
                            Clear Graph
                          </button>
                        </div>
                      </div>
                      <div className="ms-2 ">
                        <label className="form-control w-44 max-w-xs">
                          <div className="label">
                            <span className="label-text">travel Value:</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Insert Diameter"
                            className="input input-bordered w-44 max-w-xs"
                            ref={inputValueRef}
                            value={inputValue}
                            onChange={handleInputChange}
                          />
                        </label>
                        <label className="form-control w-44 max-w-xs">
                          <div className="label">
                            <span className="label-text">Reference Value:</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Insert Diameter"
                            className="input input-bordered w-44 max-w-xs"
                            ref={inputDiameterRef}
                            value={inputDiameter}
                            onChange={handleInputDiameterChange}
                          />
                        </label>
                        <label className="form-control w-44 max-w-xs">
                          <div className="label">
                            <span className="label-text">Ratio Value:</span>
                          </div>
                          <input
                            ref={inputTolRef}
                            type="text"
                            placeholder="Insert Ratio"
                            className="input input-bordered w-44 max-w-xs"
                            value={inputTol}
                            onChange={handleInputTolChange}
                          />
                        </label>
                        <button
                          className="btn btn-neutral btn-block mt-2 btn-sm"
                          onClick={handleAuto}
                        >
                          SUBMIT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid col-span-2">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h1>Drive Control Value</h1>
                    <label className="form-control flex flex-row justify-between">
                      <div className="label">
                        <span className="label-text">Odometer:</span>
                      </div>
                      <input
                        type="text"
                        value={odometerValue.toFixed(2)}
                        className="input input-bordered w-36 disabled"
                        disabled
                      />
                    </label>
                    <label className="form-control flex flex-row justify-between">
                      <div className="label">
                        <span className="label-text">Forward:</span>
                      </div>
                      <input
                        type="text"
                        value={airSpeedValue.toFixed(2)}
                        className="input input-bordered w-36 disabled"
                        disabled
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="btn btn-neutral btn-md"
                        onClick={() => {
                          odometerResetPub.current.publish({});
                        }}
                      >
                        Reset Odometer
                      </button>
                      <button
                        className="btn btn-neutral btn-md"
                        onClick={() => {
                          resetOdomPub.current.publish({});
                        }}
                      >
                        Reset Forward
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <div>
                        <div
                          className="flex gap-20"
                          style={{ marginTop: "3px" }}
                        ></div>
                      </div>
                      <div>
                        <div className="flex">
                          <div>
                            <div>
                              {/* <div className="flex justify-center gap-2">
                            <h2
                              style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "30px",
                                marginTop: "15px",
                              }}
                            >
                              Travel :{" "}
                            </h2>
                            <input
                              ref={inputValueRef}
                              type="text"
                              style={{
                                height: "40px",
                                width: "60px",
                                color: "black",
                                fontSize: "20px",
                                fontWeight: "bold",
                                marginTop: "20px",
                                textAlign: "center",
                              }}
                              placeholder="+/-"
                              value={inputValue}
                              onChange={handleInputChange}
                            />
                            <h2
                              style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "30px",
                                marginTop: "15px",
                              }}
                            >
                              m
                            </h2>
                          </div> */}
                            </div>
                          </div>
                          <div>
                            {/* <button
                          className={`btn btn-neutral tooltip tooltip-left ${
                            autoStart ? "animated" : ""
                          } ${autoStart ? "active" : ""}`}
                          style={{
                            backgroundColor: autoStart
                              ? "aquamarine"
                              : "crimson",
                          }}
                          data-tip="Press To Start/Stop"
                          onClick={handleAuto}
                        >
                          <BsRocketTakeoff
                            color="black"
                            size={40}
                          ></BsRocketTakeoff>
                        </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-5 mx-10"></div>
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

            {cleanModuleAccess ? (
              <CleaningModule
                connected={connected}
                setConnected={setConnected}
              />
            ) : (
              <></>
            )}
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
