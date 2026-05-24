import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE_URL = "http://localhost:5000/api";

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  // Initialize authentication state on component mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("authToken");
      if (savedToken) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setToken(savedToken);
            // Get full user profile
            const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUser(profileData.user);
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("authToken");
            setToken(null);
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          localStorage.removeItem("authToken");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
      
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    setError("");
  };

  // Helper function to get auth headers for API calls
  const getAuthHeaders = () => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const value = {
    user,
    loading,
    error,
    token,
    login,
    register,
    logout,
    getAuthHeaders,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
