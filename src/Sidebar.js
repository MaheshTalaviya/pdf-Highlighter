// @flow

import { React, useState, useContext } from "react";
import InputRange from "react-input-range";
import printJS from "print-js";
import { Link } from "react-router-dom";
import BookMarkChild from "./ChildBookmark"

import type { T_Highlight } from "react-pdf-highlighter/src/types";


import "./style/App.css";
import {Accordion,Card,Button,useAccordionToggle,AccordionContext} from 'react-bootstrap'
type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  resetHighlights: () => void,
  toggleDocument: () => void,
};

const updateHash = (highlight) => {
  
  document.location.hash = `highlight-${highlight.id}`;
};

function Sidebar({
  highlights,
  toggleDocument,
  resetHighlights,
  rangeSlider,
  range,
  URl,
  setRange,
  getRange,
  errMsg,
  bookMarks,
  scrollTo,
}: Props) {
 function ContextAwareToggle({ children, eventKey, callback }) {
   const currentEventKey = useContext(AccordionContext);

   const decoratedOnClick = useAccordionToggle(
     eventKey,
     () => callback && callback(eventKey)
   );

   const isCurrentEventKey = currentEventKey === eventKey;

   return (
     <button
       type="button" className="cust-button"
       style={{
         transform: isCurrentEventKey ? "rotate(90deg)" : "rotate(0deg)",
       }}
       onClick={decoratedOnClick}
     >
       {children}
     </button>
   );
 }
  return (
    <div className="sidebar" id="sideBlock" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "black" }}>
          {" "}
          PDF Highlighter
        </h2>
  
        <small>Select highlight range</small>
        <br />0
        <input
          style={{ marginBottom: "10px" }}
          type="range"
          min="0"
          max="100"
          value={range.toString()}
          onChange={rangeSlider}
        ></input>
        {range.toString()}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="number"
            id="dynamicRange"
            min="1"
            max="100"
            onChange={getRange}
            value={range.toString()}
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "10px",
              display: "none",
            }}
          />
          <button
            type="button"
            style={{ display: "none", marginBottom: "5px" }}
            onClick={setRange}
          >
            submit
          </button>
          <small style={{ fontSize: "12px", color: "red" }}>{errMsg}</small>
          <button
            style={{
              padding: " 4px 11px",
              display: " block",
              marginTop: "25px",
              borderRadius: "3px",
              border: "1px solid #c1c1c1",
            }}
            type="button"
            onClick={() => {
         
              printJS({
                printable: URl,
                type: "pdf",
                showModal: true,
              });
            }}
          >
            Print
          </button>
        </div>
        
     
        {bookMarks != "" ? (
          <h5 style={{ marginBottom: "1rem", color: "black" }}> BookMarks</h5>
        ) : null}
        {bookMarks != ""
          ? bookMarks.map((element, index) => (
              <Accordion>
                <Card>
                  <Card.Header>
                    {element?.subChapters?.length > 0 && (
                      <ContextAwareToggle
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                        }}
                       
                        eventKey={index}
                      >
                        <span>&#10148;</span>
                      </ContextAwareToggle>
                    )}

                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        scrollTo({
                          position: {
                            pageNumber: element.pageNumber,
                            boundingRect: {
                              height: 1800,
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
                      {element.title}
                    </span>
                  </Card.Header>
                  <Accordion.Collapse eventKey={index}>
                    <Card.Body>
                      {element ?.subChapters?.map((elements) => (
                        <BookMarkChild
                          childBookmark={elements}
                          scrollTo={scrollTo}
                        />
                      ))}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))
          : [].map((element, index) => (
              <Accordion>
                <Card>
                  <Card.Header>
                    {element?.subChapters.length > 0 && (
                      <Accordion.Toggle
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                        }}
                        eventKey={index}
                      >
                        <span>&#10148;</span>
                      </Accordion.Toggle>
                    )}

                    <span
                      onClick={() => {
                        scrollTo({
                          position: {
                            pageNumber: element.pageNumber,
                            boundingRect: {
                              height: 1800,
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
                      {element.title}
                    </span>
                  </Card.Header>
                  <Accordion.Collapse eventKey={index}>
                    <Card.Body>
                      {element.subChapters?.map((elements) => (
                        <BookMarkChild
                          childBookmark={elements}
                          scrollTo={scrollTo}
                        />
                      ))}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))}
      </div>
      <div style={{ padding: "1rem" }}>
        {/* <button onClick={toggleDocument}>Toggle PDF document</button> */}
      </div>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          {/* <button onClick={resetHighlights}>Reset highlights</button> */}
        </div>
      ) : null}{" "}
    </div>
  );
}

export default Sidebar;
