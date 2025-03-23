import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "../styles/DeliveryRouteOptimizer.css";
import Papa from "papaparse";

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DeliveryRouteOptimizer = () => {
  const [locations, setLocations] = useState([
    { type: "start", address: "", lat: null, lng: null },
    { type: "waypoint", address: "", lat: null, lng: null },
    { type: "end", address: "", lat: null, lng: null },
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
  const [delayContainer, showDelayContainer] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [groupedRoutes, setGroupedRoutes] = useState({});
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const routingControl = useRef(null);
  const suggestionRefs = useRef({});
  const currentLocationMarker = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInitialized) {
      try {
        leafletMap.current = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([40.7128, -74.006], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(leafletMap.current);

        // Force a resize event to ensure the map fills the container
        setTimeout(() => {
          leafletMap.current.invalidateSize();
          window.dispatchEvent(new Event("resize"));
        }, 100);

        setMapInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Unable to initialize map. Please refresh the page.");
      }
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
      const clickedOnSuggestion = Object.values(suggestionRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );

      if (!clickedOnSuggestion && activeInput !== null) {
        setActiveInput(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              className: "current-location-marker",
              html: '<div class="pulse-ring"></div><div class="pulse-core"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            currentLocationMarker.current = L.marker([latitude, longitude], {
              icon: pulsingIcon,
            }).addTo(leafletMap.current);

            // Center map on current location
            leafletMap.current.setView([latitude, longitude], 15);
          }

          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (!response.ok) throw new Error("Failed to get address");

          const data = await response.json();
          const address = data.display_name;

          // Update starting point location
          const newLocations = [...locations];
          newLocations[0] = {
            ...newLocations[0],
            address: address,
            lat: latitude,
            lng: longitude,
          };

          setLocations(newLocations);
          setIsLocating(false);
        } catch (error) {
          console.error("Error getting location:", error);
          // Even if we can't get the address, still set the coordinates
          if (position && position.coords) {
            const { latitude, longitude } = position.coords;
            const newLocations = [...locations];
            newLocations[0] = {
              ...newLocations[0],
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(
                6
              )}`,
              lat: latitude,
              lng: longitude,
            };
            setLocations(newLocations);
          }
          setLocationError(
            "Could not get full address, but coordinates are set"
          );
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(`Error getting your location: ${error.message}`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Add new waypoint
  const addWaypoint = () => {
    const newLocations = [...locations];
    const endLocation = newLocations.pop(); // Remove end location
    newLocations.push({ type: "waypoint", address: "", lat: null, lng: null });
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

    if (!value.trim()) {
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    setIsLoadingSuggestions((prev) => ({ ...prev, [index]: true }));

    const searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5`
        );

        if (!response.ok) throw new Error("Failed to fetch suggestions");

        const data = await response.json();
        setSuggestions((prev) => ({
          ...prev,
          [index]: data.map((item) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          })),
        }));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions((prev) => ({ ...prev, [index]: [] }));
      } finally {
        setIsLoadingSuggestions((prev) => ({ ...prev, [index]: false }));
      }
    }, 1000); // Increased debounce timeout

    return () => clearTimeout(searchTimeout);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (index, suggestion) => {
    const newLocations = [...locations];
    newLocations[index] = {
      ...newLocations[index],
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lng,
    };

    setLocations(newLocations);
    setSuggestions((prev) => ({ ...prev, [index]: [] }));
    setActiveInput(null);

    // Update map view to selected location
    if (leafletMap.current) {
      leafletMap.current.setView([suggestion.lat, suggestion.lng], 13);

      // Add a temporary marker
      const marker = L.marker([suggestion.lat, suggestion.lng]).addTo(
        leafletMap.current
      );
      setTimeout(() => {
        leafletMap.current.removeLayer(marker);
      }, 1500);
    }
  };

  // Function to train the model and predict delays
  const predictDelay = async (location) => {
    try {
      console.log("Predicting delay for location:", location);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCGwilY73QqP_92bm-uZNxjOZieGCMd-r8",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Based on the training data:
                    Location,Climbing,Building,Security
                    Kochi, Kerala, India,3,4,2
                    Kochi, Kerala, India,4,3,2
                    Kochi, Kerala, India,3,3,3
                    Kochi, Kerala, India,4,4,2
                    Kochi, Kerala, India,3,4,3
                    
                    Predict the delay in minutes for this location: ${location}
                    Consider factors like climbing difficulty, building complexity, and security checks.
                    Return only the number of minutes as a single integer.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const delayText = data.candidates[0].content.parts[0].text;
      const delay = parseInt(delayText.trim());

      if (isNaN(delay)) {
        throw new Error("Invalid delay prediction");
      }

      console.log("Predicted delay:", delay, "minutes for", location);
      return delay;
    } catch (error) {
      console.error("Error predicting delay:", error);
      return 0; // Return 0 delay if prediction fails
    }
  };

  // Modify the optimizeRoute function to include delays
  const optimizeRoute = async () => {
    setIsOptimizing(true);
    setError(null);

    if (!mapInitialized) {
      setError(
        "Map is not yet initialized. Please wait a moment and try again."
      );
      setIsOptimizing(false);
      return;
    }

    // Validate inputs
    if (locations.some((loc) => !loc.address)) {
      setError("Please fill all locations");
      setIsOptimizing(false);
      return;
    }

    const missingCoords = locations.find((loc) => !loc.lat || !loc.lng);
    if (missingCoords) {
      setError(
        `Please select a valid location from the suggestions for: ${missingCoords.address}`
      );
      setIsOptimizing(false);
      return;
    }

    try {
      console.log("Starting route optimization...");
      console.log("Locations:", locations);

      // Remove previous routing control if exists
      if (routingControl.current) {
        console.log("Removing previous routing control");
        leafletMap.current.removeControl(routingControl.current);
      }

      const waypoints = locations.map((loc) => L.latLng(loc.lat, loc.lng));
      console.log("Waypoints:", waypoints);

      // Initialize routing control with OSRM
      routingControl.current = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
        }),
        lineOptions: {
          styles: [
            {
              color: "#ff7f27",
              weight: 6,
              opacity: 0.8,
              dashArray: null,
              className: "route-line",
            },
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        addWaypoints: true,
        draggableWaypoints: false,
        createMarker: function (i, wp) {
          let icon;
          if (i === 0) {
            icon = L.divIcon({
              className: "custom-marker start-marker",
              html: `<div style="background-color:#4ade80; width:12px; height:12px; border-radius:50%; border:2px solid white"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
          } else if (i === waypoints.length - 1) {
            icon = L.divIcon({
              className: "custom-marker end-marker",
              html: `<div style="background-color:#f87171; width:12px; height:12px; border-radius:50%; border:2px solid white"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
          } else {
            icon = L.divIcon({
              className: "custom-marker waypoint-marker",
              html: `<div style="background-color:#60a5fa; width:12px; height:12px; border-radius:50%; border:2px solid white"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
          }
          return L.marker(wp.latLng, { icon: icon });
        },
      });

      console.log("Adding routing control to map");
      routingControl.current.addTo(leafletMap.current);

      // Extract route information when route is calculated
      routingControl.current.on("routesfound", async (e) => {
        console.log("Route found:", e);
        const routes = e.routes;
        const route = routes[0];

        if (route && route.bounds) {
          console.log("Fitting bounds:", route.bounds);
          leafletMap.current.fitBounds(route.bounds, {
            padding: [50, 50],
            maxZoom: 15,
          });
        }

        // Calculate total delay for all destinations
        let totalDelay = 0;
        for (let i = 1; i < locations.length; i++) {
          const delay = await predictDelay(locations[i].address);
          totalDelay += delay;
        }

        setRouteInfo({
          distance: (route.summary.totalDistance / 1000).toFixed(2),
          duration: Math.round(route.summary.totalTime / 60),
          delay: totalDelay,
          totalTime: Math.round(route.summary.totalTime / 60) + totalDelay,
          waypoints: locations.length,
        });

        // Force map update after route is found
        setTimeout(() => {
          if (leafletMap.current) {
            console.log("Updating map view");
            leafletMap.current.invalidateSize();
            if (route && route.bounds) {
              leafletMap.current.fitBounds(route.bounds, {
                padding: [50, 50],
                maxZoom: 15,
              });
            }
          }
        }, 100);

        setIsOptimizing(false);
      });

      // Handle routing errors
      routingControl.current.on("routingerror", (e) => {
        console.error("Routing error:", e);
        setError(
          "Failed to calculate route. Please check the locations and try again."
        );
        setIsOptimizing(false);
      });
    } catch (err) {
      console.error("Error optimizing route:", err);
      setError("Error optimizing route: " + err.message);
      setIsOptimizing(false);
    }
  };

  // Add an effect to handle map resize when switching between locations
  useEffect(() => {
    if (leafletMap.current && locations.length > 0) {
      const resizeMap = () => {
        leafletMap.current.invalidateSize();
        if (routingControl.current) {
          const waypoints = locations.map((loc) => L.latLng(loc.lat, loc.lng));
          leafletMap.current.fitBounds(L.latLngBounds(waypoints));
        }
      };

      window.addEventListener("resize", resizeMap);
      setTimeout(resizeMap, 100);

      return () => {
        window.removeEventListener("resize", resizeMap);
      };
    }
  }, [locations, selectedStartLocation]);

  // Get location label
  const getLocationLabel = (locationType, index) => {
    switch (locationType) {
      case "start":
        return "Starting Point";
      case "end":
        return "Destination";
      default:
        return `Waypoint ${index}`;
    }
  };

  // Get location type CSS class
  const getLocationTypeClass = (locationType) => {
    switch (locationType) {
      case "start":
        return "location-start";
      case "end":
        return "location-end";
      default:
        return "location-waypoint";
    }
  };

  // Function to get coordinates using Gemini API
  const getCoordinatesWithGemini = async (address) => {
    try {
      console.log("Fetching coordinates for address using Gemini:", address);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCGwilY73QqP_92bm-uZNxjOZieGCMd-r8",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Get the exact latitude and longitude coordinates for this location: ${address}. Return only the coordinates in the format: "latitude,longitude"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Gemini response:", data);

      // Extract coordinates from Gemini's response
      const coordinatesText = data.candidates[0].content.parts[0].text;
      const [lat, lng] = coordinatesText
        .split(",")
        .map((coord) => parseFloat(coord.trim()));

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates received from Gemini");
      }

      return {
        lat,
        lng,
        display_name: address,
      };
    } catch (error) {
      console.error("Error getting coordinates from Gemini:", error);
      return null;
    }
  };

  // Function to process CSV data and group by start locations
  const processCSVData = async (data) => {
    console.log("Processing CSV data:", data);
    const grouped = {};

    // Process each row and get coordinates
    for (const row of data) {
      console.log("Processing row:", row);

      // Skip rows with missing data
      if (!row.Start || !row.End) {
        console.log("Skipping row with missing data");
        continue;
      }

      // Clean up the addresses
      const startAddress = row.Start.trim();
      const endAddress = row.End.trim();

      console.log("Processing addresses:", { startAddress, endAddress });

      // Add delay between requests to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const startCoords = await getCoordinatesWithGemini(startAddress);
      const endCoords = await getCoordinatesWithGemini(endAddress);

      console.log("Coordinates:", { startCoords, endCoords });

      if (startCoords && endCoords) {
        if (!grouped[startAddress]) {
          grouped[startAddress] = {
            coordinates: startCoords,
            destinations: [],
          };
        }

        grouped[startAddress].destinations.push({
          address: endAddress,
          coordinates: endCoords,
        });
      } else {
        console.log("Failed to get coordinates for:", {
          start: startAddress,
          end: endAddress,
        });
      }
    }

    console.log("Grouped routes:", grouped);
    setGroupedRoutes(grouped);

    // Set the first start location as selected if available
    const firstLocation = Object.keys(grouped)[0];
    if (firstLocation) {
      setSelectedStartLocation(firstLocation);
      loadRouteForStartLocation(firstLocation, grouped[firstLocation]);
    }
  };

  // Function to handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        transformHeader: (header) => {
          // Clean up header names
          return header.trim().replace(/^["']|["']$/g, "");
        },
        transform: (value) => {
          // Clean up values
          return value.trim().replace(/^["']|["']$/g, "");
        },
        complete: (results) => {
          console.log("Parsed CSV data:", results.data);
          // Filter out empty rows and ensure required columns exist
          const validData = results.data.filter(
            (row) =>
              row.Start &&
              row.End &&
              row.Start.trim() !== "" &&
              row.End.trim() !== ""
          );
          console.log("Valid data:", validData);
          setCsvData(validData);
          processCSVData(validData);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setError("Failed to parse CSV file");
        },
      });
    }
  };

  // Function to load route for a specific start location
  const loadRouteForStartLocation = (startLocation, routeData) => {
    console.log("Loading route for:", startLocation);
    console.log("Route data:", routeData);

    if (!routeData || !routeData.coordinates || !routeData.destinations) {
      console.error("Invalid route data:", routeData);
      return;
    }

    const newLocations = [
      {
        type: "start",
        address: startLocation,
        lat: routeData.coordinates.lat,
        lng: routeData.coordinates.lng,
      },
      ...routeData.destinations.map((dest) => ({
        type: "waypoint",
        address: dest.address || dest.coordinates.display_name,
        lat: dest.coordinates.lat,
        lng: dest.coordinates.lng,
      })),
    ];

    console.log("New locations:", newLocations);
    setLocations(newLocations);
    setSelectedStartLocation(startLocation);

    // Ensure map is initialized and visible
    if (leafletMap.current) {
      // Center map on the start location
      leafletMap.current.setView(
        [routeData.coordinates.lat, routeData.coordinates.lng],
        13
      );

      // Force a resize event to ensure the map fills the container
      setTimeout(() => {
        leafletMap.current.invalidateSize();
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }

    // Automatically optimize route after loading locations
    setTimeout(() => optimizeRoute(), 500);
  };

  // Add file upload button to the UI
  const renderFileUpload = () => (
    <div className="file-upload-section">
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        className="upload-button"
        onClick={() => fileInputRef.current.click()}
      >
        Upload Delivery Data (CSV)
      </button>

      {Object.keys(groupedRoutes).length > 0 && (
        <div className="start-locations-list">
          <h3>Starting Locations</h3>
          {Object.entries(groupedRoutes).map(([location, data]) => (
            <button
              key={location}
              className={`start-location-button ${
                selectedStartLocation === location ? "selected" : ""
              }`}
              onClick={() => loadRouteForStartLocation(location, data)}
            >
              {location} ({data.destinations.length} deliveries)
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Modify the navigation view to show delay information
  const renderNavigationView = () => (
    <div className="navigation-view">
      <div className="status-bar">
        <div className="time-remaining">
          <span className="time-label">Time Remaining</span>
          <span className="time-value">{routeInfo.totalTime} min</span>
          {routeInfo.delay > 0 && (
            <div className="delay-info">
              <span className="delay-label">Including predicted delays:</span>
              <span className="delay-value">+{routeInfo.delay} min</span>
            </div>
          )}
        </div>
        <div className="distance">
          <span className="distance-value">{routeInfo.distance} km</span>
        </div>
      </div>

      <button className="nav-button">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="optimizer-container">
      {/* Map Container - Always present */}
      <div
        ref={mapRef}
        className={`map-container ${
          routeInfo ? "navigation-mode" : "planning-mode"
        }`}
      >
        {!mapInitialized && (
          <div className="map-loading">
            <div className="loading-text">Loading map...</div>
          </div>
        )}
      </div>

      {!routeInfo ? (
        /* Route Planning Section */
        <div className="route-planning-section">
          <h1 className="optimizer-title">Delivery Route Optimizer</h1>
          {renderFileUpload()}

          {/* Only show the regular input panel if no CSV data is loaded */}
          {!csvData && (
            <div className="optimizer-layout">
              {/* Left panel - Inputs */}
              <div className="left-panel">
                <div className="info-panel">
                  <h2 className="panel-heading">Route Information</h2>

                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className={`location-card ${getLocationTypeClass(
                        location.type
                      )}`}
                    >
                      <div className="location-header">
                        <label className="location-label">
                          {getLocationLabel(location.type, index)}
                        </label>
                        {location.type === "waypoint" && (
                          <button
                            type="button"
                            onClick={() => removeWaypoint(index)}
                            className="remove-button"
                            aria-label="Remove waypoint"
                          >
                            ✕
                          </button>
                        )}
                        {location.type === "start" && (
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isLocating}
                            className={
                              isLocating
                                ? "use-current-location-button disabled"
                                : "use-current-location-button"
                            }
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
                          onChange={(e) =>
                            handleLocationChange(index, e.target.value)
                          }
                          onFocus={() => setActiveInput(index)}
                          className="location-input"
                          placeholder={`Enter ${
                            location.type === "start"
                              ? "starting"
                              : location.type === "end"
                              ? "destination"
                              : "waypoint"
                          } address`}
                        />

                        {activeInput === index &&
                          (suggestions[index]?.length > 0 ||
                            isLoadingSuggestions[index]) && (
                            <div
                              ref={(ref) =>
                                (suggestionRefs.current[index] = ref)
                              }
                              className="suggestions-dropdown"
                            >
                              {isLoadingSuggestions[index] ? (
                                <div className="suggestion-loading">
                                  Loading suggestions...
                                </div>
                              ) : (
                                <ul className="suggestions-list">
                                  {suggestions[index]?.map((suggestion, i) => (
                                    <li
                                      key={i}
                                      onClick={() =>
                                        handleSelectSuggestion(
                                          index,
                                          suggestion
                                        )
                                      }
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

                      {location.lat && location.lng && (
                        <div className="coordinates-display">
                          Selected: {location.lat.toFixed(5)},{" "}
                          {location.lng.toFixed(5)}
                        </div>
                      )}
                    </div>
                  ))}

                  {locationError && (
                    <div className="location-error">{locationError}</div>
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
                    className={
                      isOptimizing || !mapInitialized
                        ? "calculate-button disabled"
                        : "calculate-button"
                    }
                  >
                    {isOptimizing ? "Optimizing..." : "Calculate Optimal Route"}
                  </button>

                  {error && <div className="error-message">{error}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        renderNavigationView()
      )}
    </div>
  );
};

export default DeliveryRouteOptimizer;
