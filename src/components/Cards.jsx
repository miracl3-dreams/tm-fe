import React from "react";

const Cards = ({ children, className }) => {
  return (
    <>
      <div className={`${className} p-5 rounded-md`}>{children}</div>
    </>
  );
};

export default Cards;
