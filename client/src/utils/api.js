// API utility functions for fetching dynamic data

const API_BASE_URL = "http://localhost:5000/api";

// Retry configuration
const RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Create headers with authentication
function createHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// Enhanced error handling
function handleApiError(error, context) {
  console.error(`API Error in ${context}:`, error);
  
  // Check if it's an authentication error
  if (error.status === 401 || error.status === 403) {
    // Token might be expired, redirect to login
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    return;
  }
  
  // Log the error but don't expose sensitive information
  if (error.status >= 500) {
    console.error('Server error occurred');
  }
}

// Utility function for exponential backoff retry with auth
async function fetchWithRetry(url, options = {}, retries = RETRY_COUNT) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    return response;
  } catch (error) {
    if (retries === 0) {
      handleApiError(error, `fetchWithRetry(${url})`);
      throw error;
    }

    // Don't retry auth errors
    if (error.status === 401 || error.status === 403) {
      throw error;
    }

    const delay = INITIAL_RETRY_DELAY * Math.pow(2, RETRY_COUNT - retries);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1);
  }
}

/**
 * Fetch all flights (requires authentication)
 * @returns {Promise<Array>} List of flights
 */
export const fetchFlights = async () => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/flights`, {
      headers: createHeaders(true)
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching flights:", error);
    return [];
  }
};

/**
 * Fetch a specific flight by ID (requires authentication)
 * @param {string} id Flight ID
 * @returns {Promise<Object|null>} Flight data or null if not found
 */
export const fetchFlightById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/${id}`, {
      headers: createHeaders(true)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch flight");
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, `fetchFlightById(${id})`);
    return null;
  }
};

/**
 * Fetch all airports (requires authentication)
 * @returns {Promise<Array>} List of airports
 */
export const fetchAirports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports`, {
      headers: createHeaders(true)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch airports");
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, "fetchAirports");
    return [];
  }
};

/**
 * Fetch a specific airport by code (requires authentication)
 * @param {string} code Airport code
 * @returns {Promise<Object|null>} Airport data or null if not found
 */
export const fetchAirportByCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/${code}`, {
      headers: createHeaders(true)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch airport");
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, `fetchAirportByCode(${code})`);
    return null;
  }
};

/**
 * Fetch all airlines (requires authentication)
 * @returns {Promise<Array>} List of airlines
 */
export const fetchAirlines = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airlines`, {
      headers: createHeaders(true)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch airlines");
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, "fetchAirlines");
    return [];
  }
};

/**
 * Fetch a specific airline by code (requires authentication)
 * @param {string} code Airline code
 * @returns {Promise<Object|null>} Airline data or null if not found
 */
export const fetchAirlineByCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airlines/${code}`, {
      headers: createHeaders(true)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch airline");
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, `fetchAirlineByCode(${code})`);
    return null;
  }
};

/**
 * Fetch weather data for a city (requires authentication)
 * @param {string} city City name
 * @returns {Promise<Object|null>} Weather data or null if not found
 */
export const fetchWeatherByCity = async (city) => {
  try {
    const response = await fetch(`${API_BASE_URL}/weather/${city}`, {
      headers: createHeaders(true)
    });
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    return await response.json();
  } catch (error) {
    handleApiError(error, `fetchWeatherByCity(${city})`);
    return null;
  }
};

/**
 * Fetch real-time flight positions for the map (requires authentication)
 * @returns {Promise<Array>} List of live flights with position data
 */
export const fetchLiveFlights = async () => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/live-flights`, {
      headers: createHeaders(true)
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching live flights:", error);
    return [];
  }
};
