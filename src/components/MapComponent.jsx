import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import polyline from '@mapbox/polyline';

const MapComponent = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [waypointCoords, setWaypointCoords] = useState([]);
  const [numStops, setNumStops] = useState(0);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState(null);
  const [optimize, setOptimize] = useState(false);
  const mapRef = useRef(null);
  const waypointAutocompletes = useRef([]);
  
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerStyle = { width: '100%', height: '400px' };

  // Get current location and initialize map
  const initializeWithCurrentLocation = async (google) => {
    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setOriginCoords(coords);

      // Initialize map with current location
      const mapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: coords.latitude, lng: coords.longitude },
        zoom: 15,
        mapId: "bd118346962a3fba" // Add your custom map style ID here
      });
      setMap(mapInstance);

      // Add marker for current location
      new google.maps.Marker({
        position: { lat: coords.latitude, lng: coords.longitude },
        map: mapInstance,
        label: 'A'
      });

      // Get address for the current location
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ 
          location: { lat: coords.latitude, lng: coords.longitude }
        });
        if (result.results[0]) {
          setOrigin(result.results[0].formatted_address);
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }

      return mapInstance;
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Could not get your current location. Initializing with default location.');
      
      // Fall back to default location
      const mapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        mapId: "bd118346962a3fba"// Add your custom map style ID here
      });
      setMap(mapInstance);
      return mapInstance;
    }
  };

  // Get current location on button click
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setOriginCoords(coords);

        if (map) {
          const center = { lat: coords.latitude, lng: coords.longitude };
          map.setCenter(center);
          map.setZoom(15);
          
          // Add marker for current location
          new google.maps.Marker({
            position: center,
            map: map,
            label: 'A'
          });

          // Get address for the current location
          try {
            const geocoder = new window.google.maps.Geocoder();
            const result = await geocoder.geocode({ location: center });
            if (result.results[0]) {
              setOrigin(result.results[0].formatted_address);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Could not get your current location. Please enter it manually.');
      }
    );
  };

  // Handle number of stops input change
  const handleNumStopsChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setNumStops(value);
    
    // Preserve existing waypoints and their coordinates
    if (value > waypoints.length) {
      // Add new empty waypoints
      setWaypoints(prevWaypoints => {
        const newWaypoints = [...prevWaypoints];
        for (let i = prevWaypoints.length; i < value; i++) {
          newWaypoints[i] = '';
        }
        return newWaypoints;
      });
      
      // Add empty coordinates
      setWaypointCoords(prevCoords => {
        const newCoords = [...prevCoords];
        for (let i = prevCoords.length; i < value; i++) {
          newCoords[i] = null;
        }
        return newCoords;
      });
    } else if (value < waypoints.length) {
      // Remove excess waypoints while preserving existing ones
      setWaypoints(prevWaypoints => prevWaypoints.slice(0, value));
      setWaypointCoords(prevCoords => prevCoords.slice(0, value));
      
      // Clean up autocomplete instances for removed waypoints
      for (let i = value; i < waypointAutocompletes.current.length; i++) {
        if (waypointAutocompletes.current[i]) {
          delete waypointAutocompletes.current[i];
        }
      }
    }
  };

  // Update waypoint at index
  const updateWaypoint = (index, value) => {
    setWaypoints(prevWaypoints => {
      const newWaypoints = [...prevWaypoints];
      newWaypoints[index] = value;
      return newWaypoints;
    });
  };

  // Update waypoint coordinates at index
  const updateWaypointCoords = (index, coords) => {
    setWaypointCoords(prevCoords => {
      const newCoords = [...prevCoords];
      newCoords[index] = coords;
      return newCoords;
    });
  };

  useEffect(() => {
    const loader = new Loader({
      apiKey: API_KEY,
      version: "beta",
      libraries: ["places"],
    });

    loader.load()
      .then(async (google) => {
        const mapInstance = await initializeWithCurrentLocation(google);

        // Initialize autocomplete for origin
        const originAutocomplete = new google.maps.places.Autocomplete(
          document.getElementById('origin-input'),
          { types: ['geocode'] }
        );

        // Initialize autocomplete for destination
        const destinationAutocomplete = new google.maps.places.Autocomplete(
          document.getElementById('destination-input'),
          { types: ['geocode'] }
        );

        // Set up origin place changed listener
        originAutocomplete.addListener('place_changed', () => {
          const place = originAutocomplete.getPlace();
          if (place.geometry) {
            setOrigin(place.formatted_address);
            setOriginCoords({
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            });
            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(15);
          }
        });

        // Set up destination place changed listener
        destinationAutocomplete.addListener('place_changed', () => {
          const place = destinationAutocomplete.getPlace();
          if (place.geometry) {
            setDestination(place.formatted_address);
            setDestinationCoords({
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            });
          }
        });

        // We'll set up waypoint autocompletes in the UI when the number of stops changes
        window.google = google;
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API configuration.');
      });
  }, [API_KEY]);

  // Initialize autocomplete for new waypoint inputs
  const initializeWaypointAutocomplete = (index) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    
    const inputId = `waypoint-input-${index}`;
    const inputElement = document.getElementById(inputId);
    
    if (inputElement && !waypointAutocompletes.current[index]) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputElement,
        { types: ['geocode'] }
      );
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          updateWaypoint(index, place.formatted_address);
          updateWaypointCoords(index, {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          });
        }
      });
      
      // Store the autocomplete instance
      waypointAutocompletes.current[index] = autocomplete;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originCoords || !destinationCoords) {
      setError('Origin and destination are required.');
      return;
    }

    // Check that all waypoints have coordinates
    const hasInvalidWaypoints = waypointCoords.some((coord, index) => !coord && waypoints[index]);
    if (hasInvalidWaypoints) {
      setError('All stops must have valid addresses.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Only include waypoints that have coordinates
      const validWaypoints = waypointCoords.filter(coord => coord !== null);
      
      // Format waypoints for the API request
      const formattedWaypoints = validWaypoints.map(coord => ({
        location: new window.google.maps.LatLng(coord.latitude, coord.longitude),
        stopover: true
      }));

      const requestData = {
        origin: new window.google.maps.LatLng(originCoords.latitude, originCoords.longitude),
        destination: new window.google.maps.LatLng(destinationCoords.latitude, destinationCoords.longitude),
        waypoints: optimize ? formattedWaypoints : [],
        optimizeWaypoints: optimize,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      // Use the DirectionsService instead of axios
      const directionsService = new window.google.maps.DirectionsService();
      const response = await new Promise((resolve, reject) => {
        directionsService.route(requestData, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      if (response?.routes?.length) {
        const route = response.routes[0];
        const legs = route.legs;
        
        // Calculate total distance and duration
        const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
        const totalDuration = legs.reduce((sum, leg) => sum + leg.duration.value, 0);

        // Format the response to match our existing structure
        const formattedResponse = {
          distanceMeters: totalDistance,
          duration: `${totalDuration}s`,
          legs: legs.map(leg => ({
            distanceMeters: leg.distance.value,
            duration: `${leg.duration.value}s`
          })),
          polyline: {
            encodedPolyline: route.overview_polyline
          },
          waypointOrder: route.waypoint_order
        };

        setRouteData(formattedResponse);
        
        // Draw the route on the map
        if (map) {
          // Clear previous routes
          if (window.routeLine) {
            window.routeLine.setMap(null);
          }

          // Remove all markers
          if (window.markers) {
            window.markers.forEach(marker => marker.setMap(null));
          }
          window.markers = [];
          
          const path = route.overview_path;
          
          window.routeLine = new window.google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map: map
          });

          // Add markers for all points
          const addMarker = (position, label) => {
            const marker = new window.google.maps.Marker({
              position,
              map,
              label
            });
            window.markers = window.markers || [];
            window.markers.push(marker);
            return marker;
          };

          // Origin marker
          addMarker(new window.google.maps.LatLng(originCoords.latitude, originCoords.longitude), 'A');
          
          // Waypoint markers (using a different marker ordering if optimized)
          const validWaypointCoords = waypointCoords.filter(coord => coord !== null);
          const waypointOrder = route.waypoint_order || Array.from({ length: validWaypointCoords.length }, (_, i) => i);
          
          validWaypointCoords.forEach((coord, index) => {
            const position = new window.google.maps.LatLng(coord.latitude, coord.longitude);
            const optimizedIndex = waypointOrder.indexOf(index);
            const label = String.fromCharCode(66 + (optimize ? optimizedIndex : index)); // B, C, D, ...
            addMarker(position, label);
          });
          
          // Destination marker (last label in sequence)
          const destLabel = String.fromCharCode(66 + validWaypointCoords.length);
          addMarker(new window.google.maps.LatLng(destinationCoords.latitude, destinationCoords.longitude), destLabel);

          // Fit bounds to show the entire route
          const bounds = new window.google.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          map.fitBounds(bounds);
        }
      }
    } catch (err) {
      console.error('Route Error:', err);
      setError('Failed to fetch route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-planner">
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              id="origin-input"
              type="text"
              placeholder="Your location"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              id="destination-input"
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="num-stops">Number of stops:</label>
          <input
            id="num-stops"
            type="number"
            min="0"
            max="10"
            value={numStops}
            onChange={handleNumStopsChange}
            style={{ width: '60px', padding: '8px' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
            <input
              id="optimize-route"
              type="checkbox"
              checked={optimize}
              onChange={(e) => setOptimize(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="optimize-route">Optimize route order</label>
          </div>
        </div>
        
        {waypoints.map((waypoint, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              id={`waypoint-input-${index}`}
              type="text"
              placeholder={`Stop ${index + 1}`}
              value={waypoint}
              onChange={(e) => updateWaypoint(index, e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              ref={(el) => {
                if (el) {
                  // Initialize autocomplete when input is rendered
                  setTimeout(() => initializeWaypointAutocomplete(index), 0);
                }
              }}
            />
          </div>
        ))}
        
        <button 
          type="submit" 
          disabled={loading || !originCoords || !destinationCoords}
          style={{ 
            padding: '8px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: (!loading && originCoords && destinationCoords) ? 'pointer' : 'not-allowed',
            opacity: (!loading && originCoords && destinationCoords) ? 1 : 0.7
          }}
        >
          {loading ? 'Calculating...' : 'Get Route'}
        </button>
        
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </form>

      <div 
        id="map" 
        ref={mapRef}
        style={{ height: '400px', border: '1px solid #ddd' }}
      />

      {routeData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Route Details:</h3>
          <p>Total Distance: {(routeData.distanceMeters / 1000).toFixed(1)} km</p>
          <p>Total Duration: {routeData.duration.replace('s', ' seconds')}</p>
          
          {routeData.legs && routeData.legs.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h4>Leg Details:</h4>
              {routeData.legs.map((leg, index) => {
                let fromLabel = index === 0 ? 'Origin' : `Stop ${index}`;
                let toLabel = index === routeData.legs.length - 1 ? 'Destination' : `Stop ${index + 1}`;
                
                if (routeData.waypointOrder) {
                  // If route is optimized, adjust the labels
                  if (index > 0 && index < routeData.legs.length - 1) {
                    const waypointIndex = routeData.waypointOrder[index - 1];
                    fromLabel = `Stop ${waypointIndex + 1}`;
                  }
                  if (index < routeData.legs.length - 1) {
                    const nextWaypointIndex = routeData.waypointOrder[index];
                    toLabel = `Stop ${nextWaypointIndex + 1}`;
                  }
                }
                
                return (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    <p>
                      <strong>{fromLabel} → {toLabel}:</strong> {(leg.distanceMeters / 1000).toFixed(1)} km, 
                      {leg.duration.replace('s', ' seconds')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;