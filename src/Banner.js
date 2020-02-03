import React from "react";
import "./App.css";


const Banner = ({ bannerData, top, left, bannerWidth }) => {

  console.log("top ", top);
  console.log("left ", left);
  return (
    <div style={{ width: `${bannerWidth}px`, top: `${top}px`, left: `${left}px` }} className="banner">
      {bannerData.series[0].balance}
    </div>
  );
};

export default Banner;
