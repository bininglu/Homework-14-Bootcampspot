// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  var earthquakes = L.layerGroup();
  createMap(earthquakes);
  function chooseColor(val){
    switch(Math.floor(val)){
      case 0:
        return "#00FF00"
        break;
      case 1:
        return "#AAFF05"
        break;
      case 2:
        return "#FFFF08"
        break;
      case 3:
        return "#FFAA05"
        break;
      case 4:
        return "#FF5502"
        break;
      case 5:
        return "FF0000"
        break;
      
    }

  };

  // Loop through data
  for (var i = 0; i < earthquakeData.length; i++) {

    // Set the data location property to a variable
    var location = earthquakeData[i].geometry;
    
  
    // Add a new marker to the cluster group and bind a pop-up
    var circle = L.circle([location.coordinates[1], location.coordinates[0]],{
      fillOpacity: 0.75,
      weight: 1,
      color: "black",
      // fillColor: "red",
      fillColor: chooseColor(parseFloat(earthquakeData[i].properties.mag)),
      // Adjust radius
      radius: earthquakeData[i].properties.mag * 20000,
      // onEachFeature: onEachFeature
    }).bindPopup("<h3>" + earthquakeData[i].properties.place +
    "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    .addTo(earthquakes)
  };

};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes

  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4.5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var colors = ["#00FF00", "#AAFF05", "#FFFF08", "#FFAA05", "#FF5502", "#FF0000"];
    var labels = [];

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\">"+limits[index]+"</li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);
}

