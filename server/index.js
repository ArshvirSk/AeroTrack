require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Environment variables validation
if (!process.env.AVIATIONSTACK_API_KEY || !process.env.OPENWEATHER_API_KEY) {
  console.error("ERROR: Missing required API keys in environment variables");
  console.error("Please check your .env file contains AVIATIONSTACK_API_KEY and OPENWEATHER_API_KEY");
  process.exit(1);
}

// AviationStack API configuration
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_BASE_URL = "https://api.aviationstack.com/v1";

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

// API error messages
const API_ERRORS = {
  AUTH_FAILED: "Authentication failed. Please check your API key.",
  RATE_LIMIT: "Rate limit exceeded. Please try again later.",
  SERVER_ERROR: "Server error occurred. Please try again later.",
};

// Users database file path
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  }
});

// Auth rate limiting (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: "Too many authentication attempts, please try again later."
  }
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.originalUrl
      } - Status: ${res.statusCode} - Duration: ${duration}ms`
    );
  });
  next();
});

// Database helper functions
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

// JWT middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    req.user = user;
    next();
  });
}

// Validation middleware
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}

// Airport data with coordinates
const airportsWithCoordinates = [
  { city: "Mumbai", code: "BOM", lat: 19.0896, lng: 72.8656 },
  { city: "Delhi", code: "DEL", lat: 28.5561, lng: 77.1 },
  { city: "Bangalore", code: "BLR", lat: 13.1986, lng: 77.7066 },
  { city: "Chennai", code: "MAA", lat: 12.9941, lng: 80.1709 },
  { city: "Kolkata", code: "CCU", lat: 22.6453, lng: 88.4467 },
  { city: "Hyderabad", code: "HYD", lat: 17.2403, lng: 78.4294 },
  { city: "Ahmedabad", code: "AMD", lat: 23.0225, lng: 72.5714 },
  { city: "Pune", code: "PNQ", lat: 18.5793, lng: 73.9089 },
  { city: "Goa", code: "GOI", lat: 15.3808, lng: 73.8314 },
  { city: "Kochi", code: "COK", lat: 10.1517, lng: 76.3919 },
];

// Sample airlines for mock data
const airlines = [
  { name: "Air India", code: "AI" },
  { name: "IndiGo", code: "6E" },
  { name: "SpiceJet", code: "SG" },
  { name: "Vistara", code: "UK" },
  { name: "GoAir", code: "G8" },
];

const weatherData = {
  Mumbai: { condition: "clear", temperature: 32, humidity: 65, windSpeed: 12 },
  Delhi: { condition: "cloudy", temperature: 28, humidity: 45, windSpeed: 8 },
  Bangalore: {
    condition: "rainy",
    temperature: 24,
    humidity: 80,
    windSpeed: 15,
  },
  Chennai: { condition: "clear", temperature: 33, humidity: 70, windSpeed: 10 },
  Kolkata: {
    condition: "stormy",
    temperature: 30,
    humidity: 85,
    windSpeed: 25,
  },
};

// Helper function to map weather condition codes to our app's conditions
const mapWeatherCondition = (weatherId) => {
  // Based on OpenWeatherMap condition codes
  // https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) return "stormy"; // Thunderstorm
  if (weatherId >= 300 && weatherId < 600) return "rainy"; // Drizzle and Rain
  if (weatherId >= 600 && weatherId < 700) return "snowy"; // Snow
  if (weatherId >= 700 && weatherId < 800) return "foggy"; // Atmosphere (fog, mist, etc.)
  if (weatherId === 800) return "clear"; // Clear sky
  if (weatherId > 800) return "cloudy"; // Clouds
  return "clear"; // Default
};

// =================== AUTHENTICATION ENDPOINTS ===================

// Register endpoint
app.post("/api/auth/register", [
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Read existing users
    const users = await readUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeUsers(users);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login endpoint
app.post("/api/auth/login", [
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Read users
    const users = await readUsers();
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
      code: 'LOGIN_ERROR'
    });
  }
});

// Get current user profile (protected route)
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PROFILE_ERROR'
    });
  }
});

// Token verification endpoint
app.post("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      email: req.user.email
    }
  });
});

// =================== FLIGHT DATA ENDPOINTS ===================

// API endpoint to get real-time flight positions for the map
app.get("/api/live-flights", authenticateToken, async (req, res) => {
  try {
    // Make request to AviationStack API with retry mechanism
    const maxRetries = 3;
    let retryCount = 0;
    let response;

    while (retryCount < maxRetries) {
      try {
        response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
          params: {
            access_key: AVIATIONSTACK_API_KEY,
            flight_status: "active",
            limit: 100,
          },
          timeout: 10000, // 10 second timeout
        });
        break; // If successful, break the retry loop
      } catch (retryError) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw retryError; // If all retries failed, throw the error
        }
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
      }
    }

    // Validate API response
    if (!response?.data?.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid API response format");
    }

    // Filter and process flights
    const activeFlights = response.data.data.filter((flight) => {
      return (
        flight?.live?.latitude &&
        flight?.live?.longitude &&
        flight?.flight?.iata &&
        flight?.airline?.name
      );
    });

    if (activeFlights.length === 0) {
      console.log("No active flights found, using fallback data");
      return res.json(generateMockFlightData());
    }

    // Process and format flight data
    const formattedFlights = activeFlights.slice(0, 40).map((flight) => {
      const callsign = flight.flight.iata || flight.flight.icao || "UNKNOWN";

      // Determine flight status based on available data
      let flightStatus = "Cruising";
      if (
        flight.flight_status === "landed" ||
        (flight.live && flight.live.is_ground)
      ) {
        flightStatus = "On Ground";
      } else if (flight.live && flight.live.altitude) {
        const altitude = parseFloat(flight.live.altitude);
        if (altitude < 5000) flightStatus = "Descending";
        else if (altitude > 30000) flightStatus = "Climbing";
      }

      // Calculate estimated price based on distance and flight duration
      const basePrice = 2000;
      const distanceFactor = flight.flight.distance
        ? Math.floor(flight.flight.distance / 100)
        : 0;
      const price =
        basePrice + distanceFactor * 50 + Math.floor(Math.random() * 1000);

      return {
        id: flight.flight.iata || flight.flight.icao,
        callsign,
        airline: flight.airline.name,
        flightNumber: flight.flight.number || flight.flight.iata,
        origin: flight.departure.airport,
        originCode: flight.departure.iata,
        originCoordinates: {
          lat: parseFloat(flight.departure.latitude) || 0,
          lng: parseFloat(flight.departure.longitude) || 0,
        },
        destination: flight.arrival.airport,
        destinationCode: flight.arrival.iata,
        destinationCoordinates: {
          lat: parseFloat(flight.arrival.latitude) || 0,
          lng: parseFloat(flight.arrival.longitude) || 0,
        },
        latitude: parseFloat(flight.live.latitude),
        longitude: parseFloat(flight.live.longitude),
        altitude: parseFloat(flight.live.altitude) || 35000,
        speed: parseFloat(flight.live.speed) || 400,
        heading: parseFloat(flight.live.direction) || 0,
        verticalRate: 0,
        status: flightStatus,
        price,
      };
    });

    res.json(formattedFlights);
  } catch (error) {
    console.error("AviationStack API Error:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    res.json(generateMockFlightData());
  }
});

// Helper functions for flight data processing
function getAirlineFromCallsign(callsign) {
  // Extract airline from callsign (usually first 3 characters)
  // This is a more comprehensive airline database
  const airlineMap = {
    // Major international airlines
    DLH: "Lufthansa",
    UAL: "United Airlines",
    AAL: "American Airlines",
    BAW: "British Airways",
    AFR: "Air France",
    SIA: "Singapore Airlines",
    UAE: "Emirates",
    ETH: "Ethiopian Airlines",
    QTR: "Qatar Airways",
    KLM: "KLM Royal Dutch Airlines",

    // Indian airlines
    AIC: "Air India",
    IGO: "IndiGo",
    VTI: "Vistara",
    SEJ: "SpiceJet",

    // More international airlines
    DAL: "Delta Air Lines",
    CPA: "Cathay Pacific",
    JAL: "Japan Airlines",
    ANA: "All Nippon Airways",
    CSN: "China Southern",
    CCA: "Air China",
    CES: "China Eastern",
    THY: "Turkish Airlines",
    SVA: "Saudia",
    ETD: "Etihad Airways",
    QFA: "Qantas",
    FIN: "Finnair",
    IBE: "Iberia",
    TAP: "TAP Portugal",
    AZA: "Alitalia",
    ACA: "Air Canada",
    ANZ: "Air New Zealand",
    ASA: "Alaska Airlines",
    JBU: "JetBlue",
    SWA: "Southwest Airlines",
    WJA: "WestJet",
    RYR: "Ryanair",
    EZY: "easyJet",
    VRD: "Virgin Atlantic",
    VOZ: "Virgin Australia",
    THA: "Thai Airways",
    MAS: "Malaysia Airlines",
    GIA: "Garuda Indonesia",
    VIR: "Virgin Atlantic",

    // Common cargo airlines
    FDX: "FedEx Express",
    UPS: "UPS Airlines",
    GTI: "Atlas Air",
    ABR: "ASL Airlines",

    // Additional codes for common callsigns
    ITY: "ITA Airways",
    CFG: "Condor",
    BER: "Air Berlin",
    EWG: "Eurowings",
    EZS: "EasyJet Switzerland",
    EZY: "EasyJet",
    NAX: "Norwegian",
    SAS: "Scandinavian Airlines",
    SWR: "Swiss International",
    AEE: "Aegean Airlines",
    AEA: "Air Europa",
    BEL: "Brussels Airlines",
    LOT: "LOT Polish Airlines",
    CSA: "Czech Airlines",
    AUA: "Austrian Airlines",
    ICE: "Icelandair",
    NLY: "Air North",
    GLO: "Gol Transportes Aéreos",
    TAM: "LATAM Brasil",
    LAN: "LATAM Chile",
    AVA: "Avianca",
    CMP: "Copa Airlines",
    AMX: "Aeroméxico",
    VOI: "Volaris",
    VIV: "VivaAerobus",
    JZA: "Jazz Aviation",
    PAL: "Philippine Airlines",
    CEB: "Cebu Pacific",
    JST: "Jetstar",
    TGW: "Tiger Airways",
    HVN: "Vietnam Airlines",
    VJC: "VietJet Air",
    OMA: "Oman Air",
    MEA: "Middle East Airlines",
    RJA: "Royal Jordanian",
    MSR: "EgyptAir",
    ETH: "Ethiopian Airlines",
    KQA: "Kenya Airways",
    SAA: "South African Airways",
    RAM: "Royal Air Maroc",
    NKS: "Spirit Airlines",
    FFT: "Frontier Airlines",
    HAL: "Hawaiian Airlines",
    SKW: "SkyWest Airlines",
    JIA: "PSA Airlines",
    JBU: "JetBlue Airways",
    AWE: "America West Airlines",
    ASH: "Mesa Airlines",
    RPA: "Republic Airways",
    EDV: "Endeavor Air",
    PDT: "Piedmont Airlines",
    QXE: "Horizon Air",
    AZU: "Azul Brazilian Airlines",
    WJA: "WestJet",
    CHH: "Hainan Airlines",
    CSZ: "Shenzhen Airlines",
    CXA: "Xiamen Airlines",
    HDA: "Dragonair",
    HKE: "Hong Kong Express",
    CRK: "Cebu Pacific",
    JSA: "JetStar Asia",
    JST: "JetStar",
    TGW: "Tigerair",
    SLK: "SilkAir",
    SEJ: "SpiceJet",
    VTI: "Air Vistara",
    AXB: "Air India Express",
    JAI: "Jet Airways",
    GOW: "GoAir",
    AKA: "AirAsia",
    AXM: "AirAsia X",
    TGG: "Thai AirAsia",
    AWQ: "Indonesia AirAsia",
    APG: "Philippines AirAsia",
    VAL: "Volotea",
    N: "US-registered private/general aviation",
    G: "UK-registered private/general aviation",
    F: "French-registered private/general aviation",
    D: "German-registered private/general aviation",
    JA: "Japanese-registered private/general aviation",
    VH: "Australian-registered private/general aviation",
    C: "Canadian-registered private/general aviation",
  };

  if (!callsign || callsign.length < 2) return "Unknown Airline";

  // Try to match the first 3 characters first
  if (callsign.length >= 3) {
    const prefix3 = callsign.substring(0, 3);
    if (airlineMap[prefix3]) return airlineMap[prefix3];
  }

  // Try to match the first 2 characters
  const prefix2 = callsign.substring(0, 2);
  if (airlineMap[prefix2]) return airlineMap[prefix2];

  // Try to match just the first character for registration-based callsigns
  const prefix1 = callsign.substring(0, 1);
  if (airlineMap[prefix1]) return airlineMap[prefix1];

  // If we can extract a registration prefix (like N12345)
  if (/^[A-Z][0-9]/.test(callsign)) {
    const regPrefix = callsign.substring(0, 1);
    if (airlineMap[regPrefix]) {
      return airlineMap[regPrefix];
    }
  }

  // If the callsign is all numbers, it's likely a flight number without airline code
  if (/^\d+$/.test(callsign)) {
    return "Commercial Flight";
  }

  // Extract any letters at the beginning of the callsign
  const letterMatch = callsign.match(/^[A-Z]+/);
  if (letterMatch && letterMatch[0]) {
    return `${letterMatch[0]} Airlines`;
  }

  return "Unknown Airline";
}

function getFlightNumberFromCallsign(callsign) {
  if (!callsign) return "????";

  // Extract numeric part from callsign
  const matches = callsign.match(/[0-9]{1,4}/);
  return matches ? matches[0] : "????";
}

function getFlightStatus(onGround, verticalRate) {
  if (onGround) return "On Ground";
  if (verticalRate > 100) return "Climbing";
  if (verticalRate < -100) return "Descending";
  return "Cruising";
}

// Function to generate mock flight data when API fails
function generateMockFlightData() {
  return Array.from({ length: 20 }, (_, i) => {
    const randomAirportIndex = Math.floor(
      Math.random() * airportsWithCoordinates.length
    );
    const randomDestinationIndex =
      (randomAirportIndex +
        1 +
        Math.floor(Math.random() * (airportsWithCoordinates.length - 1))) %
      airportsWithCoordinates.length;

    const origin = airportsWithCoordinates[randomAirportIndex];
    const destination = airportsWithCoordinates[randomDestinationIndex];

    // Generate a position somewhere between origin and destination
    const progress = Math.random();
    const lat = origin?.lat + (destination?.lat - origin?.lat) * progress;
    const lng = origin?.lng + (destination?.lng - origin?.lng) * progress;

    return {
      id: `FL${100 + i}`,
      callsign: `SIM${1000 + i}`,
      airline:
        airlines[Math.floor(Math.random() * airlines.length)]?.name ||
        "Mock Airline",
      flightNumber: `${1000 + i}`,
      origin: origin?.city || "Mock Origin",
      originCode: origin?.code || "???",
      originCoordinates: {
        lat: origin?.lat || 19.0896,
        lng: origin?.lng || 72.8656,
      },
      destination: destination?.city || "Mock Destination",
      destinationCode: destination?.code || "???",
      destinationCoordinates: {
        lat: destination?.lat || 28.5561,
        lng: destination?.lng || 77.1,
      },
      latitude: lat || 23.5,
      longitude: lng || 74.3,
      altitude: Math.floor(Math.random() * 35000) + 5000,
      speed: Math.floor(Math.random() * 400) + 300,
      heading: Math.floor(Math.random() * 360),
      verticalRate: Math.floor(Math.random() * 2000) - 1000,
      status: ["Cruising", "Climbing", "Descending"][
        Math.floor(Math.random() * 3)
      ],
    };
  });
}

// Routes
app.get("/api/flights", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        limit: 30, // Limit to 30 flights to conserve API calls
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.data && response.data.data) {
      const formattedFlights = response.data.data.map((flight) => ({
        id: flight.flight.iata || `FL${Math.floor(Math.random() * 1000)}`,
        airline: flight.airline.name || "Unknown Airline",
        origin: flight.departure.airport || "Unknown Origin",
        destination: flight.arrival.airport || "Unknown Destination",
        departureTime: flight.departure.scheduled
          ? new Date(flight.departure.scheduled).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        arrivalTime: flight.arrival.scheduled
          ? new Date(flight.arrival.scheduled).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        status: flight.flight_status || "Unknown",
        aircraft: flight.aircraft?.icao || "Unknown Aircraft",
        distance: Math.floor(Math.random() * 3000) + 500, // API doesn't provide distance
      }));
      res.json(formattedFlights);
    } else {
      // Fallback to sample data if API response is invalid
      console.log("Invalid API response, using fallback data");
      res.json(flights);
    }
  } catch (error) {
    console.error("Error fetching flights from API:", error.message);

    // Handle specific API errors
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        console.error(API_ERRORS.AUTH_FAILED);
      } else if (status === 429) {
        console.error(API_ERRORS.RATE_LIMIT);
      } else if (status >= 500) {
        console.error(API_ERRORS.SERVER_ERROR);
      }
    }

    // Fallback to sample data if API call fails
    res.json(generateMockFlightData());
  }
});

app.get("/api/flights/:id", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        flight_iata: req.params.id,
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const flight = response.data.data[0];
      const formattedFlight = {
        id: flight.flight.iata || req.params.id,
        airline: flight.airline.name || "Unknown Airline",
        origin: flight.departure.airport || "Unknown Origin",
        destination: flight.arrival.airport || "Unknown Destination",
        departureTime: flight.departure.scheduled
          ? new Date(flight.departure.scheduled).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        arrivalTime: flight.arrival.scheduled
          ? new Date(flight.arrival.scheduled).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        status: flight.flight_status || "Unknown",
        aircraft: flight.aircraft?.icao || "Unknown Aircraft",
        distance: Math.floor(Math.random() * 3000) + 500, // API doesn't provide distance
      };

      res.json(formattedFlight);
    } else {
      // Fallback to sample data if flight not found in API
      const flight = flights.find((f) => f.id === req.params.id);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }
      res.json(flight);
    }
  } catch (error) {
    console.error(
      `Error fetching flight ${req.params.id} from API:`,
      error.message
    );
    // Fallback to sample data if API call fails
    const flight = flights.find((f) => f.id === req.params.id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    res.json(flight);
  }
});

app.get("/api/airports", authenticateToken, async (req, res) => {
  try {
    // Use the predefined airportsWithCoordinates array instead of making an API call
    const formattedAirports = airportsWithCoordinates.map((airport) => ({
      code: airport.code,
      city: airport.city,
      country: "India",
      terminals: Math.floor(Math.random() * 3) + 1,
      runways: Math.floor(Math.random() * 3) + 1,
      coordinates: {
        lat: airport.lat,
        lng: airport.lng,
      },
    }));

    res.json(formattedAirports);
  } catch (error) {
    console.error("Error serving airports data:", error.message);
    res.status(500).json({ error: "Failed to fetch airports" });
  }
});

app.get("/api/airports/:code", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/airports`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        iata_code: req.params.code.toUpperCase(),
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const airport = response.data.data[0];
      const formattedAirport = {
        code: airport.iata_code || req.params.code.toUpperCase(),
        name: airport.airport_name || "Unknown Airport",
        city: airport.city_name || "Unknown City",
        country: airport.country_name || "Unknown Country",
        terminals: Math.floor(Math.random() * 3) + 1, // API doesn't provide terminal count
        runways: Math.floor(Math.random() * 3) + 1, // API doesn't provide runway count
      };

      res.json(formattedAirport);
    } else {
      // Return 404 if airport not found in API
      return res.status(404).json({ message: "Airport not found" });
    }
  } catch (error) {
    console.error(
      `Error fetching airport ${req.params.code} from API:`,
      error.message
    );
    // Return error if API call fails
    res.status(500).json({ error: "Failed to fetch airport from API" });
  }
});

app.get("/api/airlines", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/airlines`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        limit: 10, // Limit to 10 airlines to conserve API calls
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const formattedAirlines = response.data.data.map((airline) => ({
        code: airline.iata_code || "??",
        name: airline.airline_name || "Unknown Airline",
        country: airline.country_name || "Unknown Country",
        fleet: Math.floor(Math.random() * 200) + 20, // API doesn't provide fleet size
        destinations: Math.floor(Math.random() * 100) + 10, // API doesn't provide destination count
      }));

      res.json(formattedAirlines);
    } else {
      // Return error if API response is invalid
      res.status(500).json({ error: "Invalid API response" });
    }
  } catch (error) {
    console.error("Error fetching airlines from API:", error.message);
    // Return error if API call fails
    res.status(500).json({ error: "Failed to fetch airlines from API" });
  }
});

app.get("/api/airlines/:code", authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/airlines`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        iata_code: req.params.code.toUpperCase(),
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const airline = response.data.data[0];
      const formattedAirline = {
        code: airline.iata_code || req.params.code.toUpperCase(),
        name: airline.airline_name || "Unknown Airline",
        country: airline.country_name || "Unknown Country",
        fleet: Math.floor(Math.random() * 200) + 20, // API doesn't provide fleet size
        destinations: Math.floor(Math.random() * 100) + 10, // API doesn't provide destination count
      };

      res.json(formattedAirline);
    } else {
      // Return 404 if airline not found in API
      return res.status(404).json({ message: "Airline not found" });
    }
  } catch (error) {
    console.error(
      `Error fetching airline ${req.params.code} from API:`,
      error.message
    );
    // Return error if API call fails
    res.status(500).json({ error: "Failed to fetch airline from API" });
  }
});

app.get("/api/weather/:city", [
  authenticateToken,
  body('city').optional().trim().isLength({ max: 100 }).matches(/^[a-zA-Z\s]+$/).withMessage('Invalid city name'),
  handleValidationErrors
], async (req, res) => {
  try {
    const city = req.params.city;
    
    // Additional validation for city parameter
    if (!city || city.length > 100 || !/^[a-zA-Z\s]+$/.test(city)) {
      return res.status(400).json({
        error: 'Invalid city name. Only letters and spaces allowed, maximum 100 characters.',
        code: 'INVALID_CITY_NAME'
      });
    }
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: "metric", // Use metric units for temperature
      },
    });

    if (response.data) {
      const weatherData = {
        condition: mapWeatherCondition(response.data.weather[0].id),
        temperature: Math.round(response.data.main.temp),
        humidity: response.data.main.humidity,
        windSpeed: Math.round(response.data.wind.speed),
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
      };

      res.json(weatherData);
    } else {
      // Fallback to sample data if API response is invalid
      const weather = weatherData[city];
      if (!weather) {
        return res
          .status(404)
          .json({ message: "Weather data not found for this city" });
      }
      res.json(weather);
    }
  } catch (error) {
    console.error(
      `Error fetching weather for ${req.params.city} from API:`,
      error.message
    );
    // Fallback to sample data if API call fails
    const weather = weatherData[req.params.city];
    if (!weather) {
      return res
        .status(404)
        .json({ message: "Weather data not found for this city" });
    }
    res.json(weather);
  }
});

// Additional airline API endpoints

// Get detailed airline information
app.get("/api/airlines/:code/details", async (req, res) => {
  try {
    const airlineCode = req.params.code.toUpperCase();

    // First get basic airline information
    const airlineResponse = await axios.get(
      `${AVIATIONSTACK_BASE_URL}/airlines`,
      {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          iata_code: airlineCode,
        },
      }
    );

    // Check if we got valid airline data
    if (
      !airlineResponse.data ||
      !airlineResponse.data.data ||
      airlineResponse.data.data.length === 0
    ) {
      // Try to get from our local data
      const localAirline = airlines.find((a) => a.code === airlineCode);
      if (!localAirline) {
        return res.status(404).json({ message: "Airline not found" });
      }
      return res.json({
        ...localAirline,
        fleetDetails: [],
        routes: [],
        statistics: {
          onTimePerformance: Math.floor(Math.random() * 20) + 80, // 80-99%
          averageDelay: Math.floor(Math.random() * 15), // 0-15 minutes
          cancellationRate: (Math.random() * 2).toFixed(1), // 0-2%
        },
      });
    }

    // Get airline data
    const airline = airlineResponse.data.data[0];

    // Now get flights operated by this airline to extract fleet and route information
    const flightsResponse = await axios.get(
      `${AVIATIONSTACK_BASE_URL}/flights`,
      {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          airline_iata: airlineCode,
          limit: 100, // Get more flights to analyze fleet and routes
        },
      }
    );

    // Process the data
    let fleetDetails = [];
    let routes = [];

    if (flightsResponse.data && flightsResponse.data.data) {
      const flights = flightsResponse.data.data;

      // Extract unique aircraft types
      const aircraftMap = {};
      flights.forEach((flight) => {
        if (flight.aircraft && flight.aircraft.icao) {
          const aircraftType = flight.aircraft.icao;
          if (!aircraftMap[aircraftType]) {
            aircraftMap[aircraftType] = {
              type: aircraftType,
              model: getAircraftModel(aircraftType),
              count: 0,
              averageAge: Math.floor(Math.random() * 10) + 2, // 2-12 years
            };
          }
          aircraftMap[aircraftType].count++;
        }
      });

      fleetDetails = Object.values(aircraftMap);

      // If no fleet details were found, provide some mock data
      if (fleetDetails.length === 0) {
        const commonAircraft = [
          {
            type: "B738",
            model: "Boeing 737-800",
            count: Math.floor(Math.random() * 30) + 10,
            averageAge: Math.floor(Math.random() * 8) + 3,
          },
          {
            type: "A320",
            model: "Airbus A320",
            count: Math.floor(Math.random() * 30) + 10,
            averageAge: Math.floor(Math.random() * 7) + 2,
          },
          {
            type: "A21N",
            model: "Airbus A321neo",
            count: Math.floor(Math.random() * 15) + 5,
            averageAge: Math.floor(Math.random() * 4) + 1,
          },
          {
            type: "B789",
            model: "Boeing 787-9 Dreamliner",
            count: Math.floor(Math.random() * 10) + 2,
            averageAge: Math.floor(Math.random() * 5) + 1,
          },
        ];

        // Select 2-4 random aircraft types
        const numTypes = Math.floor(Math.random() * 3) + 2;
        fleetDetails = commonAircraft
          .sort(() => 0.5 - Math.random())
          .slice(0, numTypes);
      }

      // Extract unique routes
      const routeMap = {};
      flights.forEach((flight) => {
        if (
          flight.departure &&
          flight.departure.iata &&
          flight.arrival &&
          flight.arrival.iata
        ) {
          const routeKey = `${flight.departure.iata}-${flight.arrival.iata}`;
          if (!routeMap[routeKey]) {
            routeMap[routeKey] = {
              origin: flight.departure.iata,
              originCity: flight.departure.airport || "Unknown",
              destination: flight.arrival.iata,
              destinationCity: flight.arrival.airport || "Unknown",
              frequency: 0,
              distance: calculateDistance(
                flight.departure.latitude,
                flight.departure.longitude,
                flight.arrival.latitude,
                flight.arrival.longitude
              ),
            };
          }
          routeMap[routeKey].frequency++;
        }
      });

      routes = Object.values(routeMap);

      // If no routes were found, provide some mock data
      if (routes.length === 0) {
        const mockRoutes = generateMockRoutes(10);
        res.json(mockRoutes);
      } else {
        res.json(routes);
      }
    } else {
      // Fallback to mock data
      const mockRoutes = generateMockRoutes(10);
      res.json(mockRoutes);
    }
  } catch (error) {
    console.error(
      `Error fetching airline details for ${req.params.code} from API:`,
      error.message
    );

    // Fallback to mock data
    const mockRoutes = generateMockRoutes(10);
    res.json(mockRoutes);
  }
});

// Get airline fleet information
app.get("/api/airlines/:code/fleet", async (req, res) => {
  try {
    const airlineCode = req.params.code.toUpperCase();

    // Get flights operated by this airline to extract fleet information
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        airline_iata: airlineCode,
        limit: 100,
      },
    });

    if (response.data && response.data.data) {
      const flights = response.data.data;

      // Extract unique aircraft types
      const aircraftMap = {};
      flights.forEach((flight) => {
        if (flight.aircraft && flight.aircraft.icao) {
          const aircraftType = flight.aircraft.icao;
          if (!aircraftMap[aircraftType]) {
            aircraftMap[aircraftType] = {
              type: aircraftType,
              model: getAircraftModel(aircraftType),
              count: 0,
              averageAge: Math.floor(Math.random() * 10) + 2, // 2-12 years
            };
          }
          aircraftMap[aircraftType].count++;
        }
      });

      const fleetDetails = Object.values(aircraftMap);

      // If no fleet details were found, provide some mock data
      if (fleetDetails.length === 0) {
        const mockFleet = [
          {
            type: "B738",
            model: "Boeing 737-800",
            count: Math.floor(Math.random() * 30) + 10,
            averageAge: Math.floor(Math.random() * 8) + 3,
          },
          {
            type: "A320",
            model: "Airbus A320",
            count: Math.floor(Math.random() * 30) + 10,
            averageAge: Math.floor(Math.random() * 7) + 2,
          },
          {
            type: "A21N",
            model: "Airbus A321neo",
            count: Math.floor(Math.random() * 15) + 5,
            averageAge: Math.floor(Math.random() * 4) + 1,
          },
        ];

        res.json(mockFleet);
      } else {
        res.json(fleetDetails);
      }
    } else {
      // Fallback to mock data
      const mockFleet = [
        {
          type: "B738",
          model: "Boeing 737-800",
          count: Math.floor(Math.random() * 30) + 10,
          averageAge: Math.floor(Math.random() * 8) + 3,
        },
        {
          type: "A320",
          model: "Airbus A320",
          count: Math.floor(Math.random() * 30) + 10,
          averageAge: Math.floor(Math.random() * 7) + 2,
        },
        {
          type: "A21N",
          model: "Airbus A321neo",
          count: Math.floor(Math.random() * 15) + 5,
          averageAge: Math.floor(Math.random() * 4) + 1,
        },
      ];

      res.json(mockFleet);
    }
  } catch (error) {
    console.error(
      `Error fetching fleet for ${req.params.code} from API:`,
      error.message
    );

    // Fallback to mock data
    const mockFleet = [
      {
        type: "B738",
        model: "Boeing 737-800",
        count: Math.floor(Math.random() * 30) + 10,
        averageAge: Math.floor(Math.random() * 8) + 3,
      },
      {
        type: "A320",
        model: "Airbus A320",
        count: Math.floor(Math.random() * 30) + 10,
        averageAge: Math.floor(Math.random() * 7) + 2,
      },
      {
        type: "A21N",
        model: "Airbus A321neo",
        count: Math.floor(Math.random() * 15) + 5,
        averageAge: Math.floor(Math.random() * 4) + 1,
      },
    ];

    res.json(mockFleet);
  }
});

// Get airline routes
app.get("/api/airlines/:code/routes", async (req, res) => {
  try {
    const airlineCode = req.params.code.toUpperCase();

    // Get flights operated by this airline to extract route information
    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        airline_iata: airlineCode,
        limit: 100,
      },
    });

    if (response.data && response.data.data) {
      const flights = response.data.data;

      // Extract unique routes
      const routeMap = {};
      flights.forEach((flight) => {
        if (
          flight.departure &&
          flight.departure.iata &&
          flight.arrival &&
          flight.arrival.iata
        ) {
          const routeKey = `${flight.departure.iata}-${flight.arrival.iata}`;
          if (!routeMap[routeKey]) {
            routeMap[routeKey] = {
              origin: flight.departure.iata,
              originCity: flight.departure.airport || "Unknown",
              destination: flight.arrival.iata,
              destinationCity: flight.arrival.airport || "Unknown",
              frequency: 0,
              distance: calculateDistance(
                flight.departure.latitude,
                flight.departure.longitude,
                flight.arrival.latitude,
                flight.arrival.longitude
              ),
            };
          }
          routeMap[routeKey].frequency++;
        }
      });

      const routes = Object.values(routeMap);

      // If no routes were found, provide some mock data
      if (routes.length === 0) {
        const mockRoutes = generateMockRoutes(10);
        res.json(mockRoutes);
      } else {
        res.json(routes);
      }
    } else {
      // Fallback to mock data
      const mockRoutes = generateMockRoutes(10);
      res.json(mockRoutes);
    }
  } catch (error) {
    console.error(
      `Error fetching routes for ${req.params.code} from API:`,
      error.message
    );

    // Fallback to mock data
    const mockRoutes = generateMockRoutes(10);
    res.json(mockRoutes);
  }
});

// Helper function to get aircraft model from ICAO code
function getAircraftModel(icao) {
  const aircraftModels = {
    A319: "Airbus A319",
    A320: "Airbus A320",
    A321: "Airbus A321",
    A21N: "Airbus A321neo",
    A20N: "Airbus A320neo",
    A19N: "Airbus A319neo",
    A332: "Airbus A330-200",
    A333: "Airbus A330-300",
    A339: "Airbus A330-900neo",
    A338: "Airbus A330-800neo",
    A342: "Airbus A340-200",
    A343: "Airbus A340-300",
    A345: "Airbus A340-500",
    A346: "Airbus A340-600",
    A359: "Airbus A350-900",
    A35K: "Airbus A350-1000",
    A388: "Airbus A380-800",
    B732: "Boeing 737-200",
    B733: "Boeing 737-300",
    B734: "Boeing 737-400",
    B735: "Boeing 737-500",
    B736: "Boeing 737-600",
    B737: "Boeing 737-700",
    B738: "Boeing 737-800",
    B739: "Boeing 737-900",
    B37M: "Boeing 737 MAX 7",
    B38M: "Boeing 737 MAX 8",
    B39M: "Boeing 737 MAX 9",
    B3XM: "Boeing 737 MAX 10",
    B741: "Boeing 747-100",
    B742: "Boeing 747-200",
    B743: "Boeing 747-300",
    B744: "Boeing 747-400",
    B748: "Boeing 747-8",
    B752: "Boeing 757-200",
    B753: "Boeing 757-300",
    B762: "Boeing 767-200",
    B763: "Boeing 767-300",
    B764: "Boeing 767-400",
    B772: "Boeing 777-200",
    B77L: "Boeing 777-200LR",
    B773: "Boeing 777-300",
    B77W: "Boeing 777-300ER",
    B778: "Boeing 777-8",
    B779: "Boeing 777-9",
    B788: "Boeing 787-8 Dreamliner",
    B789: "Boeing 787-9 Dreamliner",
    B78X: "Boeing 787-10 Dreamliner",
    E170: "Embraer E170",
    E175: "Embraer E175",
    E190: "Embraer E190",
    E195: "Embraer E195",
    E290: "Embraer E190-E2",
    E295: "Embraer E195-E2",
    DH8D: "Bombardier Dash 8 Q400",
    AT72: "ATR 72",
    AT76: "ATR 72-600",
    AT75: "ATR 72-500",
    AT45: "ATR 42-500",
    AT46: "ATR 42-600",
    CRJ2: "Bombardier CRJ-200",
    CRJ7: "Bombardier CRJ-700",
    CRJ9: "Bombardier CRJ-900",
    CRJX: "Bombardier CRJ-1000",
  };

  return aircraftModels[icao] || `Aircraft type ${icao}`;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return Math.floor(Math.random() * 3000) + 500; // Return random distance if coordinates are missing
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return Math.round(distance);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Helper function to generate mock routes
function generateMockRoutes(count) {
  const routes = [];

  for (let i = 0; i < count; i++) {
    const originIndex = Math.floor(
      Math.random() * airportsWithCoordinates.length
    );
    let destIndex = Math.floor(Math.random() * airportsWithCoordinates.length);

    // Make sure origin and destination are different
    while (destIndex === originIndex) {
      destIndex = Math.floor(Math.random() * airportsWithCoordinates.length);
    }

    const origin = airportsWithCoordinates[originIndex];
    const destination = airportsWithCoordinates[destIndex];

    routes.push({
      origin: origin.code,
      originCity: origin.city,
      destination: destination.code,
      destinationCity: destination.city,
      frequency: Math.floor(Math.random() * 14) + 1, // 1-14 flights per week
      distance: calculateDistance(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng
      ),
    });
  }

  return routes;
}

// Reports API endpoints
app.get("/api/reports/metrics", (req, res) => {
  try {
    // In a real application, this would fetch data from a database
    const metricsData = {
      totalFlights: 1248,
      totalRevenue: 1568750,
      totalPassengers: 187320,
      avgLoadFactor: 82.5,
      onTimePerformance: 91.2,
      delayedFlights: 8.8,
      cancelledFlights: 1.2,
      avgFuelConsumption: 3250,
    };

    res.json(metricsData);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics data" });
  }
});

app.get("/api/reports/revenue", (req, res) => {
  try {
    const period = req.query.period || "monthly";
    let revenueData = [];

    if (period === "monthly") {
      revenueData = [
        { month: "Jan", value: 125000 },
        { month: "Feb", value: 118500 },
        { month: "Mar", value: 135000 },
        { month: "Apr", value: 142000 },
        { month: "May", value: 156000 },
        { month: "Jun", value: 168000 },
        { month: "Jul", value: 172500 },
        { month: "Aug", value: 175000 },
        { month: "Sep", value: 162000 },
        { month: "Oct", value: 148000 },
        { month: "Nov", value: 132750 },
        { month: "Dec", value: 134000 },
      ];
    } else if (period === "yearly") {
      revenueData = [
        { month: "2020", value: 1250000 },
        { month: "2021", value: 1320000 },
        { month: "2022", value: 1425000 },
        { month: "2023", value: 1520000 },
        { month: "2024", value: 1568750 },
      ];
    }

    res.json(revenueData);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

app.get("/api/reports/flights", (req, res) => {
  try {
    // In a real application, this would fetch data from a database
    const flightReportsData = [
      {
        id: "FR001",
        date: "2024-03-15",
        flightNo: "AV101",
        route: "Mumbai - Delhi",
        status: "Completed",
        revenue: 12500,
        passengers: 156,
      },
      {
        id: "FR002",
        date: "2024-03-14",
        flightNo: "AV102",
        route: "Delhi - Mumbai",
        status: "Completed",
        revenue: 13200,
        passengers: 165,
      },
      {
        id: "FR003",
        date: "2024-03-13",
        flightNo: "AV103",
        route: "Mumbai - Bangalore",
        status: "Completed",
        revenue: 9800,
        passengers: 122,
      },
      {
        id: "FR004",
        date: "2024-03-12",
        flightNo: "AV104",
        route: "Bangalore - Delhi",
        status: "Completed",
        revenue: 11500,
        passengers: 143,
      },
      {
        id: "FR005",
        date: "2024-03-11",
        flightNo: "AV105",
        route: "Delhi - Chennai",
        status: "Completed",
        revenue: 10800,
        passengers: 135,
      },
      {
        id: "FR006",
        date: "2024-03-10",
        flightNo: "AV106",
        route: "Chennai - Mumbai",
        status: "Completed",
        revenue: 11200,
        passengers: 140,
      },
    ];

    res.json(flightReportsData);
  } catch (error) {
    console.error("Error fetching flight reports:", error);
    res.status(500).json({ error: "Failed to fetch flight reports" });
  }
});

app.get("/api/reports/flight/:id", (req, res) => {
  try {
    const flightId = req.params.id;

    // In a real application, this would fetch data from a database based on the ID
    const flightReportData = {
      id: flightId,
      date: "2024-03-15",
      flightNo: "AV101",
      route: "Mumbai - Delhi",
      departureTime: "08:30 AM",
      arrivalTime: "10:45 AM",
      aircraft: "Boeing 737-800",
      distance: 1148,
      status: "Completed",
      revenue: 12500,
      passengers: 156,
      loadFactor: 87,
      crewMembers: 8,
      fuelConsumption: 3250,
      delayMinutes: 0,
      weatherConditions: "Clear skies, light winds",
      notes:
        "Flight operated normally with no incidents. All systems performed as expected. Passenger satisfaction survey showed 92% positive feedback.",
    };

    // Add a small delay to simulate database fetch
    setTimeout(() => {
      res.json(flightReportData);
    }, 500);
  } catch (error) {
    console.error("Error fetching flight report:", error);
    res.status(500).json({ error: "Failed to fetch flight report" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
