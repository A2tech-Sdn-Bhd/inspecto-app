import React from "react";
const GeneratePDFButton = ({handleGeneratePDF, showBtnStartTrip, generateReportAccess }) => {
  return (
    <>
    {generateReportAccess ? (
          showBtnStartTrip ? (
            <button className="btn btn-primary" onClick={handleGeneratePDF}>
            Generate PDF
          </button>
          ):(
            <button className="btn text-neutral"  disabled="disabled" onClick={handleGeneratePDF}>
              Generate PDF
            </button>
          )
    ):(
      showBtnStartTrip ? (
        <button className="btn btn-primary" disabled="disabled">
        Generate PDF
      </button>
      ):(
        <button className="btn text-neutral"  disabled="disabled">
          Generate PDF
        </button>
      )
    )}
    </>
  );
};

export default GeneratePDFButton;