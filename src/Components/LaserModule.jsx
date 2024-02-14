import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
const API_URL_CB = import.meta.env.VITE_API_URL_CBOX;
const LaserModule = ({laserStatus,setLaserStatus}) => {
  

  useEffect(() => {
    axios.get(API_URL_CB + "/get-laser-status").then((res) => {
      if (res.data.status == false) {
        setLaserStatus(false);
      } else if (res.data.status == true) {
        setLaserStatus(true);
        
      }
    });
  });

  const startLaser = () => {
    axios
      .get(API_URL_CB + "/start-laser")
      .then((res) => {
        setLaserStatus(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const stopLaser = () => {
    axios
      .get(API_URL_CB + "/stop-laser")
      .then((res) => {
        setLaserStatus(false);
      })
      .catch((err) => {
        console.log(err);
        setLaserStatus(false);
      });
  };
  return (
    <>
      {laserStatus ? (
        <button className="btn btn-warning" onClick={stopLaser}>
          {"STOP LASER"}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startLaser}>
          {"START LASER"}
        </button>
      )}
    </>
  );
};

export default LaserModule;
