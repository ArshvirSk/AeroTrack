import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLiveFlights } from "@/utils/api";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Globe,
  Loader2,
  MapPin,
  Plane,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flightStats, setFlightStats] = useState({
    total: 0,
    cruising: 0,
    climbing: 0,
    descending: 0,
    onGround: 0,
  });
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [altitudeData, setAltitudeData] = useState([]);
  const [airlineData, setAirlineData] = useState([]);

  useEffect(() => {
    const fetchFlightData = async () => {
      setLoading(true);
      try {
        const flightData = await fetchLiveFlights();
        setFlights(flightData);

        // Calculate flight statistics
        const stats = {
          total: flightData.length,
          cruising: flightData.filter((f) => f.status === "Cruising").length,
          climbing: flightData.filter((f) => f.status === "Climbing").length,
          descending: flightData.filter((f) => f.status === "Descending")
            .length,
          onGround: flightData.filter((f) => f.status === "On Ground").length,
        };
        setFlightStats(stats);

        // Generate popular routes based on current flights
        const routes = {};
        flightData.forEach((flight) => {
          const routeKey = `${flight.origin}-${flight.destination}`;
          if (routes[routeKey]) {
            routes[routeKey].count += 1;
          } else {
            routes[routeKey] = {
              origin: flight.origin,
              originCode: flight.originCode,
              destination: flight.destination,
              destinationCode: flight.destinationCode,
              count: 1,
            };
          }
        });

        // Sort routes by count and take top 5
        const topRoutes = Object.values(routes)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setPopularRoutes(topRoutes);

        // Generate altitude distribution data
        const altitudeBuckets = {
          "0-10k": 0,
          "10k-20k": 0,
          "20k-30k": 0,
          "30k-40k": 0,
          "40k+": 0,
        };

        flightData.forEach((flight) => {
          const altitude = flight.altitude || 0;
          if (altitude < 10000) {
            altitudeBuckets["0-10k"]++;
          } else if (altitude < 20000) {
            altitudeBuckets["10k-20k"]++;
          } else if (altitude < 30000) {
            altitudeBuckets["20k-30k"]++;
          } else if (altitude < 40000) {
            altitudeBuckets["30k-40k"]++;
          } else {
            altitudeBuckets["40k+"]++;
          }
        });

        const formattedAltitudeData = Object.entries(altitudeBuckets).map(
          ([range, count]) => ({
            range,
            count,
          })
        );

        setAltitudeData(formattedAltitudeData);

        // Generate airline distribution data
        const airlines = {};
        flightData.forEach((flight) => {
          const airline = flight.airline || "Unknown";
          if (airlines[airline]) {
            airlines[airline]++;
          } else {
            airlines[airline] = 1;
          }
        });

        // Get top airlines
        const topAirlines = Object.entries(airlines)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));

        setAirlineData(topAirlines);
      } catch (err) {
        console.error("Error fetching flight data:", err);
        setError("Failed to load flight data");
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();

    // Refresh data every 2 minutes
    const intervalId = setInterval(fetchFlightData, 120000);

    return () => clearInterval(intervalId);
  }, []);

  // Update the flight status pie chart data
  const flightStatusData = [
    { name: "Cruising", value: flightStats.cruising },
    { name: "Climbing", value: flightStats.climbing },
    { name: "Descending", value: flightStats.descending },
    { name: "On Ground", value: flightStats.onGround },
  ];

  const STATUS_COLORS = ["#EAB308", "#10B981", "#3B82F6", "#6B7280"];

  const COLORS = ["#EAB308", "#3A5463", "#1E1F23"];

  return (
    <div className="p-6 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400">Welcome back to your flight analytics</p>
        </div>
        <div className="flex items-center space-x-2 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-800">
          <Calendar className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4 flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Active Flights</p>
                  <div className="flex items-center">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-gray-100">
                          {flightStats.total}
                        </h3>
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded flex items-center">
                          Live <TrendingUp className="w-3 h-3 ml-0.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plane className="w-6 h-6 text-yellow-500 rotate-45" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4 flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Average Speed</p>
                  <div className="flex items-center">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-gray-100">
                          {flights.length > 0
                            ? Math.round(
                                flights.reduce(
                                  (sum, flight) => sum + (flight.speed || 0),
                                  0
                                ) / flights.length
                              )
                            : 0}{" "}
                          kts
                        </h3>
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded flex items-center">
                          Live <TrendingUp className="w-3 h-3 ml-0.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4 flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Average Altitude</p>
                  <div className="flex items-center">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-gray-100">
                          {flights.length > 0
                            ? Math.round(
                                flights.reduce(
                                  (sum, flight) => sum + (flight.altitude || 0),
                                  0
                                ) / flights.length
                              ).toLocaleString()
                            : 0}{" "}
                          ft
                        </h3>
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded flex items-center">
                          Live <TrendingUp className="w-3 h-3 ml-0.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Flight Data */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Real-time Flight Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Flights */}
          <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-yellow-500" />
                  Active Flights
                  {loading && (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin text-gray-400" />
                  )}
                </CardTitle>
                <div className="text-xs text-gray-400">Live data</div>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 pt-4 max-h-[300px] overflow-y-auto">
              {error ? (
                <div className="flex items-center justify-center py-6 text-gray-400">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  {error}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
                  <span className="text-gray-400">Loading flight data...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {flights.slice(0, 6).map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center justify-between p-3 bg-[#252525] rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                          <Plane className="w-5 h-5 text-yellow-500 rotate-45" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-100">
                            {flight.airline} {flight.flightNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            {flight.callsign}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-300">
                          <span>{flight.originCode}</span>
                          <ArrowRight className="w-3 h-3 mx-1 text-yellow-500" />
                          <span>{flight.destinationCode}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 justify-end mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded-full ${
                              flight.status === "Climbing"
                                ? "bg-green-500/20 text-green-400"
                                : flight.status === "Descending"
                                ? "bg-blue-500/20 text-blue-400"
                                : flight.status === "On Ground"
                                ? "bg-gray-500/20 text-gray-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {flight.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {flights.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      No active flights found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flight Status Distribution */}
          <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-100">
                  Flight Status
                </CardTitle>
                <div className="text-xs text-gray-400">Live distribution</div>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 pt-4">
              {loading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
                  <span className="text-gray-400">Loading status data...</span>
                </div>
              ) : (
                <>
                  <div className="h-[200px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={flightStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="#1a1a1a"
                          strokeWidth={2}
                        >
                          {flightStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#252525",
                            borderColor: "#333",
                            color: "#f3f4f6",
                            borderRadius: "0.375rem",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
                          itemStyle={{ color: "#f3f4f6" }}
                          labelStyle={{ color: "#9ca3af" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {flightStatusData.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[index % STATUS_COLORS.length],
                          }}
                        ></div>
                        <span className="text-xs text-gray-400">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flight Altitude Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-100">
                Flight Altitude Distribution
              </CardTitle>
              <div className="text-xs text-gray-400">Live data</div>
            </div>
          </CardHeader>
          <CardContent className="text-gray-300 pt-4">
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
                <span className="text-gray-400">Loading altitude data...</span>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={altitudeData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#EAB308"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#EAB308"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="range" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#252525",
                        borderColor: "#333",
                        color: "#f3f4f6",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                      itemStyle={{ color: "#f3f4f6" }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Flights"
                      stroke="#EAB308"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      dot={{ fill: "#EAB308", r: 4 }}
                      activeDot={{
                        r: 6,
                        fill: "#EAB308",
                        stroke: "#252525",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Routes */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Popular Routes
        </h2>
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                Top Routes
                {loading && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin text-gray-400" />
                )}
              </CardTitle>
              <div className="text-xs text-gray-400">
                Based on active flights
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-gray-300 pt-4">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
                <span className="text-gray-400">Analyzing routes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularRoutes.map((route, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[#252525] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-md flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-gray-100 font-medium">
                          {route.originCode}
                        </div>
                        <div className="mx-2 w-16 h-[2px] bg-gradient-to-r from-gray-700 via-yellow-500 to-gray-700 relative">
                          <div className="absolute -top-[7px] left-1/2 transform -translate-x-1/2">
                            <Plane className="w-4 h-4 text-yellow-500 rotate-45" />
                          </div>
                        </div>
                        <div className="text-gray-100 font-medium">
                          {route.destinationCode}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {route.origin} to {route.destination}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-yellow-500 mr-2">
                        ₹
                        {Math.round(
                          route.price || Math.random() * 30000 + 20000
                        ).toLocaleString("en-IN")}
                      </div>
                      <div className="bg-yellow-500/10 text-yellow-500 text-xs font-medium px-3 py-1.5 rounded-full">
                        {route.count} {route.count === 1 ? "flight" : "flights"}
                      </div>
                    </div>
                  </div>
                ))}
                {popularRoutes.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-gray-400">
                    No route data available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flight Share and Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-100">
                Top Airlines
              </CardTitle>
              <div className="text-xs text-gray-400">Live data</div>
            </div>
          </CardHeader>
          <CardContent className="text-gray-300 pt-4">
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
                <span className="text-gray-400">Loading airline data...</span>
              </div>
            ) : (
              <>
                <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={airlineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        stroke="#1a1a1a"
                        strokeWidth={2}
                      >
                        {airlineData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#252525",
                          borderColor: "#333",
                          color: "#f3f4f6",
                          borderRadius: "0.375rem",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        itemStyle={{ color: "#f3f4f6" }}
                        labelStyle={{ color: "#9ca3af" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {airlineData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-xs text-gray-400">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-100">
                Flight Speed Distribution
              </CardTitle>
              <div className="text-xs text-gray-400">Live data</div>
            </div>
          </CardHeader>
          <CardContent className="text-gray-300 pt-4">
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mr-2" />
                <span className="text-gray-400">Loading speed data...</span>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={flights.slice(0, 10).map((flight, index) => ({
                      id: index + 1,
                      speed: flight.speed || 0,
                      callsign: flight.callsign,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="id"
                      stroke="#666"
                      label={{
                        value: "Flight #",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#666",
                      }}
                    />
                    <YAxis
                      stroke="#666"
                      label={{
                        value: "Speed (knots)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#666",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#252525",
                        borderColor: "#333",
                        color: "#f3f4f6",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                      itemStyle={{ color: "#f3f4f6" }}
                      labelStyle={{ color: "#9ca3af" }}
                      formatter={(value, name, props) => {
                        if (name === "speed") {
                          return [`${value} knots`, "Speed"];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(value) => {
                        const flight = flights[value - 1];
                        return flight ? flight.callsign : "Unknown";
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      stroke="#EAB308"
                      strokeWidth={2}
                      dot={{
                        fill: "#EAB308",
                        r: 4,
                        strokeWidth: 2,
                        stroke: "#1a1a1a",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#EAB308",
                        stroke: "#252525",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
