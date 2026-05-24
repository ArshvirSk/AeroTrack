import { Card, CardContent } from "@/components/ui/card";
import { Building, Globe, Info, Loader2, MapPin, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Mock detailed airport data
const MOCK_AIRPORT_DETAILS = {
  BOM: {
    name: "Mumbai Chhatrapati Shivaji International",
    iata_code: "BOM",
    icao_code: "VABB",
    country_name: "India",
    city: "Mumbai",
    timezone: "Asia/Kolkata",
    latitude: 19.0886,
    longitude: 72.8681,
    elevation: 11,
    terminals: ["T1", "T2"],
    contact: {
      phone: "+91 22 6685 1010",
      email: "contact@csmia.aero",
      website: "https://www.csmia.aero",
    },
    facilities: [
      "Duty Free Shopping",
      "Restaurants",
      "Lounges",
      "Wi-Fi",
      "Currency Exchange",
      "Medical Services",
      "Prayer Room",
      "Car Rental",
    ],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
        alt: "Airport Terminal",
        caption: "Main Terminal Building",
      },
      {
        url: "https://images.unsplash.com/photo-1542296332-2e4473faf563",
        alt: "Runway View",
        caption: "Primary Runway",
      },
      {
        url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d",
        alt: "Control Tower",
        caption: "Air Traffic Control Tower",
      },
    ],
  },
  // Add more airport details as needed
};

const AirportDetails = () => {
  const { iataCode } = useParams();
  const [airport, setAirport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirportDetails = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const airportData = MOCK_AIRPORT_DETAILS[iataCode];
        if (!airportData) {
          throw new Error("Airport not found");
        }

        setAirport(airportData);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch airport details. Please try again.");
        setLoading(false);
      }
    };

    fetchAirportDetails();
  }, [iataCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
          <p className="text-gray-400">Loading airport details...</p>
        </div>
      </div>
    );
  }

  if (error || !airport) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error || "Airport not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Building className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                {airport.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <span className="text-yellow-500 font-semibold">
                  {airport.iata_code}
                </span>
                <span>•</span>
                <span>{airport.icao_code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Information */}
          <Card className="bg-[#1f1f1f] border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex text-white items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-500" />
                Location
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">City:</span>
                  <span className="ml-2 text-gray-100">{airport.city}</span>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>
                  <span className="ml-2 text-gray-100">
                    {airport.country_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Timezone:</span>
                  <span className="ml-2 text-gray-100">{airport.timezone}</span>
                </div>
                <div>
                  <span className="text-gray-400">Coordinates:</span>
                  <span className="ml-2 text-gray-100">
                    {airport.latitude}°N, {airport.longitude}°E
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Elevation:</span>
                  <span className="ml-2 text-gray-100">
                    {airport.elevation}m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-[#1f1f1f] border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex text-white items-center gap-2">
                <Globe className="w-5 h-5 text-yellow-500" />
                Contact
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <span className="ml-2 text-gray-100">
                    {airport.contact.phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="ml-2 text-gray-100">
                    {airport.contact.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Website:</span>
                  <a
                    href={airport.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-yellow-500 hover:text-yellow-400"
                  >
                    {airport.contact.website}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terminal Information */}
          <Card className="bg-[#1f1f1f] border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex text-white items-center gap-2">
                <Plane className="w-5 h-5 text-yellow-500" />
                Terminals
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {airport.terminals.map((terminal, index) => (
                  <div
                    key={index}
                    className="bg-[#252525] rounded-lg p-3 text-center text-gray-100"
                  >
                    {terminal}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          <Card className="bg-[#1f1f1f] border-gray-800 md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex text-white items-center gap-2">
                <Info className="w-5 h-5 text-yellow-500" />
                Photo Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {airport.photos?.map((photo, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg aspect-video bg-[#252525] border border-gray-800 hover:border-yellow-500/50 transition-colors"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className="bg-[#1f1f1f] border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-yellow-500" />
                Facilities
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {airport.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="bg-[#252525] rounded-lg p-2 text-sm text-gray-100"
                  >
                    {facility}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AirportDetails;
