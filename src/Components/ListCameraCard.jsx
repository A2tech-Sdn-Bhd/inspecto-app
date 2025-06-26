import React from "react";
import { useNavigate } from "react-router-dom";

const ListCameraCard = ({ setCam }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="card bg-base-100 ms-4 card-compact">
        <div className="card-body ">
          <h2 className="card-title text-center justify-center">Camera</h2>
          <div className=" grid grid-row gap-2 ">
            <button
              className="btn btn-neutral btn-sm"
              onClick={() => {
                setCam(1);
              }}
            >
              {"Cam 1"}
            </button>
            <button
              className="btn btn-neutral btn-sm"
              onClick={() => {
                setCam(2);
              }}
            >
              {"Cam 2"}
            </button>
            <button
              className="btn btn-neutral btn-sm"
              onClick={() => {
                setCam(3);
              }}
            >
              {"Cam 3"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListCameraCard;
