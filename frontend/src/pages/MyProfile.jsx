import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editPhoto, setEditPhoto] = useState(false);

  useEffect(() => {
    axios.get("/api/user/profile", { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

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
      await axios.post("/api/user/upload-photo", formData, { withCredentials: true });
      setEditPhoto(false);
      setProfilePic(null);
      setPreview(null);
      // Refresh user data
      const res = await axios.get("/api/user/profile", { withCredentials: true });
      setUser(res.data);
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      toast.error("Upload failed");
    }
    setLoading(false);
  };

  const handlePhotoCancel = () => {
    setProfilePic(null);
    setPreview(null);
    setEditPhoto(false);
  };

  const handlePasswordChange = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await axios.post("/api/user/change-password", { password }, { withCredentials: true });
      toast.success("Password updated successfully!");
      setPassword("");
    } catch (err) {
      toast.error("Update failed");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    setLoading(true);
    try {
      // Kirim request ke backend untuk hapus user
      const token = localStorage.getItem("token");
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/user/remove",
        { id: user._id },
        { headers: { token } }
      );
      if (response.data.success) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert(response.data.message || "Delete failed");
      }
    } catch (err) {
      alert("Delete failed");
    }
    setLoading(false);
  };

  if (!user) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || user.photo || "/default-profile.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 mb-2"
          />
          {editPhoto ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePhotoSave}
                  disabled={loading || !profilePic}
                  className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handlePhotoCancel}
                  disabled={loading}
                  className="px-4 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setEditPhoto(true)}
              className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {user.photo ? "Change Photo" : "Add Photo"}
            </button>
          )}
        </div>
        <div className="w-full mb-6">
          <div className="mb-2">
            <span className="font-bold">Email:</span> {user.email}
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
