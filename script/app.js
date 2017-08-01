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
                                // '<div class="iw-subTitle">Yelp data:</div>' +
                                '<p>' + data.location.display_address + '<br>' +
                                'Rating : ' + data.rating + ' / 5.0<br>'+
                                data.review_count + ' Total Reviews</p>' +
                                '<div class="iw-subTitle">Nearby Restaurants</div>';

    //Pulling up date from zomato API
    var requestURL = "https://developers.zomato.com/api/v2.1/search?count=3&lat=" +
        data.coordinates.latitude + "&lon=" + data.coordinates.longitude +
        "&radius=1000&sort=real_distance&order=asc";

    var zomatoData;

    $.ajax({
        beforeSend: function(request) {
            request.setRequestHeader("user-key", '2ff3ad85baed2cae9efec2b43afe84ca');
        },
        dataType: "json",
        url: requestURL,
        success: function(data) {
            console.log(data);
            zomatoData = data.restaurants;
            console.log(zomatoData);
            for (let i = 0; i < 3; i++) {
                contentString += '<h3>' + zomatoData[i].restaurant.name + '</h3>';
            }
            contentString += '</div>' +
                            '<div class="iw-bottom-gradient"></div>' +
                            '</div>';
                            infowindow.setContent(contentString);
        }
    });




    // for (let i = 0; i < 3; i++) {
    //     contentString +=
    // }

    infowindow.open(map,marker);


}
var infowindow = new google.maps.InfoWindow({
    maxWidth: 350
});


var ViewModel = function(map, bartStation) {
    var self = this;

    self.map = map;

    function point(data) {
        this.main = data.main;
        this.image = data.image_url;
        this.review_count = data.review_count;
        this.rating = data.rating;
        this.coordinates = {lat:data.coordinates.latitude, lng:data.coordinates.longitude};
        this.address = data.location.display_address;
        this.googleMarker = new google.maps.Marker({
            map: map,
            position: this.coordinates,
            title: this.main,
            animation: google.maps.Animation.DROP
        });

        var contentString = '<h2>' + this.main + '</h2>';
        // console.log(contentString);
            // '<img src='this.image'/>';


        // var infowindow = new google.maps.InfoWindow({
        //     content: contentString,
        // });

        infowindow.marker = this.googleMarker;

        this.listInfoWindow = function(){
            populateInfoWindow(this.googleMarker, infowindow, data);
        };

        this.googleMarker.addListener('click', function() {
            populateInfoWindow(this, infowindow, data)
        });

        self.map.addListener('click', function(){
            infowindow.setContent(null);
            infowindow.close();
        })





        // google.maps.event.addListener(googleMarker, 'click', function() {
        //     infowindow.open(map, googleMarker)
        // });
    }

    self.bartList = [];

    bartStation.forEach(function(bart) {
        self.bartList.push(new point(bart));
    });

    self.visibleMarkers = ko.observableArray();

    self.bartList.forEach(function(bart) {
        self.visibleMarkers.push(bart);
    });

    self.filterWord = ko.observable('');

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

    // self.immediateFilter = ko.computed(function(){
    //     if (self.filterWord()) {
    //         self.filterMarkers();
    //     }
    // }, this);

}



google.maps.event.addDomListener(window, 'load', function() {
    // Bart Station data, pulled up from yelp API (v3 fusion api)
    var bartStation = [
        {
            "main": "12th St. Oakland City Center",
            "id": "12th-street-bart-station-oakland",
            "name": "12th Street BART Station",
            "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/Ui2du9p36CNStGgSxWG6rw/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/12th-street-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
            "review_count": 52,
            "categories": [
                {
                    "alias": "publictransport",
                    "title": "Public Transportation"
                }
            ],
            "rating": 3,
            "coordinates": {
                "latitude": 37.8033590838803,
                "longitude": -122.271844493925
            },
            "transactions": [],
            "location": {
                "address1": "1245 Broadway",
                "address2": null,
                "address3": "",
                "city": "Oakland",
                "zip_code": "94602",
                "country": "US",
                "state": "CA",
                "display_address": [
                    "1245 Broadway",
                    "Oakland, CA 94602"
                ]
            },
            "phone": "",
            "display_phone": "",
            "distance": 2725.942095774
        },
        {
                "main": "16th St. Mission",
                "id": "bart-16th-st-mission-san-francisco",
                "name": "BART - 16th St. Mission",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/d7kc_DpUpzUKdVD7FzQDUQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/bart-16th-st-mission-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 141,
                "categories": [
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 2,
                "coordinates": {
                    "latitude": 37.7647836375499,
                    "longitude": -122.41996559838
                },
                "transactions": [],
                "location": {
                    "address1": "2000 Mission St",
                    "address2": "",
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94103",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "2000 Mission St",
                        "San Francisco, CA 94103"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 16273.00717202
        },
        {
                    "main": "19th St. Oakland",
                    "id": "19th-street-bart-station-oakland",
                    "name": "19th Street BART Station",
                    "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/GEoEeP5gh1Sv2U4omwqMGA/o.jpg",
                    "is_closed": false,
                    "url": "https://www.yelp.com/biz/19th-street-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                    "review_count": 51,
                    "categories": [
                        {
                            "alias": "publictransport",
                            "title": "Public Transportation"
                        }
                    ],
                    "rating": 3,
                    "coordinates": {
                        "latitude": 37.80782,
                        "longitude": -122.26852
                    },
                    "transactions": [],
                    "location": {
                        "address1": "1900 Broadway",
                        "address2": null,
                        "address3": "",
                        "city": "Oakland",
                        "zip_code": "94612",
                        "country": "US",
                        "state": "CA",
                        "display_address": [
                            "1900 Broadway",
                            "Oakland, CA 94612"
                        ]
                    },
                    "phone": "",
                    "display_phone": "",
                    "distance": 2548.1649042679996
        },
        {
                "main": "24th St. Mission",
                "id": "bart-24th-st-mission-station-san-francisco",
                "name": "BART -  24th St Mission Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/67Qn3K_6QvwVWoBTYpIJcQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/bart-24th-st-mission-station-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 61,
                "categories": [
                    {
                        "alias": "metrostations",
                        "title": "Metro Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.75199,
                    "longitude": -122.41871
                },
                "transactions": [],
                "location": {
                    "address1": "2800 Mission St",
                    "address2": null,
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94110",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "2800 Mission St",
                        "San Francisco, CA 94110"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 1846.245952446
        },
        {
                "main": "Ashby",
                "id": "ashby-bart-station-berkeley",
                "name": "Ashby BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/LACTp1sDaTK9H5JgV0fTSw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/ashby-bart-station-berkeley?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 55,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 2.5,
                "coordinates": {
                    "latitude": 37.8530469427056,
                    "longitude": -122.270012486509
                },
                "transactions": [],
                "location": {
                    "address1": "3100 Adeline St",
                    "address2": null,
                    "address3": "",
                    "city": "Berkeley",
                    "zip_code": "94701",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "3100 Adeline St",
                        "Berkeley, CA 94701"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 6271.108740639999
        },
        {
                "main": "Balboa Park",
                "id": "bart-balboa-park-san-francisco",
                "name": "BART - Balboa Park",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/sveT0ODVGJb_r68XhW3hSg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/bart-balboa-park-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 60,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.7212438,
                    "longitude": -122.4475465
                },
                "transactions": [],
                "location": {
                    "address1": "401 Geneva Ave",
                    "address2": "",
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94112",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "401 Geneva Ave",
                        "San Francisco, CA 94112"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 20239.18375918
        },
        {
                "main": "Bay Fair",
                "id": "bay-fair-bart-station-san-leandro",
                "name": "Bay Fair BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/t8eMLt42IXPAS6gxx4POSA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/bay-fair-bart-station-san-leandro?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 99,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 2.5,
                "coordinates": {
                    "latitude": 37.69779,
                    "longitude": -122.12965
                },
                "transactions": [],
                "location": {
                    "address1": "15242 Hesperian Blvd",
                    "address2": "",
                    "address3": "",
                    "city": "San Leandro",
                    "zip_code": "94578",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "15242 Hesperian Blvd",
                        "San Leandro, CA 94578"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 15370.505393419999
        },
        {
                "main": "Castro Valley",
                "id": "castro-valley-bart-station-castro-valley",
                "name": "Castro Valley BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/PXiGPGvvrtn9rjx5h27Iaw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/castro-valley-bart-station-castro-valley?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 38,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 4,
                "coordinates": {
                    "latitude": 37.6914831345115,
                    "longitude": -122.075961408445
                },
                "transactions": [],
                "location": {
                    "address1": "3301 Norbridge Dr",
                    "address2": "",
                    "address3": "",
                    "city": "Castro Valley",
                    "zip_code": "94546",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "3301 Norbridge Dr",
                        "Castro Valley, CA 94546"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 18970.4493048
        },
        {
            "main": "Civic Center",
                "id": "muni-bart-station-civic-center-san-francisco",
                "name": "MUNI / BART Station - Civic Center",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/wDjAX3YHsJdKcpgiHPx8_w/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/muni-bart-station-civic-center-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 176,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 2.5,
                "coordinates": {
                    "latitude": 37.7795077488,
                    "longitude": -122.413753979
                },
                "transactions": [],
                "location": {
                    "address1": "1150 Market St",
                    "address2": "",
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94110",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1150 Market St",
                        "San Francisco, CA 94110"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 15399.52340296
        },
        {
                "main": "Coliseum",
                "id": "coliseum-bart-station-oakland",
                "name": "Coliseum BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/wRF6GyDbYZnQiCgg6twDBQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/coliseum-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 128,
                "categories": [
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.7523959,
                    "longitude": -122.1983131
                },
                "transactions": [],
                "location": {
                    "address1": "700 73rd Ave",
                    "address2": "",
                    "address3": "",
                    "city": "Oakland",
                    "zip_code": "94621",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "700 73rd Ave",
                        "Oakland, CA 94621"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 6621.996359520001
        },
        {
                "main": "Colma",
                "id": "colma-bart-station-colma",
                "name": "Colma BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/UMZ0r-LSEzSC9Fe9EFZSAA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/colma-bart-station-colma?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 25,
                "categories": [
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.6840581,
                    "longitude": -122.4622823
                },
                "transactions": [],
                "location": {
                    "address1": "365 D St",
                    "address2": "",
                    "address3": "",
                    "city": "Colma",
                    "zip_code": "94014",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "365 D St",
                        "Colma, CA 94014"
                    ]
                },
                "phone": "+15104647134",
                "display_phone": "(510) 464-7134",
                "distance": 23727.043576919998
        },
        {
                "main": "Concord",
                "id": "concord-bart-station-concord",
                "name": "Concord BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/6xy3iCqof3FEacY4nxUR6Q/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/concord-bart-station-concord?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 67,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.9743690490723,
                    "longitude": -122.028503417969
                },
                "transactions": [],
                "location": {
                    "address1": "1451 Oakland Ave",
                    "address2": "",
                    "address3": "",
                    "city": "Concord",
                    "zip_code": "94520",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1451 Oakland Ave",
                        "Concord, CA 94520"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 26763.88425032
        },
        {
                "main": "Daly City",
                "id": "bart-daly-city-daly-city",
                "name": "BART - Daly City",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/uT26Z74A_bv7o86hW11W8Q/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/bart-daly-city-daly-city?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 123,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.7063347689904,
                    "longitude": -122.468803487069
                },
                "transactions": [],
                "location": {
                    "address1": "500 John Daly Blvd",
                    "address2": "",
                    "address3": "",
                    "city": "Daly City",
                    "zip_code": "94014",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "500 John Daly Blvd",
                        "Daly City, CA 94014"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 22675.75670598
        },
        {
                "main": "Downtown Berkeley",
                "id": "downtown-berkeley-bart-station-berkeley",
                "name": "Downtown Berkeley BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/EBv7W3Wt_sllVqRTIWiOyw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/downtown-berkeley-bart-station-berkeley?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 82,
                "categories": [
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.8701129022232,
                    "longitude": -122.268159191062
                },
                "transactions": [],
                "location": {
                    "address1": "2160 Shattuck Ave",
                    "address2": "",
                    "address3": "",
                    "city": "Berkeley",
                    "zip_code": "94704",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "2160 Shattuck Ave",
                        "Berkeley, CA 94704"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 7989.275530119999
        },
        {
                "main": "Dublin / Plesanton",
                "id": "dublin-pleasanton-bart-station-pleasanton",
                "name": "Dublin/Pleasanton BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/JU3BKPz5mS7wxoY48wTchA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/dublin-pleasanton-bart-station-pleasanton?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 86,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.6987293362617,
                    "longitude": -121.890276968479
                },
                "transactions": [],
                "location": {
                    "address1": "5801 Owens Dr",
                    "address2": "",
                    "address3": "",
                    "city": "Pleasanton",
                    "zip_code": "94588",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "5801 Owens Dr",
                        "Pleasanton, CA 94588"
                    ]
                },
                "phone": "+15104412278",
                "display_phone": "(510) 441-2278",
                "distance": 32257.6672869
        },
        {
                "main": "El Cerrito del Norte",
                "id": "el-cerrito-del-norte-bart-station-el-cerrito",
                "name": "El Cerrito Del Norte BART Station",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/I7k3t4FF27Qlu9DJvQTrvQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/el-cerrito-del-norte-bart-station-el-cerrito?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 51,
                "categories": [
                    {
                        "alias": "metrostations",
                        "title": "Metro Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.9256996,
                    "longitude": -122.3175364
                },
                "transactions": [],
                "location": {
                    "address1": "6400 Cutting Blvd",
                    "address2": "",
                    "address3": "",
                    "city": "El Cerrito",
                    "zip_code": "94530",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "6400 Cutting Blvd",
                        "El Cerrito, CA 94530"
                    ]
                },
                "phone": "+15102362278",
                "display_phone": "(510) 236-2278",
                "distance": 15278.85026174
        },
        {
                "main": "El Cerrito Plaza",
                "id": "el-cerrito-plaza-bart-station-el-cerrito",
                "name": "El Cerrito Plaza BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/PsiU0n4ST75rv08GFI3ZFQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/el-cerrito-plaza-bart-station-el-cerrito?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 41,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.9017615,
                    "longitude": -122.2993599
                },
                "transactions": [],
                "location": {
                    "address1": "6699 Fairmount Dr",
                    "address2": "",
                    "address3": "",
                    "city": "El Cerrito",
                    "zip_code": "94530",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "6699 Fairmount Dr",
                        "El Cerrito, CA 94530"
                    ]
                },
                "phone": "+15102362278",
                "display_phone": "(510) 236-2278",
                "distance": 12338.35594612
        },
        {
                "main": "Embarcadero",
                "id": "muni-bart-station-embarcadero-san-francisco",
                "name": "MUNI / BART Station - Embarcadero",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/VFQYKQudNwWQFG1C41x4XA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/muni-bart-station-embarcadero-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 173,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.7926976,
                    "longitude": -122.3972938
                },
                "transactions": [],
                "location": {
                    "address1": "298 Market St",
                    "address2": "",
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94111",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "298 Market St",
                        "San Francisco, CA 94111"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 13770.36920888
        },
        {
                "main": "Fremont",
                "id": "fremont-bart-station-fremont",
                "name": "Fremont BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/yQHS-FTqjrh8RU6qHDUnNg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/fremont-bart-station-fremont?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 181,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.556282,
                    "longitude": -121.977482
                },
                "transactions": [],
                "location": {
                    "address1": "2000 Bart Way",
                    "address2": null,
                    "address3": "",
                    "city": "Fremont",
                    "zip_code": "94538",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "2000 Bart Way",
                        "Fremont, CA 94538"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 35789.590833840004
        },
        {
                "main": "Fruitvale",
                "id": "fruitvale-bart-station-oakland",
                "name": "Fruitvale BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/askuPDVoIYwVdBlwqrRwgg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/fruitvale-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 73,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 2.5,
                "coordinates": {
                    "latitude": 37.7753829956055,
                    "longitude": -122.223937988281
                },
                "transactions": [],
                "location": {
                    "address1": "3401 East 12th St",
                    "address2": "",
                    "address3": "",
                    "city": "Oakland",
                    "zip_code": "94601",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "3401 East 12th St",
                        "Oakland, CA 94601"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 3285.4661615939995
        },
        {
                "main": "Glen Park",
                "id": "bart-glen-park-station-san-francisco",
                "name": "BART - Glen Park Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/4yLHPGCengzWp2NcxTQQEQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/bart-glen-park-station-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 87,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 4,
                "coordinates": {
                    "latitude": 37.7331277731504,
                    "longitude": -122.43384172287
                },
                "transactions": [],
                "location": {
                    "address1": "2901 Diamond St",
                    "address2": null,
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94131",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "2901 Diamond St",
                        "San Francisco, CA 94131"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 18602.36266934
        },
        {
                "main": "Hayward",
                "id": "hayward-bart-station-hayward",
                "name": "Hayward BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/RYgaPkt-12ksaaOdDk7HiQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/hayward-bart-station-hayward?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 63,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.67011,
                    "longitude": -122.08827
                },
                "transactions": [],
                "location": {
                    "address1": "699 B St",
                    "address2": "",
                    "address3": "",
                    "city": "Hayward",
                    "zip_code": "94541",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "699 B St",
                        "Hayward, CA 94541"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 19931.96477653
        },
        {
                "main": "Lafayette",
                "id": "lafayette-bart-station-lafayette",
                "name": "Lafayette BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/woF2eywcDqdkk9q63D745w/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/lafayette-bart-station-lafayette?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 24,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.8940058,
                    "longitude": -122.1260732
                },
                "transactions": [],
                "location": {
                    "address1": "3601 Deer Hill Rd",
                    "address2": "",
                    "address3": "",
                    "city": "Lafayette",
                    "zip_code": "94549",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "3601 Deer Hill Rd",
                        "Lafayette, CA 94549"
                    ]
                },
                "phone": "+15104652278",
                "display_phone": "(510) 465-2278",
                "distance": 14434.960645939998
        },
        {
                "main": "Lake Merritt",
                "id": "lake-merritt-bart-station-oakland",
                "name": "Lake Merritt BART Station",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/hwwOQESdukZRqqezD1Z9dw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/lake-merritt-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 78,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.79751,
                    "longitude": -122.26582
                },
                "transactions": [],
                "location": {
                    "address1": "800 Madison St",
                    "address2": null,
                    "address3": "",
                    "city": "Oakland",
                    "zip_code": "94607",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "800 Madison St",
                        "Oakland, CA 94607"
                    ]
                },
                "phone": "+15108358600",
                "display_phone": "(510) 835-8600",
                "distance": 2203.586541924
        },
        {
                "main": "MacArthur",
                "id": "macarthur-bart-station-oakland",
                "name": "MacArthur BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/M7Tjm4sPQwkz6RAzoe-MFQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/macarthur-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 105,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.8293455392122,
                    "longitude": -122.265955209732
                },
                "transactions": [],
                "location": {
                    "address1": "555 40th St",
                    "address2": null,
                    "address3": "",
                    "city": "Oakland",
                    "zip_code": "94609",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "555 40th St",
                        "Oakland, CA 94609"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 3752.9202078819994
        },
        {
                "main": "Millbrae",
                "id": "millbrae-bart-station-millbrae",
                "name": "Millbrae BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/KKAcOQ6r5For4_oe3H1Nlg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/millbrae-bart-station-millbrae?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 166,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.6001340240088,
                    "longitude": -122.386935298894
                },
                "transactions": [],
                "location": {
                    "address1": "200 N Rollins Rd",
                    "address2": null,
                    "address3": "",
                    "city": "Millbrae",
                    "zip_code": "94030",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "200 N Rollins Rd",
                        "Millbrae, CA 94030"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 25831.049631399997
        },
        {
                "main": "Montgomery St.",
                "id": "muni-bart-station-montgomery-san-francisco",
                "name": "MUNI / BART Station - Montgomery",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/isLGBGjLNTde2hhiz2ze_A/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/muni-bart-station-montgomery-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 166,
                "categories": [
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.789201,
                    "longitude": -122.40141
                },
                "transactions": [],
                "location": {
                    "address1": "598 Market St",
                    "address2": "",
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94104",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "598 Market St",
                        "San Francisco, CA 94104"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 14183.8215296
        },
        {
                "main": "North Berkeley",
                "id": "north-berkeley-bart-station-berkeley",
                "name": "North Berkeley BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/ZiZPO1vo82OuIlT7F-rkmw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/north-berkeley-bart-station-berkeley?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 41,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.8737688,
                    "longitude": -122.2825872
                },
                "transactions": [],
                "location": {
                    "address1": "1750 Sacramento St",
                    "address2": null,
                    "address3": "",
                    "city": "Berkeley",
                    "zip_code": "94702",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1750 Sacramento St",
                        "Berkeley, CA 94702"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 8875.48435056
        },
        {
                "main": "North Concord / Martinez",
                "id": "north-concord-martinez-station-bart-concord",
                "name": "North Concord/Martinez Station BART",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/yFhk0UpKzRZHOB2y0cF8sA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/north-concord-martinez-station-bart-concord?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 28,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 38.0044173441388,
                    "longitude": -122.023715360278
                },
                "transactions": [],
                "location": {
                    "address1": "3700 Port Chicago Hwy",
                    "address2": "",
                    "address3": "",
                    "city": "Concord",
                    "zip_code": "94520",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "3700 Port Chicago Hwy",
                        "Concord, CA 94520"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 29516.5267451
        },
        {
                "main": "Oakland International Airport",
                "id": "oakland-international-airport-bart-station-oakland",
                "name": "Oakland International Airport BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/28b_Dk8VIqo1rJEY_ZPj-g/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/oakland-international-airport-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 24,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    },
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.711615,
                    "longitude": -122.212136
                },
                "transactions": [],
                "location": {
                    "address1": "4 Airport Dr",
                    "address2": "",
                    "address3": "Terminal 1",
                    "city": "Oakland",
                    "zip_code": "94621",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "4 Airport Dr",
                        "Terminal 1",
                        "Oakland, CA 94621"
                    ]
                },
                "phone": "+15104652278",
                "display_phone": "(510) 465-2278",
                "distance": 10317.301068863999
        },
        {
                "main": "Orinda",
                "id": "orinda-bart-station-orinda",
                "name": "Orinda BART Station",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/8XP2I1Ldowc7mmIZb6xdAw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/orinda-bart-station-orinda?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 26,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.878436180046,
                    "longitude": -122.1840920631
                },
                "transactions": [],
                "location": {
                    "address1": "11 Camino Pablo",
                    "address2": "",
                    "address3": "",
                    "city": "Orinda",
                    "zip_code": "94563",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "11 Camino Pablo",
                        "Orinda, CA 94563"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 9887.06236634
        },
        {
                "main": "Pittsburg / Bay Point",
                "id": "pittsburg-bay-point-bart-station-pittsburg",
                "name": "Pittsburg/Bay Point BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/EuNS-_DKUNMX_BfxuKxOvw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/pittsburg-bay-point-bart-station-pittsburg?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 62,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 2.5,
                "coordinates": {
                    "latitude": 38.015465,
                    "longitude": -121.9453528
                },
                "transactions": [],
                "location": {
                    "address1": "1700 W Leland Ave",
                    "address2": "",
                    "address3": "",
                    "city": "Pittsburg",
                    "zip_code": "94565",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1700 W Leland Ave",
                        "Pittsburg, CA 94565"
                    ]
                },
                "phone": "+19256762278",
                "display_phone": "(925) 676-2278",
                "distance": 35367.66533802
        },
        {
                "main": "Pleasant Hill / Contra Costa Centre",
                "id": "pleasant-hill-contra-costa-centre-station-walnut-creek-2",
                "name": "Pleasant Hill/Contra Costa Centre Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/Sy5UrzjyITlrJI1Ab6KQzQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/pleasant-hill-contra-costa-centre-station-walnut-creek-2?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 71,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.92766,
                    "longitude": -122.05595
                },
                "transactions": [],
                "location": {
                    "address1": "1365 Treat Blvd",
                    "address2": "",
                    "address3": "",
                    "city": "Walnut Creek",
                    "zip_code": "94597",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1365 Treat Blvd",
                        "Walnut Creek, CA 94597"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 21499.105467719997
        },
        {
                "main": "Powell St.",
                "id": "powell-st-station-san-francisco-2",
                "name": "Powell St. Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/IyUlASE1LZt0aDLElBvKPg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/powell-st-station-san-francisco-2?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 251,
                "categories": [
                    {
                        "alias": "metrostations",
                        "title": "Metro Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.7842658205375,
                    "longitude": -122.407779693604
                },
                "transactions": [],
                "location": {
                    "address1": "899 Market St",
                    "address2": "",
                    "address3": "",
                    "city": "San Francisco",
                    "zip_code": "94102",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "899 Market St",
                        "San Francisco, CA 94102"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 14802.89600344
        },
        {
                "main": "Richmond",
                "id": "richmond-bart-station-richmond",
                "name": "Richmond BART Station",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/T8sZjdD_UvppsUJ2yUcjhQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/richmond-bart-station-richmond?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 46,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 2.5,
                "coordinates": {
                    "latitude": 37.9367948323488,
                    "longitude": -122.352556362748
                },
                "transactions": [],
                "location": {
                    "address1": "1700 Nevin Ave",
                    "address2": "",
                    "address3": "",
                    "city": "Richmond",
                    "zip_code": "94801",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1700 Nevin Ave",
                        "Richmond, CA 94801"
                    ]
                },
                "phone": "+15102362278",
                "display_phone": "(510) 236-2278",
                "distance": 18019.28591262
        },
        {
                "main": "Rockridge",
                "id": "rockridge-station-bart-oakland",
                "name": "Rockridge Station BART",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/ioo-2Sza6_2B1M9dt8HwVg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/rockridge-station-bart-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 80,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.84397,
                    "longitude": -122.25153
                },
                "transactions": [],
                "location": {
                    "address1": "5660 College Ave",
                    "address2": "",
                    "address3": "",
                    "city": "Oakland",
                    "zip_code": "94618",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "5660 College Ave",
                        "Oakland, CA 94618"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 4886.96610085
        },
        {
                "main": "San Bruno",
                "id": "san-bruno-bart-station-san-bruno-2",
                "name": "San Bruno BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/cRBeKnWKq3owd_0uGIWrfA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/san-bruno-bart-station-san-bruno-2?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 76,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 4,
                "coordinates": {
                    "latitude": 37.6375373315442,
                    "longitude": -122.41592061233
                },
                "transactions": [],
                "location": {
                    "address1": "1151 Huntington Ave",
                    "address2": null,
                    "address3": "",
                    "city": "San Bruno",
                    "zip_code": "94066",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1151 Huntington Ave",
                        "San Bruno, CA 94066"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 23870.2700089
        },
        {
                "main": "San Francisco International Airport",
                "id": "san-francisco-international-airport-bart-station-san-francisco",
                "name": "San Francisco International Airport BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/WIEHcxXAsgo3_C2876Zq8A/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/san-francisco-international-airport-bart-station-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 209,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    },
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 4,
                "coordinates": {
                    "latitude": 37.6158376560539,
                    "longitude": -122.392523288727
                },
                "transactions": [],
                "location": {
                    "address1": "780 S Airport Blvd",
                    "address2": "International Terminal",
                    "address3": "Level 3",
                    "city": "San Francisco",
                    "zip_code": "94128",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "780 S Airport Blvd",
                        "International Terminal",
                        "Level 3",
                        "San Francisco, CA 94128"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 24595.277678899998
        },
        {
                "main": "San Leandro",
                "id": "san-leandro-bart-station-san-leandro",
                "name": "San Leandro BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/zmWR26QTKKmC3FYB49-ygw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/san-leandro-bart-station-san-leandro?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 50,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.7221049011706,
                    "longitude": -122.160264201315
                },
                "transactions": [],
                "location": {
                    "address1": "1401 San Leandro Blvd",
                    "address2": "",
                    "address3": "",
                    "city": "San Leandro",
                    "zip_code": "94577",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1401 San Leandro Blvd",
                        "San Leandro, CA 94577"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 11287.89225259
        },
        {
                "main": "South Hayward",
                "id": "south-hayward-bart-station-hayward",
                "name": "South Hayward BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/EP-WkFep3k9FzVuOsoFWYw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/south-hayward-bart-station-hayward?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 38,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.6355242,
                    "longitude": -122.0563101
                },
                "transactions": [],
                "location": {
                    "address1": "28601 Dixon St",
                    "address2": "",
                    "address3": "",
                    "city": "Hayward",
                    "zip_code": "94544",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "28601 Dixon St",
                        "Hayward, CA 94544"
                    ]
                },
                "phone": "+15104412278",
                "display_phone": "(510) 441-2278",
                "distance": 24628.41720818
        },
        {
                "main": "South San Francisco",
                "id": "south-san-francisco-bart-station-south-san-francisco",
                "name": "South San Francisco BART Station",
                "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/RkVoRThmYW4SR5uo8v2Bww/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/south-san-francisco-bart-station-south-san-francisco?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 51,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.6641996752711,
                    "longitude": -122.443930173857
                },
                "transactions": [],
                "location": {
                    "address1": "1333 Mission Rd",
                    "address2": "",
                    "address3": "",
                    "city": "South San Francisco",
                    "zip_code": "94080",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1333 Mission Rd",
                        "South San Francisco, CA 94080"
                    ]
                },
                "phone": "+16509922278",
                "display_phone": "(650) 992-2278",
                "distance": 23509.179174419998
        },
        {
                "main": "Union City",
                "id": "union-city-bart-station-union-city-2",
                "name": "Union City BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/RiI_8InVZDt7ORNMURnxKw/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/union-city-bart-station-union-city-2?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 75,
                "categories": [
                    {
                        "alias": "trainstations",
                        "title": "Train Stations"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.59014,
                    "longitude": -122.01898
                },
                "transactions": [],
                "location": {
                    "address1": "10 Union Sq",
                    "address2": "",
                    "address3": "",
                    "city": "Union City",
                    "zip_code": "94587",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "10 Union Sq",
                        "Union City, CA 94587"
                    ]
                },
                "phone": "+15104412278",
                "display_phone": "(510) 441-2278",
                "distance": 30601.35708966
        },
        {
                "main": "Walnut Creek",
                "id": "walnut-creek-bart-station-walnut-creek",
                "name": "Walnut Creek BART Station",
                "image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/y3Bwk5tUMDZFLgVVso9HTQ/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/walnut-creek-bart-station-walnut-creek?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 95,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.905429538691,
                    "longitude": -122.067574328836
                },
                "transactions": [],
                "location": {
                    "address1": "200 Ygnacio Valley Blvd",
                    "address2": "",
                    "address3": "",
                    "city": "Walnut Creek",
                    "zip_code": "94596",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "200 Ygnacio Valley Blvd",
                        "Walnut Creek, CA 94596"
                    ]
                },
                "phone": "+19256762278",
                "display_phone": "(925) 676-2278",
                "distance": 19091.22061576
        },
        {
                "main": "Warm Springs / South Fremont",
                "id": "warm-springs-bart-station-fremont",
                "name": "Warm Springs BART Station",
                "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/ubslRmKEBhzTU5eNRt3cxA/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/warm-springs-bart-station-fremont?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 20,
                "categories": [
                    {
                        "alias": "trains",
                        "title": "Trains"
                    }
                ],
                "rating": 4.5,
                "coordinates": {
                    "latitude": 37.5018884534774,
                    "longitude": -121.937619298697
                },
                "transactions": [],
                "location": {
                    "address1": "45193 Warm Springs Blvd",
                    "address2": "",
                    "address3": null,
                    "city": "Fremont",
                    "zip_code": "94539",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "45193 Warm Springs Blvd",
                        "Fremont, CA 94539"
                    ]
                },
                "phone": "+15104646000",
                "display_phone": "(510) 464-6000",
                "distance": 42694.7199889
        },
        {
                "main": "West Dublin / Pleasanton",
                "id": "west-dublin-pleasanton-bart-station-dublin",
                "name": "West Dublin/Pleasanton BART Station",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/N_oqxcGtuyY-C9qQd_-COg/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/west-dublin-pleasanton-bart-station-dublin?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 54,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3.5,
                "coordinates": {
                    "latitude": 37.70095,
                    "longitude": -121.92711
                },
                "transactions": [],
                "location": {
                    "address1": "6501 Golden Gate Dr",
                    "address2": "",
                    "address3": "",
                    "city": "Dublin",
                    "zip_code": "94568",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "6501 Golden Gate Dr",
                        "Dublin, CA 94568"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 29756.40530946
        },
        {
                "main": "West Oakland",
                "id": "west-oakland-bart-station-oakland",
                "name": "West Oakland BART Station",
                "image_url": "https://s3-media1.fl.yelpcdn.com/bphoto/pFS6n4hz_Zx8khb4sL3o8g/o.jpg",
                "is_closed": false,
                "url": "https://www.yelp.com/biz/west-oakland-bart-station-oakland?adjust_creative=xkex5WiyxDtXcrvACbZsew&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=xkex5WiyxDtXcrvACbZsew",
                "review_count": 103,
                "categories": [
                    {
                        "alias": "publictransport",
                        "title": "Public Transportation"
                    }
                ],
                "rating": 3,
                "coordinates": {
                    "latitude": 37.8051769,
                    "longitude": -122.2949178
                },
                "transactions": [],
                "location": {
                    "address1": "1451 7th St",
                    "address2": null,
                    "address3": "",
                    "city": "Oakland",
                    "zip_code": "94607",
                    "country": "US",
                    "state": "CA",
                    "display_address": [
                        "1451 7th St",
                        "Oakland, CA 94607"
                    ]
                },
                "phone": "",
                "display_phone": "",
                "distance": 4795.927185455999
        }
    ];

    var map = createMap();
    var VM =new ViewModel(map, bartStation)
    ko.applyBindings(VM);

    VM.filterWord.subscribe(function(){
        VM.filterMarkers();
    })
});
