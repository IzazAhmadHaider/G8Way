import React, { useEffect, useRef } from 'react';
import { getMapData, show3dMap, TLabelAppearance } from '@mappedin/mappedin-js';
import { mapConfig } from './config';
import '@mappedin/mappedin-js/lib/index.css';

declare global {
  interface Window {
    sendLocationToWebApp?: (
      location: { latitude: number; longitude: number; accuracy: number }, center?: boolean) => void;
    getAllPOIsOnAllFloors?: (distance?: boolean) => any[];
    NavigateToPOI?: (Point: string) => string;
    NavigateToMultiplePOIs?: (Points: string[]) => { routes: any[]; totalDistance: number };
    getCurrentFloorId: () => string | null;
    getAllFloors?: () => { id: string; name: string }[];
  }
}

// Function to get the current floor ID
const getCurrentFloorId = (mapView: any) => {
  const currentFloor = mapView.currentFloor;
  if (currentFloor) {
    return currentFloor.id;
  } else {
    console.error('Current floor is not available.');
    return null;
  }
};

const getAllFloors = (mapData: any) => {
  if (!mapData) {
    console.error('Map data is not initialized.');
    return [];
  }
  const floors = mapData.getByType('floor').map((floor: any) => ({
    id: floor.id,
    name: floor.name,
  }));
  return floors;
};


// const coordinates = [
//   { latitude: 50.051445297436906, longitude: 8.573888102899321, accuracy: 1, floorid: 'm_01a8460ea3632b89' },
//   { latitude: 50.05088076816026, longitude: 8.572121422508308, accuracy: 1 },
// ];


const getAllPOIsOnAllFloors = (mapData: any, mapView: any, currentLocation: any, calculateDistance = false) => {
  if (!mapData) {
    console.error('Map data is not initialized.');
    return [];
  }
  if (!currentLocation) {
    console.error('Current location is not available.');
    return [];
  }
  const pois = [];
  // const { latitude, longitude, floorId } = currentLocation;
  for (const poi of mapData.getByType('point-of-interest')) {
    const poiData = {
      name: poi.name,
      coordinate: poi.coordinate,
      floorId: poi.floor.id,
      floorName: poi.floor.name,
      id: poi.id,
      description: poi.description,
      images: poi.images,
      links: poi.links,
      distance: 0
    };
    if (calculateDistance) {
      const startCoordinate = mapView.createCoordinate(currentLocation.latitude, currentLocation.longitude, currentLocation?.floorId);
      // Calculate distance from current location to the POI
      const endCoordinate = poi.coordinate;
      let distanceToPoi = null;
      try {
        const directions = mapData.getDirections(startCoordinate, endCoordinate);
        distanceToPoi = directions ? directions.distance : null;
      } catch (error) {
        console.error(`Failed to calculate distance to POI ${poi.name}:`, error);
      }
      poiData.distance = distanceToPoi; // Include the calculated distance
    }
    pois.push(poiData);
  }
  // console.log(pois);
  return pois;
};

// Function to get directions to a POI
const getDirectionToPOI = (mapData: any, mapView: any, startPoint: any, poiId: any) => {
  const allPOIs = mapData.getByType('point-of-interest');
  const targetPOI = allPOIs.find((poi: { id: string }) => poi.id === poiId.trim());
  if (!targetPOI) {
    console.log(`Point of Interest "${poiId}" not found.`);
    return;
  }
  const startCoordinate = mapView.createCoordinate(startPoint.latitude, startPoint.longitude, startPoint?.floorId);
  const endCoordinate = targetPOI.coordinate;
  const directions = mapData.getDirections(startCoordinate, endCoordinate);
  if (directions) {
    mapView.Navigation.draw(directions);
    return directions.distance;
  }
  return null;
};
const getDirectionsForMultiplePOIs = (mapData: any, mapView: any, startPoint: any, poiIds: string[]) => {
  if (!mapData || !mapView || !startPoint || poiIds.length < 2) {
    console.error("Invalid inputs for multi-destination navigation.");
    return { routes: [], totalDistance: 0 };
  }

  const allPOIs = mapData.getByType('point-of-interest');
  const poiIdSet = new Set(poiIds.map(id => id.trim()));
  const pathDetails = [];
  let totalDistance = 0;
  let currentStartPoint = startPoint;

  // Process each POI based on the provided poiIds
  for (let i = 0; i < poiIds.length; i++) {
    const targetPOI = allPOIs.find((poi: { id: string }) => poiIdSet.has(poi.id)); 
    if (!targetPOI) {
      console.error(`POI "${poiIds[i]}" not found.`);
      break; // Exit if POI is not found
    }

    const startCoordinate = mapView.createCoordinate(currentStartPoint.latitude, currentStartPoint.longitude, currentStartPoint?.floorId);
    const endCoordinate = targetPOI.coordinate;

    try {
      const directions = mapData.getDirections(startCoordinate, endCoordinate);
      if (directions) {
        mapView.Navigation.draw(directions);
        pathDetails.push({
          from: currentStartPoint,
          to: targetPOI,
          distance: directions.distance,
        });
        totalDistance += directions.distance; // Update total distance
        currentStartPoint = { latitude: targetPOI.coordinate.latitude, longitude: targetPOI.coordinate.longitude, floorId: targetPOI.floor.id };
      }
    } catch (error) {
      console.error(`Failed to get directions to POI "${poiIds[i]}":`, error);
    }
  }

  return { routes: pathDetails, totalDistance }; // Return both routes and totalDistance
};

// The main App component
const App: React.FC = () => {
  const locationRef = useRef<{ latitude: number; longitude: number; accuracy: number, floorOrFloorId?: string | "device" } | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const mapData = await getMapData({
          key: mapConfig.apiKey,
          secret: mapConfig.apiSecret,
          mapId: mapConfig.mapId,
        });

        const mapContainer = document.getElementById('mappedin-map');
        if (mapContainer) {
          const mapView = await show3dMap(mapContainer, mapData,
            { initialFloor: 'm_f2786e5df102b3c5', }
          );

          mapView.Camera.set({
            pitch: 26,
            bearing: 159,
            zoomLevel: 16.5,
          });

          mapView.BlueDot.enable({
            watchDevicePosition: false,
            color: '#39A2F9',
            debug: true,
            accuracyRing: {
              color: '#39A2F9',
              opacity: 0.1,
            },
            heading: {
              color: 'aqua',
              opacity: 1,
            },
            inactiveColor: 'wheat',
            timeout: 20000,
          });


          const pois = mapData.getByType('point-of-interest');

          pois.forEach((poi) => {
            const MarkerPointerr: TLabelAppearance = {
              margin: 10,
              marker: {
                icon: 'PointerMarker.svg',
                iconFit: "contain",
                iconPadding: -5,
                foregroundColor: {
                  inactive: "white",
                  active: "white",
                },
              },
            };
            if (poi.name && poi.floor.id === mapView.currentFloor.id) {
              mapView.Labels.add(poi.coordinate, poi.name, {
                appearance: MarkerPointerr,
                interactive: true,
                //rank: 'always-visible',
                rank: 'high',
              });
            }
          });


          window.sendLocationToWebApp = (location, center?: boolean) => {
            updateBlueDotWithLocation(mapView, location);
            if (center) {
              const { latitude, longitude } = location;
              const coordinate = mapView.createCoordinate(latitude, longitude);
              mapView.Camera.set({ center: coordinate });
            }
          };

          window.NavigateToPOI = (Point) => {
            return getDirectionToPOI(mapData, mapView, locationRef.current, Point);
          };


          window.NavigateToMultiplePOIs = (poiIds: string[]) => {
            return getDirectionsForMultiplePOIs(mapData, mapView, locationRef.current, poiIds);
          };

          window.getCurrentFloorId = () => {
            return getCurrentFloorId(mapView);
          };

          window.getAllPOIsOnAllFloors = (distance = false) => {
            return getAllPOIsOnAllFloors(mapData, mapView, locationRef.current, distance);
          };

          window.getAllFloors = () => {
            return getAllFloors(mapData);
          };
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();
  }, []);

  const updateBlueDotWithLocation = (
    mapView: any,
    location: { latitude: number; longitude: number; accuracy: number, floorOrFloorId?: string | "device"; }
  ) => {
    if (mapView) {
      //alert(location);
      locationRef.current = location;
      mapView.BlueDot.update(location);
    } else {
      console.error('MapView is not initialized.');
    }
  };

  return <div id="mappedin-map" style={{ width: '100%', height: '100vh' }} />;
};

export default App;