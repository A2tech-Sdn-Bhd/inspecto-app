import React from "react";
import axios from "axios";
import { useEffect } from "react";
const API_URL_CB = import.meta.env.VITE_API_URL_CBOX;
const MappingModule = ({mappingStatus, setmappingStatus, scanningstatus}) => {
  
  useEffect(() => {
    console.log("map"+scanningstatus);
    axios.get(API_URL_CB + "/get-status-mapping").then((res) => {
      if (res.data.status == 0) {
        setmappingStatus(false);
      } else if (res.data.status == 1) {
        setmappingStatus(true);
      }
    });
    axios.get("http://192.168.88.2:8888/getMappingStatus").then((res) => {
      if (res.data.status == false) {
        setmappingStatus(false);
      } else if (res.data.status == true) {
        setmappingStatus(true);
      }
    });
    
  }, []);
  const startMapping = () => {
    axios
      .get("http://192.168.88.2:8888/startMapping")
      .then((res) => {
        return axios.get(API_URL_CB + "/start-mapping"); 
      })
      .then((res) => {
        setmappingStatus(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const stopMapping = () => {
    axios
      .get("http://192.168.88.2:8888/stopMapping")
      .then((res) => {
        
      })
      .then((res) => {
        setmappingStatus(false);
      })
      .catch((err) => {
        console.log(err);
        setmappingStatus(false);
        return axios.get(API_URL_CB + "/stop-mapping")
      });
  };

  return (
    <>
      {mappingStatus ? (
        <button className="btn btn-warning" onClick={stopMapping}>
          {"STOP MAPPING"}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startMapping} disabled={scanningstatus}>
          {"START MAPPING"}
        </button>
      )}
    </>
  );
};

export default MappingModule;
