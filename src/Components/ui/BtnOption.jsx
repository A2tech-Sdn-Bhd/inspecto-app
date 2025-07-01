import Swal from "sweetalert2";
import { useCookies } from "react-cookie";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;
const BtnOption = () => {
  const [cookies, removeCookie] = useCookies(["token_app"]);
  const clearLocalStorageLogout = () => {
    const tripInformation = JSON.parse(localStorage.getItem("tripInformation"));
    if (tripInformation) {
      const tripID = tripInformation.tripID;
      const imgstoragekey = `imgSnapshot_${tripID}`;
      const timestoragekey = `endTime_${tripID}`;
      localStorage.removeItem(imgstoragekey);
      localStorage.removeItem(timestoragekey);
      localStorage.removeItem("generatepdfyet");
      localStorage.removeItem("tripInformation");
    }
  };
  const restartService = () => {
    let date = new Date();
    date = date.toLocaleString();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to restart the service?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.get(`${API_URL}/restart`, {
          date: date,
        });
      }
    });
  };

  const shutdownInspecto = () => {
    let date = new Date();
    date = date.toLocaleString();
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to shutdown the Inspecto?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        removeCookie("token_app", "");
        clearLocalStorageLogout();
        axios.get(`${API_URL}/shutdown`, {
          date: date,
        });
      }
    });
  };
  return (
    <details className="dropdown">
      <summary className="m-1 btn btn-neutral">Option</summary>
      <ul className="dropdown-content z-[1] menu p-2 shadow btn-neutral rounded-box w-52">
        {/* <li>
                  <a className="bg-base-900 hover:bg-slate-700 text-white hover:text-slate-300">
                    View Subscription Status
                  </a>
                </li> */}
        <li>
          <a
            onClick={restartService}
            className="bg-base-900 hover:bg-slate-700 text-white hover:text-slate-300"
          >
            Restart Inspecto
          </a>
        </li>
        <li>
          <a
            className="bg-red-700 text-black hover:bg-red-600"
            onClick={shutdownInspecto}
          >
            Shutdown Inspecto
          </a>
        </li>
      </ul>
    </details>
  );
};
export default BtnOption;
