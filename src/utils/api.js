// API utility functions for fetching dynamic data

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Fetch all flights
 * @returns {Promise<Array>} List of flights
 */
export const fetchFlights = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights`);
    if (!response.ok) {
      throw new Error("Failed to fetch flights");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching flights:", error);
    return [];
  }
};

/**
 * Fetch a specific flight by ID
 * @param {string} id Flight ID
 * @returns {Promise<Object|null>} Flight data or null if not found
 */
export const fetchFlightById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch flight");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching flight ${id}:`, error);
    return null;
  }
};

/**
 * Fetch all airports
 * @returns {Promise<Array>} List of airports
 */
export const fetchAirports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports`);
    if (!response.ok) {
      throw new Error("Failed to fetch airports");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching airports:", error);
    return [];
  }
};

/**
 * Fetch a specific airport by code
 * @param {string} code Airport code
 * @returns {Promise<Object|null>} Airport data or null if not found
 */
export const fetchAirportByCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/${code}`);
    if (!response.ok) {
      throw new Error("Failed to fetch airport");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching airport ${code}:`, error);
    return null;
  }
};

/**
 * Fetch all airlines
 * @returns {Promise<Array>} List of airlines
 */
export const fetchAirlines = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airlines`);
    if (!response.ok) {
      throw new Error("Failed to fetch airlines");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching airlines:", error);
    return [];
  }
};

/**
 * Fetch a specific airline by code
 * @param {string} code Airline code
 * @returns {Promise<Object|null>} Airline data or null if not found
 */
export const fetchAirlineByCode = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airlines/${code}`);
    if (!response.ok) {
      throw new Error("Failed to fetch airline");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching airline ${code}:`, error);
    return null;
  }
};

/**
 * Fetch weather data for a city
 * @param {string} city City name
 * @returns {Promise<Object|null>} Weather data or null if not found
 */
export const fetchWeatherByCity = async (city) => {
  try {
    const response = await fetch(`${API_BASE_URL}/weather/${city}`);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return null;
  }
};

/**
 * Fetch real-time flight positions for the map
 * @returns {Promise<Array>} List of live flights with position data
 */
export const fetchLiveFlights = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/live-flights`);
    if (!response.ok) {
      throw new Error("Failed to fetch live flight data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching live flights:", error);
    return [];
  }
};
