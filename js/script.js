//Model
var sideStatus = true;
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.5665, lng: 126.9780},
        zoom: 7,
    });
}
//Presenter
var viewModel = {
    changeSideStatus: function() {
            if (sideStatus==true) {
                $("aside").css("display", "none");
                $("#map").css("width", "100%");
                $("#map").css("margin-left", "0%");
                google.maps.event.trigger(map, "resize");
                sideStatus = false;
            }
            else {
                $("aside").css("display", "block");
                $("#map").css("width", "80%");
                $("#map").css("margin-left", "20%");
                google.maps.event.trigger(map, "resize");
                sideStatus = true;
            }
        }
    };
ko.applyBindings(viewModel);