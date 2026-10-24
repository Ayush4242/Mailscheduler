
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="*"
          element={
            <div className="p-10 text-center">
              <h1 className="text-3xl font-bold text-green-900">
                404 — Page not found
              </h1>
              <a href="/" className="mt-4 inline-block text-green-700 underline">
                Back to home
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
