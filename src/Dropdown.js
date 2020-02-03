import React from "react";

import "./App.css";

export default ({ children, open }) => {
  if (open) {
    return <div className="child">{children}</div>;
  } else {
    return null;
  }
};
