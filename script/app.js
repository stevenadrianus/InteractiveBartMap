function initMaps(){
    // This function handle the initialization of the map
    function createMap(){
        return new google.maps.Map(document.getElementById('map'), {
            center: {lat: 37.805301, lng: -122.219371},
            zoom: 10
        });
    }

    // The infowindow generator for the marker on the maps
    function populateInfoWindow(marker, infowindow, data) {
        infowindow.setContent(null);

        var contentString = '<div id="iw-container">' +
                                '<div class="iw-title">' + data.main + '</div>' +
                                '<div class="iw-content">' +
                                    '<p>' + data.address + '</p>' +
                                    '<div class="iw-subTitle">Nearby Restaurants</div>';

        //Pulling up date from zomato API
        var requestURL = "https://developers.zomato.com/api/v2.1/search?count=3&lat=" +
            data.coordinates.latitude + "&lon=" + data.coordinates.longitude +
            "&radius=3000&sort=real_distance&order=asc";

        var zomatoData;

        $.ajax({
            beforeSend: function(request) {
                request.setRequestHeader("user-key", '2ff3ad85baed2cae9efec2b43afe84ca');
            },
            dataType: "json",
            url: requestURL,
            // If data successfully received, the restuarant info will be added to
            // the infowindow content.
            success: function(data) {
                zomatoData = data.restaurants;
                for (let i = 0; i < 3; i++) {
                    var currentRestaurant = zomatoData[i].restaurant;
                    contentString += '<a href=' + currentRestaurant.url + 'color="black">' +
                    '<h3>' + currentRestaurant.name + '</h3></a>';
                    if (currentRestaurant.featured_image){
                        contentString += '<img src=' + currentRestaurant.featured_image +
                        ' height="100" width="100">';
                    }
                    contentString += '<p>' + currentRestaurant.location.address + "<br>" +
                        "Rating: " + currentRestaurant.user_rating.aggregate_rating + " / 5.0<br>" +
                        currentRestaurant.user_rating.votes + " Total Reviews<br>" +
                        "Average cost for two: $" + currentRestaurant.average_cost_for_two +
                        '</p>';

                }
                contentString += '<sub>Content provided by Zomato</sub>' +
                        '</div>' +
                        '<div class="iw-bottom-gradient"></div>' +
                        '</div>';
                infowindow.setContent(contentString);

            }
        })
        .fail(function(xhr, status, error) {
            alert("Failed to fetch Zomato Data");
        });
        infowindow.open(map,marker);
    }

    // function geocodePlace(results, status) {
    //   if (status == google.maps.places.PlacesServiceStatus.OK) {
    //       console.log(results[0].geometry.location);
    //       return results[0].geometry.location;
    //   } else {
    //       console.log('fail');
    //   }
    // }

    // function geocodePlace(placesUrl) {
    //     var coordinates = [];
    //     $.ajax({
    //         url: placesUrl,
    //         dataType: 'json',
    //         success: function( response ) {
    //             coordinates.push(response.results[0].geometry.location.lat);
    //             coordinates.push(response.results[0].geometry.location.lng);
    //         }
    //     })
    //     .fail(function(jqxhr, textStatus, error) {
    //         alert("Failed to fetch Google Data");
    //     });
    //     console.log(coordinates);
    //     return coordinates;
    // }

    var infowindow = new google.maps.InfoWindow();

    var ViewModel = function(map, bartStation) {
        var self = this;

        self.map = map;

        function point(data) {
            // Initialization of the data obtained from yelp api
            this.main = data.main;
            this.coordinates = {lat: data.coordinates.latitude,
                lng: data.coordinates.longitude};

            // Initialization of the google maps marker
            this.googleMarker = new google.maps.Marker({
                map: map,
                position: this.coordinates,
                title: this.main,
                animation: google.maps.Animation.DROP
            });

            infowindow.marker = this.googleMarker;

            // Generate the infowindow when the station in the menu list is clicked
            this.listInfoWindow = function(){
                populateInfoWindow(this.googleMarker, infowindow, data);
                var divHeightOfTheMap = document.getElementById('map').clientHeight;
                var offSetFromBottom = 50;
                map.setZoom(12);
                map.setCenter(this.googleMarker.getPosition());
                map.panBy(0, -(divHeightOfTheMap / 2 - offSetFromBottom));
                this.googleMarker.setAnimation(google.maps.Animation.DROP);
            };

            // Generate the infowindow when the marker on the map is clicked
            this.googleMarker.addListener('click', function() {
                populateInfoWindow(this, infowindow, data);
                var divHeightOfTheMap = document.getElementById('map').clientHeight;
                var offSetFromBottom = 50;
                map.setZoom(12);
                map.setCenter(this.getPosition());
                map.panBy(0, -(divHeightOfTheMap / 2 - offSetFromBottom));
                this.setAnimation(google.maps.Animation.DROP);
            });

            // Close the infowindow whenever there is another click on the map
            // to prevent multiple infowindow on the same map.
            self.map.addListener('click', function(){
                infowindow.setContent(null);
                infowindow.close();
                // map.setCenter({lat: 37.805301, lng: -122.219371});
                map.setZoom(10);
            });
        }

        // Push every data from the yelp api to ko.observable
        self.bartList = [];

        bartStation.forEach(function(bart) {
            self.bartList.push(new point(bart));
        });

        self.visibleMarkers = ko.observableArray();

        self.bartList.forEach(function(bart) {
            self.visibleMarkers.push(bart);
        });

        self.filterWord = ko.observable('');

        // This function handle the filter on the menu list.
        self.filterMarkers = function() {
            var search = self.filterWord().toLowerCase();

            self.visibleMarkers.removeAll();

            self.bartList.forEach(function(marker){
                marker.googleMarker.setMap(null);

                if (marker.main.toLowerCase().indexOf(search) >= 0) {
                    self.visibleMarkers.push(marker);
                }
            });

            self.visibleMarkers().forEach(function(marker) {
                marker.googleMarker.setMap(self.map);
                marker.googleMarker.setAnimation(google.maps.Animation.DROP);
            });
        };
    };

    // Bart Station data, obtained from bart website(www.bart.gov).
    var bartStation = [
        {
            "main": "12th St. Oakland City Center",
            "coordinates": {
                "latitude": 37.8033590838803,
                "longitude": -122.271844493925
            },
            "address": "1245 Broadway, Oakland, CA 94602"
        },
        {
            "main": "16th St. Mission",
            "coordinates": {
                "latitude": 37.7647836375499,
                "longitude": -122.41996559838
            },
            "address": "2000 Mission St, San Francisco, CA 94103"
        },
        {
                    "main": "19th St. Oakland",
                    "coordinates": {
                        "latitude": 37.80782,
                        "longitude": -122.26852
                    },
                        "address": "1900 Broadway, Oakland, CA 94612"
        },
        {
                "main": "24th St. Mission",
                "coordinates": {
                    "latitude": 37.75199,
                    "longitude": -122.41871
                },
                "address": "2800 Mission St, San Francisco, CA 94110"

        },
        {
                "main": "Ashby",
                "coordinates": {
                    "latitude": 37.8530469427056,
                    "longitude": -122.270012486509
                },
                "address": "3100 Adeline St, Berkeley, CA 94701"
        },
        {
                "main": "Balboa Park",
                "coordinates": {
                    "latitude": 37.7212438,
                    "longitude": -122.4475465
                },
                "address": "401 Geneva Ave, San Francisco, CA 94112"
        },
        {
                "main": "Bay Fair",
                "coordinates": {
                    "latitude": 37.69779,
                    "longitude": -122.12965
                },
                "address": "15242 Hesperian Blvd, San Leandro, CA 94578"

        },
        {
                "main": "Castro Valley",
                "coordinates": {
                    "latitude": 37.6914831345115,
                    "longitude": -122.075961408445
                },
                "address": "3301 Norbridge Dr, Castro Valley, CA 94546"

        },
        {
            "main": "Civic Center",
                "coordinates": {
                    "latitude": 37.7795077488,
                    "longitude": -122.413753979
                },
                    "address": "1150 Market St, San Francisco, CA 94110"

        },
        {
                "main": "Coliseum",
                "coordinates": {
                    "latitude": 37.7523959,
                    "longitude": -122.1983131
                },
                    "address": "700 73rd Ave, Oakland, CA 94621"

        },
        {
                "main": "Colma",
                "coordinates": {
                    "latitude": 37.6840581,
                    "longitude": -122.4622823
                },
                "address": "365 D St, Colma, CA 94014"
        },
        {
                "main": "Concord",
                "coordinates": {
                    "latitude": 37.9743690490723,
                    "longitude": -122.028503417969
                },
                "address": "1451 Oakland Ave, Concord, CA 94520"
        },
        {
                "main": "Daly City",
                "coordinates": {
                    "latitude": 37.7063347689904,
                    "longitude": -122.468803487069
                },
                    "address": "500 John Daly Blvd, Daly City, CA 94014"
        },
        {
                "main": "Downtown Berkeley",
                "coordinates": {
                    "latitude": 37.8701129022232,
                    "longitude": -122.268159191062
                },
                "address": "2160 Shattuck Ave, Berkeley, CA 94704"
        },
        {
                "main": "Dublin / Plesanton",
                "coordinates": {
                    "latitude": 37.6987293362617,
                    "longitude": -121.890276968479
                },
                "address": "5801 Owens Dr, Pleasanton, CA 94588"
        },
        {
                "main": "El Cerrito del Norte",
                "coordinates": {
                    "latitude": 37.9256996,
                    "longitude": -122.3175364
                },
                "address": "6400 Cutting Blvd, El Cerrito, CA 94530"
        },
        {
                "main": "El Cerrito Plaza",
                "coordinates": {
                    "latitude": 37.9017615,
                    "longitude": -122.2993599
                },
                "address": "6699 Fairmount Dr, El Cerrito, CA 94530"
        },
        {
                "main": "Embarcadero",
                "coordinates": {
                    "latitude": 37.7926976,
                    "longitude": -122.3972938
                },
                "address": "298 Market St, San Francisco, CA 94111"
        },
        {
                "main": "Fremont",
                "coordinates": {
                    "latitude": 37.556282,
                    "longitude": -121.977482
                },
                "address": "2000 Bart Way, Fremont, CA 94538"
        },
        {
                "main": "Fruitvale",
                "coordinates": {
                    "latitude": 37.7753829956055,
                    "longitude": -122.223937988281
                },
                "address": "3401 East 12th St, Oakland, CA 94601"
        },
        {
                "main": "Glen Park",
                "coordinates": {
                    "latitude": 37.7331277731504,
                    "longitude": -122.43384172287
                },
                "address": "2901 Diamond St, San Francisco, CA 94131"
        },
        {
                "main": "Hayward",
                "coordinates": {
                    "latitude": 37.67011,
                    "longitude": -122.08827
                },
                "address": "699 B St, Hayward, CA 94541"
        },
        {
                "main": "Lafayette",
                "coordinates": {
                    "latitude": 37.8940058,
                    "longitude": -122.1260732
                },
                "address": "3601 Deer Hill Rd, Lafayette, CA 94549"
        },
        {
                "main": "Lake Merritt",
                "coordinates": {
                    "latitude": 37.79751,
                    "longitude": -122.26582
                },
                "address": "800 Madison St, Oakland, CA 94607"
        },
        {
                "main": "MacArthur",
                "coordinates": {
                    "latitude": 37.8293455392122,
                    "longitude": -122.265955209732
                },
                "address": "555 40th St, Oakland, CA 94609"
        },
        {
                "main": "Millbrae",
                "coordinates": {
                    "latitude": 37.6001340240088,
                    "longitude": -122.386935298894
                },
                "address": "200 N Rollins Rd, Millbrae, CA 94030"
        },
        {
                "main": "Montgomery St.",
                "coordinates": {
                    "latitude": 37.789201,
                    "longitude": -122.40141
                },
                "address": "598 Market St, San Francisco, CA 94104"
        },
        {
                "main": "North Berkeley",
                "coordinates": {
                    "latitude": 37.8737688,
                    "longitude": -122.2825872
                },
                "address": "1750 Sacramento St, Berkeley, CA 94702"
        },
        {
                "main": "North Concord / Martinez",
                "coordinates": {
                    "latitude": 38.0044173441388,
                    "longitude": -122.023715360278
                },
                    "address": "3700 Port Chicago Hwy, Concord, CA 94520"
        },
        {
                "main": "Oakland International Airport",
                "coordinates": {
                    "latitude": 37.711615,
                    "longitude": -122.212136
                },
                "address": "4 Airport Dr, Terminal 1, Oakland, CA 94621"
        },
        {
                "main": "Orinda",
                "coordinates": {
                    "latitude": 37.878436180046,
                    "longitude": -122.1840920631
                },
                    "address": "11 Camino Pablo, Orinda, CA 94563"
        },
        {
                "main": "Pittsburg / Bay Point",
                "coordinates": {
                    "latitude": 38.015465,
                    "longitude": -121.9453528
                },
                "address": "1700 W Leland Ave, Pittsburg, CA 94565"
        },
        {
                "main": "Pleasant Hill / Contra Costa Centre",
                "coordinates": {
                    "latitude": 37.92766,
                    "longitude": -122.05595
                },
                "address": "1365 Treat Blvd, Walnut Creek, CA 94597"
        },
        {
                "main": "Powell St.",
                "coordinates": {
                    "latitude": 37.7842658205375,
                    "longitude": -122.407779693604
                },
                    "address": "899 Market St, San Francisco, CA 94102"
        },
        {
                "main": "Richmond",
                "coordinates": {
                    "latitude": 37.9367948323488,
                    "longitude": -122.352556362748
                },
                    "address": "1700 Nevin Ave, Richmond, CA 94801"
        },
        {
                "main": "Rockridge",
                "coordinates": {
                    "latitude": 37.84397,
                    "longitude": -122.25153
                },
                    "address": "5660 College Ave, Oakland, CA 94618"
        },
        {
                "main": "San Bruno",
                "coordinates": {
                    "latitude": 37.6375373315442,
                    "longitude": -122.41592061233
                },
                    "address": "1151 Huntington Ave, San Bruno, CA 94066"

        },
        {
                "main": "San Francisco International Airport",
                "coordinates": {
                    "latitude": 37.6158376560539,
                    "longitude": -122.392523288727
                },
                    "address": "780 S Airport Blvd, International Terminal, Level 3, San Francisco, CA 94128"
        },
        {
                "main": "San Leandro",
                "coordinates": {
                    "latitude": 37.7221049011706,
                    "longitude": -122.160264201315
                },
                    "address": "1401 San Leandro, San Leandro, CA 94577"
        },
        {
                "main": "South Hayward",
                "coordinates": {
                    "latitude": 37.6355242,
                    "longitude": -122.0563101
                },
                    "address": "28601 Dixon St, Hayward, CA 94544"
        },
        {
                "main": "South San Francisco",
                "coordinates": {
                    "latitude": 37.6641996752711,
                    "longitude": -122.443930173857
                },
                    "address": "1333 Mission Rd, South San Francisco, CA 94080"
        },
        {
                "main": "Union City",
                "coordinates": {
                    "latitude": 37.59014,
                    "longitude": -122.01898
                },
                    "address": "10 Union Sq, Union City, CA 94587"
        },
        {
                "main": "Walnut Creek",
                "coordinates": {
                    "latitude": 37.905429538691,
                    "longitude": -122.067574328836
                },
                    "address": "200 Ygnacio Valley Blvd, Walnut Creek, CA 94596"
        },
        {
                "main": "Warm Springs / South Fremont",
                "coordinates": {
                    "latitude": 37.5018884534774,
                    "longitude": -121.937619298697
                },
                    "address": "45193 Warm Springs Blvd, Fremont, CA 94539"
        },
        {
                "main": "West Dublin / Pleasanton",
                "coordinates": {
                    "latitude": 37.70095,
                    "longitude": -121.92711
                },
                    "address": "6501 Golden Gate Dr, Dublin, CA 94568"
        },
        {
                "main": "West Oakland",
                "coordinates": {
                    "latitude": 37.8051769,
                    "longitude": -122.2949178
                },
                "address": "1451 7th St, Oakland, CA 94607"
        }
    ];

    var map = createMap();
    var VM = new ViewModel(map, bartStation);
    ko.applyBindings(VM);

    VM.filterWord.subscribe(function(){
        VM.filterMarkers();
    });

}
