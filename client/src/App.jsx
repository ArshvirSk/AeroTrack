import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Airlines from "./pages/Airlines";
import AirportDetails from "./pages/AirportDetails";
import Airports from "./pages/Airports";
import CostEstimation from "./pages/CostEstimation";
import Dashboard from "./pages/Dashboard";
import ETAEstimation from "./pages/ETAEstimation";
import FlightMap from "./pages/FlightMap";
import Flights from "./pages/Flights";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Report from "./pages/Report";

function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-yellow-500">
            Verifying Authentication...
          </h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isLanding = location.pathname === "/";

  // Show loading screen while auth is being verified
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-indigo-500"
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
          <h2 className="mt-4 text-xl font-bold text-indigo-500">
            AeroTrack
          </h2>
          <p className="text-gray-400 mt-2">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 overflow-hidden">
      {!isLanding && !isAuthPage && <Navbar />}
      <main
        className={
          !isLanding && !isAuthPage
            ? "ml-64 transition-all duration-300 animate-fadeIn"
            : ""
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flights"
            element={
              <ProtectedRoute>
                <Flights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flight-map"
            element={
              <ProtectedRoute>
                <FlightMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cost-estimation"
            element={
              <ProtectedRoute>
                <CostEstimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eta-estimation"
            element={
              <ProtectedRoute>
                <ETAEstimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/airports"
            element={
              <ProtectedRoute>
                <Airports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/airports/:iataCode"
            element={
              <ProtectedRoute>
                <AirportDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/airlines"
            element={
              <ProtectedRoute>
                <Airlines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
