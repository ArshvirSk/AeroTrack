import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Loader2,
  Building,
  Search,
  MapPin,
  Globe,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock airport data since we're replacing AviationStack
const MOCK_AIRPORTS = [
  {
    name: "Mumbai Chhatrapati Shivaji International",
    iata_code: "BOM",
    icao_code: "VABB",
    country_name: "India",
  },
  {
    name: "Delhi Indira Gandhi International",
    iata_code: "DEL",
    icao_code: "VIDP",
    country_name: "India",
  },
  {
    name: "Bengaluru Kempegowda International",
    iata_code: "BLR",
    icao_code: "VOBL",
    country_name: "India",
  },
  {
    name: "Hyderabad Rajiv Gandhi International",
    iata_code: "HYD",
    icao_code: "VOHS",
    country_name: "India",
  },
  {
    name: "Chennai International",
    iata_code: "MAA",
    icao_code: "VOMM",
    country_name: "India",
  },
  {
    name: "Kolkata Netaji Subhas Chandra Bose International",
    iata_code: "CCU",
    icao_code: "VECC",
    country_name: "India",
  },
  {
    name: "Goa Dabolim",
    iata_code: "GOI",
    icao_code: "VAGO",
    country_name: "India",
  },
  {
    name: "Pune International",
    iata_code: "PNQ",
    icao_code: "VAPO",
    country_name: "India",
  },
  {
    name: "Kochi International",
    iata_code: "COK",
    icao_code: "VOCI",
    country_name: "India",
  },
  {
    name: "Jaipur International",
    iata_code: "JAI",
    icao_code: "VIJP",
    country_name: "India",
  },
  {
    name: "Heathrow Airport",
    iata_code: "LHR",
    icao_code: "EGLL",
    country_name: "United Kingdom",
  },
  {
    name: "John F. Kennedy International",
    iata_code: "JFK",
    icao_code: "KJFK",
    country_name: "United States",
  },
  {
    name: "Singapore Changi Airport",
    iata_code: "SIN",
    icao_code: "WSSS",
    country_name: "Singapore",
  },
  {
    name: "Dubai International Airport",
    iata_code: "DXB",
    icao_code: "OMDB",
    country_name: "United Arab Emirates",
  },
  {
    name: "Frankfurt Airport",
    iata_code: "FRA",
    icao_code: "EDDF",
    country_name: "Germany",
  },
];

const Airports = () => {
  const [airports, setAirports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchAirports = async () => {
      try {
        // Simulate network delay
        setTimeout(() => {
          setAirports(MOCK_AIRPORTS);
          setLoading(false);
        }, 800);
      } catch (error) {
        setError("Failed to fetch airports. Please try again.");
        setLoading(false);
      }
    };

    fetchAirports();
  }, []);

  const filteredAirports = airports.filter((airport) => {
    const name = airport.name ? airport.name.toLowerCase() : "";
    const iata = airport.iata_code ? airport.iata_code.toLowerCase() : "";
    const icao = airport.icao_code ? airport.icao_code.toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) || iata.includes(search) || icao.includes(search)
    );
  });

  return (
    <div className="p-6 text-gray-100">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Airports Directory
          </h1>
          <p className="text-gray-400">
            Browse international airports and their details
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-800">
          <Calendar className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by name, IATA, or ICAO code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#252525] border-gray-800 text-gray-100 placeholder:text-gray-400 focus:border-yellow-500/50 focus:ring-yellow-500/20"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500 animate-pulse">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
            <p className="text-gray-400">Loading airports data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {filteredAirports.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-[#1f1f1f] border border-gray-800 rounded-lg">
              <Building className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-lg font-medium mb-1">No airports found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredAirports.map((airport, index) => (
              <Card
                key={index}
                className={`bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 card-hover stagger-${
                  (index % 4) + 1
                }`}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                    <div className="p-4">
                      <div className="flex items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                          <Building className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 mb-1 line-clamp-1">
                            {airport.name}
                          </h3>
                          <div className="flex items-center text-yellow-500 font-bold text-lg">
                            {airport.iata_code || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">ICAO:</span>
                          <span className="ml-2">
                            {airport.icao_code || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Globe className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Country:</span>
                          <span className="ml-2">{airport.country_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Airports;
