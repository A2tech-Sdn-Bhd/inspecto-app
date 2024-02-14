import React from "react";
import axios from "axios";
import { useEffect } from "react";
const ScanningModule = ({scanningstatus, setscanningstatus, mappingStatus}) => {
  useEffect(() => {
    axios.get("http://192.168.88.2:8888/getScanningStatus").then((res) => {
      console.log( res.data.status);
      if (res.data.status == true) {
        setscanningstatus(true);
      } else if (res.data.status == false) {
        setscanningstatus(false);
      }
    });
  }, []);
  const startScanning = () => {
    axios
      .get("http://192.168.88.2:8888/startScanning")
      .then((res) => {
        setscanningstatus(true);
      })
      .catch((err) => {
      });
  };
  const stopScanning = () => {
    axios
      .get("http://192.168.88.2:8888/stopScanning")
      .then((res) => {
        setscanningstatus(false);
      })
      .catch((err) => {
        setscanningstatus(false);
      });
  };

  return (
    <>
      {scanningstatus ? (
        <button className="btn btn-warning" onClick={stopScanning}>
          {"STOP SCANNING"}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startScanning} disabled={mappingStatus}>
          {"START SCANNING"}
        </button>
      )}
    </>
  );
};

export default ScanningModule;
