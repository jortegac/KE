var map;
var facetSearchData = [];
var markers = [];
var infowindow = new google.maps.InfoWindow({});
var visible = false;
var arrAddress = [];
var abstract = "";

var geocoder = new google.maps.Geocoder();

function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng(52.365957,4.894009),
		zoom: 13,
		minZoom: 9,
		
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	
	var allowedBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(50.75038379999999, 3.357962),
		new google.maps.LatLng(53.5560213, 7.227510199999999)
	);

	 var boundLimits = {
		maxLat : allowedBounds.getNorthEast().lat(),
		maxLng : allowedBounds.getNorthEast().lng(),
		minLat : allowedBounds.getSouthWest().lat(),
		minLng : allowedBounds.getSouthWest().lng()
	};

	var lastValidCenter = map.getCenter();
	var newLat, newLng;
	
	google.maps.event.addListener(map, 'center_changed', function() {
		center = map.getCenter();
		if (allowedBounds.contains(center)) {
			// still within valid bounds, so save the last valid position
			lastValidCenter = map.getCenter();
			return;
		}
		newLat = lastValidCenter.lat();
		newLng = lastValidCenter.lng();
		if(center.lng() > boundLimits.minLng && center.lng() < boundLimits.maxLng){
			newLng = center.lng();
		}
		if(center.lat() > boundLimits.minLat && center.lat() < boundLimits.maxLat){
			newLat = center.lat();
		}
		map.panTo(new google.maps.LatLng(newLat, newLng));
	});
	
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
	setAllMap(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
	clearMarkers();
	markers = [];
}
// Set all markers on the map 
function setAllMap(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}
// Process the events information of a venue
function processEvents(title, events){
	
	//var div = $('<div class="list-group" text-align:justify"></div>');	
	var div = document.createElement('div');
	$( div ).attr("class", "list-group");
	
	$.each(events, function(i, event) {
		$.each(event, function(i, item) {
			
			var heading = document.createElement('h4');
			$( heading ).attr("class", "list-group-heading");
			var text=document.createTextNode(item["title"].trim());
			heading.appendChild(text);
			
			var list = document.createElement('p');
			$(list).attr("class", "list-group-item-text");
			
			var description = document.createElement('p');
			description.innerHTML = item["description"].trim();
			list.appendChild(description);
			
			var beginning = document.createElement('p');
			text = document.createTextNode("Beginning: "+ new Date(item["beginning"].trim()).toString());
			beginning.appendChild(text);
			list.appendChild(beginning);
			
			var end = document.createElement('p');
			text = document.createTextNode("End: "+ new Date(item["end"].trim()).toString());
			end.appendChild(text);
			list.appendChild(end);
			
			div.appendChild(heading);
			div.appendChild(list);
		});
		
	});
	return div;
}

function getFirstVenueWithEvents(venues) {
    for(var i in venues){
        var venue = venues[i];
		if(!jQuery.isEmptyObject(venue.events)){
            console.log("one venue found", i, venue);
            return venue;
        }
    }
}

// Processes the venue data and puts them on the map
function processVenues(venues) {
	console.log(venues);
	
	deleteMarkers();

	// Process each venue in the response
	$.each(venues, function(i, item) {
		
		var venueTitle = item.venue_title.value.trim();
		console.log(item);
		
		if(!jQuery.isEmptyObject(item.venue_longitude) && !jQuery.isEmptyObject(item.venue_latitude) ){
		
			var lng = parseFloat(item.venue_longitude.value);
			var lat = parseFloat(item.venue_latitude.value);
			
			console.log(lng);
			console.log(lat);	
			
			var events = "";

			if(!jQuery.isEmptyObject(item.events)){				
				events = processEvents(venueTitle, item.events);	
			}
			
			
			// Create a point using the lat and lng of the venue
			var point = new google.maps.LatLng(lat,lng);
			// Create the information to be displayed for each venue
			var html = createHtml(item, point);
			// Create the marker using the coordinates and the display information
			createMarker(point, html, events, venueTitle);
		}
	});	
	
	if( markers.length != 0) {
		// Put all the markers on the map
		setAllMap(map);

		// Center the map on the first marker in the response
		centerMap(markers[0]);
	} else {
		BootstrapDialog.alert({title:"Information", message:"No results found. Try a different combination"});
	}
}

// Create the information to be displayed for this venue
function createHtml(item, point){
	var div = $('<div style="width:240px text-align:justify"></div>');
	var br = $('<br/>');
	
	// Venue name
	div.append("<h4 class='venueName'>" + item.venue_title.value.trim() + "</h4>");
	
	// Venue short description	
	if(!jQuery.isEmptyObject(item.venue_shortDescription)){
		var p = $('<p><strong>Description</strong></p>');
		var a = $('<p></p>');
		a.append(item.venue_shortDescription.value.trim());
		p.append(a);
		div.append(p);
	}
		
	// Venue URL
	if(!jQuery.isEmptyObject(item.venue_homepage)){
		var p = $('<p></p>');
		var a = $('<a></a>');
		a.attr("href", item.venue_homepage.value.trim());
		a.attr("target", "_blank");
		a.append("Visit website");
		
		p.append(a);
		div.append(p);
	}
	
	
	// Venue opening hours	
	if(!jQuery.isEmptyObject(item.venue_openingHours)){
		var p = $('<p><strong>Opening hours</strong></p>');
		var a = $('<p></p>');
		a.append(item.venue_openingHours.value.trim());
		p.append(a);
		div.append(p);
	}
	
	return div;
}

// Zoom in and center the map on the marker
function centerMap(marker) {
	
	map.panTo(marker.position);	
	map.setZoom(13);
}

// Create marker
function createMarker(point, html, events, venueTitle) {
	// Create marker using the coordinates in the point
	var marker = new google.maps.Marker({
		position: point
	});
	
	marker.setTitle(venueTitle);
	
	// Add display information to the marker's info window
	google.maps.event.addListener(marker, "click", function() {
		geocoder.geocode({'latLng': point}, function(results, status) {
			var address = "No available address";
			var city = "";
			if (status == google.maps.GeocoderStatus.OK) {
				console.log(results);
				if (results[0]) {
					address = results[0].formatted_address;
					arrAddress= results[0].address_components;
					for (i = 0; i < arrAddress.length; i++) { 
						if (arrAddress[i].types[0] == "locality") { 
							city = arrAddress[i].long_name ;
						}
					}
				}
				
				
				var addressHtml = $('<p><strong>Address:</strong></p>');
				var a = $('<p></p>');
				a.append(address);
				addressHtml.append(a);
				console.log(address);
				
				// Really bad hack to avoid overflowing of the content for not being in the div
				baseHtml = html[0].outerHTML.replace("</div>", "");
				
				console.log(events);
					
				venueHtml = baseHtml + addressHtml[0].outerHTML + "</div>";			
		
				var tabs = "<div class='ionTabs' id='tabs_1' data-name='Tabs_Group_name'>" +
							"<ul class='ionTabs__head'>" +
								"<li class='ionTabs__tab' data-target='Venue'>Venue</li>" +
								"<li  class='ionTabs__tab' data-target='Events'>Events</li>" +
								"<li  class='ionTabs__tab' data-target='DBPedia'>More information</li>" +
								"<li  class='ionTabs__tab' data-target='Twitter'>Twitter</li>" +
							"</ul>" +
							"<div class='ionTabs__body'>" +
								"<div class='ionTabs__item' data-name='Venue'>" +
									venueHtml +
								"</div>" +
								"<div id='eventsTab' class='ionTabs__item' data-name='Events'>" +
									events.outerHTML +
								"</div>" +
								"<div id='dbpediaTab' class='ionTabs__item' data-name='DBPedia'><div id='dbpedia-info'><span>Waiting for data...</span></div></div>" +
								"<div id='twitterTab' class='ionTabs__item' data-name='Twitter'><div id='tweets' class='list-group'><span>Waiting for data...</span><div id='tweets-modal'></div></div></div>" +
								"<div class='ionTabs__preloader'></div>" +
							"</div>" +
						"</div>" ;
					
				google.maps.event.clearListeners(infowindow, 'domready');
				
				google.maps.event.addListener(infowindow, 'domready', function (e) {
					$.ionTabs("#tabs_1", {type: "none"});
					dbpediaSearch(venueTitle, city);
					twitterSearch(venueTitle, marker.getPosition());
					
				});
			
				infowindow.setContent(tabs); 
				infowindow.open(map,marker);
				
			}
		});
	});
	
	// Put marker in the global markers structure
	markers.push(marker);
}

function createDBPediaHTML(name, info){
	var div = document.createElement('div');
	$( div ).attr("class", "list-group");
	$( div ).attr("id", "dbpediaInfo");
	
	var heading = document.createElement('h4');
	$( heading ).attr("class", "list-group-heading");
	var text=document.createTextNode(name);
	heading.appendChild(text);
	div.appendChild(heading);
	
	var abstract = document.createElement('p');
	text=document.createTextNode(info.abstract);
	abstract.appendChild(text);
	div.appendChild(abstract);
	
	var par = document.createElement('p');
	var link = document.createElement('a');
	$(link).attr("href", info.link);
	$(link).attr("target", "_blank");
	text=document.createTextNode("Visit Website");
	link.appendChild(text);
	par.appendChild(link);
	div.appendChild(par);
	
	if(!$.isEmptyObject(info.location) && !(info.location == "")){
		var location = document.createElement('p');
		text = document.createTextNode("Location: " + info.location);
		location.appendChild(text);
		div.appendChild(location);		
	}
	
	if(!$.isEmptyObject(info.architect) && !(info.architect == "")){
		var architect = document.createElement('p');
		text = document.createTextNode("Architect: " + info.architect);
		architect.appendChild(text);
		div.appendChild(architect);		
	}
	
	if(!$.isEmptyObject(info.current_use)){
		var use = document.createElement('p');
		text = document.createTextNode("Currently used as: " + info.current_use);
		use.appendChild(text);
		div.appendChild(use);		
	}
	
	return div;
}

