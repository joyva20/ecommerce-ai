import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const { navigate, BACKEND_URL } = useContext(ShopContext);
  const [currentStep, setCurrentStep] = useState("verify"); // verify | reset
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Monitor resetToken changes and persist to localStorage
  useEffect(() => {
    console.log("resetToken state changed:", resetToken);
    if (resetToken) {
      localStorage.setItem('forgotPasswordToken', resetToken);
      console.log("Token saved to localStorage");
    }
  }, [resetToken]);

  // On component mount, try to restore resetToken and currentStep from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('forgotPasswordToken');
    const savedStep = localStorage.getItem('forgotPasswordStep');
    
    if (savedToken && savedStep === 'reset') {
      console.log("Restored token from localStorage:", savedToken.substring(0, 20) + "...");
      setResetToken(savedToken);
      setCurrentStep('reset');
    }
  }, []);

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    
    if (!email || !username) {
      toast.error("Please enter both email and username");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(BACKEND_URL + "/api/user/forgot-password", {
        email: email.trim(),
        username: username.trim(),
      });

      if (response.data.success) {
        console.log("Reset token received:", response.data.resetToken);
        setResetToken(response.data.resetToken);
        setCurrentStep("reset");
        localStorage.setItem('forgotPasswordStep', 'reset');
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    console.log("=== RESET PASSWORD DEBUG ===");
    console.log("resetToken exists:", !!resetToken);
    console.log("resetToken length:", resetToken ? resetToken.length : 0);
    console.log("resetToken preview:", resetToken ? resetToken.substring(0, 50) + "..." : "null");
    console.log("newPassword exists:", !!newPassword);
    console.log("confirmPassword exists:", !!confirmPassword);

    if (!resetToken) {
      console.error("❌ No reset token found!");
      toast.error("Reset token is missing. Please start the process again.");
      setCurrentStep("verify");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length <= 8) {
      toast.error("Password must be longer than 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        resetToken,
        newPassword,
      };
      
      console.log("=== SENDING RESET REQUEST ===");
      console.log("URL:", BACKEND_URL + "/api/user/reset-password");
      console.log("Request data:", {
        resetToken: resetToken ? resetToken.substring(0, 50) + "..." : "null",
        newPassword: "***hidden***"
      });
      console.log("Full request data keys:", Object.keys(requestData));
      
      const response = await axios.post(BACKEND_URL + "/api/user/reset-password", requestData);

      console.log("=== RESET RESPONSE ===");
      console.log("Response:", response.data);

      if (response.data.success) {
        // Clear localStorage after successful reset
        localStorage.removeItem('forgotPasswordToken');
        localStorage.removeItem('forgotPasswordStep');
        toast.success(response.data.message);
        // Redirect to login page after successful reset
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("Reset failed:", response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("=== RESET ERROR ===");
      console.error("Error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data.message || "An error occurred while resetting password");
      } else {
        toast.error("Network error occurred while resetting password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to reset everything
  const resetEverything = () => {
    setCurrentStep("verify");
    setResetToken("");
    setEmail("");
    setUsername("");
    setNewPassword("");
    setConfirmPassword("");
    localStorage.removeItem('forgotPasswordToken');
    localStorage.removeItem('forgotPasswordStep');
    toast.info("Process reset. Please start again.");
  };

  return (
    <div className="m-auto mt-14 flex w-[90%] flex-col items-center gap-4 text-gray-800 sm:max-w-96">
      {/* Header dengan style yang sama seperti Login */}
      <div className="mb-2 mt-10 inline-flex items-center gap-2">
        <p className="prata-regular text-3xl">
          {currentStep === "verify" ? "Forgot Password" : "Reset Password"}
        </p>
        <hr className="h-[1.5px] w-8 border-none bg-gray-800" />
      </div>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-4 text-center">
        Step: {currentStep} | Token: {resetToken ? "✅ Available" : "❌ Missing"}
        {resetToken && <div>Token preview: {resetToken.substring(0, 20)}...</div>}
      </div>

      {currentStep === "verify" ? (
        // Step 1: Verify user by email and username - Style seperti Login
        <form onSubmit={handleVerifyUser} className="flex w-full flex-col gap-4">
          <input
            type="email"
            className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          {/* Info text dengan style yang konsisten */}
          <p className="text-sm text-gray-600 text-center mt-[-8px]">
            Enter your email and username to verify your account
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-black px-8 py-2 font-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </button>
        </form>
      ) : (
        // Step 2: Reset password - Style seperti Login
        <form onSubmit={handleResetPassword} className="flex w-full flex-col gap-4">
          <input
            type="password"
            className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
            placeholder="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="border-grat-800 w-full border bg-slate-100 px-3 py-2"
            placeholder="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Password requirements dengan style yang konsisten */}
          <div className="text-xs text-gray-600 mt-[-8px]">
            <p className="font-medium">Password requirements:</p>
            <p>• At least 8 characters long</p>
            <p>• Contains uppercase and lowercase letters</p>
            <p>• Contains numbers and symbols</p>
            {/* Debug info - hapus setelah testing */}
            {resetToken && (
              <p className="text-green-600 mt-2">✅ Reset token: {resetToken.substring(0, 20)}...</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-black px-8 py-2 font-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {/* Back to Login link dengan style yang sama */}
      <div className="mt-4 flex flex-col gap-2">
        <p
          onClick={() => navigate("/login")}
          className="cursor-pointer text-sm hover:text-orange-900 active:text-gray-900 text-center"
        >
          Back to Login
        </p>
        
        {/* Debug reset button */}
        <button
          onClick={resetEverything}
          className="text-xs text-gray-500 hover:text-red-600 underline"
        >
          Reset Process (Debug)
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
