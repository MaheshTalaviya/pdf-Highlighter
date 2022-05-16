// @flow
/* eslint import/no-webpack-loader-syntax: 0 */

import React, { Component, createContext, createRef } from "react";
import PDFWorker from "worker-loader!pdfjs-dist/lib/pdf.worker";
import axios from "axios";
import reactRouterDom, { Link } from "react-router-dom";
import printJS from "print-js";
import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight,
  setPdfWorker,
} from "react-pdf-highlighter";

//import testHighlights from "./test-highlights";

import Spinner from "./Spinner";
import Sidebar from "./Sidebar";
import { pdfjs } from "react-pdf";

import type {
  T_Highlight,
  T_NewHighlight,
} from "react-pdf-highlighter/src/types";

import "./style/App.css";

setPdfWorker(PDFWorker);

type Props = {};

type State = {
  url: string,
  highlights: Array<T_Highlight>,
};

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({ comment }) =>
  "" ? (
    <div className="Highlight__popup">
      {""} {"comment.text"}
    </div>
  ) : (
    ""
  );

const PRIMARY_PDF_URL = "";
//   "http://projects.discussion4all.com/CRM/FeatureBasedTextSummarization_11.pdf";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480.pdf";

const searchParams = new URLSearchParams(document.location.search);

const initialUrl = searchParams.get("url");
class App extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.rangeChange = this.rangeChange.bind(this);
    this.getRange = this.getRange.bind(this);
    this.setRange = this.setRange.bind(this);
    this.myRef = React.createRef();
  }
  state = {
    url: initialUrl,
    highlights: [],
    rangeValue: 25,
    apiArr: [],
    dynamicRangeTExt: "",
    errMsg: "",
    bookMarks: "",
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: [],
    });
  };

  async outlineParse(outline,e,pdf) { 
   
       if (outline === "string") {
         var results = await pdf.getDestination(e.dest).then((lookingFor) => {
           return lookingFor;
         });
         return results[0];
       }
       if (outline === "object") {
        
           
           return e.dest[0];
        

       }
  }
  
  scrollViewerTo = (highlight: any) => {};
  async componentDidMount() {
    const {
      match: { params },
    } = this.props;

    let response = await fetch(
      "http://3.217.90.11/compact/" + params.id + "/?format=json",
      {
        mode: "cors",
      }
    );
    var data = await response.json();

    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
    window.onbeforeprint = function (e) {
      window.getElementsByClassName("cancel-button").click();
    };
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

    var list = data;
    const task = pdfjs.getDocument(list.URL);
    task.promise.then((pdf) => {
      pdf.getOutline().then(async (outline) => {
      
        var bookmarks = [];
        console.log(outline)
        if (outline) {
        
        
          

            
            bookmarks = await Promise.all(
              await outline?.map(async (e) => {
                if (e.dest !== null) {
                  if (e.dest[0] !== null) {
                    
                    var result = await this.outlineParse(
                      typeof outline[0].dest,
                      e,
                      pdf
                    );

                    var pageNumber = await pdf
                      .getPageIndex(result)
                      .then((res) => {
                        return res + 1;
                      });
                  } else { 
                      
                    pageNumber=1
                  }

                 
                  var subArr = await Promise.all(
                    await e.items?.map(async (e) => {
                      var resultSub = await this.outlineParse(
                        typeof e.dest[0],
                        e,
                        pdf
                      );

                      var spageNumber = await pdf
                        .getPageIndex(resultSub)
                        .then((res) => {
                          return res + 1;
                        });

                      return {
                        dest: e.dest,
                        title: e.title,

                        pageNumber: spageNumber,
                      };
                    })
                  );
                
                  return {
                    dest: e.dest,
                    title: e.title,
                    subChapters: subArr,
                    pageNumber: pageNumber,
                  };
                  
                } else { 
                  return {
                    
                  };
                }
              })
            );
          
        }
       
  
        this.setState({
          bookMarks: bookmarks,
        });
      });
    });
    window.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.keyCode == 80) {
        e.preventDefault();
        printJS({
          printable: list.URL,
          type: "pdf",
          showModal: true,
        });
      }
    });
    this.setState({
      apiArr: list,
    });

    let diaplyData = this.arrAction(list, this.state.rangeValue);

    this.setState({ url: list.URL, highlights: [...diaplyData] });
   
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  addHighlight(highlight: T_NewHighlight) {
    const { highlights } = this.state;
    fetch("http://projects.discussion4all.com/CRM/response.php", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        position: highlight.position,
      }),
    });
    console.log("Saving highlight", highlight);

    this.setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights],
    });
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight--->", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      }),
    });
  }

  //@  Api array formating
  arrAction(arr, range) {
    var arrData = [];
    var apiDataArr = arr;

    apiDataArr.chunks.forEach(function (element) {
      var loopCount = (element.length * (range / 100)).toFixed(0);

      element.sort(function (a, b) {
        return b.score - a.score;
      });

      for (let i = 0; i < loopCount; i++) {
        element[i].positions.forEach(function (elemtn2) {
          var dataList = {
            position: elemtn2,
            id: element[i].score.toString(),
          };

          arrData.push(dataList);
        });
      }
    });
    return arrData;
  }

  //@ Range input field
  getRange(e) {
    if (e.target.value >= 0 && e.target.value <= 100) {
      this.setState({
        dynamicRangeTExt: e.target.value,
      });

      this.setState({
        rangeValue: e.target.value,
      });
    }
  }

  // Submit button click
  setRange(e) {
    if (this.state.rangeValue != "") {
      this.setState({
        rangeValue: this.state.rangeValue,
        errMsg: "",
      });

      let resultData = this.arrAction(this.state.apiArr, this.state.rangeValue);
      this.setState({ highlights: [...resultData] });
    } else {
      this.setState({
        rangeValue: 0,
        errMsg: "This field can not be empty.",
      });
    }
  }

  //@ Ramge input onChange
  rangeChange(event) {
    this.setState({
      rangeValue: event.target.value,
    });
    let resultData = this.arrAction(this.state.apiArr, event.target.value);
    this.setState({ highlights: [...resultData] });
    //this.scrollViewerTo({ position: { pageNumber: 30, boundingRect: { height: 1200, width: 809.9999999999999, x1: 255.73419189453125, x2: 574.372314453125, y1: 139.140625, y2: 165.140625 } } });
  }

  render() {
    const { url, highlights } = this.state;
    
    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          highlights={highlights}
          resetHighlights={this.resetHighlights}
          toggleDocument={this.toggleDocument}
          rangeSlider={this.rangeChange}
          range={this.state.rangeValue}
          setRange={this.setRange}
          URl={url}
          errMsg={this.state.errMsg}
          getRange={this.getRange}
          bookMarks={this.state.bookMarks}
          scrollTo={this.scrollViewerTo}
        />

        <div
          id="preview"
          style={{
            height: "100vh",
            width: "100%",
            position: "relative",
          }}
        >
          <PdfLoader url={url} ref={this.myRef} beforeLoad={<Spinner />}>
            {(pdfDocument) => (
              <PdfHighlighter
               
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={resetHash}
                // pdfScaleValue="page-width"
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  //this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      this.addHighlight({ content, position, comment });

                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                     
                    />
                  ) : (
                    <AreaHighlight
                      highlight={highlight}
                      onChange={(boundingRect) => {
                        this.updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                     
                      onMouseOver={() => {}}
                     
                      key={index}
                      children={component}
                    />
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default App;
