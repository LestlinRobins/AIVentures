# Delivery Route Optimizer

A modern web application that optimizes delivery routes using real-time mapping, AI-powered delay predictions, and intelligent route planning. Built with React and Leaflet.

## Features

- 🗺️ Interactive map interface with real-time route visualization
- 📍 Multiple delivery points support with waypoints
- 🚗 Real-time route optimization using OSRM
- ⏱️ AI-powered delay predictions using Gemini 2.0 Flash
- 📊 CSV data import for bulk route planning
- 📱 Responsive design for mobile and desktop
- 🌙 Dark theme optimized for delivery operations
- 🔄 Real-time traffic and route updates
- 📍 Current location detection
- 🎯 Turn-by-turn navigation view

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
git clone https://github.com/yourusername/delivery-route-optimizer.git
cd delivery-route-optimizer
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Gemini API key:

```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm start
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
