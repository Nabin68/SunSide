<div align="center">

# 🌤️ SunSide
### *Sit Smart. Beat the Sun.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Leaflet](https://img.shields.io/badge/Leaflet.js-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-22C55E?style=for-the-badge)]()

**SunSide** is a smart travel companion web app that tells you whether to sit on the **LEFT** or **RIGHT** side of any public transport vehicle to avoid direct sunlight during your journey.

</div>

---

## ✨ Features

- 🌍 **Auto-detects your current location** via GPS
- 📍 **Fully editable origin** with manual override
- 🔄 **One-click origin ↔ destination swap**
- 🗺️ **Up to 3 alternative routes** displayed simultaneously on a live map
- ☀️ **Real-time sun position** calculated using SunCalc at every route segment
- 🧭 **Vehicle bearing compared to sun azimuth** at each segment
- 💺 **LEFT or RIGHT seat recommendation** per route
- 📊 **Visual exposure bar** showing orange (left) vs blue (right) sun %
- ⚠️ **Warns about long stretches** of direct sun exposure
- 🕐 **Departure + arrival time display** with realistic travel time estimates
- 📋 **One-click Share Result** to clipboard
- ℹ️ **About modal** with developer info
- 📱 **Fully responsive** — works on mobile and desktop

---

## 🖼️ Screenshots

> 📸 Add screenshots here — desktop sidebar view, mobile bottom sheet, route card, and the About modal.

---

## 🧠 How It Works

1. **User enters origin** (auto-detected via GPS or typed manually) and destination
2. **Backend geocodes** the destination using Nominatim (OpenStreetMap) — no API key required
3. **OSRM public API** fetches up to 3 alternative routes with full geometry
4. **Each route is broken into segments** — the bearing (compass direction of travel) is calculated for each
5. **SunCalc computes the sun's azimuth** at each segment's location and estimated time of passage
6. **Relative angle** between sun azimuth and vehicle bearing determines if the sun is to the LEFT or RIGHT
7. **Exposure tallied** across all segments → LEFT % and RIGHT % per route
8. **Best route** (lowest winning-side exposure) is highlighted in gold on the map
9. **User sees recommendation:** which side to sit on, for which route, with detailed timing info

---

## 🗂️ Project Structure

```
sunside/
├── frontend/                     # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AboutModal.jsx    # Developer info modal
│   │   │   ├── MapView.jsx       # Leaflet map with routes & markers
│   │   │   ├── RouteCard.jsx     # Individual route result card
│   │   │   └── SkeletonCard.jsx  # Loading skeleton
│   │   ├── hooks/
│   │   │   └── useGeolocation.js # GPS + reverse geocode hook
│   │   ├── pages/
│   │   │   └── Home.jsx          # Main application page
│   │   ├── services/
│   │   │   └── api.js            # Axios API calls to backend
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind CSS v4 config
│   ├── .env                      # Frontend environment variables
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── backend/                      # Python FastAPI backend
│   ├── models/
│   │   └── schemas.py            # Pydantic request/response models
│   ├── routers/
│   │   └── routes.py             # API route handlers
│   ├── services/
│   │   ├── nominatim.py          # Geocoding via OpenStreetMap
│   │   ├── osrm.py               # Route fetching via OSRM
│   │   └── sun_engine.py         # Core sun position & analysis logic
│   ├── main.py                   # FastAPI app entry point
│   ├── .env                      # Backend environment variables
│   ├── .env.example
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.11+
- **Git**

### Clone the Repo

```bash
git clone https://github.com/Nabin68/SunSide.git
cd SunSide
```

---

### ⚙️ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Edit `backend/.env`:

```env
ALLOWED_ORIGINS=http://localhost:5173
PORT=8000
```

Start the backend server:

```bash
python main.py
```

> Backend runs on **http://localhost:8000**

---

### 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

> Frontend runs on **http://localhost:5173**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze` | Main route + sun analysis |
| `GET` | `/api/routes/geocode` | Autocomplete suggestions |
| `GET` | `/api/routes/sun-position` | Sun azimuth at location + time |
| `GET` | `/api/routes/reverse-geocode` | Lat/lon to human-readable address |

### Example Request — `/api/analyze`

```json
{
  "origin": "Rajbiraj, Saptari",
  "destination": "Biratnagar, Nepal",
  "departure_time": "2025-05-07T08:30:00"
}
```

### Example Response

```json
{
  "origin_name": "Rajbiraj, Saptari District",
  "destination_name": "Biratnagar, Morang District",
  "departure_info": "Today at 08:30 AM",
  "best_route_index": 0,
  "routes": [
    {
      "route_index": 0,
      "duration_seconds": 4212,
      "distance_meters": 65700,
      "left_percent": 23.4,
      "right_percent": 76.6,
      "recommended_side": "LEFT",
      "sun_period": "Morning sun",
      "sun_movement": "STABLE",
      "exposure_summary": "You'll face direct sun for ~16 mins on the right side",
      "recommendation_reason": "Left side has 53% less direct sun on this route at this time of day"
    }
  ]
}
```

---

## 🔧 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | `frontend/.env` | Backend API base URL |
| `ALLOWED_ORIGINS` | `backend/.env` | Comma-separated allowed CORS origins |
| `PORT` | `backend/.env` | Port for uvicorn (default `8000`) |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Map | Leaflet.js + React-Leaflet |
| HTTP Client | Axios |
| Backend | Python FastAPI |
| Server | Uvicorn |
| Routing API | OSRM (free, no key required) |
| Geocoding | Nominatim / OpenStreetMap (free, no key required) |
| Sun Position | SunCalc (Python) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please make sure your code follows the existing style and all API calls remain within free-tier limits (Nominatim, OSRM).

---

## 👨‍💻 Developer

<div align="center">

**Nabin Kumar Rouniyar**  
*Yantra Technology*

[![Email](https://img.shields.io/badge/Email-nabingupta68@gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:nabingupta68@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-Nabin68-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Nabin68)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-nabin--rouniyar-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nabin-rouniyar-86682726a/)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

> *Built with ☀️ by Nabin Kumar Rouniyar — because no one should have to squint on a bus.*
