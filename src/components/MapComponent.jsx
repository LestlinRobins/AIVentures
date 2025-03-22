import { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import axios from 'axios';
import polyline from '@mapbox/polyline';

const libraries = ["places"];

const MapComponent = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const originRef = useRef();
  const destinationRef = useRef();
  const originAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerStyle = { width: '100%', height: '400px' };
  const defaultCenter = { lat: 40.7128, lng: -74.0060 };

  useEffect(() => {
    if (isLoaded && window.google) {
      // Initialize autocomplete for origin
      originAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        document.getElementById('origin-input'),
        { types: ['geocode'] }
      );

      // Initialize autocomplete for destination
      destinationAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        document.getElementById('destination-input'),
        { types: ['geocode'] }
      );

      // Add listeners
      originAutocompleteRef.current.addListener('place_changed', () => {
        const place = originAutocompleteRef.current.getPlace();
        if (place.geometry) {
          setOrigin(place.formatted_address);
          setOriginCoords({
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          });
        }
      });

      destinationAutocompleteRef.current.addListener('place_changed', () => {
        const place = destinationAutocompleteRef.current.getPlace();
        if (place.geometry) {
          setDestination(place.formatted_address);
          setDestinationCoords({
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          });
        }
      });
    }
  }, [isLoaded]);

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
      }
    } catch (err) {
      setError('Failed to fetch route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const decodedPath = routeData?.polyline?.encodedPolyline 
    ? polyline.decode(routeData.polyline.encodedPolyline).map(([lat, lng]) => ({ lat, lng }))
    : [];

  const center = originCoords 
    ? { lat: originCoords.latitude, lng: originCoords.longitude }
    : defaultCenter;

  return (
    <div className="route-planner">
      <LoadScript 
        googleMapsApiKey={API_KEY} 
        libraries={libraries}
        onError={(error) => {
          console.error('Google Maps Script Error:', error);
          setError('Failed to load Google Maps. Please check your API configuration.');
        }}
        onLoad={() => {
          console.log('Google Maps Script loaded successfully');
          setIsLoaded(true);
        }}
      >
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
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

        <div style={{ height: '400px', border: '1px solid #ddd' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={decodedPath.length ? 12 : 4}
          >
            {originCoords && (
              <Marker
                position={{ lat: originCoords.latitude, lng: originCoords.longitude }}
                label="A"
              />
            )}
            {destinationCoords && (
              <Marker
                position={{ lat: destinationCoords.latitude, lng: destinationCoords.longitude }}
                label="B"
              />
            )}
            {decodedPath.length > 0 && (
              <Polyline
                path={decodedPath}
                options={{
                  strokeColor: '#007bff',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                }}
              />
            )}
          </GoogleMap>
        </div>

        {routeData && (
          <div style={{ marginTop: '20px' }}>
            <h3>Route Details:</h3>
            <p>Distance: {(routeData.distanceMeters / 1000).toFixed(1)} km</p>
            <p>Duration: {routeData.duration.replace('s', ' seconds')}</p>
          </div>
        )}
      </LoadScript>
    </div>
  );
};

export default MapComponent;