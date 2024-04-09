import React, { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "./styles.css";
import Todo from "./components/VisitingTodo";
import Form from "./components/VisitingForm";
import Filter from "./components/VisitingFilter";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZ3J1bWJsZXNuYWsiLCJhIjoiY2x1Zmxza21xMWtiMzJpbnNweGExeHJrNyJ9.MKtmWf0CAwyzEA_Ed1GRqA";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const FILTER_MAP = {
  All: () => true,
  Unvisited: (location) => !location.completed,
  Visited: (location) => location.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  function usePersistedState(key, defaultValue) {
    const [state, setState] = useState(
      () => JSON.parse(localStorage.getItem(key)) || defaultValue,
    );

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  }

  const mapContainerRef = useRef(null);
  const directionsRef = useRef(null);
  const [travelTime, setTravelTime] = useState(null);
  const [map, setMap] = useState(null);
  const [locations, setLocations] = usePersistedState("locations", []);
  const [filter, setFilter] = useState("All");
  const [resetPosition, setResetPosition] = useState([30.09, 51.39]);

  useEffect(() => {
    let map;
    let directions;

    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true,
    });

    function successLocation(position) {
      console.log("Latitude:", position.coords.latitude);
      console.log("Longitude:", position.coords.longitude);
      setupMap([position.coords.longitude, position.coords.latitude]);
    }

    function errorLocation() {
      setupMap([30.09, 51.39]);
    }

    function setupMap(center) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: 15,
      });

      setMap(map);

      var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/walking",
        controls: {
          instructions: false,
        },
      });

      while (directionsRef.current.firstChild) {
        directionsRef.current.firstChild.remove();
      }

      directionsRef.current.appendChild(directions.onAdd(map));

      directions.on("route", ({ route }) => {
        const timeInSeconds = route[0].duration;
        const timeInMinutes = Math.round((timeInSeconds / 60) * 10) / 10;
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = Math.round(timeInMinutes % 60);
        setTravelTime({ hours, minutes });
      });

      setTimeout(() => {
        const buttons = directionsRef.current.querySelectorAll("button");
        buttons[0].textContent = "Start";
        buttons[1].textContent = "Swap";
        buttons[2].textContent = "End";
      }, 0);
    }

    return () => {
      if (map) map.remove();
      if (directions) directions.remove();
    };
  }, []);

  const handleResetMap = () => {
    if (!map || !resetPosition) return;
    map.flyTo({
      center: resetPosition,
      essential: true,
    });
    map.setCenter(resetPosition);
    setTravelTime(null);
  };

  const handleUpdateLocation = () => {
    navigator.geolocation.getCurrentPosition(updatePosition, errorLocation, {
      enableHighAccuracy: true,
    });

    function updatePosition(position) {
      const { longitude, latitude } = position.coords;
      map.setCenter([longitude, latitude]);
      console.log("Updated position: ", [longitude, latitude]);
      setResetPosition([longitude, latitude]);
    }

    function errorLocation() {
      console.error("Unable to retrieve your location");
      setResetPosition([30.09, 51.39]);
    }
  };

  function toggleLocationVisited(id) {
    const updatedLocations = locations.map((location) => {
      if (id === location.id) {
        return { ...location, completed: !location.completed };
      }
      return location;
    });
    setLocations(updatedLocations);
  }

  const locationList = locations
    .filter(FILTER_MAP[filter])
    .map((location) => (
      <Todo
        id={location.id}
        name={location.name}
        completed={location.completed}
        key={location.id}
        toggleLocationVisited={toggleLocationVisited}
        deleteLocation={deleteLocation}
        editLocation={editLocation}
      />
    ));

  const filterList = FILTER_NAMES.map((name) => (
    <Filter
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  function addLocation(name) {
    const newLocation = { id: `todo-${nanoid()}`, name, completed: false };
    setLocations([...locations, newLocation]);
  }

  function deleteLocation(id) {
    const remainingLocations = locations.filter(
      (location) => id !== location.id,
    );
    setLocations(remainingLocations);
  }

  function editLocation(id, newName) {
    const editLocationList = locations.map((location) => {
      if (id == location.id) {
        return { ...location, name: newName };
      }
      return location;
    });
    setLocations(editLocationList);
  }

  const locationsNoun = locationList.length !== 1 ? "locations" : "location";
  const headingText = `${locationList.length} ${locationsNoun} remaining`;

  return (
    <div className="app-box">
      <div className="Heading">
        <h1>Terra Incognita</h1>
        <h4>Travel Into the Unknown</h4>
        {travelTime && (
          <p>
            Estimated travel time: {travelTime.hours} hours and{" "}
            {travelTime.minutes} minutes
          </p>
        )}
      </div>
      <div id="mapWrapper">
        <div ref={mapContainerRef} style={{ width: "100%", height: "400px" }} />
      </div>
      <div className="button-wrapper">
        <button className="reset-button" onClick={handleResetMap}>
          Reset Pos
        </button>
        <button className="reset-button" onClick={handleUpdateLocation}>
          Update Pos
        </button>
      </div>
      <div ref={directionsRef} />
      <Form addLocation={addLocation} />
      <div className="filters btn-group stack-exception">{filterList}</div>
      <h4 id="list-heading">{headingText}</h4>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {locationList}
      </ul>
    </div>
  );
}

export default App;
