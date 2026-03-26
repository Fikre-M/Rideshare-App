# AI-Powered Rideshare Platform

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://ai-rideshare.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![MUI](https://img.shields.io/badge/MUI-v5-007FFF)](https://mui.com)

A modern, intelligent rideshare application built with React and powered by artificial intelligence. Features smart driver-passenger matching, dynamic pricing, route optimization, demand prediction, and predictive analytics.

## 🤖 AI Features

### Core AI Capabilities
- **Smart Matching Algorithm**: AI-powered driver-passenger matching based on proximity, ratings, vehicle type, and availability
- **Dynamic Pricing Engine**: Machine learning models for real-time surge pricing based on demand, weather, traffic, and events
- **Route Optimization**: Intelligent routing algorithms that consider traffic patterns, fuel efficiency, and user preferences
- **Demand Prediction**: ML models that forecast ride demand patterns and peak hours
- **Predictive Analytics**: Advanced analytics dashboard with revenue forecasting and operational insights
- **AI Chat Assistant**: Intelligent chatbot for customer support, trip planning, and real-time assistance

### AI Technologies Used
- Machine Learning algorithms for pattern recognition
- Real-time data processing and analysis
- Predictive modeling for demand forecasting
- Natural language processing for chat interactions
- Optimization algorithms for routing and matching

## 🚀 Features

- **Modern React Architecture**: Built with React 18, Vite, and modern development practices
- **Material-UI Design**: Professional, responsive interface with smooth animations
- **Real-time Updates**: WebSocket integration for live data updates
- **Authentication System**: Secure user authentication and authorization
- **Interactive Dashboard**: Comprehensive analytics and operational insights
- **Mobile Responsive**: Optimized for all device sizes
- **Performance Optimized**: Code splitting, lazy loading, and efficient bundling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Recharts** - Data visualization

### AI & Analytics
- **Custom AI Service Layer** - Modular AI service architecture
- **Predictive Models** - Demand forecasting and analytics
- **Real-time Processing** - Live data analysis and insights
- **Machine Learning Integration** - Ready for ML model integration

### Development Tools
- **TypeScript Support** - Type-safe development
- **ESLint & Prettier** - Code quality and formatting
- **Jest & Testing Library** - Unit and integration testing
- **Husky** - Git hooks for code quality

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transportation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - `VITE_API_URL`: Backend API endpoint
   - `VITE_AI_API_URL`: AI service endpoint
   - `VITE_MAPBOX_TOKEN`: Mapbox token for real maps (optional)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage

### Development Login
Use these credentials to access the platform:
- **Admin**: admin@airideshare.com / admin123
- **User**: user@airideshare.com / user123
- **Driver**: driver@airideshare.com / driver123

### AI Features Demo
1. **Smart Matching**: Navigate to AI Dispatch → Smart Matching
2. **Route Optimization**: Go to AI Dispatch → Route Optimization  
3. **Demand Prediction**: Visit AI Analytics → Demand Prediction
4. **Dynamic Pricing**: Check AI Analytics → Dynamic Pricing
5. **Predictive Analytics**: View AI Analytics → Predictive Analytics
6. **AI Chat**: Click the AI assistant button (available after login)

## 🏗️ Architecture

### AI Service Layer
```
src/services/aiService.js - Central AI service with fallback mock data
├── Chat Interface - Natural language processing
├── Route Optimization - Pathfinding algorithms  
├── Demand Prediction - Time series forecasting
├── Dynamic Pricing - Real-time pricing models
├── Smart Matching - Multi-factor matching algorithm
└── Predictive Analytics - Business intelligence
```

### Component Structure
```
src/components/ai/
├── ChatBot.jsx - AI chat interface
├── RouteOptimizer.jsx - Route planning component
├── DemandPredictor.jsx - Demand forecasting dashboard
├── DynamicPricing.jsx - Pricing calculation interface
├── SmartMatching.jsx - Driver-passenger matching
└── PredictiveAnalytics.jsx - Analytics dashboard
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Backend API base URL
- `VITE_AI_API_URL`: AI service base URL  
- `VITE_MAPBOX_TOKEN`: Mapbox access token
- `VITE_OPENAI_API_KEY`: OpenAI API key (optional)

### AI Service Configuration
The AI service layer automatically falls back to mock data when external services are unavailable, making it perfect for development and demonstration.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📱 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The app is ready for deployment to any static hosting service. The build output is in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎨 Screenshots

### Dashboard & AI Features
![AI Dashboard](docs/screenshots/dashboard.png)
> Real-time KPIs, demand forecasting chart, and live driver map

![Smart Matching](docs/screenshots/smart-matching.png)
> AI-powered driver selection with radar chart scoring breakdown

![Dynamic Pricing](docs/screenshots/dynamic-pricing.png)
> Surge pricing visualization with factor-based breakdown

![AI Chat Assistant](docs/screenshots/chatbot.png)
> Markdown-enabled chat with conversation history and model selector

> **Note:** Run `npm run dev` and take screenshots to populate the `docs/screenshots/` folder.

## 🔮 Future Enhancements

- **Real AI Integration**: Connect to actual ML models and AI services
- **Advanced Analytics**: More sophisticated predictive models
- **IoT Integration**: Real-time vehicle telemetry
- **Blockchain**: Decentralized payment and identity systems
- **AR/VR**: Immersive user experiences
- **Voice Interface**: Voice-controlled AI assistant

---

**Built with ❤️ and 🤖 AI**
