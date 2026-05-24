import axios from "axios";

const API_KEY = "e8e02fb773b4c3437a2972d9a3cebca8";
const BASE_URL = "https://api.aviationstack.com/v1/flights";

// Retry configuration
const RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Utility function for exponential backoff retry
const axiosWithRetry = async (config, retries = RETRY_COUNT) => {
  try {
    return await axios(config);
  } catch (error) {
    if (retries === 0) throw error;

    const delay = INITIAL_RETRY_DELAY * Math.pow(2, RETRY_COUNT - retries);
    console.log(
      `Retrying request in ${delay}ms... (${retries} attempts remaining)`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return axiosWithRetry(config, retries - 1);
  }
};

// Function to get all flights
export const getFlights = async () => {
  try {
    const response = await axiosWithRetry({
      method: "get",
      url: `${BASE_URL}?access_key=${API_KEY}`,
    });
    // Add random price data to each flight
    const flights = response.data.data.map((flight) => ({
      ...flight,
      price: Math.floor(Math.random() * (10000 + 1)), // Random price between 5000 and 50000
    }));
    return flights;
  } catch (error) {
    console.error("Error fetching flights after all retries:", error);
    return [];
  }
};

// Function to search flights based on origin, destination, and date
export const searchFlights = async ({ origin, destination, date }) => {
  try {
    const response = await axiosWithRetry({
      method: "get",
      url: BASE_URL,
      params: {
        access_key: API_KEY,
        dep_iata: origin,
        arr_iata: destination,
        flight_date: date,
      },
    });
    // Add random price data to each flight
    const flights = (response.data.data || []).map((flight) => ({
      ...flight,
      price: Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000, // Random price between 5000 and 50000
    }));
    return flights;
  } catch (error) {
    console.error("Error fetching search flights after all retries:", error);
    return [];
  }
};
