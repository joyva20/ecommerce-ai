import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, BACKEND_URL } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(BACKEND_URL + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success(`Welcome ${name}, We hope you enjoy your stay!`);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(BACKEND_URL + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          console.log(response.data)
          toast.success(`Welcome Back!`);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if(token)
    navigate("/")
  },[token])

  return (
    <form
      onSubmit={onSubmitHandler}
      className="m-auto mt-14 flex w-[90%] flex-col items-center gap-4 text-gray-800 sm:max-w-96"
    >
      <div className="mb-2 mt-10 inline-flex items-center gap-2">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="h-[1.5px] w-8 border-none bg-gray-800" />
      </div>
      {currentState === "Sign Up" ? (
        <input
          type="text"
          className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
          placeholder="Name"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      ) : (
        ""
      )}
      <input
        type="email"
        className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <input
        type="password"
        className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
        placeholder="Password"
        required
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <div className="mt-[-8px] flex w-full justify-between text-sm">
        <p 
          onClick={() => navigate("/forgot-password")}
          className="cursor-pointer hover:text-orange-900 active:text-gray-900"
        >
          Forgot your password?
        </p>
        {currentState === "Sign Up" ? (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer text-sm hover:text-orange-900 active:text-gray-900"
          >
            Login Here
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer text-sm hover:text-orange-900 active:text-gray-900"
          >
            Create Account
          </p>
        )}
      </div>
      <button className="mt-4 bg-black px-8 py-2 font-light text-white">
        {currentState === "Sign Up" ? "Sign Up" : "Sign in"}
      </button>
    </form>
  );
};

export default Login;
