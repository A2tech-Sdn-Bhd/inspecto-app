import React from "react";
import { Modal, Accordion } from "react-daisyui";
import { useState } from "react";
import Swal from "sweetalert2";
const ReportForm = ({
  showForm,
  setShowForm,
  tripNamePrevious,
  inspectoNamePrevious,
  tripTypePrevious,
  placePrevious,
  setShowBtnEndTrip,
  setShowBtnStartTrip,
  handleUseButton,
  showFormLogin,
  setShowFormLogin,
}) => {
  const [tripName, settripName] = useState("");
  const [inspectoName, setinspectorName] = useState("");
  const [place, setplace] = useState("");
  const [tripType, settripType] = useState("unselect");
  const handletripName = (e) => {
    settripName(e.target.value);
  };
  const handleInspectorName = (e) => {
    setinspectorName(e.target.value);
  };
  const handlePlace = (e) => {
    setplace(e.target.value);
  };
  const handleTripType = (e) => {
    settripType(e.target.value);
  };

  const buttonStyle = {
    marginTop: "10px",
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (tripName && inspectoName && place && tripType != "unselect") {
      const tripID = Math.floor(Math.random() * 1000000000);

      const date = new Date();

      const dateTime = date.toLocaleString();
      const time = date.toLocaleTimeString();
      localStorage.setItem(
        "tripInformation",
        JSON.stringify({
          tripID: tripID,
          tripName: tripName,
          inspectoName: inspectoName,
          place: place,
          tripType: tripType,
          dateTime: dateTime,
          time: time,
        })
      );
      setShowFormLogin(false);
      setShowForm(false);
      Swal.fire("Started!", "Your trip has been started.", "success");
      setShowBtnEndTrip(false);
      setShowBtnStartTrip(true);
      localStorage.setItem("tripStatus", false);
    } else {
      // At least one required field is empty, show error message

      alert("Please fill in all required fields.");
    }
  };
  const handleUsePreviousTrip = () => {
    const tripID = Math.floor(Math.random() * 1000000000);
    const date = new Date();
    // get datetime
    const dateTime = date.toLocaleString();
    const time = date.toLocaleTimeString();
    localStorage.setItem(
      "tripInformation",
      JSON.stringify({
        tripID: tripID,
        tripName: tripNamePrevious,
        inspectoName: inspectoNamePrevious,
        place: placePrevious,
        tripType: tripTypePrevious,
        dateTime: dateTime,
        time: time,
      })
    );
    setShowForm(false);
    Swal.fire(
      "Started!",
      "Your trip has been started with using previous information.",
      "success"
    );
    localStorage.setItem("tripStatus", "False");
    setShowBtnEndTrip(false);
    setShowBtnStartTrip(true);
  };

  return (
    <div>
      <Modal open={showForm}>
        <Modal.Body>
          <div>
            {handleUseButton ? (
              <Accordion className="  collapse border-2 mb-2">
                {" "}
                <Accordion.Title className=" text-xl font-medium">
                  Use Previous Trip Information
                </Accordion.Title>
                <Accordion.Content>
                  <p>Trip Name: {tripNamePrevious}</p>
                  <p>Inspector Name: {inspectoNamePrevious}</p>
                  <p>Location: {placePrevious}</p>
                  <p>Trip Type: {tripTypePrevious}</p>
                  <button
                    type="submit"
                    className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    style={buttonStyle}
                    onClick={handleUsePreviousTrip}
                  >
                    Use
                  </button>
                </Accordion.Content>
              </Accordion>
            ) : (
              <></>
            )}
            <Accordion className="collapse border-2 ">
              <Accordion.Title className=" text-xl font-medium">
                Use New Trip Information
              </Accordion.Title>
              <Accordion.Content>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 text-black font-bold text-lg">
                    Please Enter Trip Information
                  </div>
                  <input
                    className="bg-primary-50 border border-primary-300 text-black text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block w-full p-2.5 dark:bg-primary-700 dark:border-primary-600 dark:placeholder-primary-400 dark:text-black dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                    type="text"
                    value={tripName}
                    onChange={handletripName}
                    placeholder="Enter Trip Name"
                  />
                  <br />
                  <input
                    className="bg-primary-50 border border-primary-300 text-black text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block w-full p-2.5 dark:bg-primary-700 dark:border-primary-600 dark:placeholder-primary-400 dark:text-black dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                    type="text"
                    value={inspectoName}
                    onChange={handleInspectorName}
                    placeholder="Enter Inspector Name"
                  />
                  <br />
                  <input
                    className="bg-primary-50 border border-primary-300 text-black text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block w-full p-2.5 dark:bg-primary-700 dark:border-primary-600 dark:placeholder-primary-400 dark:text-black dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                    type="text"
                    value={place}
                    onChange={handlePlace}
                    placeholder="Enter Location Name"
                  />
                  <br />
                  <select
                    className="select select-bordered w-full max-w-xs"
                    value={tripType}
                    onChange={handleTripType}
                    defaultValue="Trip Type"
                  >
                    <option disabled value="unselect">
                      Trip Type
                    </option>
                    <option value="Inspection">Inspection</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                  <br />
                  <button
                    type="submit"
                    className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    style={buttonStyle}
                  >
                    Submit
                  </button>
                </form>
              </Accordion.Content>
            </Accordion>
          </div>
        </Modal.Body>
      </Modal>
      <Modal open={showFormLogin}>
        <Modal.Body>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-black font-bold text-lg">
                Please Enter Trip Information
              </div>
              <input
                className="bg-primary-50 border border-primary-300 text-black text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block w-full p-2.5 dark:bg-primary-700 dark:border-primary-600 dark:placeholder-primary-400 dark:text-black dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                type="text"
                value={tripName}
                onChange={handletripName}
                placeholder="Enter Trip Name"
              />
              <br />
              <input
                className="bg-primary-50 border border-primary-300 text-black text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block w-full p-2.5 dark:bg-primary-700 dark:border-primary-600 dark:placeholder-primary-400 dark:text-black dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                type="text"
                value={inspectoName}
                onChange={handleInspectorName}
                placeholder="Enter Inspector Name"
              />
              <br />
              <input
                className="bg-primary-50 border border-primary-300 text-black text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block w-full p-2.5 dark:bg-primary-700 dark:border-primary-600 dark:placeholder-primary-400 dark:text-black dark:focus:ring-secondary-500 dark:focus:border-secondary-500"
                type="text"
                value={place}
                onChange={handlePlace}
                placeholder="Enter Location Name"
              />
              <br />
              <select
                className="select select-bordered w-full max-w-xs"
                value={tripType}
                onChange={handleTripType}
                defaultValue="Trip Type"
              >
                <option disabled value="unselect">
                  Trip Type
                </option>
                <option value="Inspection">Inspection</option>
                <option value="Cleaning">Cleaning</option>
              </select>
              <br />
              <button
                type="submit"
                className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                style={buttonStyle}
              >
                Submit
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReportForm;
