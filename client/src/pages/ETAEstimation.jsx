import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as tf from "@tensorflow/tfjs";
import {
  ArrowRight,
  Calendar,
  Calendar as CalendarIcon,
  Clock,
  Cloud,
  CloudLightning,
  CloudRain,
  Info,
  Loader2,
  MapPin,
  Plane,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAirports, fetchWeatherByCity } from "../utils/api";

// Simple ETA prediction model
class ETAPredictionModel {
  constructor() {
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create a sequential model
      this.model = tf.sequential();

      // Add layers
      this.model.add(
        tf.layers.dense({
          inputShape: [4], // distance, speed, weather condition, aircraft type
          units: 8,
          activation: "relu",
        })
      );

      this.model.add(
        tf.layers.dense({
          units: 4,
          activation: "relu",
        })
      );

      this.model.add(
        tf.layers.dense({
          units: 1, // ETA adjustment in minutes
          activation: "linear",
        })
      );

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: "meanSquaredError",
      });

      // Train with synthetic data
      await this.trainWithSyntheticData();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize ETA prediction model:", error);
      return false;
    }
  }

  generateSyntheticData(numSamples = 500) {
    const xs = [];
    const ys = [];

    for (let i = 0; i < numSamples; i++) {
      // Generate random inputs
      const distance = Math.random() * 5000 + 100; // 100-5100 km
      const speed = Math.random() * 300 + 500; // 500-800 km/h
      const weatherCondition = Math.floor(Math.random() * 4); // 0-3 (clear, cloudy, rainy, stormy)
      const aircraftType = Math.floor(Math.random() * 2); // 0-1 (commercial, private)

      // Add inputs
      xs.push([distance, speed, weatherCondition, aircraftType]);

      // Calculate synthetic ETA adjustment
      // Base ETA = distance / speed (hours)
      const baseETA = distance / speed;

      // Add delays based on weather and aircraft
      let adjustment = 0;

      // Weather affects ETA
      if (weatherCondition === 1) adjustment += 0.1; // cloudy: 5% longer
      if (weatherCondition === 2) adjustment += 0.3; // rainy: 15% longer
      if (weatherCondition === 3) adjustment += 0.45; // stormy: 30% longer

      // Aircraft type affects ETA
      if (aircraftType === 1) adjustment += 0.1; // private: 10% longer (less efficient routing)

      // Convert to minutes of delay
      const delayMinutes = baseETA * adjustment * 60;

      ys.push([delayMinutes]);
    }

    return {
      xs: tf.tensor2d(xs),
      ys: tf.tensor2d(ys),
    };
  }

  calculateR2Score(yTrue, yPred) {
    const mean = tf.mean(yTrue);
    const totalSum = tf.sum(tf.square(tf.sub(yTrue, mean)));
    const residualSum = tf.sum(tf.square(tf.sub(yTrue, yPred)));
    const r2 = tf.sub(1, tf.div(residualSum, totalSum));
    return r2.dataSync()[0];
  }

  async trainWithSyntheticData() {
    const { xs, ys } = this.generateSyntheticData();

    // Split data into training and validation sets (80-20 split)
    const splitIdx = Math.floor(xs.shape[0] * 0.8);
    const xTrain = xs.slice([0, 0], [splitIdx, -1]);
    const yTrain = ys.slice([0, 0], [splitIdx, -1]);
    const xVal = xs.slice([splitIdx, 0], [-1, -1]);
    const yVal = ys.slice([splitIdx, 0], [-1, -1]);

    await this.model.fit(xTrain, yTrain, {
      epochs: 50,
      batchSize: 32,
      validationData: [xVal, yVal],
    });

    // Calculate and log R² score on validation set
    const predictions = this.model.predict(xVal);
    const r2Score = this.calculateR2Score(yVal, predictions);
    console.log(`Validation R² Score: ${r2Score.toFixed(4)}`);

    // Cleanup
    xs.dispose();
    ys.dispose();
    xTrain.dispose();
    yTrain.dispose();
    xVal.dispose();
    yVal.dispose();
    predictions.dispose();
  }

  async predict(input) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const { distance, speed, weatherCondition, aircraftType } = input;

      // Convert to tensor
      const inputTensor = tf.tensor2d([
        [distance, speed, weatherCondition, aircraftType],
      ]);

      // Predict delay in minutes
      const prediction = this.model.predict(inputTensor);
      const delayMinutes = (await prediction.data())[0];

      // Clean up
      inputTensor.dispose();
      prediction.dispose();

      // Base ETA calculation (hours)
      const baseETA = distance / speed;

      // Total ETA in hours (base + delay)
      const totalETAHours = baseETA + delayMinutes / 60;

      // Convert to hours and minutes
      const hours = Math.floor(totalETAHours);
      const minutes = Math.round((totalETAHours - hours) * 60);

      return {
        baseETA: this.formatTime(baseETA),
        delayMinutes: Math.round(delayMinutes),
        totalETA: `${hours}h ${minutes}m`,
        hours,
        minutes,
      };
    } catch (error) {
      console.error("ETA prediction error:", error);
      return this.fallbackPrediction(input);
    }
  }

  fallbackPrediction(input) {
    const { distance, speed, weatherCondition, aircraftType } = input;

    // Base ETA calculation (hours)
    const baseETA = distance / speed;

    // Add delays based on weather and aircraft
    let adjustment = 0;

    // Weather affects ETA
    if (weatherCondition === 1) adjustment += 0.05; // cloudy: 5% longer
    if (weatherCondition === 2) adjustment += 0.15; // rainy: 15% longer
    if (weatherCondition === 3) adjustment += 0.3; // stormy: 30% longer

    // Aircraft type affects ETA
    if (aircraftType === 1) adjustment += 0.1; // private: 10% longer

    // Calculate delay in minutes
    const delayMinutes = Math.round(baseETA * adjustment * 60);

    // Total ETA in hours
    const totalETAHours = baseETA + delayMinutes / 60;

    // Convert to hours and minutes
    const hours = Math.floor(totalETAHours);
    const minutes = Math.round((totalETAHours - hours) * 60);

    return {
      baseETA: this.formatTime(baseETA),
      delayMinutes,
      totalETA: `${hours}h ${minutes}m`,
      hours,
      minutes,
    };
  }

  formatTime(timeInHours) {
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }
}

// Create singleton instance
const etaPredictionModel = new ETAPredictionModel();

const ETAEstimation = () => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    distance: "",
    speed: "800",
    aircraftType: "commercial",
    weatherCondition: "clear",
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState("initializing");
  const [departureTime, setDepartureTime] = useState("");
  const [currentDate] = useState(new Date().toISOString().split("T")[0]);
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);

  // Initialize the ML model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        setModelStatus("initializing");
        await etaPredictionModel.initialize();
        setModelStatus("ready");
      } catch (error) {
        console.error("Failed to initialize ML model:", error);
        setModelStatus("failed");
      }
    };

    initializeModel();
  }, []);

  // Fetch airports data
  useEffect(() => {
    const loadAirports = async () => {
      setAirportsLoading(true);
      try {
        const airportsData = await fetchAirports();
        setAirports(airportsData);
      } catch (error) {
        console.error("Error loading airports:", error);
      } finally {
        setAirportsLoading(false);
      }
    };

    loadAirports();
  }, []);

  // Auto-calculate distance when origin and destination are selected
  useEffect(() => {
    if (formData.origin && formData.destination) {
      const originAirport = airports.find(
        (airport) =>
          airport.city.toLowerCase() === formData.origin.toLowerCase() ||
          airport.code.toLowerCase() === formData.origin.toLowerCase()
      );
      const destinationAirport = airports.find(
        (airport) =>
          airport.city.toLowerCase() === formData.destination.toLowerCase() ||
          airport.code.toLowerCase() === formData.destination.toLowerCase()
      );

      if (originAirport && destinationAirport) {
        // In a real app, you would calculate the actual distance between coordinates
        // For demo purposes, we'll use the sample distances from our API
        const flightDistance = calculateDistance(
          originAirport,
          destinationAirport
        );
        setFormData((prev) => ({
          ...prev,
          distance: flightDistance.toString(),
        }));

        // Also update weather condition based on destination
        updateWeatherCondition(formData.destination);
      }
    }
  }, [formData.origin, formData.destination, airports]);

  // Calculate distance between airports using Haversine formula
  const calculateDistance = (origin, destination) => {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in kilometers
    const lat1 = (origin.latitude * Math.PI) / 180;
    const lat2 = (destination.latitude * Math.PI) / 180;
    const deltaLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const deltaLon =
      ((destination.longitude - origin.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return Math.round(distance);
  };

  // Update weather condition based on destination city
  const updateWeatherCondition = async (city) => {
    try {
      const weatherData = await fetchWeatherByCity(city);
      if (weatherData) {
        setFormData((prev) => ({
          ...prev,
          weatherCondition: weatherData.condition,
        }));
      }
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Weather condition mapping
  const weatherConditionMap = {
    clear: 0,
    cloudy: 1,
    rainy: 2,
    stormy: 3,
  };

  // Aircraft type mapping
  const aircraftTypeMap = {
    commercial: 0,
    private: 1,
  };

  const calculateETA = async () => {
    setLoading(true);

    try {
      // Prepare input for the model
      const modelInput = {
        distance: parseFloat(formData.distance) || 0,
        speed: parseFloat(formData.speed) || 800,
        weatherCondition: weatherConditionMap[formData.weatherCondition] || 0,
        aircraftType: aircraftTypeMap[formData.aircraftType] || 0,
      };

      // Get prediction
      const prediction = await etaPredictionModel.predict(modelInput);

      // Calculate arrival time if departure time is provided
      let arrivalTime = null;
      if (departureTime) {
        const [hours, minutes] = departureTime.split(":");
        const departureDate = new Date();
        departureDate.setHours(parseInt(hours, 10));
        departureDate.setMinutes(parseInt(minutes, 10));

        const arrivalDate = new Date(departureDate);
        arrivalDate.setHours(arrivalDate.getHours() + prediction.hours);
        arrivalDate.setMinutes(arrivalDate.getMinutes() + prediction.minutes);

        arrivalTime = arrivalDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      setResults({
        ...prediction,
        arrivalTime,
      });
    } catch (error) {
      console.error("ETA calculation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get weather condition icon
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "clear":
        return (
          <div className="text-yellow-500">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case "cloudy":
        return (
          <div className="text-gray-400">
            <Cloud className="w-5 h-5" />
          </div>
        );
      case "rainy":
        return (
          <div className="text-blue-400">
            <CloudRain className="w-5 h-5" />
          </div>
        );
      case "stormy":
        return (
          <div className="text-purple-400">
            <CloudLightning className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="text-yellow-500">
            <Calendar className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="p-6 text-gray-100">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Flight ETA Estimation
          </h1>
          <p className="text-gray-400">
            Calculate estimated arrival times using machine learning predictions
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-800">
          <CalendarIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Model Status Indicator */}
      <div
        className={`mb-6 p-3 rounded-lg flex items-center ${
          modelStatus === "ready"
            ? "bg-green-500/10 border border-green-500/30 text-green-400"
            : modelStatus === "initializing"
            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500"
            : "bg-red-500/10 border border-red-500/30 text-red-500"
        }`}
      >
        <Clock className="w-5 h-5 mr-2" />
        <span className="font-medium">
          {modelStatus === "ready"
            ? "ETA prediction model ready"
            : modelStatus === "initializing"
            ? "Initializing ETA prediction model..."
            : "Model failed to initialize - using fallback calculations"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg lg:col-span-1">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
              <Plane className="w-5 h-5 mr-2 text-yellow-500" />
              Flight Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origin" className="text-gray-300">
                  Origin
                </Label>
                <div className="relative">
                  <Input
                    id="origin"
                    name="origin"
                    type="text"
                    placeholder="Enter origin city or airport"
                    value={formData.origin}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="w-4 h-4 text-gray-400" />
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
                    name="destination"
                    type="text"
                    placeholder="Enter destination city or airport"
                    value={formData.destination}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance" className="text-gray-300">
                  Flight Distance (km)
                </Label>
                <div className="relative">
                  <Input
                    id="distance"
                    name="distance"
                    type="number"
                    placeholder="Enter distance in kilometers"
                    value={formData.distance}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Plane className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed" className="text-gray-300">
                  Aircraft Speed (km/h)
                </Label>
                <div className="relative">
                  <Input
                    id="speed"
                    name="speed"
                    type="number"
                    placeholder="Enter cruising speed"
                    value={formData.speed}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Wind className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aircraftType" className="text-gray-300">
                  Aircraft Type
                </Label>
                <div className="relative">
                  <Input
                    id="aircraftType"
                    name="aircraftType"
                    type="text"
                    placeholder="Enter aircraft type"
                    value={formData.aircraftType}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Plane className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weatherCondition" className="text-gray-300">
                  Weather Condition
                </Label>
                <Select
                  value={formData.weatherCondition}
                  onValueChange={(value) =>
                    handleSelectChange("weatherCondition", value)
                  }
                >
                  <SelectTrigger className="bg-[#252525] border-gray-800 text-gray-100 focus:border-yellow-500/50 focus:ring-yellow-500/20">
                    <SelectValue placeholder="Select weather condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="stormy">Stormy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime" className="text-gray-300">
                  Departure Time (optional)
                </Label>
                <div className="relative">
                  <Input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={calculateETA}
                disabled={
                  loading ||
                  modelStatus === "initializing" ||
                  !formData.distance
                }
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium shadow-lg hover:shadow-yellow-500/20 transition-all duration-200 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    Calculate ETA <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg lg:col-span-2">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
              ETA Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {results ? (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                        <Plane className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          Flight Route
                        </h3>
                        <p className="text-sm text-gray-400">
                          Origin to Destination
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Origin:</span>
                        <span className="font-medium text-gray-100">
                          {formData.origin || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Destination:</span>
                        <span className="font-medium text-gray-100">
                          {formData.destination || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Distance:</span>
                        <span className="font-medium text-gray-100">
                          {formData.distance} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Aircraft Type:</span>
                        <span className="font-medium text-gray-100">
                          {formData.aircraftType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                        <Thermometer className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          Flight Conditions
                        </h3>
                        <p className="text-sm text-gray-400">
                          Weather and Speed
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Weather:</span>
                        <span className="font-medium text-gray-100 flex items-center">
                          {formData.weatherCondition.charAt(0).toUpperCase() +
                            formData.weatherCondition.slice(1)}
                          <span className="ml-2">
                            {getWeatherIcon(formData.weatherCondition)}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Cruising Speed:</span>
                        <span className="font-medium text-gray-100">
                          {formData.speed} km/h
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Base Flight Time:</span>
                        <span className="font-medium text-gray-100">
                          {results.baseETA}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Weather Delay:</span>
                        <span className="font-medium text-gray-100">
                          {results.delayMinutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-yellow-500 mb-1 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Total Estimated Flight Time
                      </h3>
                      <p className="text-sm text-gray-400">
                        Including all delays and conditions
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p className="text-3xl font-bold text-yellow-500">
                        {results.totalETA}
                      </p>
                    </div>
                  </div>
                </div>

                {results.arrivalTime && (
                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-100 mb-1">
                          Estimated Arrival Time
                        </h3>
                        <p className="text-sm text-gray-400">
                          Based on {departureTime} departure
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <p className="text-2xl font-bold text-gray-100">
                          {results.arrivalTime}
                        </p>
                        <p className="text-xs text-gray-400 text-right">
                          {currentDate}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Clock className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-lg font-medium mb-1">No ETA results yet</p>
                <p className="text-sm text-center">
                  Fill in the flight parameters and click Calculate to see the
                  ETA prediction
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explanation Section */}
      <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg mt-6">
        <CardHeader className="pb-2 border-b border-gray-800/50">
          <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
            <Info className="w-5 h-5 mr-2 text-yellow-500" />
            About ETA Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-300 mb-4">
            The ETA prediction model takes into account various factors that can
            affect flight times, including weather conditions, aircraft type,
            and distance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
              <h3 className="text-md font-medium text-yellow-500 mb-2">
                Weather Impact
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                <li>Clear skies: No delay</li>
                <li>Cloudy conditions: ~5% longer flight time</li>
                <li>Rainy conditions: ~15% longer flight time</li>
                <li>Stormy conditions: ~30% longer flight time</li>
              </ul>
            </div>

            <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
              <h3 className="text-md font-medium text-yellow-500 mb-2">
                Aircraft Considerations
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                <li>Commercial airliners follow optimized routes</li>
                <li>Private jets may have less efficient routing</li>
                <li>Speed variations based on aircraft model</li>
                <li>Altitude and wind factors are considered</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ETAEstimation;
