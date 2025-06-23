import React from "react";
import { useNavigate } from "react-router-dom";

const ListCameraCard = ({ setCam, showBtnBack }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="card bg-base-100 mt-4 ms-4">
        <div className="card-body">
          <h2 className="card-title text-center justify-center">Camera Position Control</h2>
          <div className=" grid grid-row gap-2 ">
            <button
              className="btn btn-neutral btn-md"
              onClick={() => {
                setCam(1);
              }}
            >
              {"Cam 1 (1)"}
            </button>
            <button
              className="btn btn-neutral btn-md"
              onClick={() => {
                setCam(2);
              }}
            >
              {"Cam 2 (2)"}
            </button>
            <button
              className="btn btn-neutral btn-md"
              onClick={() => {
                setCam(3);
              }}
            >
              {"Cam 3 (3)"}
            </button>
            {showBtnBack ? (
                          <button
                          className="btn btn-neutral btn-md"
                          onClick={() => {
                            navigate("/")
                          }}
                        >
                          {"BACK TO NORMAL MODE"}
                        </button>
            ):(<></>)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListCameraCard;
