# 🗺️ **React Application with Mappedin Integration and BlueDot Animation**

This React application demonstrates how to integrate **Mappedin**, a mapping library, into a React app, allowing users to view a **3D interactive map** and animate a **BlueDot** that updates its position based on a series of coordinates.

---

## 📦 **Project Overview**

This project uses the following technologies:

- **React**: A JavaScript library for building user interfaces.
- **Mappedin**: A 3D indoor mapping solution for rendering dynamic maps.
- **TypeScript**: TypeScript is used to add types for a better development experience and safety.

---

## 🧩 **Code Explanation**

Let's walk through the code step by step to understand its structure and functionality.

### 1. **Importing Required Libraries and CSS**

The code starts by importing necessary libraries and configuration files:

```javascript
import React, { useEffect } from "react"; // Importing React and useEffect hook.
import { getMapData, show3dMap } from "@mappedin/mappedin-js"; // Mappedin library for 3D map functionality.
import { mapConfig } from "./config"; // Importing the configuration for API keys and map ID.
import "@mappedin/mappedin-js/lib/index.css"; // Importing Mappedin's default CSS for styling.
```

### 2. **These are Coordinates for Testing Purpose**

```javascript
const coordinates = [
  { latitude: 50.10574936554695, longitude: 8.671309014326267, accuracy: 1 },
  { latitude: 50.10570067068403, longitude: 8.671242197773896, accuracy: 1 },
  { latitude: 50.105675886069676, longitude: 8.671190462733136, accuracy: 1 },
  { latitude: 50.1056380411509, longitude: 8.671192723225422, accuracy: 1 },
  { latitude: 50.10560685694093, longitude: 8.671219439428766, accuracy: 1 },
  { latitude: 50.10558663551319, longitude: 8.671242395027216, accuracy: 1 },
  { latitude: 50.10555929583722, longitude: 8.671269500653219, accuracy: 1 },
  { latitude: 50.1055486636721, longitude: 8.671309313452236, accuracy: 1 },
];
```

### 📱 **App Component**

### 1. **Component Definition**

```javascript
const App: React.FC = () => {};
```

Defines the App component as a functional component (React.FC).

```javascript
useEffect(() => {});
```

useEffect hook runs the following logic when the component mounts.

```javascript
const initializeMap = async () => {};
```

Asynchronous function to initialize the map.

```javascript
const mapData = await getMapData({
  key: mapConfig.apiKey,
  secret: mapConfig.apiSecret,
  mapId: mapConfig.mapId,
});
```

Fetches map data asynchronously using `getMapData`.
It uses `apiKey`, `apiSecret`, and `mapId` from the configuration (`mapConfig`).
`await` ensures that the map data is fully fetched before proceeding.

```javascript
const mapContainer = document.getElementById("mappedin-map");
```

Retrieves the DOM element with the id `mappedin-map`, where the map will be displayed.

```javascript
if (mapContainer) {
  const mapView = await show3dMap(mapContainer, mapData);
}
```

Checks if the `mapContainer` exists.
If it exists, it calls `show3dMap` to display the 3D map inside the container with the fetched `mapData`.

```javascript
mapView.BlueDot.enable({
  color: "#39A2F9", // Set BlueDot color to blue.
  debug: true, // Enable debugging mode to view detailed logs.
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
```

`color: '#39A2F9',:` Set BlueDot color to blue.
`debug: true,:` Enable debugging mode to view detailed logs.
`color: '#39A2F9':`Set the color of the accuracy ring to blue.
`opacity: 0.1, :` Set opacity of the accuracy ring to 10%.
`color: 'aqua', :` Set the heading (orientation) color to aqua.
`opacity: 1, :` Set opacity of the heading to 100%.
` inactiveColor: 'wheat', :` Set the inactive BlueDot color to wheat.
` timeout: 20000, :` Set the timeout to 20 seconds for BlueDot inactivity.

Configures and enables the BlueDot with specific visual settings such as color, opacity, and timeout.
It helps show the user's dynamic location on the map.


```javascript
animateBlueDot(mapView);
```
Calls the `animateBlueDot` function to start animating the BlueDot on the map.
The BlueDot will move according to a set of coordinates.


### ** ⚒️ Function used to animate via array of Coordinates**

```javascript
const animateBlueDot = (mapView: any) => {}
```
Defines an `animateBlueDot` function that will update the position of BlueDot at regular intervals.
It takes the `mapView` object as a parameter to update the BlueDot on the map.

```javascript
let index = 0;
```
Initializes an index variable to track the current position in the coordinates array.

```javascript
const interval = setInterval(() => {



    if (index < coordinates.length) {
      // Checks if there are more coordinates left to animate.
      mapView.BlueDot.update(coordinates[index]);
      // Updates the BlueDot position using the current coordinates.
      index++;
      // Increments the index to the next coordinate.
    } else {
      clearInterval(interval);
      // Clears the interval when all coordinates have been processed, stopping the animation.
    }

}, 3000);

```
Sets an interval that runs every 3 seconds to update the BlueDot's position.
Runs the interval every 3000 milliseconds (3 seconds).

```javascript
return <div id="mappedin-map" style={{ width: '100%', height: '100vh' }} />;
```
Returns a div with the id `mappedin-map` where the 3D map will be rendered.
The style ensures the map container takes up the full width and height of the `viewport (100vh)`.

```javascript
catch (error) {
    console.error('Failed to initialize map:', error);
}
```
Catches any errors that occur during the map initialization process.
Logs the error message to the console for debugging.

### ** ⚒️ Function used to animate via Geolocation API**

```javascript
const animateBlueDotWithGeoLocation = (mapView: any) => {
  if (navigator.geolocation) {
    let watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const accuracy = position.coords.accuracy || 1;
        mapView.BlueDot.update({ latitude, longitude, accuracy });
      },
      (error) => {
        console.error("Error getting geolocation: ", error.message);
      },
      {
        enableHighAccuracy: true, 
        maximumAge: 0,            
        timeout: 5000             
      }
    );
    
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 30000);
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
};
```

```javascript
  const animateBlueDotWithGeoLocation = (mapView: any) => {}
```
This Function is used to animate the blue dot with the location we get from geolocation service.

```javascript
mapView.BlueDot.update({ latitude, longitude, accuracy });
```
Updates the BlueDot on the map using live geolocation data.

```javascript
navigator.geolocation.watchPosition(successCallback, errorCallback, options);
```
Watches for position changes, triggering the callback with updated coordinates.

```javascript
setTimeout(() => {
  navigator.geolocation.clearWatch(watchId);
}, 30000);
```
Stops location tracking after 30 seconds to conserve resources.

```javascript
console.error("Geolocation is not supported by this browser.");
```
Checks browser compatibility for the Geolocation API.