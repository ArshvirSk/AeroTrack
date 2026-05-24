<div align="center">
  <img src="https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=AeroTrack+Banner" alt="AeroTrack Banner">
  
  # AeroTrack

  **Navigate the skies with real-time intelligence.**

  [![Live Demo](https://img.shields.io/badge/Demo-Live_Now-4F46E5?style=for-the-badge)](https://your-demo-link.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

## 📌 Problem Statement
Tracking live flights and weather conditions across different regions often requires disjointed tools. AeroTrack unifies real-time aviation data with live weather overlays into a single, high-performance interface, giving aviation professionals and enthusiasts a complete, unified operational view.

## ✨ Key Features
* **Real-Time Flight Tracking:** Live aircraft positions, altitudes, and speeds via AviationStack API.
* **Weather Integration:** Contextual meteorological data powered by OpenWeatherMap.
* **Cost & ETA Predictions:** Algorithmic estimates for flight costs and arrival times based on distance and historical metrics.
* **Interactive Mapping:** Fluid map navigation using React Leaflet for an intuitive user experience.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS 4, shadcn/ui, React Router |
| **Backend** | Node.js, Express, jsonwebtoken, bcryptjs |
| **Maps** | Leaflet, React Leaflet |
| **APIs** | AviationStack, OpenWeatherMap |

## 🚀 Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aerotrack.git
   cd aerotrack
   ```

2. **Install dependencies for both client and server:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `server` directory (refer to `.env.example`):
   ```env
   AVIATIONSTACK_API_KEY=your_aviationstack_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development servers:**
   ```bash
   # Terminal 1 (Server)
   cd server && npm start
   
   # Terminal 2 (Client)
   cd client && npm run dev
   ```

## 📸 Screenshots

| Dashboard | Flight Map |
|---|---|
| <img src="https://via.placeholder.com/600x350/1a1a1a/ffffff?text=Dashboard+Screenshot" alt="Dashboard Screenshot" width="400" /> | <img src="https://via.placeholder.com/600x350/1a1a1a/ffffff?text=Flight+Map+Screenshot" alt="Flight Map Screenshot" width="400" /> |

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
