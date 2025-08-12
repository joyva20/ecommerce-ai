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

  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUppercase: false,
    hasSymbol: false
  });

  // Monitor resetToken changes and persist to localStorage
  useEffect(() => {
    if (resetToken) {
      localStorage.setItem('forgotPasswordToken', resetToken);
    }
  }, [resetToken]);

  // Password validation effect
  useEffect(() => {
    if (newPassword) {
      setPasswordChecks({
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
      });
    } else {
      setPasswordChecks({
        minLength: false,
        hasUppercase: false,
        hasSymbol: false
      });
    }
  }, [newPassword]);

  // On component mount, try to restore resetToken and currentStep from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('forgotPasswordToken');
    const savedStep = localStorage.getItem('forgotPasswordStep');
    
    if (savedToken && savedStep === 'reset') {
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
        setResetToken(response.data.resetToken);
        setCurrentStep("reset");
        localStorage.setItem('forgotPasswordStep', 'reset');
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetToken) {
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

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Check all password requirements
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasMinLength || !hasUppercase || !hasSymbol) {
      toast.error("Password must meet all requirements");
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        resetToken,
        newPassword,
      };
      
      const response = await axios.post(BACKEND_URL + "/api/user/reset-password", requestData);

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
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
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
    <form
      onSubmit={currentStep === "verify" ? handleVerifyUser : handleResetPassword}
      className="m-auto mt-14 flex w-[90%] flex-col items-center gap-4 text-gray-800 sm:max-w-96"
    >
      <div className="mb-2 mt-10 inline-flex items-center gap-2">
        <p className="prata-regular text-3xl">
          {currentStep === "verify" ? "Forgot Password" : "Reset Password"}
        </p>
        <hr className="h-[1.5px] w-8 border-none bg-gray-800" />
      </div>

      {currentStep === "verify" ? (
        <>
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
          
          <p className="mt-[-8px] text-sm text-gray-600 text-center">
            Enter your email and username to verify your account
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-black px-8 py-2 font-light text-white disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </button>
        </>
      ) : (
        <>
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

          {/* Password requirements checklist */}
          <div className="mt-2 text-sm text-gray-600 w-full">
            <p className="font-medium mb-2">Password requirements:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${passwordChecks.minLength ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordChecks.minLength ? '✅' : '❌'}
                </span>
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${passwordChecks.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordChecks.hasUppercase ? '✅' : '❌'}
                </span>
                <span>At least one uppercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${passwordChecks.hasSymbol ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordChecks.hasSymbol ? '✅' : '❌'}
                </span>
                <span>At least one symbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-black px-8 py-2 font-light text-white disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </>
      )}

      {/* Back to Login link - sama seperti di Login page */}
      <div className="mt-4 flex w-full justify-between text-sm">
        <p
          onClick={() => navigate("/login")}
          className="cursor-pointer hover:text-orange-900 active:text-gray-900"
        >
          Back to Login
        </p>
        <p
          onClick={resetEverything}
          className="cursor-pointer text-gray-400 hover:text-red-600"
        >
          Start Over
        </p>
      </div>
    </form>
  );
};

export default ForgotPassword;