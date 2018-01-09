function initMap() {
    var sanDiego = {lat:32.7157, lng:-117.1611};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: sanDiego,
    });
    var infos = [];
    var pos;
    var geoLocationWindow = new google.maps.InfoWindow;
    var geoLocationMarker = new google.maps.Marker;
    
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('right-panel'));

    const myPromise = new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };  
                geoLocationMarker.setPosition(pos);
                geoLocationMarker.setMap(map);
                geoLocationWindow.setPosition(pos);
                geoLocationWindow.setContent('Current location');
                geoLocationWindow.open(map, geoLocationMarker);
                map.setCenter(pos);
                resolve(pos);
            });
        } 
    });
    $(document).ready(function() {
        $.getJSON('data.json', function(data) {
            $.each(data, function(i, value) {
                $('table > tbody').append('<tr></tr>');
                $('table > tbody > tr:last').append('<td>' + value.name + '</td>').append('<td>' + value.description + '</td>').append('<td><a href="https://www.google.com/maps?q=' + value.location + '" target="blank">Open in Google Maps</td>');
    
                $('#destination').append('<option></option>');
                $('option:last').attr('value', value.location).append(value.name);
                var latLng = new google.maps.LatLng(value.location[0], value.location[1]);
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                });
                var contentString = '<h3>' + value.name + '</h3>' + '<p>' + value.description + '</p>';
                var infowindow = new google.maps.InfoWindow();
                var service = new google.maps.DistanceMatrixService();
                var htmlTable = $('table > tbody > tr').eq(i).find('td').eq(2);

                myPromise.then((success) => {
                    service.getDistanceMatrix({
                        origins: [success],
                        destinations: [latLng],
                        travelMode: 'DRIVING',
                    }, callback); 
                    function callback(response, status) {
                        if (status === 'OK') {
                            var results = response.rows[0].elements[0];
                            htmlTable.append('<p>Distance: ' + results.distance.text + '</p>');
                        } else {
                            alert('Error was: ' + status);
                        }
                    };
                });       
                google.maps.event.addListener(marker, 'mouseover', (function(marker, contentString, infowindow) {
                    return function() {
                        closeInfos();

                        infowindow.setContent(contentString);
                        infowindow.open(map, marker);

                        infos[0] = infowindow;
                    };
                })(marker, contentString, infowindow));
            })
        });
    });
    
    var onChangeHandler = function() {
        if (document.getElementById('destination').value == "") {
            return;
        }
        calculateAndDisplayRoute(directionsService, directionsDisplay);
        };
    document.getElementById('destination').addEventListener('change', onChangeHandler);

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var destinationValue = (document.getElementById('destination').value.split(','));
        var lat = parseFloat(destinationValue[0]);
        var lng = parseFloat(destinationValue[1]);
        var latLngValue = {lat: lat, lng: lng};
        
        
        directionsService.route({
            origin: pos,
            destination: latLngValue,
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status=== 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });

    };
        
    function closeInfos() {
        if (infos.length > 0) {
            infos[0].set('marker', null);
            infos[0].close();
            infos.length = 0;
            //close old info window after new info window is opened via event handler
        }
    };
};
    
/* 
style webpage and table
then sort top spots based of distance
*/