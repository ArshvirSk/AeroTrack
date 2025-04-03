import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Calendar, Loader2, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { getFlights, searchFlights } from "../api/flights";

const Flights = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightResults, setFlightResults] = useState([]);

  useEffect(() => {
    // Set default date to tomorrow
    setError(null);
    setLoading(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);

    // Load initial flights
    getFlights()
      .then((flights) => {
        setFlightResults(flights);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        console.error("Error fetching flights:", error);
      });
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const flights = await searchFlights({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
      });
      setFlightResults(flights);
    } catch (error) {
      setError("Failed to fetch flights. Please try again.");
      setFlightResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (flight) => {
    const searchQuery = `${flight.airline} ${flight.flightNumber} ${flight.origin} to ${flight.destination}`;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
      "_blank"
    );
  };

  return (
    <div className="p-6 text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          Search Flights
        </h1>
        <p className="text-gray-400">
          Enter origin and destination to search for flights, or leave empty to
          see popular routes
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Form */}
      <Card className="mb-6 bg-[#1E1F23] border-[#2F4550] hover:border-[#3A5463] transition-colors">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">From (IATA Code)</Label>
              <Input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-[#2F4550] border-[#3A5463] text-gray-100 placeholder:text-gray-400"
                placeholder="e.g. BOM"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">To (IATA Code)</Label>
              <Input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-[#2F4550] border-[#3A5463] text-gray-100 placeholder:text-gray-400"
                placeholder="e.g. DEL"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 bg-[#2F4550] border-[#3A5463] text-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 flex items-center gap-2"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Flights"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flight Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-100">
          {loading
            ? "Loading flights..."
            : `Available Flights (${flightResults.length})`}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : flightResults.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No flights found for your search criteria
          </div>
        ) : (
          <div className="grid gap-4">
            {flightResults.map((flight, index) => (
              <Card
                key={index}
                className="bg-[#1E1F23] border-[#2F4550] hover:border-[#3A5463] transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#2F4550] rounded-lg flex flex-col items-center justify-center p-2">
                        <Plane className="w-5 h-5 text-yellow-500 mb-1" />
                        <span className="text-xs text-gray-400">
                          {flight.flight?.iata || "N/A"}
                        </span>
                        <span className="text-sm font-medium text-gray-100">
                          {flight.airline?.name || "Unknown Airline"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-100">
                            {flight.departure?.iata || "Unknown"}
                          </span>
                          <div className="text-yellow-500">→</div>
                          <span className="font-semibold text-gray-100">
                            {flight.arrival?.iata || "Unknown"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {flight.departure?.scheduled?.split("T")[1] || "N/A"}{" "}
                          - {flight.arrival?.scheduled?.split("T")[1] || "N/A"}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => handleBooking(flight)}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flights;
