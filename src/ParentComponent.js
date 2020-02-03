import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import ButtonComp from "./ButtonComp";
// import { withRouter } from "react-router-dom";

import "./App.css";

const a = [
  { id: 1, data: "first" },
  { id: 2, data: "second" },
  { id: 3, data: "third" },
  { id: 4, data: "forth" }
];

const ParentComponent = () => {
  const [open, toggleOpen] = useState(false);

  const toggleClick = () => {
    toggleOpen(!open);
  };

  // // useEffect(() => {
  // //   // if ()
  // //   fetchData(this.props.match.params.id);
  // // })
  // //
  // // componentDidMount() {
  // //   fetchData(this.props.match.params.id);
  // //   fetchMenuData();
  // // }
  // //
  // // componentDidUpdate(prevProps) {
  // //   if (prevProps.match.params.id !== this.props.match.params.id) {
  // //     fetchData(this.props.match.params.id);
  // //   }
  // }
  //
  const handleItemClick = id => {
    console.log("click", id);
    // this.props.history.push(`/users/${id}`);
  };

  const arrows = () => {
    return open ? <span>&gt;&gt;</span> : <span>&lt;&lt;</span>;
  };

  return (
    <div className="dropdown-wrapper">
      <div className="dropdown" onClick={toggleClick}>
        <span>WatchList</span>
        {arrows()}
      </div>
      <div className="parent">
        <Dropdown open={open}>
          {a.map(el => {
            return (
              <ButtonComp
                id={el.id}
                el={el.data}
                handleClick={handleItemClick}
              />
            );
          })}
        </Dropdown>
      </div>
    </div>
  );
};

export default ParentComponent;
