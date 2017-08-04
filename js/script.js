//Model
//Global variables needed to make the app work
let i;
let j;
let map;
let marker;
let iSquare;
let infoWindow;
let populateInfo;
let resetFilter;
//This was made as if the server this application ran on served
//a JSON file (/js/json/locations.json) after I called a $.getJSON request...
let tmpLocations = {
    "locations": [
        { "address": "51 Belmont St, Boston, MA 02129"},
        { "address": "21 Tremont St UNIT B, Boston, MA 02129"},
        { "address": "42 8th St, Boston, MA 02129"},
        { "address": "10 Lexington Ave, Boston, MA 02129"},
        { "address": "47 Harvard St APT B101, Boston, MA 02129"}
    ]
};
//A certain function to stop animations used in both google and KO
//viewmodels
function stopAnimation(j) {
    marker[j].setAnimation(null);
}
//Presenter
    //Knockout Presenter initializer
function ViewModel() {
    var self = this;
    self.locations = ko.observable(tmpLocations.locations);
    self.example = ko.observable("will this work?");
    self.showAside = ko.observable(true);
    self.filterInput = ko.observable("");
    //Parses location data to allow classes and coordinates for the entries
    //Also appends FourSquare data for more information about the place
    function setCoord(i) {
        $.ajax({
            url: "https://maps.googleapis.com/maps/api/geocode/json"+
            "?address="+
                self.locations()[i].address.replace(/\s/g, "+")+
                "&key=AIzaSyBqWKH8t9zkyH1hwW69exWJ_jnLUqtq7Yg",
            success: function(data){
                self.locations()[i].lat =
                    data.results[0].geometry.location.lat;
                self.locations()[i].lng =
                    data.results[0].geometry.location.lng;
            },
            error: function() {
                console.log('Could not get coordinates');
            }
        });
    }
    function setFInfo(i) {
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore?near='+
                self.locations()[i].address.replace(/\s/g, "+")+
                '&v=20170101'+
                '&client_id=KW3OM1IGPJMQHKY4UDEK2N54F1EGYABQR1A2CO0KKSDRWGTT'+
                '&client_secret=FRKIO5OUJPY3EX4W3Q2SRELXLLK23ZI4QTJZDCPY50VXSC4O',
            success: function(data) {
                self.locations()[i].fSquare = "<h3>Nearby place info " +
                    "made possible by FourSquare</h3>";
                var rSquare = data.response.groups[0].items;
                for(j = 0; j < rSquare.length; j++) {
                    self.locations()[i].fSquare += '<div><h4>' +
                        rSquare[j].venue.name + '</h4>' +
                        rSquare[j].tips[0].text + '<br>' +
                        '</div><br>';
                    if(j>1) {
                        break;
                    }
                }
                self.locations()[i].fSquare=
                    self.locations()[i].fSquare.replace('undefined', '');
            },
            error: function() {
                self.locations()[i].fSquare = 'Could not load ' +
                    'FourSquare data...';
            }
        });
    }
    for (let i = 0; i < self.locations().length; i++) {
        self.locations()[i].classID =
            self.locations()[i].address.replace(/\s|,/g, "");
        setCoord(i);
        setFInfo(i);
    }
    //Function to change the visibility of the sidebar
    self.changeSideStatus = function() {
        if (self.showAside()===true) {
            self.showAside(false);
            $("#map").css("width", "100%");
            $("#map").css("margin-left", "0%");
            google.maps.event.trigger(map, "resize");
        }
        else {
            self.showAside(true);
            $("#map").css("width", "80%");
            $("#map").css("margin-left", "20%");
            google.maps.event.trigger(map, "resize");
        }
    };
    //Function to highlight the clicked address
    self.highlight = function(data) {
        $("."+data.classID).css("background-color", "grey");
        for (let i = 0;  i < self.locations().length; i++) {
            if (self.locations()[i].classID==data.classID) {
                for (let j = 0; j < marker.length; j++) {
                    if (self.locations()[i].address==marker[j].title) {
                        populateInfo(marker[j], infoWindow);
                        marker[j].setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(stopAnimation, 700, j);
                        break;
                    }
                }
                continue;
            }
            $("."+self.locations()[i].classID).css("background-color", "black");
        }
    };
    //Function to filter out visible addresses
    self.filterAddresses = function() {
        for (i in self.locations()) {
            if (self.locations()[i].address.search(self.filterInput())==-1) {
                $("."+self.locations()[i].classID).css("display", "none");
            }
            else {
                $("."+self.locations()[i].classID).css("display", "block");
            }
        }
        for (i in marker) {
            if (marker[i].title.search(self.filterInput())==-1) {
                marker[i].setMap(null);
            }
            else {
                marker[i].setMap(map);
            }
        }
    };
    resetFilter = function() {
        for (i = 0; i < self.locations().length; i++) {
            $("."+self.locations()[i].classID).css("display", "block");
            $("."+self.locations()[i].classID).css("background-color", "black");
        }
        for (i = 0; i < marker.length; i++) {
            marker[i].setMap(map);
            marker[i].setAnimation(null);
        }
        infoWindow.close();
        map.setCenter({lat: 42.3782, lng: -71.0602});
        self.filterInput("");
    };
}
var myViewModel = new ViewModel();
ko.applyBindings(myViewModel);
//Initialize the map
function InitMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 42.3782, lng: -71.0602},
        zoom: 15,
    });
    //Creates markers for each entry within the database
    marker = [];
    infoWindow = new google.maps.InfoWindow();
    for (let i = 0; i < tmpLocations.locations.length; i++) {
        marker[i] = new google.maps.Marker({
            position: {lat: tmpLocations.locations[i].lat,
                lng: tmpLocations.locations[i].lng},
            map: map,
            title: tmpLocations.locations[i].address,
            animation: google.maps.Animation.DROP,
        });
        setMarkerListener(i);
    }
    function setMarkerListener(i) {
        marker[i].addListener('click', function() {
            resetFilter();
            populateInfo(this, infoWindow);
            marker[i].setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(stopAnimation, 700, i);
        });
    }
    //Renders an infowindow on the selected address or marker
    populateInfo = function (marker, infowindow) {
        if (infowindow.marker != marker) {
            for(i in myViewModel.locations()) {
                if(myViewModel.locations()[i].address==marker.title) {
                    iSquare = myViewModel.locations()[i].fSquare;
                    if (iSquare===undefined) {
                        iSquare = "<br>Please wait a moment and try again";
                    }
                }
            }
            infowindow.setContent('<div><h2>' + marker.title + '</h2></div>'+
                                  '<div>' + iSquare +
                                  '</div>');
            infowindow.open(map, marker);
            map.setCenter(marker.getPosition());
        }
    };
}