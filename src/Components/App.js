import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Map from "./Map";

const App = () => {
  return (
    <div className="App">
      <header className="app-hdr">
        <h1> Vermont Invasive Species Management 2023</h1>
      </header>

      <p> Data collected from Vermont EPA </p>
      <p>
        {" "}
        Not sponsored or affiliated with Vermont government and data collectors{" "}
      </p>
      <Routes>
        <Route path="/" element={<Map />} />
      </Routes>
      <footer className="app-ftr"> </footer>
    </div>
  );
};

export default App;
