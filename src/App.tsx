import Mappedin, { MapView, useMapData, useMap, Label } from '@mappedin/react-sdk';
import '@mappedin/react-sdk/lib/esm/index.css';
import { useState, useEffect, useRef } from 'react';

// Mock coordinate data simulating person movement
const coordinates = [
  { latitude: 50.10574936554695, longitude: 8.671309014326267 },
  { latitude: 50.10570067068403, longitude: 8.671242197773896 },
  { latitude: 50.105675886069676, longitude: 8.671190462733136 },
  { latitude: 50.1056380411509, longitude: 8.671192723225422 },
  { latitude: 50.10560685694093, longitude: 8.671219439428766 },
  { latitude: 50.10558663551319, longitude: 8.671242395027216 },
  { latitude: 50.10555929583722, longitude: 8.671269500653219 },
  { latitude: 50.1055486636721, longitude: 8.671309313452236 },
  { latitude: 50.105529471135505, longitude: 8.671347648769729 },
  { latitude: 50.10550533833827, longitude: 8.671431179162257 },
  { latitude: 50.10553769701518, longitude: 8.671479335497533 },
  { latitude: 50.10555147443028, longitude: 8.671498562487464 },
  { latitude: 50.10554394385963, longitude: 8.671524495790358 },
  { latitude: 50.105562337713046, longitude: 8.671577650731614 }
];

function PersonLocation() {
  const [usecoordinates, setUsecoordinates] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCoordinate, setCurrentCoordinate] = useState<Mappedin.Coordinate | null>(null);
  const { mapView } = useMap();
  const markerRef = useRef<Mappedin.Marker | null>(null);

  useEffect(() => {
    if (usecoordinates) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % coordinates.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported.");
        return;
      }
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setCurrentCoordinate(new Mappedin.Coordinate(latitude, longitude));
        },
        (error) => console.error("Geolocation error: ", error.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [usecoordinates]);

  useEffect(() => {
    const coordinate = usecoordinates
      ? coordinates[currentIndex]
      : currentCoordinate;
    if (mapView && coordinate) {
      const mappedinCoordinate = new Mappedin.Coordinate(coordinate.latitude, coordinate.longitude);
      if (!markerRef.current) {
        const customMarkerHtml = `<div><img src="/placeholder.png" style="width: 20px; height: 20px;" alt="Placeholder" /></div>`;
        markerRef.current = mapView.Markers.add(mappedinCoordinate, customMarkerHtml, {
          rank: 'always-visible',
        });
      } else {
        mapView.Markers.animateTo(markerRef.current, mappedinCoordinate);
      }
    }
  }, [mapView, currentCoordinate, currentIndex, usecoordinates]);

  return (
    <div className='absolute top-0 left-0'>
      <label>
        <input
        
          type="checkbox"
          checked={usecoordinates}
          onChange={() => setUsecoordinates((prev) => !prev)}
        />
        Enable Testing Mode
      </label>
    </div>
  );
}

// export default PersonLocation;

function MyCustomComponent() {
  const { mapData } = useMap();
  const spaceLabels = mapData
    .getByType('space')
    .map((space) => <Label key={space.id} target={space.center} text={space.name} />);

  return (
    <>
      {spaceLabels}
      <PersonLocation />
    </>
  );
}

export default function App() {
  const { isLoading, error, mapData } = useMapData({
    key: 'mik_sQZIWj36cB0rAWvHH51e20717',
    secret: 'mis_3O18TNSPfo1n5YR5ariICqwHqChPAoAgMnq3yV2KtMj7a270ff4',
    mapId: '6748437a01c8d6000bfa9935',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return mapData ? (
    <MapView mapData={mapData}>
      <MyCustomComponent />
    </MapView>
  ) : null;
}
