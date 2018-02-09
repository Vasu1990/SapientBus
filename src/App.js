import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.markerArray = [];
    this.map = undefined;
    this.directionsDisplay = undefined;
    this.stepDisplay = undefined;
    this.initMap = this.initMap.bind(this);
    this.calculateAndDisplayRoute = this.calculateAndDisplayRoute.bind(this);
    this.showSteps = this.showSteps.bind(this);
    this.attachInstructionText = this.attachInstructionText.bind(this);
    this.calTotalDistanceAndTime = this.calTotalDistanceAndTime.bind(this);
    this.roundToTwoPlaces = this.roundToTwoPlaces.bind(this);
    this.search = this.search.bind(this);
  }

  initMap = () => {
        // Instantiate a directions service.
        this.directionsService = new window.google.maps.DirectionsService;

        // Create a map and center it on Manhattan.
        this.map = new window.google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {lat: 40.771, lng: -73.974}
        });

        // Create a renderer for directions and bind it to the map.
        this.directionsDisplay = new window.google.maps.DirectionsRenderer({map: this.map});

        // Instantiate an info window to hold step text.
        this.stepDisplay = new window.google.maps.InfoWindow;

        // Display the route between the initial start and end selections.
        this.calculateAndDisplayRoute(this.directionsDisplay, this.directionsService, this.markerArray, this.stepDisplay, this.map);
  }

  search = () => {
    this.calculateAndDisplayRoute(this.directionsDisplay, this.directionsService, this.markerArray, this.stepDisplay, this.map);
  }

  calTotalDistanceAndTime = legs => {
    let total = {
      distance: 0,
      time: 0
    };
    legs.forEach( (item,index) => {
      total.distance += item.distance.value;
      total.time += item.duration.value;
    });
    if (total.distance/1000 > 1) {
      total.distance = this.roundToTwoPlaces(total.distance/1000) + " Km";
    } else {
      total.distance = this.roundToTwoPlaces(total.distance) + " m";
    }
    if (total.time/3600 > 1) {
      total.time = this.roundToTwoPlaces(total.time/3600) + " hours";
    } else {
      total.time = this.roundToTwoPlaces(total.time/60) + " min";
    }
    return total;
  }

  roundToTwoPlaces = number => {
      return parseFloat(parseFloat(Math.round(number * 100) / 100).toFixed(2));
  };

  calculateAndDisplayRoute = (directionsDisplay, directionsService,
          markerArray, stepDisplay, map) => {
        let self = this,
            waypoint = [{
              location: document.getElementById('wayPoints').value
            }];
        // First, remove any existing markers from the map.
        for (var i = 0; i < markerArray.length; i++) {
          markerArray[i].setMap(null);
        }

        // Retrieve the start and end locations and create a DirectionsRequest
        directionsService.route({
          origin: document.getElementById('start').value,
          destination: document.getElementById('end').value,
          travelMode: document.getElementById('travelMode').value || 'WALKING',
          waypoints: waypoint,
        }, function(response, status) {
          // Route the directions and pass the response to a function to create
          // markers for each step.
          if (status === 'OK') {
            document.getElementById('warnings-panel').innerHTML =
                '<b>' + response.routes[0].warnings + '</b>';
            self.directionsDisplay.setDirections(response);
            self.showSteps(response, markerArray, stepDisplay, map);
            let total = self.calTotalDistanceAndTime(response.routes[0].legs);
            document.getElementById('totalDistance').innerHTML = total.distance;
            document.getElementById('totalTime').innerHTML = total.time;
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }

  showSteps = (directionResult, markerArray, stepDisplay, map) => {
        // For each step, place a marker, and add the text to the marker's infowindow.
        // Also attach the marker to an array so we can keep track of it and remove it
        // when calculating new routes.
        var myRoute = directionResult.routes[0].legs[0];
        for (var i = 0; i < myRoute.steps.length; i++) {
          var marker = markerArray[i] = markerArray[i] || new window.google.maps.Marker;
          marker.setMap(map);
          marker.setPosition(myRoute.steps[i].start_location);
          this.attachInstructionText(
              stepDisplay, marker, myRoute.steps[i].instructions, map);
        }
      }

  attachInstructionText = (stepDisplay, marker, text, map) => {
        window.google.maps.event.addListener(marker, 'click', function() {
          // Open an info window when the marker is clicked on, containing the text
          // of the step.
          stepDisplay.setContent(text);
          stepDisplay.open(map, marker);
        });
      }

  componentDidMount = () => {
    this.initMap();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div id="floating-panel">
    <b>Start: </b>
    <select id="start">
      <option value="JMD Garden, sector 33, gurgaon, india">Home</option>
      <option value="infospace, gurgaon, india">Infospace, Gurgaon</option>
      <option value="janakpuri, delhi, india">Janakpuri</option>
      <option value="green park, delhi, india">Green park</option>
      <option value="sector 15, noida, india">Sector 15, Noida</option>
    </select>
    <b>End: </b>
    <select id="end">
      <option value="rajiv chowk,gurgaon,india">Rajiv chowk,Gurgaon</option>
      <option value="infospace, gurgaon, india">Office</option>
      <option value="janakpuri, delhi, india">Janakpuri</option>
      <option value="green park, delhi, india">Green park</option>
      <option value="sector 15, noida, india">Sector 15, Noida</option>>
    </select>
    <b>Travel Mode: </b>
    <select id="travelMode">
        <option value="DRIVING">DRIVING</option>
        <option value="WALKING">WALKING</option>
        <option value="BICYCLING">BICYCLING</option>
        <option value="TRANSIT">TRANSIT</option>
    </select>
    <b>Via: </b>
    <select id="wayPoints">
        <option value="rajiv chowk, gurgaon, india">Rajiv chowk</option>
        <option value="Huda City center, gurgaon , india">Huda city center</option>
    </select>
    <button id="btn" onClick={this.search}>Search</button>
    <div id="warnings-panel"></div>
    </div>
        <div id="travelInfo">
          <p>
            <span style={{color:"red"}}>Total Distance : </span>
            <span style={{color:"blue"}} id="totalDistance"></span>
          </p>
          <p>
            <span style={{color:"red"}}>Total Estimated Time : </span>
            <span style={{color:"blue"}} id="totalTime"></span>
          </p>
        </div>
        <div id ="map"></div>
      </div>
    );
  }
}

export default App;
