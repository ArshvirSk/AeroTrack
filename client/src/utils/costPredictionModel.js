import * as tf from "@tensorflow/tfjs";

// This is a simple linear regression model for flight cost prediction
// In a real-world scenario, you would train this model on actual flight data
export class CostPredictionModel {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.r2Score = null;
    this.normalizers = {
      distance: { mean: 2000, std: 1000 },
      passengers: { mean: 150, std: 100 },
      fuelPrice: { mean: 2.5, std: 1 },
      duration: { mean: 3, std: 2 },
      // 0 for commercial, 1 for private
      aircraftType: { mean: 0.5, std: 0.5 },
    };
  }

  // Normalize input features to improve model performance
  normalizeInput(input) {
    return {
      distance:
        (input.distance - this.normalizers.distance.mean) /
        this.normalizers.distance.std,
      passengers:
        (input.passengers - this.normalizers.passengers.mean) /
        this.normalizers.passengers.std,
      fuelPrice:
        (input.fuelPrice - this.normalizers.fuelPrice.mean) /
        this.normalizers.fuelPrice.std,
      duration:
        (input.duration - this.normalizers.duration.mean) /
        this.normalizers.duration.std,
      aircraftType:
        (input.aircraftType === "private"
          ? 1
          : 0 - this.normalizers.aircraftType.mean) /
        this.normalizers.aircraftType.std,
    };
  }

  // Format number as INR
  formatNumberAsINR(number) {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(parseFloat(number));
  }

  // Create and initialize the model
  async initialize() {
    try {
      // Create a sequential model
      this.model = tf.sequential();

      // Add layers to the model
      // Input layer with 5 features: distance, passengers, fuel price, duration, aircraft type
      this.model.add(
        tf.layers.dense({
          inputShape: [5],
          units: 10,
          activation: "relu",
        })
      );

      // Hidden layer
      this.model.add(
        tf.layers.dense({
          units: 8,
          activation: "relu",
        })
      );

      // Hidden layer
      this.model.add(
        tf.layers.dense({
          units: 8,
          activation: "relu",
        })
      );

      // Output layer with 4 units for different cost components
      // [fuelCost, crewCost, maintenanceCost, insuranceCost]
      this.model.add(
        tf.layers.dense({
          units: 4,
          activation: "linear",
        })
      );

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: "meanSquaredError",
      });

      // Train the model with some synthetic data
      await this.trainWithSyntheticData();

      this.initialized = true;
      console.log("Cost prediction model initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize cost prediction model:", error);
      return false;
    }
  }

  // Generate synthetic training data based on domain knowledge
  generateSyntheticData(numSamples = 1000) {
    const xs = [];
    const ys = [];

    for (let i = 0; i < numSamples; i++) {
      // Generate random input values
      const distance = Math.random() * 5000 + 500; // 500-5500 km
      const passengers = Math.floor(Math.random() * 300) + 10; // 10-310 passengers
      const fuelPrice = Math.random() * 4 + 1; // $1-$5 per liter
      const duration = Math.random() * 10 + 1; // 1-11 hours
      const aircraftType = Math.random() > 0.7 ? 1 : 0; // 30% private, 70% commercial

      // Normalize inputs
      const normalizedDistance =
        (distance - this.normalizers.distance.mean) /
        this.normalizers.distance.std;
      const normalizedPassengers =
        (passengers - this.normalizers.passengers.mean) /
        this.normalizers.passengers.std;
      const normalizedFuelPrice =
        (fuelPrice - this.normalizers.fuelPrice.mean) /
        this.normalizers.fuelPrice.std;
      const normalizedDuration =
        (duration - this.normalizers.duration.mean) /
        this.normalizers.duration.std;
      const normalizedAircraftType =
        (aircraftType - this.normalizers.aircraftType.mean) /
        this.normalizers.aircraftType.std;

      // Add input features
      xs.push([
        normalizedDistance,
        normalizedPassengers,
        normalizedFuelPrice,
        normalizedDuration,
        normalizedAircraftType,
      ]);

      // Calculate synthetic output values based on domain knowledge
      // These formulas simulate real-world relationships between inputs and costs
      const aircraftMultiplier = aircraftType === 1 ? 2.5 : 1;

      // Fuel cost depends on distance, fuel price, and aircraft type
      const fuelCost = distance * fuelPrice * 0.1 * aircraftMultiplier;

      // Crew cost depends on duration and aircraft type
      const crewCost = duration * 250 * (aircraftType === 1 ? 1.2 : 1);

      // Maintenance cost depends on distance and aircraft type
      const maintenanceCost = distance * 0.15 * (aircraftType === 1 ? 1.3 : 1);

      // Insurance cost depends on distance, passengers, and aircraft type
      const insuranceCost =
        distance * 0.1 * (aircraftType === 1 ? 1.4 : 1) + passengers * 2;

      // Add output values
      ys.push([fuelCost, crewCost, maintenanceCost, insuranceCost]);
    }

    return {
      xs: tf.tensor2d(xs),
      ys: tf.tensor2d(ys),
    };
  }

  // Train the model with synthetic data
  // Calculate R² score
  calculateR2Score(yTrue, yPred) {
    const mean = tf.mean(yTrue);
    const totalSum = tf.sum(tf.square(tf.sub(yTrue, mean)));
    const residualSum = tf.sum(tf.square(tf.sub(yTrue, yPred)));
    const r2 = tf.sub(1, tf.div(residualSum, totalSum));
    return r2.dataSync()[0];
  }

  async trainWithSyntheticData() {
    const { xs, ys } = this.generateSyntheticData();
    const splitIndex = Math.floor(xs.shape[0] * 0.8);

    // Split data into training and validation sets
    const trainXs = xs.slice([0, 0], [splitIndex, xs.shape[1]]);
    const trainYs = ys.slice([0, 0], [splitIndex, ys.shape[1]]);
    const valXs = xs.slice([splitIndex, 0], [-1, xs.shape[1]]);
    const valYs = ys.slice([splitIndex, 0], [-1, ys.shape[1]]);

    // Train the model
    await this.model.fit(trainXs, trainYs, {
      epochs: 100,
      batchSize: 32,
      validationData: [valXs, valYs],
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(
              `Epoch ${epoch}: loss = ${logs.loss}, val_loss = ${logs.val_loss}`
            );
          }
        },
      },
    });

    // Calculate R² score on validation set
    const predictions = this.model.predict(valXs);
    this.r2Score = this.calculateR2Score(valYs, predictions);
    console.log(`Model R² Score: ${this.r2Score.toFixed(4)}`);

    // Clean up tensors
    trainXs.dispose();
    trainYs.dispose();
    valXs.dispose();
    valYs.dispose();
    predictions.dispose();
    xs.dispose();
    ys.dispose();
  }

  // Predict costs based on input parameters
  async predict(input) {
    if (!this.initialized || !this.model) {
      await this.initialize();
    }

    try {
      // Normalize the input
      const normalizedInput = this.normalizeInput(input);

      // Convert to tensor
      const inputTensor = tf.tensor2d([
        [
          normalizedInput.distance,
          normalizedInput.passengers,
          normalizedInput.fuelPrice,
          normalizedInput.duration,
          normalizedInput.aircraftType,
        ],
      ]);

      // Make prediction
      const prediction = this.model.predict(inputTensor);

      // Get the values as an array
      const [fuelCost, crewCost, maintenanceCost, insuranceCost] =
        await prediction.data();

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      // Calculate total cost
      const totalCost =
        fuelCost + crewCost + maintenanceCost + insuranceCost + 320000;
      const costPerPassenger = totalCost / input.passengers;

      // Return the prediction results with comma-separated formatting
      return {
        fuelCost: this.formatNumberAsINR(Math.max(0, fuelCost + 40000)),
        crewCost: this.formatNumberAsINR(Math.max(0, crewCost + 160000)),
        maintenanceCost: this.formatNumberAsINR(
          Math.max(0, maintenanceCost + 75000)
        ),
        insuranceCost: this.formatNumberAsINR(
          Math.max(0, insuranceCost + 45000)
        ),
        totalCost: this.formatNumberAsINR(Math.max(0, totalCost)),
        costPerPassenger: this.formatNumberAsINR(Math.max(0, costPerPassenger)),
        r2Score: this.r2Score ? this.r2Score.toFixed(4) : null,
      };
    } catch (error) {
      console.error("Prediction error:", error);
      // Fallback to a simpler calculation if prediction fails
      return this.fallbackPrediction(input);
    }
  }

  // Fallback calculation in case the model fails
  fallbackPrediction(input) {
    const { distance, passengers, aircraftType, fuelPrice, duration } = input;

    // Simple calculations based on input parameters
    const aircraftMultiplier = aircraftType === "private" ? 1.5 : 1;
    const fuelCost = distance * fuelPrice * aircraftMultiplier;
    const crewCost = duration * 250 * (aircraftType === "private" ? 1.2 : 1);
    const maintenanceCost =
      distance * 0.15 * (aircraftType === "private" ? 1.3 : 1);
    const insuranceCost =
      distance * 0.1 * (aircraftType === "private" ? 1.4 : 1);

    const totalCost = fuelCost + crewCost + maintenanceCost + insuranceCost;
    const costPerPassenger = totalCost / passengers;

    return {
      fuelCost: this.formatNumberAsINR(fuelCost),
      crewCost: this.formatNumberAsINR(crewCost),
      maintenanceCost: this.formatNumberAsINR(maintenanceCost),
      insuranceCost: this.formatNumberAsINR(insuranceCost),
      totalCost: this.formatNumberAsINR(totalCost),
      costPerPassenger: this.formatNumberAsINR(costPerPassenger),
    };
  }
}

// Create and export a singleton instance
const costPredictionModel = new CostPredictionModel();
export default costPredictionModel;
