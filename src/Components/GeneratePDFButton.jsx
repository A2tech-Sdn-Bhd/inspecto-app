import React from "react";
const GeneratePDFButton = ({handleGeneratePDF, showBtnStartTrip, generateReportAccess }) => {
  return (
    <>
    {generateReportAccess ? (
          showBtnStartTrip ? (
            <button className="btn btn-primary btn-sm" onClick={handleGeneratePDF}>
            Generate PDF
          </button>
          ):(
            <button className="btn text-neutral btn-sm"  disabled="disabled" onClick={handleGeneratePDF}>
              Generate PDF
            </button>
          )
    ):(
      showBtnStartTrip ? (
        <button className="btn btn-primary btn-sm" disabled="disabled">
        Generate PDF
      </button>
      ):(
        <button className="btn text-neutral btn-sm"  disabled="disabled">
          Generate PDF
        </button>
      )
    )}
    </>
  );
};

export default GeneratePDFButton;