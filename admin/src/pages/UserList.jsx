
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendURL } from "../App";

const UserList = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(backendURL + "/api/user/list", {
        headers: { token },
      });
      if (response.data.success) setUsers(response.data.users);
      else toast.error(response.data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeUser = async (id) => {
    try {
      const response = await axios.post(
        backendURL + "/api/user/remove",
        { id },
        { headers: { token } },
      );
      if (response.data.success) {
        toast.info(response.data.message);
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setEditData({ name: user.name, email: user.email });
    setShowModal(true);
  };

  const saveEdit = async () => {
    try {
      const response = await axios.post(
        backendURL + "/api/user/edit",
        { id: editId, name: editData.name, email: editData.email },
        { headers: { token } },
      );
      if (response.data.success) {
        toast.success("User updated");
        setShowModal(false);
        setEditId(null);
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <p className="mb-2">User List</p>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[2fr_3fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Name</b>
          <b>Email</b>
          <b className="text-center">Edit</b>
          <b className="text-center">Delete</b>
        </div>
        {users.map((user) => (
          <div
            key={user._id}
            className="grid grid-cols-[2fr_3fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <p>{user.name}</p>
            <p>{user.email}</p>
            <button
              className="text-center text-blue-600 underline"
              onClick={() => handleEdit(user)}
            >
              Edit
            </button>
            <button
              className="text-center text-red-600"
              onClick={() => removeUser(user._id)}
            >
              X
            </button>
          </div>
        ))}
      </div>
      {/* Modal Edit User */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow w-[350px]">
            <h3 className="mb-4 text-lg font-bold">Edit User</h3>
            <div className="mb-2">
              <label className="block mb-1">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={e => setEditData({ ...editData, email: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={saveEdit}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
