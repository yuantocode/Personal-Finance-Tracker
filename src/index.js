import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; // if you use App.jsx, CRA resolves it
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();