import React from "react";
const GeneratePDFButton = ({handleGeneratePDF, showBtnStartTrip}) => {

  return (
    <>
    {showBtnStartTrip ? (
      <button className="btn btn-primary" onClick={handleGeneratePDF}>
      Generate PDF
    </button>
    ):(
      <button className="btn text-neutral"  disabled="disabled" onClick={handleGeneratePDF}>
        Generate PDF
      </button>
    )}
    </>
  );
};

export default GeneratePDFButton;