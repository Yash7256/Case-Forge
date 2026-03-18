import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import Result from "./pages/Result";

function App() {
  return (
    <div className="min-h-screen gradient-bg text-slate-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
