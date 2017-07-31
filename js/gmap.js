var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.5665, lng: 126.9780},
        zoom: 7,
    });
}