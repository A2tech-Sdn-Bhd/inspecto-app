import React from "react";
import { useState, useEffect } from "react";
import LaserModule from "../Components/LaserModule";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
const ListModuleCard = ({ setCam, setShowPtzCtrl, showAuto, setShowAuto }) => {
  const [crackDetectionAccess, setCrackDetectionAccess] = useState(false);
  const [mappingModuleAccess, setMappingModuleAccess] = useState(false);
  const [ptzModuleAccess, setPtzModuleAccess] = useState(false);
  const [LaserModuleAccess, setLaserModuleAccess] = useState(false);
  const [cleanModuleAccess, setCleanModuleAccess] = useState(false);
  const [generateReportAccess, setGenerateReportAccess] = useState(false);

  const [cookies, removeCookie] = useCookies(["token_app"]);
  const navigate = useNavigate();
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
  return (
    <>
      <div className="card bg-base-100 shadow-xl  me-4">
        <div className="card-body">
          <h2 className="card-title justify-center">List of Module</h2>
          <div className="mt-2 grid grid-row gap-2 ">
            {crackDetectionAccess ? (
              <button
                className="btn btn-block btn-neutral"
                onClick={() => {
                  navigate("/crackdetection");
                }}
              >
                Crack Detection
              </button>
            ) : (
              <></>
            )}
            {mappingModuleAccess ? (
              <button
                className="btn btn-block btn-neutral"
                onClick={() => {
                  navigate("/mapping");
                }}
              >
                Lidar
              </button>
            ) : (
              <></>
            )}
            {/* {ptzModuleAccess ? (
              <button
                className="btn btn-block btn-neutral"
                onClick={() => {
                  navigate("/ptz");
                }}
              >
                PTZ Controller
              </button>
            ) : (
              <></>
            )} */}

            {LaserModuleAccess ? (
              <button
              className="btn btn-block btn-neutral"
              onClick={() => {
                navigate("/laser");
              }}
            >
              Laser
            </button>              
            ) : (
              <></>
            )}
            {cleanModuleAccess ? (
              <button
                className="btn btn-block btn-neutral"
                onClick={() => {
                  navigate("/cleaning");
                }}
              >
                Cleaning
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListModuleCard;
