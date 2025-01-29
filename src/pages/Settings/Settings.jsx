import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Profile updated:", { username, email });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Password updated:", { currentPassword, newPassword });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center">
      {isSubmitting && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20">
          <p className="text-white text-lg font-semibold">Submitting...</p>
        </div>
      )}
      <div className="bg-blue-400 bg-opacity-95 px-5 py-10 rounded-md shadow-md w-[90%] max-w-[400px] md:max-w-[350px] lg:w-[30%] relative">
        <Link to="/dashboard/tasks">
          <IoArrowBackCircleSharp className="text-black w-[40px] h-[40px] relative -top-2 cursor-pointer" />
        </Link>
        <h2 className="font-poppins font-bold text-xl text-center mb-6">
          Account Settings
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Update Profile</h3>
          <div className="flex items-center gap-2">
            <FaUser className="text-black" />
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="New Username"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-black" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="New Email"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <div className="flex items-center gap-2">
            <FaLock className="text-black" />
            <input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-green-300"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <FaLock className="text-black" />
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-green-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded-md shadow-md hover:bg-green-600 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
