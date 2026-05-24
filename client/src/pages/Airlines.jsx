import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Loader2,
  Plane,
  Search,
  MapPin,
  Globe,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock airline data since we're replacing AviationStack
const MOCK_AIRLINES = [
  {
    name: "Air India",
    iata_code: "AI",
    icao_code: "AIC",
    country_name: "India",
  },
  { name: "IndiGo", iata_code: "6E", icao_code: "IGO", country_name: "India" },
  {
    name: "SpiceJet",
    iata_code: "SG",
    icao_code: "SEJ",
    country_name: "India",
  },
  { name: "Vistara", iata_code: "UK", icao_code: "VTI", country_name: "India" },
  { name: "GoAir", iata_code: "G8", icao_code: "GOW", country_name: "India" },
  {
    name: "Emirates",
    iata_code: "EK",
    icao_code: "UAE",
    country_name: "United Arab Emirates",
  },
  {
    name: "Qatar Airways",
    iata_code: "QR",
    icao_code: "QTR",
    country_name: "Qatar",
  },
  {
    name: "Singapore Airlines",
    iata_code: "SQ",
    icao_code: "SIA",
    country_name: "Singapore",
  },
  {
    name: "Lufthansa",
    iata_code: "LH",
    icao_code: "DLH",
    country_name: "Germany",
  },
  {
    name: "British Airways",
    iata_code: "BA",
    icao_code: "BAW",
    country_name: "United Kingdom",
  },
  {
    name: "Air France",
    iata_code: "AF",
    icao_code: "AFR",
    country_name: "France",
  },
  {
    name: "KLM",
    iata_code: "KL",
    icao_code: "KLM",
    country_name: "Netherlands",
  },
  {
    name: "American Airlines",
    iata_code: "AA",
    icao_code: "AAL",
    country_name: "United States",
  },
  {
    name: "Delta Air Lines",
    iata_code: "DL",
    icao_code: "DAL",
    country_name: "United States",
  },
  {
    name: "United Airlines",
    iata_code: "UA",
    icao_code: "UAL",
    country_name: "United States",
  },
];

const Airlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchAirlines = async () => {
      try {
        // Simulate network delay
        setTimeout(() => {
          setAirlines(MOCK_AIRLINES);
          setLoading(false);
        }, 800);
      } catch (error) {
        setError("Failed to fetch airlines. Please try again.");
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  const filteredAirlines = airlines.filter((airline) => {
    const name = airline.name ? airline.name.toLowerCase() : "";
    const iata = airline.iata_code ? airline.iata_code.toLowerCase() : "";
    const icao = airline.icao_code ? airline.icao_code.toLowerCase() : "";
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
            Airlines Directory
          </h1>
          <p className="text-gray-400">
            Browse international airlines and their details
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
            <p className="text-gray-400">Loading airlines data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {filteredAirlines.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-[#1f1f1f] border border-gray-800 rounded-lg">
              <Plane className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-lg font-medium mb-1">No airlines found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredAirlines.map((airline, index) => (
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
                          <Plane className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 mb-1 line-clamp-1">
                            {airline.name}
                          </h3>
                          <div className="flex items-center text-yellow-500 font-bold text-lg">
                            {airline.iata_code || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">ICAO:</span>
                          <span className="ml-2">
                            {airline.icao_code || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Globe className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Country:</span>
                          <span className="ml-2">{airline.country_name}</span>
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

export default Airlines;
