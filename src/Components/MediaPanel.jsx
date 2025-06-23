import GeneratePDFButton from "../Components/GeneratePDFButton";
import { Button } from "react-daisyui";

const MediaPanel = ({
  isRecording,
  setIsRecording,
  showBtnStartTrip,
  generateReportAccess,
  canvasRef,
  mediaRecorder
}) => {

  const downloadImage = () => {
    const date = new Date();
    let name = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}.jpg`;
    // console.log(name);
    const imgDataUrl = canvasRef.current.toDataURL("image/jpeg", 1);
    fetch(imgDataUrl).then((r) => {
      r.blob().then((blob) => {
        // console.log(r);
        saveAs(blob, name);
      });
    });
    const imgReport = imgDataUrl.replace(/^data:image\/jpg;base64,/, "");
    const tripInformation = JSON.parse(localStorage.getItem("tripInformation"));
    const tripID = tripInformation.tripID;
    const imgID = Math.floor(Math.random() * 1000000000);
    const imgdata = [[imgID, imgReport, odometerValue]];
    console.log("odom" + odometerValue);
    const isImgSnapshotExists =
      localStorage.getItem(`imgSnapshot_${tripID}`) !== null;
    if (isImgSnapshotExists) {
      const newdata = imgdata;

      let existdata = [[]];
      existdata = JSON.parse(localStorage.getItem(`imgSnapshot_${tripID}`)) || [
        [],
      ];
      existdata.push(newdata[0]);
      localStorage.setItem(`imgSnapshot_${tripID}`, JSON.stringify(existdata));

      // console.log("imgsnapshot key exists.");
    } else {
      localStorage.setItem(`imgSnapshot_${tripID}`, JSON.stringify(imgdata));
      // console.log("imgsnapshot key does not exist.");
    }
  };
  const handleGeneratePDF = async (e) => {
    window.open("/generatepdf", "_blank");
    setgeninput({
      ...geninput,
      n: "",
    });
    localStorage.setItem("generatepdfyet", true);
    localStorage.setItem("chart_data", JSON.stringify(realtimeData));
  };
  return (
    <div className="card bg-base-100 mt-4 ms-4">
      <div className="card-body">
        <h2 className="card-title justify-center">Media Capture Menu</h2>
        <div className="mt-2 grid grid-row gap-2 ">
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-neutral" onClick={downloadImage}>
              {"Snapshot"}
            </button>
            <Button
              color={isRecording ? "error" : "neutral"}
              onClick={() => {
                if (!isRecording) {
                  setIsRecording(true);
                  mediaRecorder.start();
                } else {
                  setIsRecording(false);
                  mediaRecorder.stop();
                }
              }}
            >
              {!isRecording && "Record"}
              {isRecording && "Stop"}
            </Button>
          </div>
          <GeneratePDFButton
            handleGeneratePDF={handleGeneratePDF}
            showBtnStartTrip={showBtnStartTrip}
            generateReportAccess={generateReportAccess}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaPanel;
