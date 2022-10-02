import React from "react";

const Background = () => {
  return (
    <div className="absolute top-0 -z-10 h-screen w-screen bg-[#1F1F1F]">
      <div
        className="absolute top-0 right-0 -z-10 h-full w-full animate-pulse bg-cover"
        style={{ backgroundImage: `url(./background.svg)` }}
      ></div>
    </div>
  );
};

export default Background;
