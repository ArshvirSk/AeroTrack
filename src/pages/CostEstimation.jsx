import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Calendar,
  Calculator,
  Plane,
  DollarSign,
  Clock,
  Users,
  Fuel,
  Shield,
  ArrowRight,
  Calendar as CalendarIcon,
  Brain,
} from "lucide-react";
import costPredictionModel from "../utils/costPredictionModel";

const CostEstimation = () => {
  const [formData, setFormData] = useState({
    distance: "",
    passengers: "",
    aircraft: "commercial",
    fuelPrice: "",
    duration: "",
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState("initializing");

  // Initialize the ML model when the component mounts
  useEffect(() => {
    const initializeModel = async () => {
      try {
        setModelStatus("initializing");
        await costPredictionModel.initialize();
        setModelStatus("ready");
      } catch (error) {
        console.error("Failed to initialize ML model:", error);
        setModelStatus("failed");
      }
    };

    initializeModel();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateCost = async () => {
    setLoading(true);

    try {
      // Prepare input for the ML model
      const modelInput = {
        distance: parseFloat(formData.distance) || 0,
        passengers: parseInt(formData.passengers) || 1,
        fuelPrice: parseFloat(formData.fuelPrice) || 0,
        duration: parseFloat(formData.duration) || 0,
        aircraftType: formData.aircraft,
      };

      // Get prediction from the ML model
      const prediction = await costPredictionModel.predict(modelInput);
      setResults(prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      // Fallback to simple calculation if ML prediction fails
      const distance = parseFloat(formData.distance) || 0;
      const passengers = parseInt(formData.passengers) || 1;
      const fuelPrice = parseFloat(formData.fuelPrice) || 0;
      const duration = parseFloat(formData.duration) || 0;

      // Base calculations
      const fuelCost =
        distance * fuelPrice * (formData.aircraft === "private" ? 1.5 : 1);
      const crewCost =
        duration * 250 * (formData.aircraft === "private" ? 1.2 : 1);
      const maintenanceCost =
        distance * 0.15 * (formData.aircraft === "private" ? 1.3 : 1);
      const insuranceCost =
        distance * 0.1 * (formData.aircraft === "private" ? 1.4 : 1);

      const totalCost = fuelCost + crewCost + maintenanceCost + insuranceCost;
      const costPerPassenger = totalCost / passengers;

      setResults({
        fuelCost: fuelCost.toFixed(2),
        crewCost: crewCost.toFixed(2),
        maintenanceCost: maintenanceCost.toFixed(2),
        insuranceCost: insuranceCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        costPerPassenger: costPerPassenger.toFixed(2),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-gray-100">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Flight Cost Estimation
          </h1>
          <p className="text-gray-400">
            Calculate estimated costs using machine learning predictions
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
        <Brain className="w-5 h-5 mr-2" />
        <span className="font-medium">
          {modelStatus === "ready"
            ? "ML model ready for predictions"
            : modelStatus === "initializing"
            ? "Initializing ML model..."
            : "ML model failed to initialize - using fallback calculations"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg lg:col-span-1">
          <CardHeader className="pb-2 border-b border-gray-800/50">
            <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-yellow-500" />
              Input Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4">
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
                <Label htmlFor="passengers" className="text-gray-300">
                  Number of Passengers
                </Label>
                <div className="relative">
                  <Input
                    id="passengers"
                    name="passengers"
                    type="number"
                    placeholder="Enter passenger count"
                    value={formData.passengers}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aircraft" className="text-gray-300">
                  Aircraft Type
                </Label>
                <Select
                  value={formData.aircraft}
                  onValueChange={(value) =>
                    handleSelectChange("aircraft", value)
                  }
                >
                  <SelectTrigger className="bg-[#252525] border-gray-800 text-gray-100 focus:border-yellow-500/50 focus:ring-yellow-500/20">
                    <SelectValue placeholder="Select aircraft type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252525] border-gray-800 text-gray-100">
                    <SelectItem
                      value="commercial"
                      className="hover:bg-gray-800 focus:bg-gray-800 focus:text-yellow-500"
                    >
                      Commercial Airliner
                    </SelectItem>
                    <SelectItem
                      value="private"
                      className="hover:bg-gray-800 focus:bg-gray-800 focus:text-yellow-500"
                    >
                      Private Jet
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelPrice" className="text-gray-300">
                  Fuel Price ($/liter)
                </Label>
                <div className="relative">
                  <Input
                    id="fuelPrice"
                    name="fuelPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter fuel price"
                    value={formData.fuelPrice}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Fuel className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300">
                  Flight Duration (hours)
                </Label>
                <div className="relative">
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    step="0.5"
                    placeholder="Enter flight duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="bg-[#252525] border-gray-800 text-gray-100 pl-10 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={calculateCost}
                disabled={loading || modelStatus === "initializing"}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium shadow-lg hover:shadow-yellow-500/20 transition-all duration-200 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Calculator className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    Calculate Cost <ArrowRight className="w-4 h-4 ml-2" />
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
              <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
              ML-Powered Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {results ? (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Fuel className="w-5 h-5 mr-2 text-yellow-500" />
                      <h3 className="text-md font-medium text-gray-300">
                        Fuel Cost
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100">
                      ${results.fuelCost}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on distance and fuel price
                    </p>
                  </div>

                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 mr-2 text-yellow-500" />
                      <h3 className="text-md font-medium text-gray-300">
                        Crew Cost
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100">
                      ${results.crewCost}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on flight duration
                    </p>
                  </div>

                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Plane className="w-5 h-5 mr-2 text-yellow-500" />
                      <h3 className="text-md font-medium text-gray-300">
                        Maintenance
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100">
                      ${results.maintenanceCost}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on distance and aircraft type
                    </p>
                  </div>

                  <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 mr-2 text-yellow-500" />
                      <h3 className="text-md font-medium text-gray-300">
                        Insurance
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-100">
                      ${results.insuranceCost}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on distance and aircraft type
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-yellow-500 mb-1 flex items-center">
                        <Brain className="w-5 h-5 mr-2" />
                        ML-Predicted Total Cost
                      </h3>
                      <p className="text-sm text-gray-400">
                        Sum of all operational expenses
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p className="text-3xl font-bold text-yellow-500">
                        ${results.totalCost}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#252525] border border-gray-800 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100 mb-1">
                        Cost Per Passenger
                      </h3>
                      <p className="text-sm text-gray-400">
                        Individual passenger allocation
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p className="text-2xl font-bold text-gray-100">
                        ${results.costPerPassenger}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Calculator className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-lg font-medium mb-1">
                  No calculation results yet
                </p>
                <p className="text-sm text-center">
                  Fill in the parameters and click Calculate to see the
                  ML-powered cost breakdown
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ML Model Information */}
      <Card className="bg-[#1f1f1f] border-gray-800 hover:border-gray-700 transition-colors shadow-lg mt-6">
        <CardHeader className="pb-2 border-b border-gray-800/50">
          <CardTitle className="text-lg font-medium text-gray-100 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-yellow-500" />
            About the ML Model
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-300 mb-4">
            This cost estimation tool uses a neural network model trained on
            flight data to predict various cost components based on your inputs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
              <h3 className="text-md font-medium text-yellow-500 mb-2">
                Model Features
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                <li>Distance-based fuel consumption</li>
                <li>Aircraft type-specific calculations</li>
                <li>Passenger load considerations</li>
                <li>Duration-based crew costs</li>
                <li>Real-time market fuel prices</li>
              </ul>
            </div>

            <div className="bg-[#252525] border border-gray-800 rounded-lg p-4">
              <h3 className="text-md font-medium text-yellow-500 mb-2">
                Prediction Accuracy
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                The model has been trained on synthetic data representing
                typical flight operations and costs.
              </p>
              <p className="text-sm text-gray-400">
                For production use, this model would be trained and validated on
                real historical flight cost data to improve accuracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostEstimation;
