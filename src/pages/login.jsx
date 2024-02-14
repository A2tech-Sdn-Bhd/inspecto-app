import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/a2tech.png";
import { useCookies } from "react-cookie";
const API_URL = import.meta.env.VITE_API_URL_INSPECTO;

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    username: "",
    password: "",
  });
  const { username, password } = inputValue;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [cookies, removeCookie] = useCookies(["token_app"]);
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };
  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }
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
        return status
          ? navigate("/")
          : (
            console.log(""));
      }
    };

    verifyCookie();
  }, [cookies, navigate, removeCookie]);

  const handleError = (err) =>
    toast.error(err, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // check if username and password is empty
      if (!username || !password) {
        handleError("Please fill all the fields");
        if (!username) {
          document.getElementById("username").classList.add("input-error");
          document.getElementById("username").focus();
        } else {
          document.getElementById("username").classList.remove("input-error");
        }
        if (!password) {
          document.getElementById("password").classList.add("input-error");
          document.getElementById("password").focus();
        } else {
          document.getElementById("password").classList.remove("input-error");
        }
        return;
      } else {
        document.getElementById("username").classList.remove("input-error");
        document.getElementById("password").classList.remove("input-error");
      }
      let date = new Date();
        date.setTime(date.getTime() + 60 * 60 * 1000);
      const { data } = await axios.post(
        
        API_URL + "/signin",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      console.log(data);
      const { success, message, status, email, usernameVld} = data;
      console.log(success);
      if (success && status == 1) {
        localStorage.setItem("username",usernameVld);
        localStorage.setItem("email",email);

        handleSuccess(message);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      handleError(error.response.data.message);
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      username: "",
      password: "",
    });
  };
  return (
    <div>
      <div
        id="login-form"
        className="relative flex flex-col justify-center h-screen overflow-hidden bg-gray-200"
      >
        <div className="w-full p-6 m-auto bg-white rounded-xl shadow-md lg:max-w-lg transition-all duration-500 ease-in-out">
          <img src={logo} alt="" />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label">
                <span className="text-base label-text">Username</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleOnChange}
                placeholder="Username"
                className="w-full input input-bordered input-primary bg-white text-black"
              />
            </div>
            <div>
              <label className="label">
                <span className="text-base label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter Password"
                  className="input input-bordered input-primary bg-white text-black w-full"
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
                  onClick={togglePasswordVisibility}
                  type="button"
                >
                  {isPasswordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* <div class="text-sm text-end">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div> */}
            <div>
              <button className="btn btn-primary btn-block">Login</button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
