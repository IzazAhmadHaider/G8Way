import React, { useEffect, useRef } from "react";
import { getMapData, show3dMap, WALLS } from "@mappedin/mappedin-js";
import { mapConfig } from "./config";
import "@mappedin/mappedin-js/lib/index.css";

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        g8wayapp?: {
          postMessage: (message: string) => void;
        };
      };
    };
    sendLocationToWebApp?: (
      location: { latitude: number; longitude: number; accuracy: number },
      center?: boolean
    ) => void;
    getAllPOIsOnAllFloors?: (distance?: boolean) => any[];
    NavigateToPOI?: (Point: string) => string;
    NavigateToMultiplePOIs?: (Points: string[]) => {
      routes: any[];
      totalDistance: number;
    };
    getCurrentFloorId: () => string | null;
    getAllFloors?: () => { id: string; name: string }[];
    updateVisibleArea: (width: number, height: number) => void;
    highlightUniquePOIs: (uniquePOIIds: string[]) => void;
  }
}

// const updateMappedinVisibleArea = (
//   mapView: any,
//   width: number,
//   height: number
// ) => {
//   if (!mapView) return console.error("MapView not initialized.");

//   // Example: Center a specific location on the map using provided dimensions
//   const targetCoordinate = { latitude: 43.644, longitude: -79.395 }; // Replace with actual coordinates
//   mapView.Camera.set({
//     pitch: 26,
//     bearing: 159,
//     zoomLevel: 16.5,
//   });
// };

// Function to get the current floor ID
const getCurrentFloorId = (mapView: any) => {
  const currentFloor = mapView.currentFloor;
  if (currentFloor) {
    return currentFloor.id;
  } else {
    console.error("Current floor is not available.");
    return null;
  }
};

const getAllFloors = (mapData: any) => {
  if (!mapData) {
    console.error("Map data is not initialized.");
    return [];
  }
  const floors = mapData.getByType("floor").map((floor: any) => ({
    id: floor.id,
    name: floor.name,
  }));
  return floors;
};

// const coordinates = [
//   { latitude: 50.05089422913231, longitude: 8.572008274302208, accuracy: 10 },
//   { latitude: 50.05077437316641, longitude: 8.571272123569962, accuracy: 1 },
// ];

const getAllPOIsOnAllFloors = (
  mapData: any,
  mapView: any,
  currentLocation: any,
  calculateDistance = false
) => {
  if (!mapData) {
    console.error("Map data is not initialized.");
    return [];
  }
  if (!currentLocation) {
    console.error("Current location is not available.");
    return [];
  }

  const pois = [];
  const startCoordinate = mapView.createCoordinate(
    currentLocation.latitude,
    currentLocation.longitude,
    currentLocation?.floorId
  );

  for (const poi of mapData.getByType("point-of-interest")) {
    //console.log(poi.floor)
    if (poi.floor.id !== "m_f2786e5df102b3c5") {
      continue; 
    }

    const poiData = {
      name: poi.name,
      coordinate: poi.coordinate,
      floorId: poi.floor.id,
      floorName: poi.floor.name,
      id: poi.id,
      description: poi.description,
      images: poi.images,
      links: poi.links,
      distance: 0,
    };

    if (calculateDistance) {
      // Calculate distance from current location to the POI
      const endCoordinate = poi.coordinate;
      let distanceToPoi = null;
      try {
        const directions = mapData.getDistance(
          startCoordinate,
          endCoordinate
        );
        distanceToPoi = directions ? directions : null;
      } catch (error) {
        console.error(
          `Failed to calculate distance to POI ${poi.name}:`,
          error
        );
      }
      poiData.distance = distanceToPoi;
    }

    pois.push(poiData); // Add the POI to the result list
  }
  console.log(pois); // Debugging output
  return pois;
};

// Function to get directions to a POI
const getDirectionToPOI = (
  mapData: any,
  mapView: any,
  startPoint: any,
  poiId: any
) => {
  const allPOIs = mapData.getByType("point-of-interest");
  const targetPOI = allPOIs.find(
    (poi: { id: string }) => poi.id === poiId.trim()
  );
  if (!targetPOI) {
    console.log(`Point of Interest "${poiId}" not found.`);
    return;
  }
  const startCoordinate = mapView.createCoordinate(
    startPoint.latitude,
    startPoint.longitude,
    startPoint?.floorId
  );
  const endCoordinate = targetPOI.coordinate;
  const directions = mapData.getDirections(startCoordinate, endCoordinate);
  if (directions) {
    mapView.Navigation.draw(directions);
    return directions.distance;
  }
  return null;
};
const getDirectionsForMultiplePOIs = (
  mapData: any,
  mapView: any,
  startPoint: any,
  poiIds: string[]
) => {
  if (!mapData || !mapView || !startPoint) {
    console.error("Invalid inputs for multi-destination navigation.");
    return { routes: [], totalDistance: 0 };
  }

  const allPOIs = mapData.getByType("point-of-interest");
  const poiIdSet = new Set(poiIds.map((id) => id.trim()));
  const pathDetails: any[] = [];
  let totalDistance = 0;
  let currentStartPoint = startPoint;

  // Collect all target POIs
  const targetPOIs = allPOIs.filter((poi: { id: string }) =>
    poiIdSet.has(poi.id)
  );

  if (targetPOIs.length !== poiIds.length) {
    console.error(
      "Some POIs were not found:",
      poiIds.filter((id) => !targetPOIs.some((poi: any) => poi.id === id))
    );
  }

  // Create start and end coordinates
  const startCoordinate = mapView.createCoordinate(
    currentStartPoint.latitude,
    currentStartPoint.longitude,
    currentStartPoint?.floorId
  );

  // for (let i = 0; i < targetPOIs.length; i++) {
  //   const targetPOI = targetPOIs[i];

  //   const endCoordinate = mapView.createCoordinate(
  //     targetPOI.coordinate.latitude,
  //     targetPOI.coordinate.longitude,
  //     targetPOI?.floor.id
  //   );

  //   try {
  //     // Calculate step-by-step directions
  //     const directions = mapData.getDirections(startCoordinate, endCoordinate);
  //     if (directions) {
  //       pathDetails.push({
  //         from: currentStartPoint,
  //         to: targetPOI,
  //         distance: directions.distance,
  //       });

  //       totalDistance += directions.distance;

  //       // Update the current start point for the next route step
  //       currentStartPoint = {
  //         latitude: targetPOI.coordinate.latitude,
  //         longitude: targetPOI.coordinate.longitude,
  //         floorId: targetPOI.floor.id,
  //       };
  //     }
  //   } catch (error) {
  //     console.error(
  //       `Failed to get directions to POI "${targetPOI.id}":`,
  //       error
  //     );
  //   }
  // }

  const endCoordinates = targetPOIs.map((poi: any) => poi.coordinate);

  const fullRoute = mapData.getDirectionsMultiDestination(
    startCoordinate,
    endCoordinates
  );
  mapView.Navigation.draw(fullRoute);

  console.log({ routes: pathDetails, totalDistance });

  return { routes: pathDetails, totalDistance };
};

const highlightUniquePOIs = (
  mapData: any,
  mapView: any,
  uniquePOIIds: string[] = []
) => {
  if (!mapData || !mapView) {
    console.error("Invalid inputs for highlighting POIs.");
    return;
  }

  mapView.Markers.removeAll();
  const pois = mapData.getByType("point-of-interest");

  pois.forEach((poi: any) => {
    // Define a unique appearance for the highlighted POIs
    const uniqueMarkerTemplate = `
      <div>
        <style>
        .markeru {
         display: flex;
      align-items: center;
      font-family: Arial, sans-serif; /* Clean font */
      font-size: 10px; /* Adjust text size */
      color: #333; /* Text color */ 
        }

        .markeru img {
        width: 40px;
          object-fit: contain;
          // margin-right: 12px;
        }
        </style>
        <div class="markeru">
          <img src="loaction.svg" alt="Unique POI Icon" />
          <p>${poi.name}</p>
        </div>
      </div>`;

    const defaultMarkerTemplate = `
      <div>
  <style>
    .marker {
      display: flex;
      align-items: center;
      font-family: Arial, sans-serif; /* Clean font */
      font-size: 10px; /* Adjust text size */
      color: #333; /* Text color */
    }

    .marker img {
      width: 20px; 
      height: 20px; 
      object-fit: contain;
      margin-right: 2px; 
    }

    .marker p {
      margin: 0;
      font-weight: medium; /* Adjust text weight */
    }
  </style>
  <div class="marker">
    <img src="PointerMarker.svg" alt="Normal POI Icon" />
    <p>${poi.name}</p>
  </div>
</div>
`;

    // Check if this POI is in the unique POI list
    if (
      uniquePOIIds.length > 0 &&
      uniquePOIIds.includes(poi.id) &&
      poi.floor.id === mapView.currentFloor.id
    ) {
      // Add a unique marker with custom template for unique POIs
      mapView.Markers.add(poi.coordinate, uniqueMarkerTemplate, {
        rank: "always-visible", // or any other rank logic
      });
    } else if (poi.name && uniquePOIIds.length == 0  && poi.floor.id === mapView.currentFloor.id) {
    //} else if (poi.name && poi.floor.id === mapView.currentFloor.id) {
      // Always add a default marker for normal POIs
      mapView.Markers.add(poi.coordinate, defaultMarkerTemplate, {
        rank: "high", // or any other rank logic
      });
    }
  });
};

// The main App component
const App: React.FC = () => {
  const locationRef = useRef<{
    latitude: number;
    longitude: number;
    accuracy: number;
    floorOrFloorId?: string | "device";
  } | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const mapData = await getMapData({
          key: mapConfig.apiKey,
          secret: mapConfig.apiSecret,
          mapId: mapConfig.mapId,
        });

        const mapContainer = document.getElementById("mappedin-map");
        if (mapContainer) {
          const mapView = await show3dMap(mapContainer, mapData, {
            initialFloor: "m_f2786e5df102b3c5",
          });

          mapView.Camera.set({
            pitch: 0,
            bearing: 159,
            zoomLevel: 16.5,
          });
          // mapView.updateState(WALLS.Exterior, {
          //   texture: {
          //     url: 'https://example.com/wall-side-texture.png',
          //   },
          //   topTexture: {
          //     url: 'https://example.com/wall-top-texture.png',
          //   },
          // });

          mapView.updateState(WALLS.Interior, {
            color: '#050505',
            topColor: '#1e1e1e',
          });
          mapData.getByType("object").forEach((object) => {
            mapView.updateState(object, {
              // texture: {
              //   url: OBJECT_SIDE,
              // },
              topColor: "#4d4d4d",
            });
          });

          mapView.BlueDot.enable({
            watchDevicePosition: false,
            color: "#39A2F9",
            debug: true,
            accuracyRing: {
              color: "#39A2F9",
              opacity: 0.1,
            },
            heading: {
              color: "aqua",
              opacity: 1,
            },
            inactiveColor: "wheat",
            timeout: 20000,
          });
          highlightUniquePOIs(mapData, mapView);
          //highlightUniquePOIs(mapData, mapView ,  ['s_325987648b5dd1cc', 's_eb2827ef87440666', "s_f353785f99a45817"]);

          // console.time("getAllPOIsOnAllFloors");
          // getAllPOIsOnAllFloors(mapData, mapView, coordinates[0] , true);
          // console.timeEnd("getAllPOIsOnAllFloors");

          // updateBlueDotWithLocation(mapView, coordinates[0] , true)
          // getDirectionsForMultiplePOIs(mapData, mapView, coordinates[0], ['s_325987648b5dd1cc', 's_eb2827ef87440666', "s_f353785f99a45817"])
          // updateMappedinVisibleArea(mapView, 2000, 5000);

          // updateMappedinVisibleArea(mapView, 400, 600);

          window.sendLocationToWebApp = (location, center?: boolean) => {
            updateBlueDotWithLocation(mapView, location, center);
          };
          window.highlightUniquePOIs = (uniquePOIIds: string[]) => {
            highlightUniquePOIs(mapData, mapView, uniquePOIIds);
          };
          // window.updateVisibleArea = (width, height) => {
          //   updateMappedinVisibleArea(mapView, width, height);
          // };

          window.NavigateToPOI = (Point) => {
            return getDirectionToPOI(
              mapData,
              mapView,
              locationRef.current,
              Point
            );
          };

          window.NavigateToMultiplePOIs = (poiIds: string[]) => {
            return getDirectionsForMultiplePOIs(
              mapData,
              mapView,
              locationRef.current,
              poiIds
            );
          };

          window.getCurrentFloorId = () => {
            return getCurrentFloorId(mapView);
          };

          window.getAllPOIsOnAllFloors = (distance = false) => {
            return getAllPOIsOnAllFloors(
              mapData,
              mapView,
              locationRef.current,
              distance
            );
          };

          window.getAllFloors = () => {
            return getAllFloors(mapData);
          };
          
          if (window.webkit?.messageHandlers?.g8wayapp) {
            window.webkit.messageHandlers.g8wayapp.postMessage("MapInitialized");
          } else {
            console.error("g8wayapp message handler is not available.");
          }
        }
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };
    //  if (isLoading) {
    //     return <div>Loading...</div>;
    //   }
    initializeMap();
    
   
  }, []);

  const updateBlueDotWithLocation = (
    mapView: any,
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
      floorOrFloorId?: string | "device";
    },
    center?: Boolean
  ) => {
    if (mapView) {
      //alert(location);
      locationRef.current = location;
      mapView.BlueDot.update(location);
      if (center) {
        mapView.Camera.set({
          // bearing: 30,
          // pitch: 80,
          zoomLevel: 20,
          center: location,
        });
      }
    } else {
      console.error("MapView is not initialized.");
    }
  };

  return <div id="mappedin-map" style={{ width: "100%", height: "100vh" }} />;
};

export default App;
