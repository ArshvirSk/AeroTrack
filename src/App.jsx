import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Airlines from "./pages/Airlines";
import Airports from "./pages/Airports";
import CostEstimation from "./pages/CostEstimation";
import Dashboard from "./pages/Dashboard";
import ETAEstimation from "./pages/ETAEstimation";
import FlightMap from "./pages/FlightMap";
import Flights from "./pages/Flights";
import Report from "./pages/Report";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 4.5V9.5L13.5 12.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.78168 19.25H18.2183C19.5477 19.25 20.4828 17.9412 19.9367 16.7498C19.0509 14.7202 17.3473 12.5569 15.0592 11.0248C14.6463 10.7598 14.1906 10.5316 13.7034 10.3441C13.2539 10.1715 12.8693 9.75 12.5815 9.75C12.0893 9.75 11.7242 10.216 11.3589 10.3766C10.8737 10.5883 10.4179 10.8451 9.99369 11.1271C7.67263 12.6668 5.94906 14.8348 5.06327 16.8668C4.51714 18.0583 5.45225 19.25 6.78168 19.25Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-yellow-500">
            Aviation Dashboard
          </h2>
          <p className="text-gray-400 mt-2">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 overflow-hidden">
      <Navbar />
      <main className="ml-64 transition-all duration-300 animate-fadeIn">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/flight-map" element={<FlightMap />} />
          <Route path="/report" element={<Report />} />
          <Route path="/cost-estimation" element={<CostEstimation />} />
          <Route path="/eta-estimation" element={<ETAEstimation />} />
          <Route path="/airports" element={<Airports />} />
          <Route path="/airlines" element={<Airlines />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
