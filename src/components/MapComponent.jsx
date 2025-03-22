import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import polyline from '@mapbox/polyline';

const MapComponent = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  
  const originRef = useRef();
  const destinationRef = useRef();

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
        mapIds: ["bd118346962a3fba"] // Add your custom map style ID here
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
        mapIds: ["bd118346962a3fba"] // Add your custom map style ID here
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
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API configuration.');
      });
  }, [API_KEY]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originCoords || !destinationCoords) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: { location: { latLng: originCoords } },
          destination: { location: { latLng: destinationCoords } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline,routes.legs',
          },
        }
      );

      if (response.data?.routes?.length) {
        setRouteData(response.data.routes[0]);
        
        // Draw the route on the map
        if (map && response.data.routes[0].polyline) {
          const path = polyline.decode(response.data.routes[0].polyline.encodedPolyline)
            .map(([lat, lng]) => ({ lat, lng }));
          
          new window.google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map: map
          });

          // Add markers
          if (originCoords) {
            new window.google.maps.Marker({
              position: { lat: originCoords.latitude, lng: originCoords.longitude },
              map: map,
              label: 'A'
            });
          }
          if (destinationCoords) {
            new window.google.maps.Marker({
              position: { lat: destinationCoords.latitude, lng: destinationCoords.longitude },
              map: map,
              label: 'B'
            });
          }

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
            {/* <button
              type="button"
              onClick={getCurrentLocation}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#007bff',
                fontSize: '14px'
              }}
            >
              📍 Current
            </button> */}
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
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>

      <div 
        id="map" 
        ref={mapRef}
        style={{ height: '400px', border: '1px solid #ddd' }}
      />

      {routeData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Route Details:</h3>
          <p>Distance: {(routeData.distanceMeters / 1000).toFixed(1)} km</p>
          <p>Duration: {routeData.duration.replace('s', ' seconds')}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
                
                