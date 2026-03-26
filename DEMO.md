# Demo Guide — AI Rideshare Platform

**Live URL:** https://rideshareapp-two.vercel.app

---

## Quick Start (2 minutes)

### 1. Login with a demo account

Go to the login page and click any of the three demo cards — no typing needed:

| Account | Email | Password | Access |
|---------|-------|----------|--------|
| AI Admin | admin@airideshare.com | admin123 | Full dashboard + analytics |
| John Doe | user@airideshare.com | user123 | Passenger view |
| Sarah Wilson | driver@airideshare.com | driver123 | Driver view |

---

## Feature Walkthrough

### Dashboard (`/dashboard`)
- Live KPI cards: total vehicles, active drivers, trips today, avg wait time, occupancy rate
- Real-time map with simulated driver positions
- Event feed with severity-coded alerts

### AI Smart Matching (`/dashboard/dispatch` → Smart Matching)
- Enter a pickup and destination (e.g. "Bole Area" → "Piazza")
- Click **Find Matches** — the AI scores drivers on proximity, rating, vehicle type, ETA, and availability
- Results show a radar chart breakdown of each match score
- Requires an OpenAI API key in Settings to use live AI; falls back to deterministic mock data otherwise

### Dynamic Pricing (`/dashboard/analytics` → Dynamic Pricing)
- Adjust demand level, weather, traffic, and event inputs
- AI calculates a surge multiplier in real time with a full reasoning breakdown
- Shows price history chart and factor weights

### Route Optimization (`/dashboard/dispatch` → Route Optimizer)
- Input origin and destination coordinates
- Combines Mapbox directions (if key provided) with OpenAI route ranking
- Returns recommended route with estimated time, distance, and traffic warnings

### Demand Prediction (`/dashboard/analytics` → Demand Prediction)
- 6-hour hourly demand forecast with confidence intervals
- Peak hour detection and driver deployment recommendations

### Predictive Analytics (`/dashboard/analytics` → Predictive Analytics)
- Revenue projections (today / this week / this month)
- Driver utilization current vs predicted vs optimal
- AI-generated business insights

### AI Chat Assistant
- Click the **purple chat FAB** (bottom-right corner) on any page
- Powered by Google Gemini via server-side proxy
- Supports markdown responses, conversation history, and quick-reply suggestions
- Keyboard shortcut: `Ctrl/Cmd + Shift + A`

### Command Palette
- Press `Ctrl/Cmd + K` anywhere in the dashboard
- Navigate to any page, trigger AI features, or search actions

---

## Configuring Real AI Keys

Go to **Settings → API Keys** (or the setup modal on first load):

| Key | Where to get it | Feature unlocked |
|-----|----------------|-----------------|
| Google AI (Gemini) | [aistudio.google.com](https://aistudio.google.com) | AI Chat |
| OpenAI | [platform.openai.com](https://platform.openai.com) | Matching, Pricing, Routes, Analytics |
| Mapbox | [mapbox.com](https://mapbox.com) | Real map tiles + directions |

Keys are stored in `sessionStorage` only — never sent anywhere except the server-side proxy.

---

## Tech Stack Highlights

- **React 18** + **TypeScript** + **Vite**
- **Material UI v5** with dark/light/auto theme
- **Zustand** for state (auth, chat, API keys, theme, notifications)
- **TanStack Query** for AI data fetching with caching + budget guard
- **Framer Motion** for animations
- **WebSocket** context with exponential backoff reconnection
- **PWA** — installable, offline page, service worker
- **Jest** + **Testing Library** — unit + integration tests

---

## Project Structure

```
src/
├── ai/               # ML model wrappers (TensorFlow.js)
├── components/       # UI components (ai/, dashboard/, map/, common/)
├── context/          # AuthContext, WebSocketContext
├── hooks/            # useAIFeatures, useAIQuery, useForm, useNotifications
├── pages/            # Dashboard, Analytics, Dispatch, MapView, Auth
├── services/         # aiService, openAIService, googleAIService, mapboxService
├── stores/           # Zustand stores (chat, theme, apiKey, notification)
└── utils/            # api.ts (axios), config, imageUtils, pwa
```
