import React, { useEffect } from 'react';
import { getMapData, show3dMap } from '@mappedin/mappedin-js';
import { mapConfig } from './config';
import '@mappedin/mappedin-js/lib/index.css';

declare global {
  interface Window {
    sendLocationToWebApp?: (location: { latitude: number; longitude: number; accuracy: number }) => void;
    getAllPOIsOnAllFloors?: () => any[];
    sendYourPointOfInterest?: (PointOfInterset: string) => void;
  }
}



const App: React.FC = () => {
  const [locationFromOtherSource, setLocationFromOtherSource] = React.useState<{ latitude: number; longitude: number; floorOrFloorId?: string | "device"; } | null>(null);

  // const coordinates = [
  //   { latitude: 50.10574936554695, longitude: 8.671309014326267, accuracy: 1 },
  //   { latitude: 50.10570067068403, longitude: 8.671242197773896, accuracy: 1 },
  //   { latitude: 50.105675886069676, longitude: 8.671190462733136, accuracy: 1 },
  //   { latitude: 50.1056380411509, longitude: 8.671192723225422, accuracy: 1 },
  //   { latitude: 50.10560685694093, longitude: 8.671219439428766, accuracy: 1 },
  //   { latitude: 50.10558663551319, longitude: 8.671242395027216, accuracy: 1 },
  //   { latitude: 50.10555929583722, longitude: 8.671269500653219, accuracy: 1 },
  //   { latitude: 50.1055486636721, longitude: 8.671309313452236, accuracy: 1 },
  // ];
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
          const mapView = await show3dMap(mapContainer, mapData);

          mapView.Camera.set({
            pitch: 5,
            bearing: 70,
            zoomLevel: 10,
          });

          mapView.BlueDot.enable({
            watchBrowserPosition: false,
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

          window.sendLocationToWebApp = (location) => {
            updateBlueDotWithLocation(mapView, location);
          };
          // getPoint(mapView, coordinates[0]);
          // getDirectionToPOI(mapData, mapView, coordinates[0], 'Gate 3');
          window.sendYourPointOfInterest = (Point) => {
            getDirectionToPOI(mapData, mapView, locationFromOtherSource, Point);
          };
          window.getAllPOIsOnAllFloors = () => {
            return getAllPOIsOnAllFloors(mapData);
          };
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();
  }, []);



  // The Below Function is for Animating to a specific point of interset on the map

  // const getPoint = (mapView: any, location: { latitude?: number; longitude?: number; name?: string, floorOrFloorId?: string | "device"; }) => {
  //   if (mapView) {
  //     const poi = mapView.Camera.animateTo(
  //       {
  //         bearing: 30,
  //         pitch: 80,
  //         zoomLevel: 100,
  //         center: location,
  //       },
  //       { duration: 4000, easing: 'ease-in-out' },
  //     );
  //     return poi;
  //   } else {
  //     console.error('MapView is not initialized.');
  //   }

  // };

  const getAllPOIsOnAllFloors = (mapData: any) => {
    // Ensure mapData is available
    if (!mapData) {
      console.error('Map data is not initialized.');
      return [];
    };

    // Retrieve all POIs in a flat array
    const pois: any[] = [];

    for (const poi of mapData.getByType('point-of-interest')) {
      pois.push({
        name: poi.name,
        coordinate: poi.coordinate,
        floorId: poi.floor.id,
        floorName: poi.floor.name,
        id: poi.id,
        description: poi.description,
        images: poi.images,
        links: poi.links,
      });
    }
    console.log(pois)
    return pois;
  };


  const getDirectionToPOI = (mapData: any, mapView: any, startPoint: any, poiName: any) => {
    const allPOIs = mapData.getByType('point-of-interest');
    const targetPOI = allPOIs.find((poi: { name: string }) => poi.name.toLowerCase() === poiName.toLowerCase());
    if (!targetPOI) {
      console.log(`Point of Interest "${poiName}" not found.`);
      return;
    }
    const startCoordinate = mapView.createCoordinate(startPoint.latitude, startPoint.longitude, startPoint.floorId);
    const endCoordinate = targetPOI.coordinate;
    const directions = mapData.getDirections(startCoordinate, endCoordinate)
    if (directions) {
      mapView.Navigation.draw(directions);
    }
  };



  const updateBlueDotWithLocation = (
    mapView: any,
    location: { latitude: number; longitude: number; accuracy: number, floorOrFloorId?: string | "device"; }
  ) => {
    if (mapView) {
      setLocationFromOtherSource(location);
      mapView.BlueDot.update(location);
    } else {
      console.error('MapView is not initialized.');
    }
  };

  return <div id="mappedin-map" style={{ width: '100%', height: '100vh' }} />;
};

export default App;