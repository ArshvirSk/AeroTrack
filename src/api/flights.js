import axios from "axios";

const API_KEY = "fc88ad2bfe585ba9c58f0021773faeef";
const BASE_URL = "https://api.aviationstack.com/v1/flights";

// Function to get all flights
export const getFlights = async () => {
  try {
    const response = await axios.get(`${BASE_URL}?access_key=${API_KEY}`);
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching flights:", error);
    return [];
  }
};

// Function to search flights based on origin, destination, and date
export const searchFlights = async ({ origin, destination, date }) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        access_key: API_KEY,
        dep_iata: origin,
        arr_iata: destination,
        flight_date: date,
      },
    });

    console.log("Filtered Flights:", response.data.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching search flights:", error);
    return [];
  }
};
