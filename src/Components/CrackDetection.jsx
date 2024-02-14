import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
const API_URL_CB = import.meta.env.VITE_API_URL_CBOX;
const CrackDetection = ({r}) => {
  const [detectionStatus, setDetectionStatus] = useState(false);
  useEffect(() => {
    axios.get(API_URL_CB + "/get-status-detection").then((res) => {
      if (res.data.status == 0) {
        setDetectionStatus(false);
      } else if (res.data.status == 1) {
        setDetectionStatus(true);
      }
    });
  }, []);
  const startDetection = () => {
    axios
      .get(API_URL_CB + "/start-crack-detection")
      .then((res) => {
        setDetectionStatus(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const stopDetection = () => {
    axios
      .get(API_URL_CB + "/stop-crack-detection")
      .then((res) => {
        setDetectionStatus(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {detectionStatus ? (
        <button className="btn btn-warning" onClick={stopDetection}>
          {"STOP DETECTION"}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startDetection}>
          {"START DETECTION"}
        </button>
      )}
    </>
  );
};

export default CrackDetection;
