// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var csv  = require("csvtojson");

global.events_json = {};

csv().fromFile('./events.csv').then(function(jsonArrayObj){
    global.events_json = jsonArrayObj;
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

function getValue(lat, lng, name) {
    let nearest_impression_id = null;
    let nearest_impression_dist = null;
    let nearest_click_id = null;
    let nearest_click_dist = null;

    events_json.forEach((elem, idx) => {
        dist = Math.pow(lat - elem['lat'], 2) + Math.pow(lng - elem['lon'], 2);
        
        if (elem['event_type'] == 'imp') {
            if (nearest_impression_id == null) {
                nearest_impression_dist = dist;
                nearest_impression_id = idx;
            } else if (dist < nearest_impression_dist) {
                nearest_impression_dist = dist;
                nearest_impression_id = idx;
            }
        }
        if (elem['event_type'] == 'click') {
            if (nearest_click_id == null) {
                nearest_click_dist = dist;
                nearest_click_id = idx;
            } else if (dist < nearest_click_dist) {
                nearest_click_dist = dist;
                nearest_click_id = idx;
            }
        }
    })
    return {
        'lat': lat,
        'lon': lng,
        'name': name,
        'impressions': nearest_impression_id,
        'clicks': nearest_click_id
    }
}

router.put('/', function(req, res) {
    response = {}
    req.body.forEach((elem) => {
        response[elem.name] = getValue(elem.lat, elem.lon, elem.name);
    })
    res.json(response);
});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);