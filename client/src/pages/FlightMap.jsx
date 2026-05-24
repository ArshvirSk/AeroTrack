import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Info,
  Loader2,
  MapPin,
  Plane,
  Search,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { fetchLiveFlights } from "../utils/api";

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom plane icon
const planeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61212.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
  className: "plane-icon",
});

// Custom airport icon
const airportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1201/1201643.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: "destination-icon",
});

const mockRoutes = [
  {
    departure: {
      airport: "Brussels Airport",
      timezone: "Europe/Brussels",
      iata: "BRU",
      icao: "EBBR",
      terminal: null,
      time: "06:10:00",
    },
    arrival: {
      airport: "Girona-Costa Brava",
      timezone: "Europe/Madrid",
      iata: "GRO",
      icao: "LEGE",
      terminal: "1",
      time: "07:55:00",
    },
    airline: {
      name: "Brussels Airlines",
      callsign: "B-LINE",
      iata: "SN",
      icao: "BEL",
    },
    flight: {
      number: "3683",
    },
  },
  {
    departure: {
      airport: "Los Angeles International Airport",
      timezone: "America/Los_Angeles",
      iata: "LAX",
      icao: "KLAX",
      terminal: "4",
      time: "14:30:00",
    },
    arrival: {
      airport: "John F. Kennedy International Airport",
      timezone: "America/New_York",
      iata: "JFK",
      icao: "KJFK",
      terminal: "7",
      time: "22:00:00",
    },
    airline: {
      name: "American Airlines",
      callsign: "AMERICAN",
      iata: "AA",
      icao: "AAL",
    },
    flight: {
      number: "100",
    },
  },
  {
    departure: {
      airport: "Dubai International Airport",
      timezone: "Asia/Dubai",
      iata: "DXB",
      icao: "OMDB",
      terminal: "3",
      time: "08:45:00",
    },
    arrival: {
      airport: "Heathrow Airport",
      timezone: "Europe/London",
      iata: "LHR",
      icao: "EGLL",
      terminal: "5",
      time: "12:30:00",
    },
    airline: {
      name: "Emirates",
      callsign: "EMIRATES",
      iata: "EK",
      icao: "UAE",
    },
    flight: {
      number: "29",
    },
  },
  {
    departure: {
      airport: "Tokyo Haneda Airport",
      timezone: "Asia/Tokyo",
      iata: "HND",
      icao: "RJTT",
      terminal: "1",
      time: "15:00:00",
    },
    arrival: {
      airport: "Sydney Kingsford Smith Airport",
      timezone: "Australia/Sydney",
      iata: "SYD",
      icao: "YSSY",
      terminal: "T1",
      time: "05:30:00",
    },
    airline: {
      name: "Japan Airlines",
      callsign: "JAPANAIR",
      iata: "JL",
      icao: "JAL",
    },
    flight: {
      number: "771",
    },
  },
];

const getBearing = (lat1, lon1, lat2, lon2) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const λ1 = toRadians(lon1);
  const λ2 = toRadians(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
};

// Function to create a dynamically rotated plane icon
const getPlaneIcon = (angle, isSelected = false) => {
  // Default to 0 if angle is not provided or invalid
  const safeAngle = isNaN(angle) ? 0 : angle;

  // Use gold color for selected flights, silver for others
  const fillColor = isSelected ? "#FFD700" : "#E0E0E0";
  const glowColor = isSelected
    ? "rgba(255, 215, 0, 0.7)"
    : "rgba(224, 224, 224, 0.5)";
  const size = isSelected ? 24 : 20;

  // Create a custom SVG icon with rotation applied directly in the SVG
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fillColor}" 
         style="filter: drop-shadow(0 0 3px ${glowColor}); transform: rotate(${safeAngle}deg); transform-origin: center;">
      <path d="M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2h0A1.5,1.5,0,0,0,10,3.5V9L2,14v2l8-2.5V19l-2,1.5V22l3.5-1h1L15,22V20.5L13,19V13.5Z"/>
    </svg>`;

  // Create a base64 encoded data URL
  const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

  // Create the icon
  return new L.Icon({
    iconUrl: dataUrl,
    iconSize: [24, 24],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

// Function to generate curved route points using Great Circle method
const generateCurve = (start, end, segments = 100) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  const lat1 = toRadians(start[0]);
  const lon1 = toRadians(start[1]);
  const lat2 = toRadians(end[0]);
  const lon2 = toRadians(end[1]);

  // Calculate the great circle distance
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.pow(Math.sin((lon1 - lon2) / 2), 2)
      )
    );

  const curve = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;

    // Calculate intermediate point at fraction f along the great circle path
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x =
      A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y =
      A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDegrees(Math.atan2(y, x));

    // Handle longitude wrapping around 180/-180 degrees
    let adjustedLon = lon;
    if (i > 0) {
      const prevLon = curve[i - 1][1];
      const diff = lon - prevLon;
      if (diff > 180) adjustedLon -= 360;
      else if (diff < -180) adjustedLon += 360;
    }

    curve.push([lat, adjustedLon]);
  }

  return curve;
};

// Function to calculate destination point given distance and bearing
const calculateDestination = (lat, lng, bearing, distance) => {
  // Earth's radius in km
  const R = 6371;

  // Convert to radians
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;
  const brng = (bearing * Math.PI) / 180;

  // Convert distance from km to radians
  const d = distance / R;

  // Calculate destination point
  let lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  // Convert back to degrees
  lat2 = (lat2 * 180) / Math.PI;
  lon2 = (lon2 * 180) / Math.PI;

  return [lat2, lon2];
};

// Function to return coordinates based on IATA codes
const airportCoordinates = {
  // Indian Airports
  BOM: [19.0896, 72.8656], // Mumbai (Chhatrapati Shivaji)
  DEL: [28.5565, 77.1], // Delhi (Indira Gandhi)
  BLR: [13.1986, 77.7066], // Bengaluru
  HYD: [17.2403, 78.4294], // Hyderabad
  MAA: [12.9941, 80.1709], // Chennai
  CCU: [22.6547, 88.4467], // Kolkata
  GOI: [15.3808, 73.8314], // Goa
  PNQ: [18.5793, 73.9089], // Pune
  COK: [10.152, 76.3916], // Kochi
  JAI: [26.8242, 75.8122], // Jaipur
  // International Airports
  LHR: [51.47, -0.4543], // London Heathrow
  JFK: [40.6413, -73.7781], // New York JFK
  SIN: [1.3644, 103.9915], // Singapore Changi
  DXB: [25.2532, 55.3657], // Dubai International
  FRA: [50.0379, 8.5622], // Frankfurt
  // Mock Routes Airports
  BRU: [50.9014, 4.4844], // Brussels
  GRO: [41.901, 2.7606], // Girona-Costa Brava
  LAX: [33.9416, -118.4085], // Los Angeles
  HND: [35.5494, 139.7798], // Tokyo Haneda
  SYD: [-33.9399, 151.1753], // Sydney Kingsford Smith
};

const getLat = (iata) => airportCoordinates[iata]?.[0] || 0;
const getLng = (iata) => airportCoordinates[iata]?.[1] || 0;

// Function to generate mock flight data for fallback
const generateMockFlightData = () => {
  // Create mock flight data based on the mockRoutes
  return mockRoutes.map((route, index) => {
    // Calculate a position somewhere between origin and destination
    const originCoords = airportCoordinates[route.departure.iata] || [0, 0];
    const destCoords = airportCoordinates[route.arrival.iata] || [0, 0];

    // Random progress along the route (between 0.2 and 0.8)
    const progress = 0.2 + Math.random() * 0.6;

    // Calculate intermediate point along great circle path
    const φ1 = (originCoords[0] * Math.PI) / 180;
    const λ1 = (originCoords[1] * Math.PI) / 180;
    const φ2 = (destCoords[0] * Math.PI) / 180;
    const λ2 = (destCoords[1] * Math.PI) / 180;

    const d =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin((φ2 - φ1) / 2), 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin((λ2 - λ1) / 2), 2)
        )
      );

    const A = Math.sin((1 - progress) * d) / Math.sin(d);
    const B = Math.sin(progress * d) / Math.sin(d);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const latitude = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const longitude = (Math.atan2(y, x) * 180) / Math.PI;

    // Calculate heading (direction) between points - this points toward destination
    const heading = getBearing(
      latitude,
      longitude,
      destCoords[0],
      destCoords[1]
    );

    return {
      id: `mock-${index}`,
      callsign: route.airline.callsign,
      airline: route.airline.name,
      flightNumber: route.flight.number,
      origin: route.departure.airport,
      originCode: route.departure.iata,
      destination: route.arrival.airport,
      destinationCode: route.arrival.iata,
      latitude,
      longitude,
      altitude: 30000 + Math.random() * 10000,
      heading,
      speed: 400 + Math.random() * 100,
      verticalRate:
        Math.random() > 0.5 ? Math.random() * 500 : -Math.random() * 500,
      status: "In Air",
      originCoordinates: { lat: originCoords[0], lng: originCoords[1] },
      destinationCoordinates: { lat: destCoords[0], lng: destCoords[1] },
    };
  });
};

const FlightMap = () => {
  const defaultCenter = [20, 0]; // More central global view
  const defaultZoom = 3;
  const flightZoom = 5; // Zoom level when a flight is selected

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // State to track clicked airports for path visualization
  const [clickedAirports, setClickedAirports] = useState([]);

  // Suppress console errors from browser extensions
  useLayoutEffect(() => {
    // Store the original console.error
    const originalConsoleError = console.error;

    // Override console.error to filter out specific errors
    console.error = function (...args) {
      // Check if the error message contains specific strings to filter
      const errorMessage = args.join(" ");
      if (
        errorMessage.includes(
          "The message port closed before a response was received"
        ) ||
        errorMessage.includes(
          "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
        ) ||
        errorMessage.includes("events.launchdarkly.com")
      ) {
        // Ignore these specific errors
        return;
      }

      // Pass through all other errors to the original console.error
      return originalConsoleError.apply(console, args);
    };

    // Cleanup function to restore the original console.error
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Mock airport data
  const airports = [
    { name: "Mumbai", code: "BOM", position: [19.0896, 72.8656] },
    { name: "Delhi", code: "DEL", position: [28.5562, 77.1] },
    { name: "Bangalore", code: "BLR", position: [13.1986, 77.7066] },
    { name: "New York", code: "JFK", position: [40.6413, -73.7781] },
    { name: "London", code: "LHR", position: [51.47, -0.4543] },
    { name: "Tokyo", code: "HND", position: [35.5494, 139.7798] },
    { name: "Dubai", code: "DXB", position: [25.2532, 55.3657] },
    { name: "Singapore", code: "SIN", position: [1.3644, 103.9915] },
  ];

  useEffect(() => {
    const fetchFlights = async () => {
      setLoadingFlights(true);
      try {
        const flightData = await fetchLiveFlights();

        // Check if we received valid data
        if (Array.isArray(flightData) && flightData.length > 0) {
          setFlights(flightData);
          setError(null); // Clear any previous errors
        } else {
          // If API returns empty array or invalid data, use mock data
          console.warn("No flight data received, using mock data instead");
          setFlights(generateMockFlightData());
        }
      } catch (error) {
        console.error("Error fetching flight data:", error);
        setError("Failed to load flight data. Using simulation data instead.");
        // Use mock data as fallback
        setFlights(generateMockFlightData());
      } finally {
        setLoadingFlights(false);
      }
    };

    fetchFlights();

    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      fetchFlights();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle flight marker click
  const handleFlightClick = (flight) => {
    setSelectedFlight(flight);

    // Find the origin and destination airports
    const originAirport = {
      name: flight.origin,
      position: [flight.originCoordinates.lat, flight.originCoordinates.lng],
      code: flight.originCode,
    };

    const destinationAirport = {
      name: flight.destination,
      position: [
        flight.destinationCoordinates.lat,
        flight.destinationCoordinates.lng,
      ],
      code: flight.destinationCode,
    };

    // Set the selected route
    setSelectedRoute({
      from: originAirport,
      to: destinationAirport,
      flight: flight,
    });

    // Clear any clicked airports when selecting a flight
    setClickedAirports([]);
  };

  const generateRoute = () => {
    setLoading(true);
    setError(null);

    const originAirport = airports.find(
      (airport) =>
        airport.code.toLowerCase() === origin.toLowerCase() ||
        airport.name.toLowerCase() === origin.toLowerCase()
    );
    const destAirport = airports.find(
      (airport) =>
        airport.code.toLowerCase() === destination.toLowerCase() ||
        airport.name.toLowerCase() === destination.toLowerCase()
    );

    if (!originAirport || !destAirport) {
      setError("Please enter valid airport codes or names");
      setLoading(false);
      return;
    }

    // Generate curved route path
    const curvedPath = generateCurve(
      originAirport.position,
      destAirport.position,
      50 // Number of segments for smooth curve
    );

    // Calculate distance and duration
    const distance = Math.floor(
      L.latLng(originAirport.position).distanceTo(
        L.latLng(destAirport.position)
      ) / 1000
    );
    const duration = Math.floor((distance / 800) * 60); // Assuming average speed of 800 km/h

    // Set route with curved path
    setRoute({
      from: originAirport,
      to: destAirport,
      path: curvedPath,
      distance,
      duration,
    });

    // Set clicked airports to show markers for origin and destination
    setClickedAirports([originAirport, destAirport]);
    setLoading(false);
  };

  return (
    <div className="p-6 text-gray-100">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Flight Map</h1>
          <p className="text-gray-400">
            Track live flights and plan your routes
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-800">
          <Calendar className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Route Planner and Flights List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Route Planner */}
          <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg">
            <CardHeader className="pb-2 border-b border-gray-800/50">
              <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                Route Planner
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin" className="text-gray-300">
                    Origin
                  </Label>
                  <div className="relative">
                    <Input
                      id="origin"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Airport code or name"
                      className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-gray-300">
                    Destination
                  </Label>
                  <div className="relative">
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Airport code or name"
                      className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generateRoute}
                  disabled={loading || !origin || !destination}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium shadow-lg hover:shadow-yellow-500/20 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Route <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {route && (
                  <div className="mt-4 p-4 bg-[#252525] border border-gray-800 rounded-lg animate-fadeIn">
                    <h3 className="text-md font-medium text-yellow-500 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Route Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">From:</span>
                        <span className="font-medium text-gray-200">
                          {route.from.name} ({route.from.code})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">To:</span>
                        <span className="font-medium text-gray-200">
                          {route.to.name} ({route.to.code})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Distance:</span>
                        <span className="font-medium text-gray-200">
                          {route.distance.toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. Duration:</span>
                        <span className="font-medium text-gray-200">
                          {Math.floor(route.duration / 60)}h{" "}
                          {route.duration % 60}m
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Flights List */}
          <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-800/50">
              <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
                <Plane className="w-5 h-5 mr-2 text-yellow-500" />
                Active Flights
                {loadingFlights && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[320px] overflow-y-auto">
                {flights.length > 0 ? (
                  <div className="divide-y divide-gray-800">
                    {flights.map((flight) => (
                      <div
                        key={flight.id}
                        className={`p-3 hover:bg-gray-800 cursor-pointer transition-colors ${
                          selectedFlight?.id === flight.id ? "bg-gray-800" : ""
                        }`}
                        onClick={() => handleFlightClick(flight)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-100">
                              {flight.airline} {flight.flightNumber}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {flight.callsign}
                            </p>
                          </div>
                          <div className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                            {flight.status}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 flex justify-between">
                          <span>
                            {flight.originCode} → {flight.destinationCode}
                          </span>
                          <span>{flight.altitude.toLocaleString()} ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-gray-500 mb-2" />
                    <p className="text-gray-400">
                      There are no active flights to display at this time.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center and Right Columns */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <Card
            className={`bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden ${
              selectedFlight ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <CardHeader className="pb-2 border-b border-gray-800/50">
              <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
                <Plane className="w-5 h-5 mr-2 text-yellow-500" />
                Live Flight Tracker
                {loadingFlights && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[650px] w-full relative">
                <MapContainer
                  center={defaultCenter}
                  zoom={defaultZoom}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  onClick={(e) => {
                    // Get the clicked position
                    const { lat, lng } = e.latlng;
                    console.log(`Map clicked at: ${lat}, ${lng}`);

                    // Find the closest airport to the clicked position if within reasonable distance
                    // This would be implemented here if needed
                  }}
                >
                  {/* Map Controller to programmatically control the map */}
                  <MapController
                    selectedFlight={selectedFlight}
                    selectedRoute={selectedRoute}
                    defaultCenter={defaultCenter}
                    defaultZoom={defaultZoom}
                    flightZoom={flightZoom}
                  />

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    className="map-tiles"
                  />

                  {/* Airport Markers - Only show when part of a route */}
                  {route && (
                    <>
                      <Marker position={route.from.position} icon={airportIcon}>
                        <Popup className="airport-popup">
                          <div className="bg-[#1f1f1f] text-gray-100 p-2 rounded-md border border-gray-800">
                            <h3 className="text-yellow-500 font-bold">
                              {route.from.name} ({route.from.code})
                            </h3>
                            <p className="text-sm text-gray-300">
                              Origin Airport
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                      <Marker position={route.to.position} icon={airportIcon}>
                        <Popup className="airport-popup">
                          <div className="bg-[#1f1f1f] text-gray-100 p-2 rounded-md border border-gray-800">
                            <h3 className="text-yellow-500 font-bold">
                              {route.to.name} ({route.to.code})
                            </h3>
                            <p className="text-sm text-gray-300">
                              Destination Airport
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}

                  {/* Route Line */}
                  {route && (
                    <Polyline
                      positions={generateCurve(
                        route.from.position,
                        route.to.position
                      )}
                      color="#EAB308"
                      weight={3}
                      opacity={0.7}
                      eventHandlers={{
                        click: () => {
                          // Show route details when clicking on the path
                          if (route) {
                            alert(
                              `Flight path: ${route.from.name} (${
                                route.from.code
                              }) to ${route.to.name} (${
                                route.to.code
                              })\nDistance: ${route.distance.toLocaleString()} km\nEstimated duration: ${Math.floor(
                                route.duration / 60
                              )}h ${route.duration % 60}m`
                            );
                          }
                        },
                      }}
                    />
                  )}

                  {/* Selected Route */}
                  {selectedRoute && (
                    <>
                      {/* Route Line with Aircraft Position */}
                      <Polyline
                        positions={generateCurve(selectedRoute.from.position, [
                          selectedRoute.flight.latitude,
                          selectedRoute.flight.longitude,
                        ]).concat(
                          generateCurve(
                            [
                              selectedRoute.flight.latitude,
                              selectedRoute.flight.longitude,
                            ],
                            selectedRoute.to.position
                          )
                        )}
                        color="#EAB308"
                        weight={3}
                        opacity={0.7}
                        smoothFactor={1}
                      />

                      {/* Origin Airport Marker */}
                      <Marker
                        position={selectedRoute.from.position}
                        icon={airportIcon}
                      >
                        <Popup className="airport-popup">
                          <div className="bg-[#1f1f1f] text-gray-100 p-2 rounded-md border border-gray-800">
                            <h3 className="text-yellow-500 font-bold">
                              {selectedRoute.from.name} (
                              {selectedRoute.from.code})
                            </h3>
                            <p className="text-sm text-gray-300">
                              Origin Airport
                            </p>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Destination Airport Marker */}
                      <Marker
                        position={selectedRoute.to.position}
                        icon={airportIcon}
                      >
                        <Popup className="airport-popup">
                          <div className="bg-[#1f1f1f] text-gray-100 p-2 rounded-md border border-gray-800">
                            <h3 className="text-yellow-500 font-bold">
                              {selectedRoute.to.name} ({selectedRoute.to.code})
                            </h3>
                            <p className="text-sm text-gray-300">
                              Destination Airport
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}

                  {/* Only show airports when they're clicked */}
                  {clickedAirports.map((airport) => (
                    <Marker
                      key={airport.code}
                      position={airport.position}
                      icon={airportIcon}
                    >
                      <Popup className="airport-popup">
                        <div className="bg-[#1f1f1f] text-gray-100 p-2 rounded-md border border-gray-800">
                          <h3 className="text-yellow-500 font-bold">
                            {airport.name} ({airport.code})
                          </h3>
                          <p className="text-sm text-gray-300">
                            {clickedAirports.length === 1
                              ? "Selected as origin"
                              : "Selected as destination"}
                          </p>
                          {clickedAirports.length === 1 && (
                            <button
                              className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClickedAirports([]);
                              }}
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Flight markers - only show the aircraft icon on the map, not the popup */}
                  {flights.map((flight) => {
                    // Calculate heading toward destination for each flight
                    const destinationHeading = getBearing(
                      flight.latitude || 0,
                      flight.longitude || 0,
                      flight.destinationCoordinates?.lat || 0,
                      flight.destinationCoordinates?.lng || 0
                    );

                    return (
                      <Marker
                        key={flight.id}
                        position={[flight.latitude || 0, flight.longitude || 0]}
                        icon={getPlaneIcon(
                          destinationHeading,
                          selectedFlight?.id === flight.id
                        )}
                        eventHandlers={{
                          click: () => handleFlightClick(flight),
                        }}
                      />
                    );
                  })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Flight Detail Panel - Only show when a flight is selected */}
          {selectedFlight && (
            <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg lg:col-span-1 overflow-hidden">
              <CardHeader className="pb-2 border-b border-gray-800/50">
                <CardTitle className="text-lg font-medium text-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <Plane className="w-5 h-5 mr-2 text-yellow-500" />
                    Flight Details
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setSelectedFlight(null);
                      setSelectedRoute(null);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-yellow-500">
                    {selectedFlight.airline} {selectedFlight.flightNumber}
                  </h2>
                  <p className="text-gray-300">
                    Callsign: {selectedFlight.callsign}
                  </p>
                  <div className="mt-2 inline-block px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                    {selectedFlight.status}
                  </div>
                </div>

                <div className="flex items-center justify-between my-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Origin</p>
                    <p className="text-gray-100 font-medium">
                      {selectedFlight.originCode}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {selectedFlight.origin}
                    </p>
                  </div>

                  <div className="flex-1 px-4">
                    <div className="relative">
                      <div className="h-0.5 bg-gray-700 w-full absolute top-1/2 transform -translate-y-1/2"></div>
                      <Plane
                        className="w-5 h-5 text-yellow-500 relative mx-auto"
                        style={{
                          transform: `rotate(${selectedFlight.heading}deg)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Destination</p>
                    <p className="text-gray-100 font-medium">
                      {selectedFlight.destinationCode}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {selectedFlight.destination}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-xs mb-1">Altitude</p>
                    <p className="text-gray-100 font-medium">
                      {selectedFlight.altitude.toLocaleString()} ft
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-xs mb-1">Ground Speed</p>
                    <p className="text-gray-100 font-medium">
                      {selectedFlight.speed} knots
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-xs mb-1">Heading</p>
                    <p className="text-gray-100 font-medium">
                      {selectedFlight.heading}°
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <p className="text-gray-400 text-xs mb-1">Vertical Rate</p>
                    <p className="text-gray-100 font-medium">
                      {selectedFlight.verticalRate > 0 ? "+" : ""}
                      {selectedFlight.verticalRate} ft/min
                    </p>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800 mb-4">
                  <p className="text-gray-400 text-xs mb-1">Current Position</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-400 text-xs">Latitude</p>
                      <p className="text-gray-100">
                        {selectedFlight.latitude.toFixed(4)}°
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Longitude</p>
                      <p className="text-gray-100">
                        {selectedFlight.longitude.toFixed(4)}°
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Component to control the map programmatically
const MapController = ({
  selectedFlight,
  selectedRoute,
  defaultCenter,
  defaultZoom,
  flightZoom,
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedFlight && selectedRoute) {
      try {
        // Create bounds that include origin, destination, and current flight position
        const bounds = L.latLngBounds(
          // Origin airport
          L.latLng(selectedRoute.from.position),
          // Destination airport
          L.latLng(selectedRoute.to.position)
        );

        // Add current flight position to the bounds
        bounds.extend(
          L.latLng(selectedFlight.latitude || 0, selectedFlight.longitude || 0)
        );

        // Check if bounds are valid before fitting map
        if (bounds.isValid()) {
          // Fit the map to these bounds with some padding
          map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1,
          });
        } else {
          // Fallback to default view if bounds are invalid
          map.setView(defaultCenter, defaultZoom, { animate: true });
        }
      } catch (error) {
        console.error("Error adjusting map view:", error);
        // Fallback to default view on error
        map.setView(defaultCenter, defaultZoom, { animate: true });
      }
    } else if (!selectedRoute) {
      // Reset to default view if no flight or route is selected
      map.setView(defaultCenter, defaultZoom, { animate: true });
    }
  }, [
    selectedFlight,
    selectedRoute,
    map,
    defaultCenter,
    defaultZoom,
    flightZoom,
  ]);

  return null;
};

export default FlightMap;
