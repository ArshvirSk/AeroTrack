import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePDFReport } from "@/utils/pdfGenerator";
import axios from "axios";
import {
    AlertCircle,
    ArrowUpRight,
    Calendar,
    DollarSign,
    Download,
    FileText,
    Loader2,
    TrendingUp,
    Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const API_BASE_URL = "http://localhost:5000";

const Report = () => {
  // State for data
  const [metrics, setMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [flightReports, setFlightReports] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [loading, setLoading] = useState({
    metrics: true,
    revenue: true,
    flights: true,
  });
  const [error, setError] = useState({
    metrics: null,
    revenue: null,
    flights: null,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  // Fetch data from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading((prev) => ({ ...prev, metrics: true }));
        // Fetch live flight data with authentication
        const liveFlights = await axios.get(
          `${API_BASE_URL}/api/live-flights`,
          getAuthConfig()
        );
        if (liveFlights.data) {
          // Calculate metrics from live flight data
          const flightMetrics = {
            totalFlights: liveFlights.data.length,
            totalRevenue: liveFlights.data.reduce(
              (acc, flight) =>
                acc + (flight.price || Math.floor(Math.random() * 3000) + 2000),
              0
            ),
            totalPassengers: liveFlights.data.reduce(
              (acc, flight) => acc + (flight.passengers || 150),
              0
            ),
            loadFactor: Math.round(Math.random() * 20 + 70), // Simulated load factor between 70-90%
            flightsGrowth: Math.round(Math.random() * 10 + 5),
            revenueGrowth: Math.round(Math.random() * 15 + 5),
            passengersGrowth: Math.round(Math.random() * 12 + 3),
            loadFactorGrowth: Math.round(Math.random() * 5 + 1),
          };
          setMetrics(flightMetrics);
          setError((prev) => ({ ...prev, metrics: null }));
          setRetryCount(0);
        } else {
          throw new Error("No data received");
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchMetrics();
          }, RETRY_DELAY * Math.pow(2, retryCount));
        } else {
          setError((prev) => ({
            ...prev,
            metrics: "Failed to load metrics data after multiple attempts",
          }));
        }
      } finally {
        setLoading((prev) => ({ ...prev, metrics: false }));
      }
    };

    const fetchRevenueData = async () => {
      try {
        setLoading((prev) => ({ ...prev, revenue: true }));
        // Fetch live flight data for revenue calculation
        const liveFlights = await axios.get(
          `${API_BASE_URL}/api/live-flights`,
          getAuthConfig()
        );
        if (liveFlights.data) {
          // Generate revenue data based on individual flights
          const formattedRevenueData = liveFlights.data.map((flight) => ({
            flightId: flight.id,
            value: flight.price || Math.floor(Math.random() * 5000) + 2000,
            label: `${flight.flightNumber} (${flight.originCode} → ${flight.destinationCode})`,
          }));

          setRevenueData(formattedRevenueData);
          setError((prev) => ({ ...prev, revenue: null }));
          setRetryCount(0);
        } else {
          throw new Error("No data received");
        }
      } catch (err) {
        console.error("Error fetching revenue data:", err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchRevenueData();
          }, RETRY_DELAY * Math.pow(2, retryCount));
        } else {
          setError((prev) => ({
            ...prev,
            revenue: "Failed to load revenue data after multiple attempts",
          }));
        }
      } finally {
        setLoading((prev) => ({ ...prev, revenue: false }));
      }
    };

    const fetchFlightReports = async () => {
      try {
        setLoading((prev) => ({ ...prev, flights: true }));
        const liveFlights = await axios.get(
          `${API_BASE_URL}/api/live-flights`,
          getAuthConfig()
        );
        
        if (liveFlights.data) {
          // Generate flight reports from live data
          const reports = liveFlights.data.map((flight) => ({
            id: flight.id,
            date: flight.departure?.scheduled || new Date().toISOString(),
            type: "Live Flight",
            status: flight.status,
            metrics: {
              flightNumber: flight.flightNumber,
              airline: flight.airline,
              origin: flight.origin,
              destination: flight.destination,
              altitude: flight.altitude,
              speed: flight.speed,
            },
          }));
          setFlightReports(reports);
          setError((prev) => ({ ...prev, flights: null }));
          setRetryCount(0);
        } else {
          throw new Error("No data received");
        }
      } catch (err) {
        console.error("Error fetching flight reports:", err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchFlightReports();
          }, RETRY_DELAY * Math.pow(2, retryCount));
        } else {
          setError((prev) => ({
            ...prev,
            flights: "Failed to load flight reports after multiple attempts",
          }));
        }
      } finally {
        setLoading((prev) => ({ ...prev, flights: false }));
      }
    };

    fetchMetrics();
    fetchRevenueData();
    fetchFlightReports();
  }, [selectedPeriod]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Handle view report
  const handleViewReport = async (reportId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/flight/${reportId}`,
        getAuthConfig()
      );
      setSelectedReport(response.data);
      setReportModalOpen(true);
    } catch (err) {
      console.error("Error fetching report details:", err);
    }
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      // Simulate report generation with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a new report entry
      const newReport = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: "General",
        status: "Generated",
        metrics: {
          totalFlights: metrics.totalFlights,
          totalRevenue: metrics.totalRevenue,
          totalPassengers: metrics.totalPassengers,
          avgLoadFactor: metrics.avgLoadFactor,
        },
      };

      // Add the new report to the flightReports state
      setFlightReports((prevReports) => [newReport, ...prevReports]);

      // Show success message
      alert("Report generated successfully! You can now download it.");
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again later.");
    } finally {
      setGenerating(false);
    }
  };

  // References for charts
  const revenueChartRef = useRef(null);

  // Handle download report
  const handleDownloadReport = async () => {
    try {
      // Prepare data for PDF generation
      const reportData = {
        metrics,
        revenueData,
      };

      // Prepare chart references
      const chartRefs = {
        revenueChart: revenueChartRef,
      };

      // Generate PDF document
      const doc = await generatePDFReport(reportData, chartRefs);

      // Save the PDF
      doc.save("aviation-report.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  return (
    <div className="p-6 text-gray-100">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Flight Reports
          </h1>
          <p className="text-gray-400">
            Analytics and performance metrics for your flights
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-800">
          <Calendar className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">Total Flights</p>
                <div className="flex items-center justify-between">
                  {loading.metrics ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-100">
                        {metrics?.totalFlights || "N/A"}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-500" />
                      </div>
                    </>
                  )}
                </div>
                {!loading.metrics && metrics && (
                  <div className="mt-2 flex items-center text-xs text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+{metrics.flightsGrowth}% from last month</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">Revenue</p>
                <div className="flex items-center justify-between">
                  {loading.metrics ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-100">
                        ${metrics?.totalRevenue.toLocaleString() || "N/A"}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-yellow-500" />
                      </div>
                    </>
                  )}
                </div>
                {!loading.metrics && metrics && (
                  <div className="mt-2 flex items-center text-xs text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+{metrics.revenueGrowth}% from last month</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">Passengers</p>
                <div className="flex items-center justify-between">
                  {loading.metrics ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-100">
                        {metrics?.totalPassengers.toLocaleString() || "N/A"}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-yellow-500" />
                      </div>
                    </>
                  )}
                </div>
                {!loading.metrics && metrics && (
                  <div className="mt-2 flex items-center text-xs text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+{metrics.passengersGrowth}% from last month</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full"></div>
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">Load Factor</p>
                <div className="flex items-center justify-between">
                  {loading.metrics ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-100">
                        {metrics?.loadFactor || "N/A"}%
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                      </div>
                    </>
                  )}
                </div>
                {!loading.metrics && metrics && (
                  <div className="mt-2 flex items-center text-xs text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+{metrics.loadFactorGrowth}% from last month</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview and Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-100">
                Revenue Overview
              </CardTitle>
              <div className="flex space-x-2">
                <button
                  className={`text-xs px-2 py-1 ${
                    selectedPeriod === "monthly"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "hover:bg-gray-800 text-gray-400"
                  } rounded-md`}
                  onClick={() => handlePeriodChange("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`text-xs px-2 py-1 ${
                    selectedPeriod === "yearly"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "hover:bg-gray-800 text-gray-400"
                  } rounded-md`}
                  onClick={() => handlePeriodChange("yearly")}
                >
                  Yearly
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-gray-300 pt-4">
            <div className="h-[300px]">
              {loading.revenue ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-300">
                    Loading chart data...
                  </span>
                </div>
              ) : error.revenue ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                  <p className="text-gray-300 text-center">{error.revenue}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    ref={revenueChartRef}
                    data={revenueData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
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
                          stopColor="#fbbf24"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#fbbf24"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      stroke="#666"
                      tick={{ fill: "#999", fontSize: 10 }}
                      tickLine={{ stroke: "#666" }}
                      axisLine={{ strokeWidth: 2 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={60}
                    />
                    <YAxis
                      stroke="#666"
                      tick={{ fill: "#999" }}
                      tickLine={{ stroke: "#666" }}
                      axisLine={{ strokeWidth: 2 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f1f1f",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        padding: "10px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      itemStyle={{ color: "#fbbf24", fontSize: "14px" }}
                      formatter={(value) =>
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                      labelStyle={{
                        color: "#999",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                      cursor={{ stroke: "#666", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      name="Revenue"
                      activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-100">
                Monthly Statistics
              </CardTitle>
              <button
                className="text-xs text-yellow-500 hover:text-yellow-400 flex items-center"
                onClick={handleDownloadReport}
              >
                Download Report <Download className="w-3 h-3 ml-1" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="text-gray-300 pt-4">
            <div className="h-[300px]">
              {loading.revenue ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-300">
                    Loading chart data...
                  </span>
                </div>
              ) : error.revenue ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                  <p className="text-gray-300 text-center">{error.revenue}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="label"
                      stroke="#666"
                      tick={{ fill: "#999", fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={60}
                    />
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
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Bar dataKey="value" fill="#EAB308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flight Reports Table */}
      <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg overflow-hidden">
        <CardHeader className="pb-2 border-b border-gray-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-gray-100">
              Recent Flight Reports
            </CardTitle>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium shadow-lg hover:shadow-yellow-500/20 transition-all duration-200"
              onClick={handleGenerateReport}
            >
              <FileText className="w-4 h-4 mr-2" /> Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-gray-300 pt-4">
          {loading.flights ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              <span className="ml-2 text-gray-300">
                Loading flight reports...
              </span>
            </div>
          ) : error.flights ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
              <p className="text-gray-300 text-center">{error.flights}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Flights
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Passengers
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Load Factor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {flightReports.map((flight, index) => (
                    <tr
                      key={flight.id || index}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {flight.date}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                          {flight.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        {flight.metrics?.totalFlights || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        {flight.metrics?.totalPassengers?.toLocaleString() ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        {flight.metrics?.avgLoadFactor
                          ? `${flight.metrics.avgLoadFactor}%`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-yellow-500">
                        ${(flight.metrics?.totalRevenue || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-400 hover:text-yellow-500 border-gray-700 hover:border-yellow-500 transition-colors"
                          onClick={() => handleViewReport(flight.id)}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      {reportModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500">
                    Flight Report: {selectedReport.flightNo}
                  </h2>
                  <p className="text-gray-400">{selectedReport.date}</p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-800 transition-colors"
                  onClick={() => setReportModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-[#252525] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-medium text-gray-100 mb-3">
                      Flight Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Route:</span>
                        <span className="text-gray-200">
                          {selectedReport.route}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Departure:</span>
                        <span className="text-gray-200">
                          {selectedReport.departureTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Arrival:</span>
                        <span className="text-gray-200">
                          {selectedReport.arrivalTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Aircraft:</span>
                        <span className="text-gray-200">
                          {selectedReport.aircraft}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Distance:</span>
                        <span className="text-gray-200">
                          {selectedReport.distance} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">
                          {selectedReport.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#252525] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-medium text-gray-100 mb-3">
                      Performance Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue:</span>
                        <span className="text-yellow-500">
                          ${selectedReport.revenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Passengers:</span>
                        <span className="text-gray-200">
                          {selectedReport.passengers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Load Factor:</span>
                        <span className="text-gray-200">
                          {selectedReport.loadFactor}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Crew Members:</span>
                        <span className="text-gray-200">
                          {selectedReport.crewMembers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fuel Consumption:</span>
                        <span className="text-gray-200">
                          {selectedReport.fuelConsumption} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delay:</span>
                        <span className="text-gray-200">
                          {selectedReport.delayMinutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#252525] p-4 rounded-lg border border-gray-800 mb-6">
                <h3 className="text-lg font-medium text-gray-100 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weather Conditions:</span>
                    <span className="text-gray-200">
                      {selectedReport.weatherConditions}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Notes:</span>
                    <p className="text-gray-200 bg-[#1a1a1a] p-3 rounded border border-gray-800">
                      {selectedReport.notes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-[#252525] hover:bg-gray-700 text-gray-100 border border-gray-800 font-medium mr-2"
                  onClick={() => setReportModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium"
                  onClick={handleDownloadReport}
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
