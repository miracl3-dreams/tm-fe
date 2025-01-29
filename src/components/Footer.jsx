import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white text-center py-4 w-full">
      <div className="container mx-auto px-4">
        <p className="text-sm sm:text-base">
          &copy; {new Date().getFullYear()} Task Management. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
