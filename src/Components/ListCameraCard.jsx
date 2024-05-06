import React from "react";

const ListCameraCard = ({ setCam, setShowPtzCtrl }) => {
  return (
    <>
      <div className="card bg-base-100 shadow-xl mt-4 ms-4">
        <div className="card-body">
          <h2 className="card-title text-center justify-center">Camera Position Control</h2>
          <div className=" grid grid-row gap-2 ">
            <button
              className="btn btn-neutral btn-md"
              onClick={() => {
                setCam(1);
              }}
            >
              {"Cam 1"}
            </button>
            <button
              className="btn btn-neutral btn-md"
              onClick={() => {
                setCam(2);
              }}
            >
              {"Cam 2"}
            </button>
            <button
              className="btn btn-neutral btn-md"
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
