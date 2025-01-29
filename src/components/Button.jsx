import React from "react";

const Button = ({
  className = "",
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
}) => {
  return (
    <button
      type={type}
      className={`${className} bg-black text-sm px-2 py-1 font-poppins text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={children}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;
