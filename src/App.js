import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Visualizer from "./pages/Visualizer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/visualizer" element={<Visualizer />} />
        <Route path="/" element={<Navigate to="/visualizer" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
