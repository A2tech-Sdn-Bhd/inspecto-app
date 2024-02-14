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
  useEffect(() => {
    if (ros.current) {
      return;
    }
    ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });
    ros.current.on("error", function (error) {
      // console.log(error);
      setConnected(false);
    });
    ros.current.on("connection", function () {
      // console.log("Connection made!");
      setConnected(true);
    });
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Home ros={ros} connected={connected} setConnected={setConnected} />} />
      <Route path="/generatepdf" element={<GeneratePDF />} />
      <Route path="/login" element={<Login />} />
      <Route path="/laser" element={<LaserPage ros={ros} connected={connected} setConnected={setConnected}  />} />
      <Route path="/mapping" element={<MappingPage ros={ros} connected={connected} setConnected={setConnected} />} />
      <Route path="/crackdetection" element={<CrackDetectionPage ros={ros} connected={connected} setConnected={setConnected} />} />
      <Route path="/cleaning" element={<CleaningPage ros={ros} connected={connected} setConnected={setConnected} />} />
      <Route path="/ptz" element={<PtzPage ros={ros} connected={connected} setConnected={setConnected} />} />
    </Routes>
  );
}

export default App;
