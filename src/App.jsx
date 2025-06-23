import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GeneratePDF from "./pages/GeneratePDF";
import Login from "./pages/login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/generatepdf" element={<GeneratePDF />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
