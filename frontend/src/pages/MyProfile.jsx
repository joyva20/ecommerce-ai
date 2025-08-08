import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const MyProfile = () => {
  const { token, BACKEND_URL, refreshProfilePhoto } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editPhoto, setEditPhoto] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view profile");
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user-profile/profile`, {
          headers: { token }
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      }
    };
    
    fetchProfile();
  }, [token, BACKEND_URL]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePhotoSave = async () => {
    if (!profilePic) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("photo", profilePic);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/user-profile/upload-photo`, formData, {
        headers: { 
          token,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Get the updated user data with new photo URL
      const updatedProfile = await axios.get(`${BACKEND_URL}/api/user-profile/profile`, {
        headers: { token }
      });
      
      // Update user state with new photo - add cache busting
      const newUser = { 
        ...updatedProfile.data,
        photo: updatedProfile.data.photo ? `${updatedProfile.data.photo}?t=${Date.now()}` : null
      };
      setUser(newUser);
      
      // Reset form states
      setEditPhoto(false);
      setProfilePic(null);
      setPreview(null);
      
      // Refresh profile photo in navbar
      if (refreshProfilePhoto) {
        await refreshProfilePhoto();
      }
      
      toast.success("Profile photo updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Upload failed");
    }
    setLoading(false);
  };

  const handlePhotoCancel = () => {
    setProfilePic(null);
    setPreview(null);
    setEditPhoto(false);
  };

  const handlePasswordChange = async () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/user-profile/change-password`, 
        { password }, 
        { headers: { token } }
      );
      toast.success("Password updated successfully!");
      setPassword("");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.error || "Password update failed");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/user-profile/delete`, {
        headers: { token }
      });
      
      localStorage.removeItem("token");
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Delete failed");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your profile</p>
          <a href="/login" className="bg-black text-white px-6 py-2 rounded">
            Login
          </a>
        </div>
      </div>
    );
  }

  if (!user) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || (user.photo ? user.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random&color=fff&size=200`)}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 mb-2"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random&color=fff&size=200`;
            }}
            key={user.photo} // Force re-render when photo changes
          />
          {editPhoto ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mb-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePhotoSave}
                  disabled={loading || !profilePic}
                  className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handlePhotoCancel}
                  disabled={loading}
                  className="px-4 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setEditPhoto(true)}
              className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              {user.photo ? "Change Photo" : "Add Photo"}
            </button>
          )}
        </div>
        <div className="w-full mb-6">
          <div className="mb-2">
            <span className="font-bold">Name:</span> {user.name || "Not set"}
          </div>
          <div className="mb-2">
            <span className="font-bold">Email:</span> {user.email}
          </div>
          <div className="mb-2">
            <span className="font-bold">Member since:</span> {new Date(user.date || user.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="w-full mb-6 flex flex-col gap-2">
          <label className="font-bold">Change Password</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handlePasswordChange}
              disabled={loading || !password}
              className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Save"}
            </button>
          </div>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="mt-2 text-red-600 hover:underline"
          disabled={loading}
        >
          {loading ? "Processing..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
