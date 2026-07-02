import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { store } from "./store";
import "./index.css";

const reloadOnStaleChunk = (error) => {
  const message = String(error?.message || error?.reason?.message || error || "");
  if (!/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk/i.test(message)) {
    return;
  }

  if (sessionStorage.getItem("rov_chunk_reload_attempted") === "1") {
    return;
  }

  sessionStorage.setItem("rov_chunk_reload_attempted", "1");
  window.location.reload();
};

window.addEventListener("error", (event) => reloadOnStaleChunk(event.error || event.message));
window.addEventListener("unhandledrejection", (event) => reloadOnStaleChunk(event.reason));

window.setTimeout(() => {
  sessionStorage.removeItem("rov_chunk_reload_attempted");
}, 5000);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
