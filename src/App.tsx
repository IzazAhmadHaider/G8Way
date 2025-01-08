import React, { useEffect } from 'react';
import { getMapData, show3dMap, TBlueDotPositionUpdate } from '@mappedin/mappedin-js';
import "@mappedin/mappedin-js/lib/index.css";
// import "./styles.css";

const App = () => {
  useEffect(() => {
    const initializeMap = async () => {
      const mapData = await getMapData({
        key: 'mik_sQZIWj36cB0rAWvHH51e20717',
        secret: 'mis_3O18TNSPfo1n5YR5ariICqwHqChPAoAgMnq3yV2KtMj7a270ff4',
        mapId: '6748437a01c8d6000bfa9935',
      });

      const mapContainer = document.getElementById('mappedin-map');

      // Check if the element exists
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
      }
    };

    initializeMap();
  }, []);

  return (
    <div id="mappedin-map" style={{ width: '100%', height: '100vh' }}></div>
  );
};

export default App;
