import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Map from "./Map";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Map />} />
      </Routes>
    </div>
  );
};

export default App;
