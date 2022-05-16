import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Demo from "./Demo";

const pages = (
  <Router>
    <div>
      <Switch>
        <Route path="/demo" component={Demo}></Route>
        <Route path="/:id" component={App}></Route>
      </Switch>
    </div>
  </Router>
);
ReactDOM.render(pages, document.getElementById("root"));
