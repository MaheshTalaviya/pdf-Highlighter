import React, { Component } from "react";

function bookmark({ childBookmark, scrollTo }) {
 
  return (
   
      <li 
        style={{ cursor: "pointer",fontSize: "15px",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden" }}
        onClick={() => {
            scrollTo({
              position: {
                pageNumber: childBookmark.pageNumber,
                boundingRect: {
                  height: 1500,
                  width: 809.9999999999999,
                  x1: 255.73419189453125,
                  x2: 774.372314453125,
                  y1: 139.140625,
                  y2: 165.140625,
                },
              },
            });
        
        }}
      >
        {childBookmark.title}
      </li>
  
  );
}
export default bookmark
