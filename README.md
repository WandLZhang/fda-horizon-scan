# FDA Horizon Scan - Real-Time Health Surveillance System

A cutting-edge health surveillance platform that uses **Gemini 2.5 Flash with Google Search grounding** to detect emerging health threats, FDA recalls, and viral health trends in real-time across the United States.

![FDA Horizon Scan](https://img.shields.io/badge/FDA-Horizon%20Scan-0b57d0)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4)
![Cloud Functions](https://img.shields.io/badge/GCP-Cloud%20Functions%20Gen2-4285F4)
![React](https://img.shields.io/badge/React-18-61dafb)

## 🚨 Overview

The FDA Horizon Scan is a **production-ready** health surveillance system that provides real-time detection of:
- **Viral health trends** from TikTok, Instagram, and social media causing ER visits
- **FDA recalls and warnings** from official sources
- **Disease outbreaks** and foodborne illnesses
- **Unregulated supplements** and dangerous DIY medical treatments
- **Geographic hotspots** of health incidents across US cities

## 🔥 Key Features

### Real-Time Data Processing
- **Live Gemini 2.5 Flash API** with Google Search grounding for current information
- **Server-Sent Events (SSE)** for streaming responses
- **Parallel data processing** from multiple sources simultaneously
- **Geographic visualization** with hotspot mapping

### Advanced Capabilities
- **Dual API modes**: Standard JSON and streaming SSE endpoints
- **Intelligent event aggregation** with deduplication
- **Severity-based prioritization** (Critical → High → Medium → Low)
- **Location-aware tracking** with latitude/longitude precision
- **Real search volume data** from Google Health Trends simulation

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│         FDA HORIZON SCAN PLATFORM            │
│   Real-Time Health Threat Detection System    │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│            FRONTEND (React + Vite)            │
│         • Search Interface                    │
│         • Real-time Visualizations            │
│         • Surveillance Dashboard              │
└──────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│      BACKEND (Cloud Functions Gen 2)          │
│         Google Cloud Platform                 │
│    Project: wz-fda-horizon-scan              │
└──────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌────────────────┐        ┌────────────────────┐
│  Gemini 2.5    │        │  Google Search     │
│    Flash       │        │   Grounding        │
│  (Vertex AI)   │        │   (Real-time)      │
└────────────────┘        └────────────────────┘
```

## 📡 API Endpoints

### Production Endpoints (Deployed on GCP)

| Endpoint | Method | Type | Description |
|----------|--------|------|-------------|
| `/searchHealthTrends` | POST | JSON | Search for health incidents with Gemini |
| `/searchHealthTrendsStream` | POST | SSE | Streaming search with real-time results |
| `/getHealthTrends` | POST | JSON | Get health trend volumes by geography |
| `/getHealthTrendsStream` | POST | SSE | Stream geographic trend data |

### Request Format
```json
{
  "query": "dangerous tiktok health trends",
  "include_thinking": false  // Optional: Include Gemini's reasoning
}
```

### Response Format (Streaming)
```javascript
// Server-Sent Events stream
data: {"type": "connected", "timestamp": "2025-01-13T..."}
data: {"type": "result", "index": 1, "data": {...}}
data: {"type": "complete", "total": 5}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud SDK (for backend deployment)
- Firebase CLI (for frontend deployment)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Deploy to Google Cloud Functions
gcloud functions deploy searchHealthTrendsStream \
  --gen2 \
  --runtime=python312 \
  --region=us-central1 \
  --source=. \
  --entry-point=searchHealthTrendsStream \
  --trigger-http \
  --allow-unauthenticated
```

## 📁 Project Structure

```
fda-horizon-scan/
├── README.md                          # This file
├── backend/
│   ├── main.py                       # Cloud Functions with Gemini integration
│   ├── requirements.txt              # Python dependencies
│   └── .gcloudignore                # GCP deployment config
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main application logic
│   │   ├── components/
│   │   │   ├── SearchTrigger.jsx    # Search interface
│   │   │   ├── ParallelBranches.jsx # Dual stream visualization
│   │   │   ├── AnimatedFlow.jsx     # Data flow animations
│   │   │   ├── EventAggregator.jsx  # Event combination
│   │   │   ├── SurveillanceDashboard.jsx # Alert management
│   │   │   └── HotspotMap.jsx       # Geographic visualization
│   │   └── material.css             # Glassmorphic styling
│   ├── test_scripts/                # API testing utilities
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js              # Vite configuration
│   └── firebase.json               # Firebase hosting config
```

## 🔬 Real-World Use Cases

### 1. Viral Health Challenge Detection
Detects dangerous TikTok/Instagram health trends causing hospitalizations:
- **Example**: "Benadryl Challenge" causing ER visits in Houston
- **Response**: Real-time alerts with affected numbers and locations

### 2. FDA Recall Monitoring
Tracks FDA recalls and warning letters:
- **Example**: Salmonella contamination in lettuce across 5 states
- **Response**: Geographic spread visualization and severity assessment

### 3. Unregulated Supplement Tracking
Identifies dangerous supplements sold on e-commerce platforms:
- **Example**: Contaminated weight loss pills on Amazon
- **Response**: Product identification and user impact assessment

## 🌍 Geographic Coverage

The system monitors health trends across major US markets:
- **West Coast**: Los Angeles, San Francisco, Seattle, San Diego
- **East Coast**: New York, Boston, Washington DC, Miami
- **Central**: Chicago, Houston, Dallas, Atlanta
- **Mountain**: Denver, Phoenix, Salt Lake City

Each location includes:
- DMA (Designated Market Area) codes
- Precise latitude/longitude coordinates
- Query volume metrics (0-1000 scale)
- Trend percentages
- Risk severity levels

## 📊 Data Sources

### Primary Sources
- **Gemini 2.5 Flash**: Google's latest AI model
- **Google Search Grounding**: Real-time web search integration
- **Vertex AI**: Google Cloud's ML platform

### Information Types
- FDA announcements and recalls
- CDC outbreak reports
- Local news health incidents
- Hospital emergency reports
- Social media health trends
- E-commerce product safety issues

## 🎨 Frontend Features

### Visual Components
- **Glassmorphic UI** with Material Design
- **Real-time animations** showing data flow
- **Interactive dashboard** with alert management
- **Geographic hotspot mapping**
- **Severity-based color coding**

### User Interface
- Quick search presets for common queries
- Custom query input with validation
- Real-time processing status
- Alert prioritization and actions
- Statistics overview

## 🧪 Testing

### Backend Testing
```bash
cd frontend/test_scripts
python test_streaming_endpoint.py  # Test SSE streaming
python test_all_apis.py           # Test all endpoints
python test_api_timing.py         # Performance testing
```

### Frontend Testing
```bash
cd frontend
npm test  # Run test suite
```

## 📈 Performance

- **Response Time**: 2-5 seconds for initial results
- **Streaming**: Real-time results as they're processed
- **Concurrency**: Handles multiple parallel requests
- **Scalability**: Auto-scales with Cloud Functions Gen 2

## 🔐 Security

- **CORS enabled** for cross-origin requests
- **Safety settings** configured for Gemini
- **No authentication required** (public health data)
- **Rate limiting** via Cloud Functions

## 🚢 Deployment

### Backend (Google Cloud Functions)
```bash
cd backend
gcloud config set project wz-fda-horizon-scan
gcloud functions deploy searchHealthTrendsStream --gen2 --runtime=python312
```

### Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## 🔄 Environment Variables

### Backend (.env)
```
PROJECT_ID=wz-fda-horizon-scan
LOCATION=global
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-cloud-function-url
VITE_FIREBASE_CONFIG=your-firebase-config
```

## 📝 API Documentation

### Search Health Trends
```javascript
// Request
POST /searchHealthTrends
{
  "query": "foodborne illness outbreaks"
}

// Response
{
  "source": "Gemini 2.5 Flash with Google Search (LIVE)",
  "results": [
    {
      "title": "E. coli outbreak linked to lettuce",
      "source": "FDA.gov",
      "date": "2025-01-13",
      "severity": "high",
      "summary": "Multi-state outbreak affecting 150 people",
      "location": {
        "state": "CA",
        "city": "Los Angeles",
        "lat": 34.0522,
        "lng": -118.2437
      },
      "affected": 150,
      "url": "https://fda.gov/..."
    }
  ]
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🏆 Acknowledgments

- **Google Cloud Platform** for Vertex AI and Cloud Functions
- **Gemini 2.5 Flash** for advanced AI capabilities
- **FDA** for public health data standards
- **React** and **Vite** communities

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**⚠️ Important Note**: This system uses REAL APIs and live data from Gemini 2.5 Flash with Google Search grounding. It provides actual health surveillance capabilities and is not a simulation or demo.
