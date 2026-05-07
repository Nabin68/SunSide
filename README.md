# SunSide — Full Stack Sun Exposure Seat Recommender

SunSide helps you find the perfect seat on public transport based on sun position and travel direction. It analyzes your route segments to tell you whether to sit on the **LEFT** or **RIGHT** side of the vehicle.

## 🚀 Quick Start (Local Testing)

Follow these steps to get the app running on your machine:

### 1. Start the Backend
Open a terminal in the project root:
```powershell
cd backend
.\venv\Scripts\activate
# Dependencies are already installed in the venv
python main.py
```
*The backend will run on `http://localhost:8000`*

### 2. Start the Frontend
Open a **second** terminal in the project root:
```powershell
cd frontend
# Dependencies are already installed
npm run dev
```
*The frontend will run on `http://localhost:5173`*

---

## 🛠️ Requirements & Notes
- **API Keys**: No API keys are required! The app uses public OSRM (Routing) and Nominatim (Geocoding) instances.
- **Environment Variables**: 
  - `frontend/.env` is already configured to point to `http://localhost:8000/api`.
  - If you change the backend port, update this file.
- **Geolocation**: The app will ask for your location permission to auto-fill the "Starting From" field. If denied, you can enter it manually.

## 📁 Project Structure
- `frontend/`: React 19 + Vite + Tailwind CSS v4 + Leaflet
- `backend/`: FastAPI + SunCalc + OSRM + Nominatim

## ☀️ How it works
1. **Geocoding**: Converts your destination text into coordinates.
2. **Routing**: Fetches multiple route options from OSRM.
3. **Sun Engine**: Calculates the sun's azimuth at your departure time and compares it to the bearing of every single road segment in your trip.
4. **Recommendation**: Tallies the total exposure and recommends the side with the most shade.
