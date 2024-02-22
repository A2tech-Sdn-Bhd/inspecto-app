import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Home from "./pages/Home";
import GeneratePDF from "./pages/GeneratePDF";
import LaserPage from "./pages/LaserPage";
import Login from "./pages/login";
import MappingPage from "./pages/MappingPage";
import CrackDetectionPage from "./pages/CrackDetectionPage";
import CleaningPage from "./pages/CleaningPage";
import PtzPage from "./pages/PtzPage";
import * as ROSLIB from "roslib";

function App() {
  const ros = useRef(null);
  const [connected, setConnected] = useState(false);
  const [odometerValue, setOdometerValue] = useState(0.0);
  const [airSpeedValue, setAirSpeedValue] = useState(0.0);

  const cmdVelPub = useRef(null);
  const brushArmPub = useRef(null);
  const brushSpin = useRef(null);
  const edgeFrontSub = useRef(null);
  const edgeRearSub = useRef(null);
  const airSpeedSub = useRef(null);
  const areaSub = useRef(null);
  const flowRateSub = useRef(null);
  const startAutoPub = useRef(null);
  const stopAutoPub = useRef(null);
  const moveDistancePub = useRef(null);
  const odomSub = useRef(null);
  const resetOdomPub = useRef(null);
  const [edgeFront, setEdgeFront] = useState(true);
  const [edgeRear, setEdgeRear] = useState(true);
  const odometerSub = useRef(null);
  const odometerResetPub = useRef(null);

  useEffect(() => {
    if (ros.current) {
      return;
    }

    const connectToRos = () => {
      ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });

      ros.current.on("error", function (error) {
        setConnected(false);
      });

      ros.current.on("connection", function () {
        setConnected(true);
      });

      ros.current.on("close", function () {
        setConnected(false);
        console.log("reconnecting");
        setTimeout(connectToRos, 10000);
      });
    };

    connectToRos();
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
    // console.log(edgeFrontSub);
    // console.log(edgeRear);

    // subscribe edge rear
    edgeRearSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/edge/rear",
      messageType: "std_msgs/Bool",
    });
    edgeRearSub.current.subscribe((msg) => {
      setEdgeRear(msg.data);
    });
    odometerSub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odometer",
      messageType: "std_msgs/Float64",
    });
    odometerSub.current.subscribe((msg) => {
      setOdometerValue(msg.data);
    });
    odometerResetPub.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/odometer_reset",
      messageType: "std_msgs/Empty",
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
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            ros={ros}
            connected={connected}
            setConnected={setConnected}
            odometerValue={odometerValue}
            setOdometerValue={setOdometerValue}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            cmdVelPub={cmdVelPub}
            edgeFrontSub={edgeFrontSub}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
            edgeFront={edgeFront}
            edgeRear={edgeRear}
          />
        }
      />
      <Route path="/generatepdf" element={<GeneratePDF />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/laser"
        element={
          <LaserPage
            ros={ros}
            connected={connected}
            setConnected={setConnected}
            odometerValue={odometerValue}
            setOdometerValue={setOdometerValue}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            cmdVelPub={cmdVelPub}
            edgeFrontSub={edgeFrontSub}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
            edgeFront={edgeFront}
            edgeRear={edgeRear}
          />
        }
      />
      <Route
        path="/mapping"
        element={
          <MappingPage
            ros={ros}
            connected={connected}
            setConnected={setConnected}
            odometerValue={odometerValue}
            setOdometerValue={setOdometerValue}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            cmdVelPub={cmdVelPub}
            edgeFrontSub={edgeFrontSub}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
            edgeFront={edgeFront}
            edgeRear={edgeRear}
          />
        }
      />
      <Route
        path="/crackdetection"
        element={
          <CrackDetectionPage
            ros={ros}
            connected={connected}
            setConnected={setConnected}
            odometerValue={odometerValue}
            setOdometerValue={setOdometerValue}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            cmdVelPub={cmdVelPub}
            edgeFrontSub={edgeFrontSub}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
            edgeFront={edgeFront}
            edgeRear={edgeRear}
          />
        }
      />
      <Route
        path="/cleaning"
        element={
          <CleaningPage
            ros={ros}
            connected={connected}
            setConnected={setConnected}
            odometerValue={odometerValue}
            setOdometerValue={setOdometerValue}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            cmdVelPub={cmdVelPub}
            edgeFrontSub={edgeFrontSub}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
            brushArmPub={brushArmPub}
            brushSpin={brushSpin}
            edgeFront={edgeFront}
            edgeRear={edgeRear}
          />
        }
      />
      <Route
        path="/ptz"
        element={
          <PtzPage
            ros={ros}
            connected={connected}
            setConnected={setConnected}
            odometerValue={odometerValue}
            setOdometerValue={setOdometerValue}
            moveDistancePub={moveDistancePub}
            stopAutoPub={stopAutoPub}
            cmdVelPub={cmdVelPub}
            edgeFrontSub={edgeFrontSub}
            airSpeedValue={airSpeedValue}
            odometerResetPub={odometerResetPub}
            edgeFront={edgeFront}
            edgeRear={edgeRear}
          />
        }
      />
    </Routes>
  );
}

export default App;
