//Model
var map;
var marker;
var infoWindow;
var populateInfo;
var tmpLocations = {
    "locations": [
        { "address": "51 Belmont St, Boston, MA 02129"},
        { "address": "21 Tremont St UNIT B, Boston, MA 02129"},
        { "address": "42 8th St, Boston, MA 02129"},
        { "address": "10 Lexington Ave, Boston, MA 02129"},
        { "address": "47 Harvard St APT B101, Boston, MA 02129"}
    ]
}

//Presenter
    //Parses location data to allow classes and coordinates for the entries
for (i in tmpLocations["locations"]) {
    tmpLocations["locations"][i]["classID"]=
        tmpLocations["locations"][i]["address"].replace(/\s|,/g, "");
    (function(i){
        $.getJSON("https://maps.googleapis.com/maps/api/geocode/json"+
        "?address="+
        tmpLocations["locations"][i]["address"].replace(/\s/g, "+")+
        "&key=AIzaSyBqWKH8t9zkyH1hwW69exWJ_jnLUqtq7Yg", function(data){
            tmpLocations["locations"][i]["lat"]=
                data["results"][0]["geometry"]["location"]["lat"];
            tmpLocations["locations"][i]["lng"]=
                data["results"][0]["geometry"]["location"]["lng"];
        });
    })(i);
}
    //Initialize the map
function InitMap() {
    var self = this;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 42.3782, lng: -71.0602},
        zoom: 15,
    });
    //Creates markers for each entry within the database
    marker = [];
    infoWindow = new google.maps.InfoWindow();
    for (i in tmpLocations["locations"]) {
        marker[i] = new google.maps.Marker({
            position: {lat: tmpLocations["locations"][i]["lat"],
                lng: tmpLocations["locations"][i]["lng"]},
            map: map,
            title: tmpLocations["locations"][i]["address"],
            animation: google.maps.Animation.DROP
        });
        marker[i].addListener('click', function() {
            populateInfo(this, infoWindow);
        });
    }
    populateInfo = function (marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
        }
    }
}
    //Knockout Presenter initializer
function ViewModel() {
    var self = this;
    self.locations = tmpLocations["locations"];
    self.showAside = ko.observable(true);
    self.filterInput = ko.observable("");
    //Function to change the visibility of the sidebar
    self.changeSideStatus = function() {
        if (self.showAside()==true) {
            self.showAside(false)
            $("#map").css("width", "100%");
            $("#map").css("margin-left", "0%");
            google.maps.event.trigger(map, "resize");
        }
        else {
            self.showAside(true)
            $("#map").css("width", "80%");
            $("#map").css("margin-left", "20%");
            google.maps.event.trigger(map, "resize");
        }
    };
    //Function to highlight the clicked address
    self.highlight = function(data) {
        $("."+data["classID"]).css("background-color", "grey");
        for (i in self.locations) {
            if (self.locations[i]["classID"]==data["classID"]) {
                for (j in marker) {
                    console.log(marker[j].title);
                    console.log(self.locations[i]["address"]);
                    if (self.locations[i]["address"]==marker[j].title) {
                        populateInfo(marker[j], infoWindow);
                    }
                }
                continue;
            }
            $("."+self.locations[i]["classID"]).css("background-color", "black");
        }
    };
    //Function to filter out visible addresses
    self.filterAddresses = function() {
        for (i in self.locations) {
            if (self.locations[i]["address"].search(self.filterInput())==-1) {
                $("."+self.locations[i]["classID"]).css("display", "none");
            }
            else {
                $("."+self.locations[i]["classID"]).css("display", "block");
            }
        }
        self.filterInput()
    };
    self.resetFilter = function() {
        for (i in self.locations) {
            $("."+self.locations[i]["classID"]).css("display", "block");
        }
    }
}
ko.applyBindings(new ViewModel);
