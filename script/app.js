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
            url: requestURL
        })
        .done(function(data) {
            // If data successfully received, the restuarant info will be added to
            // the infowindow content.
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

        }).fail(function(xhr, status, error) {
            // If the data request to zomato fails
            alert("Failed to fetch Zomato Data");
        });
        infowindow.open(map,marker);
    }

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
                marker.googleMarker.setVisible(false);

                if (marker.main.toLowerCase().indexOf(search) >= 0) {
                    self.visibleMarkers.push(marker);
                }
            });

            self.visibleMarkers().forEach(function(marker) {
                marker.googleMarker.setVisible(true);
                marker.googleMarker.setAnimation(google.maps.Animation.DROP);
            });
        };
    };

    var map = createMap();
    var VM = new ViewModel(map, bartStation);
    ko.applyBindings(VM);

    VM.filterWord.subscribe(function(){
        VM.filterMarkers();
    });

}

function mapsErrorHandling(){
    alert("Failed to get maps data from Google");
}
