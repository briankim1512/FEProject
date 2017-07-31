//Model
var map;
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
    //Parses location data to allow classes for the entries
for (i in tmpLocations["locations"]) {
    tmpLocations["locations"][i]["classID"]=
        tmpLocations["locations"][i]["address"].replace(/\s|,/g, "");
}
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
                continue;
            }
            $("."+self.locations[i]["classID"]).css("background-color", "black");
        }
    };
}
ko.applyBindings(new ViewModel);
    //Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 32.783, lng: -79.94},
        zoom: 15,
    });
}