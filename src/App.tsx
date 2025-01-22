import React, { useEffect, useRef } from 'react';
import { getMapData, show3dMap, TLabelAppearance } from '@mappedin/mappedin-js';
import { mapConfig } from './config';
import '@mappedin/mappedin-js/lib/index.css';

declare global {
  interface Window {
    sendLocationToWebApp?: (
      location: { latitude: number; longitude: number; accuracy: number },
      options?: { center?: boolean }) => void;
    getAllPOIsOnAllFloors?: () => any[];
    NavigateToPOI?: (Point: string) => string;
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


// Function to get all POIs across all floors
// const getAllPOIsOnAllFloors = (mapData: any) => {
//   if (!mapData) {
//     console.error('Map data is not initialized.');
//     return [];
//   }
//   const pois: any[] = [];

//   for (const poi of mapData.getByType('point-of-interest')) {
//     pois.push({
//       name: poi.name,
//       coordinate: poi.coordinate,
//       floorId: poi.floor.id,
//       floorName: poi.floor.name,
//       id: poi.id,
//       description: poi.description,
//       images: poi.images,
//       links: poi.links,
//     });
//   }
//   console.log(pois);
//   return pois;
// };

const getAllPOIsOnAllFloors = (mapData: any, currentLocation:any) => {
  if (!mapData) {
    console.error('Map data is not initialized.');
    return [];
  }
  if (!currentLocation) {
    console.error('Current location is not available.');
    return [];
  }

  const pois: any[] = [];
  const { latitude, longitude, floorId } = currentLocation;

  for (const poi of mapData.getByType('point-of-interest')) {
    // Calculate distance from current location to the POI
    const startCoordinate = mapData.createCoordinate(latitude, longitude, floorId || null);
    const endCoordinate = poi.coordinate;
    let distanceToPoi = null;

    try {
      const directions = mapData.getDirections(startCoordinate, endCoordinate);
      distanceToPoi = directions ? directions.distance : null;
    } catch (error) {
      console.error(`Failed to calculate distance to POI ${poi.name}:`, error);
    }

    // Add POI details along with the distance
    pois.push({
      name: poi.name,
      coordinate: poi.coordinate,
      floorId: poi.floor.id,
      floorName: poi.floor.name,
      id: poi.id,
      description: poi.description,
      images: poi.images,
      links: poi.links,
      distance: distanceToPoi, // Include the calculated distance
    });
  }
  console.log(pois);
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
        // const floors = mapData.getByType('floor');
        // const floor2 = floors.find(floor => floor.name === '2');
        // const floor2Id = floor2.id;


        const mapContainer = document.getElementById('mappedin-map');
        if (mapContainer) {
          const mapView = await show3dMap(mapContainer, mapData, 
            // {initialFloor: floor2Id,}
          );

          mapView.Camera.set({
            pitch: 20,
            bearing: 159,
            zoomLevel: 16,
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
                icon: '/PointerMarker.svg',
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
                rank: 'medium',
              });
            }
          });


          // window.sendLocationToWebApp = (location) => {
          //   updateBlueDotWithLocation(mapView, location);
          // };

          window.sendLocationToWebApp = (location, options = { center: false }) => {
            updateBlueDotWithLocation(mapView, location);
            if (options.center) {
              const { latitude, longitude } = location;
              const coordinate = mapView.createCoordinate(latitude, longitude);
              mapView.Camera.set({ center: coordinate });
            }
          };

          window.NavigateToPOI = (Point) => {
            return getDirectionToPOI(mapData, mapView, locationRef.current, Point);
          };

          window.getCurrentFloorId = () => {
            return getCurrentFloorId(mapView);
          };

          window.getAllPOIsOnAllFloors = () => {
            return getAllPOIsOnAllFloors(mapData, locationRef.current);
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