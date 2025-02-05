import { useState } from "react";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };

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
        />
      ) : (
        ""
      )}
      <input
        type="email"
        className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
        placeholder="Email"
        required
      />
      <input
        type="password"
        className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
        placeholder="Password"
        required
      />
      <div className="mt-[-8px] flex w-full justify-between text-sm">
        <p className="cursor-pointer hover:text-orange-900 active:text-gray-900">
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
