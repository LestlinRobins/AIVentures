# Delivery Route Optimizer

A modern web application that optimizes delivery routes using real-time mapping, AI-powered delay predictions, and intelligent route planning. Built with React and Leaflet.

## Features

- 🗺️ Interactive map interface with real-time route visualization
- 🚗 Dynamic Routes: AI-powered 10-minute updates adapt to traffic, weather & road conditions
- ⏱️ Accurate ETAs: Precise delivery predictions accounting for stairs, security & delays
- 🎯 Intelligent Planning: Instant optimized routes from simple delivery goals input
- 🌱 Sustainable Performance: Smart vehicle selection for fuel efficiency & load safety
- 📊 Actionable Insights: Performance dashboards tracking time saved & delivery success
- ⚡ Critical Delivery Prioritization: Ensuring timely medical & elderly care deliveries
- 🔄 Smart Driver Reassignment: Maintaining service continuity during disruptions
- 📍 Multiple delivery points support with waypoints
- 📱 Responsive design for mobile and desktop
- 🌙 Dark theme optimized for delivery operations
- 📊 CSV data import for bulk route planning

## Tech Stack

- React.js
- Leaflet.js for mapping
- Leaflet Routing Machine for route optimization
- Gemini 2.0 Flash API for delay predictions
- Papa Parse for CSV processing
- OpenStreetMap for map data
- OSRM for route calculations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Gemini API key (for delay predictions)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/LestlinRobins/AIVentures.git
cd AIVentures
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Gemini API key, firebase keys, and maps API key:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn start
```

## Usage

### Basic Route Planning

1. Enter starting point manually or use "Use My Location"
2. Add delivery destinations as waypoints
3. Click "Calculate Optimal Route" to generate the optimized route
4. View the route on the map with estimated time and distance

### CSV Import

1. Prepare a CSV file with the following format:

```csv
Start,End
Kochi Kerala India,Trivandrum Kerala India
Kochi Kerala India,Coimbatore Tamil Nadu India
```

2. Click "Upload Delivery Data (CSV)" to import your routes
3. Select a starting location from the list
4. View optimized routes for all deliveries

### Delay Predictions

The application uses Gemini 2.0 Flash to predict delivery delays based on:

- Building complexity
- Security check requirements
- Climbing difficulty
- Historical delivery data

## Project Structure

```
src/
├── components/
│   ├── DeliveryRouteOptimizer.jsx
│   └── ...
├── styles/
│   └── DeliveryRouteOptimizer.css
├── assets/
│   ├── delivery_data.csv
│   └── data_for_delay_training.csv
└── ...
```

## API Integration

### Gemini 2.0 Flash

- Used for intelligent delay predictions
- Processes location data to estimate delivery times
- Considers multiple factors for accurate predictions

### OpenStreetMap

- Provides map data and geocoding services
- Used for location search and address validation

### OSRM

- Handles route optimization
- Calculates optimal paths between multiple points
- Provides real-time traffic updates

### Leaflet.js

- Interactive map visualization
- Custom markers for start/end points
- Real-time route display
- Responsive map controls
- Layer management for route overlays
- Supports multiple map providers
- Handles map events and user interactions
- Mobile-friendly touch controls

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap contributors for map data
- OSRM team for routing services
- Google Gemini team for AI capabilities
- Leaflet.js community for mapping solutions

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
