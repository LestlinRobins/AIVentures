import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import '../styles/DeliveryRouteOptimizer.css';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DeliveryRouteOptimizer = () => {
  const [locations, setLocations] = useState([
    { type: 'start', address: '', lat: null, lng: null },
    { type: 'waypoint', address: '', lat: null, lng: null },
    { type: 'end', address: '', lat: null, lng: null }
  ]);
  const [suggestions, setSuggestions] = useState({});
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState({});
  const [activeInput, setActiveInput] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const routingControl = useRef(null);
  const suggestionRefs = useRef({});
  const currentLocationMarker = useRef(null);

  // Initialize map
  useEffect(() => {
    // Make sure we only initialize after component is mounted and mapRef is available
    if (mapRef.current && !mapInitialized) {
      // Add a small delay to ensure the container is fully rendered
      const timer = setTimeout(() => {
        try {
          leafletMap.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(leafletMap.current);
          
          // Force a resize event to ensure the map fills the container
          window.dispatchEvent(new Event('resize'));
          
          setMapInitialized(true);
        } catch (error) {
          console.error("Error initializing map:", error);
          setError("Unable to initialize map. Please refresh the page.");
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [mapInitialized]);

  // Clean up map on component unmount
  useEffect(() => {
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOnSuggestion = Object.values(suggestionRefs.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!clickedOnSuggestion && activeInput !== null) {
        setActiveInput(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeInput]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Create a marker for current location
          if (currentLocationMarker.current && leafletMap.current) {
            leafletMap.current.removeLayer(currentLocationMarker.current);
          }
          
          if (leafletMap.current) {
            // Add pulsing effect marker for current location
            const pulsingIcon = L.divIcon({
              className: 'current-location-marker',
              html: '<div class="pulse-ring"></div><div class="pulse-core"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            currentLocationMarker.current = L.marker([latitude, longitude], {
              icon: pulsingIcon
            }).addTo(leafletMap.current);
            
            // Center map on current location
            leafletMap.current.setView([latitude, longitude], 15);
          }
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          
          if (!response.ok) throw new Error('Failed to get address');
          
          const data = await response.json();
          const address = data.display_name;
          
          // Update starting point location
          const newLocations = [...locations];
          newLocations[0] = {
            ...newLocations[0],
            address: address,
            lat: latitude,
            lng: longitude
          };
          
          setLocations(newLocations);
          setIsLocating(false);
        } catch (error) {
          console.error('Error getting location:', error);
          // Even if we can't get the address, still set the coordinates
          if (position && position.coords) {
            const { latitude, longitude } = position.coords;
            const newLocations = [...locations];
            newLocations[0] = {
              ...newLocations[0],
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              lat: latitude,
              lng: longitude
            };
            setLocations(newLocations);
          }
          setLocationError("Could not get full address, but coordinates are set");
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(`Error getting your location: ${error.message}`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Add new waypoint
  const addWaypoint = () => {
    const newLocations = [...locations];
    const endLocation = newLocations.pop(); // Remove end location
    newLocations.push({ type: 'waypoint', address: '', lat: null, lng: null });
    newLocations.push(endLocation); // Add end location back
    setLocations(newLocations);
  };

  // Remove waypoint
  const removeWaypoint = (index) => {
    if (locations.length <= 3) {
      setError("You need at least one waypoint");
      return;
    }
    
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  };

  // Handle location input change and fetch suggestions
  const handleLocationChange = async (index, value) => {
    const newLocations = [...locations];
    newLocations[index].address = value;
    newLocations[index].lat = null;
    newLocations[index].lng = null;
    setLocations(newLocations);
    
    // Clear suggestions if input is empty
    if (!value.trim()) {
      setSuggestions(prev => ({ ...prev, [index]: [] }));
      return;
    }
    
    // Set loading state
    setIsLoadingSuggestions(prev => ({ ...prev, [index]: true }));
    
    // Fetch suggestions after a delay (debounce)
    const searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
        );
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const data = await response.json();
        setSuggestions(prev => ({ 
          ...prev, 
          [index]: data.map(item => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }))
        }));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions(prev => ({ ...prev, [index]: [] }));
      } finally {
        setIsLoadingSuggestions(prev => ({ ...prev, [index]: false }));
      }
    }, 1000);
    
    return () => clearTimeout(searchTimeout);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (index, suggestion) => {
    const newLocations = [...locations];
    newLocations[index] = {
      ...newLocations[index],
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lng
    };
    
    setLocations(newLocations);
    setSuggestions(prev => ({ ...prev, [index]: [] }));
    setActiveInput(null);
    
    // Update map view to selected location
    if (leafletMap.current) {
      leafletMap.current.setView([suggestion.lat, suggestion.lng], 13);
      
      // Add a temporary marker
      const marker = L.marker([suggestion.lat, suggestion.lng]).addTo(leafletMap.current);
      setTimeout(() => {
        leafletMap.current.removeLayer(marker);
      }, 1500);
    }
  };

  // Optimize route
  const optimizeRoute = async () => {
    setIsOptimizing(true);
    setError(null);
    
    if (!mapInitialized) {
      setError("Map is not yet initialized. Please wait a moment and try again.");
      setIsOptimizing(false);
      return;
    }
    
    // Validate inputs
    if (locations.some(loc => !loc.address)) {
      setError("Please fill all locations");
      setIsOptimizing(false);
      return;
    }
    
    // Check if any location is missing coordinates
    const missingCoords = locations.find(loc => !loc.lat || !loc.lng);
    if (missingCoords) {
      setError(`Please select a valid location from the suggestions for: ${missingCoords.address}`);
      setIsOptimizing(false);
      return;
    }

    try {
      // Remove previous routing control if exists
      if (routingControl.current) {
        leafletMap.current.removeControl(routingControl.current);
      }
      
      // Create waypoint array for routing
      const waypoints = locations.map(loc => 
        L.latLng(loc.lat, loc.lng)
      );
      
      // Initialize routing control with OSRM
      routingControl.current = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        showAlternatives: true,
        fitSelectedRoutes: true,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        }),
        lineOptions: {
          styles: [{ color: '#3388ff', weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: function(i, wp) {
          let icon;
          if (i === 0) {
            // Start marker (green)
            icon = L.divIcon({
              className: 'custom-marker start-marker',
              html: `<div style="background-color:#38b000; width:12px; height:12px; border-radius:50%; border:2px solid white"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
          } else if (i === waypoints.length - 1) {
            // End marker (red)
            icon = L.divIcon({
              className: 'custom-marker end-marker',
              html: `<div style="background-color:#d90429; width:12px; height:12px; border-radius:50%; border:2px solid white"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
          } else {
            // Waypoint marker (blue)
            icon = L.divIcon({
              className: 'custom-marker waypoint-marker',
              html: `<div style="background-color:#3a86ff; width:12px; height:12px; border-radius:50%; border:2px solid white"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
          }
          return L.marker(wp.latLng, { icon: icon });
        }
      }).addTo(leafletMap.current);
      
      // Extract route information when route is calculated
      routingControl.current.on('routesfound', (e) => {
        const routes = e.routes;
        const route = routes[0]; // Get the primary route
        
        setRouteInfo({
          distance: (route.summary.totalDistance / 1000).toFixed(2), // km
          duration: Math.round(route.summary.totalTime / 60), // minutes
          waypoints: locations.length
        });
        
        setIsOptimizing(false);
      });
      
    } catch (err) {
      setError("Error optimizing route: " + err.message);
      setIsOptimizing(false);
    }
  };

  // Get location label
  const getLocationLabel = (locationType, index) => {
    switch(locationType) {
      case 'start':
        return "Starting Point";
      case 'end':
        return "Destination";
      default:
        return `Waypoint ${index}`;
    }
  };

  // Get location type CSS class
  const getLocationTypeClass = (locationType) => {
    switch(locationType) {
      case 'start':
        return "location-start";
      case 'end':
        return "location-end";
      default:
        return "location-waypoint";
    }
  };

  return (
    <div className="optimizer-container">
      <h1 className="optimizer-title">Delivery Route Optimizer</h1>
      
      <div className="optimizer-layout">
        {/* Left panel - Inputs */}
        <div className="left-panel">
          <div className="info-panel">
            <h2 className="panel-heading">Route Information</h2>
            
            {locations.map((location, index) => (
              <div 
                key={index} 
                className={`location-card ${getLocationTypeClass(location.type)}`}
              >
                <div className="location-header">
                  <label className="location-label">
                    {getLocationLabel(location.type, index)}
                  </label>
                  {location.type === 'waypoint' && (
                    <button
                      type="button"
                      onClick={() => removeWaypoint(index)}
                      className="remove-button"
                      aria-label="Remove waypoint"
                    >
                      ✕
                    </button>
                  )}
                  {location.type === 'start' && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className={isLocating ? "use-current-location-button disabled" : "use-current-location-button"}
                      title="Use my current location"
                    >
                      {isLocating ? "Locating..." : "Use My Location"}
                    </button>
                  )}
                </div>
                
                <div className="location-input-container">
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => handleLocationChange(index, e.target.value)}
                    onFocus={() => setActiveInput(index)}
                    className="location-input"
                    placeholder={`Enter ${location.type === 'start' ? 'starting' : location.type === 'end' ? 'destination' : 'waypoint'} address`}
                  />
                  
                  {/* Location suggestions dropdown */}
                  {activeInput === index && (suggestions[index]?.length > 0 || isLoadingSuggestions[index]) && (
                    <div 
                      ref={ref => suggestionRefs.current[index] = ref}
                      className="suggestions-dropdown"
                    >
                      {isLoadingSuggestions[index] ? (
                        <div className="suggestion-loading">Loading suggestions...</div>
                      ) : (
                        <ul className="suggestions-list">
                          {suggestions[index]?.map((suggestion, i) => (
                            <li 
                              key={i}
                              onClick={() => handleSelectSuggestion(index, suggestion)}
                              className="suggestion-item"
                            >
                              {suggestion.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Show selected coordinates if available */}
                {location.lat && location.lng && (
                  <div className="coordinates-display">
                    Selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </div>
                )}
              </div>
            ))}
            
            {locationError && (
              <div className="location-error">
                {locationError}
              </div>
            )}
            
            <button
              type="button"
              onClick={addWaypoint}
              className="add-waypoint-button"
            >
              + Add Waypoint
            </button>
            
            <button
              type="button"
              onClick={optimizeRoute}
              disabled={isOptimizing || !mapInitialized}
              className={isOptimizing || !mapInitialized ? "calculate-button disabled" : "calculate-button"}
            >
              {isOptimizing ? 'Optimizing...' : !mapInitialized ? 'Loading Map...' : 'Calculate Optimal Route'}
            </button>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {routeInfo && (
              <div className="route-summary">
                <h3 className="summary-title">Route Summary</h3>
                <div className="summary-details">
                  <p>Total Distance: <span className="summary-value">{routeInfo.distance} km</span></p>
                  <p>Estimated Time: <span className="summary-value">{routeInfo.duration} minutes</span></p>
                  <p>Stops: <span className="summary-value">{routeInfo.waypoints}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel - Map */}
        <div className="right-panel">
          {/* Map loading indicator */}
          {!mapInitialized && (
            <div className="map-loading">
              <div className="loading-text">Loading map...</div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className="map-container"
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryRouteOptimizer;