import React, { useEffect } from 'react';
import { getMapData, show3dMap } from '@mappedin/mappedin-js';
import { mapConfig } from './config';
import '@mappedin/mappedin-js/lib/index.css';

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

const App: React.FC = () => {
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

          mapView.BlueDot.enable({
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

         // Called after obtaining location information from Wi-Fi or other sources.
          // updateBlueDotWithLocation(mapView, {
          //   latitude: 50.10574936554695, 
          //   longitude: 8.671309014326267, 
          //   accuracy: 5,
          // });
          
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();
  }, []);

  //   const animateBlueDot = (mapView: any) => {
  //   let index = 0;
  //   const interval = setInterval(() => {
  //     if (index < coordinates.length) {
  //       mapView.BlueDot.update(coordinates[index]);
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //     }
  //   }, 3000);
  // };

  // const updateBlueDotWithLocation = (
  //   mapView: any,
  //   location: { latitude: number; longitude: number; accuracy: number }
  // ) => {
  //   if (mapView) {
  //     mapView.BlueDot.update(location);
  //   } else {
  //     console.error("MapView is not initialized.");
  //   }
  // };
  

  return <div id="mappedin-map" style={{ width: '100%', height: '100vh' }} />;
};

export default App;