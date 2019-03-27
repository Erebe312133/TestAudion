// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var csv  = require("csvtojson");

global.events_json = {};

csv().fromFile('./events.csv').then(function(jsonArrayObj){
    global.events_json = jsonArrayObj;
    global.events_json.forEach(event => {
        event.sin_lat = Math.sin(event.lat);
        event.cos_lat = Math.cos(event.lat);
    })
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

function getValue(places) {
    sin_lat_places = [];
    cos_lat_places = [];
    places.forEach(elem => {
        elem.impressions = 0;
        elem.clicks = 0;
        sin_lat_places.push(Math.sin(elem.lat));
        cos_lat_places.push(Math.cos(elem.lat));
    });
    events_json.forEach(event => {
        let nearest_dist = 0;
        let nearest_place = null;
        places.forEach((place, idx) => {
            let dist = 6173 * Math.acos(sin_lat_places[idx] * event.sin_lat + cos_lat_places[idx] * event.cos_lat * Math.cos(place.lon - event.lon));
            if (nearest_place == null || dist < nearest_dist ) {
                nearest_dist = dist;
                nearest_place = place;
            }
        })
        if (event.event_type == 'imp')
            nearest_place.impressions += 1;
        else if (event.event_type == 'click')
            nearest_place.clicks += 1;
    })
    return (places);
}

router.put('/', function(req, res) {
    response = {}
    getValue(req.body).forEach((elem) => {
        response[elem.name] = elem;
    })
    res.json(response);
});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);