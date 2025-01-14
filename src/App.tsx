import React, { useEffect } from 'react';
import { getMapData, show3dMap } from '@mappedin/mappedin-js';
import { mapConfig } from './config';
import '@mappedin/mappedin-js/lib/index.css';

declare global {
  interface Window {
    sendLocationToWebApp?: (location: { latitude: number; longitude: number; accuracy: number }) => void;
  }
}

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
        //   mapView.on('click', async (event) => {
        //     console.log('Event object:', event); // Log the entire event object
        //     console.log('Coordinate:', event.coordinate);
       
        // });

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

          window.sendLocationToWebApp = (location) => {
            updateBlueDotWithLocation(mapView, location);
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
    location: { latitude: number; longitude: number; accuracy: number , floorOrFloorId?: string | "device";}
  ) => {
    if (mapView) {
      mapView.BlueDot.update(location);
    } else {
      console.error('MapView is not initialized.');
    }
  };

  return <div id="mappedin-map" style={{ width: '100%', height: '100vh' }} />;
};

export default App;