import React from "react";

export default ({ handleClick, id, el }) => {
  return <div onClick={() => handleClick(id)}>{el}</div>;
};
