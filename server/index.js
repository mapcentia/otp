/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2022 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

const express = require('express');
const router = express.Router();
const configUrl = require('../../../config/config.js').configUrl;
const request = require('request');

router.get('/api/otp/', function (req, response) {
    const data = JSON.parse(req.query.custom_data);
    console.log(data)
    const cutOffSec = data.intervals.join('&cutoffSec=')
    const route = data.route !== null ? data.route : "default";
    let urlParameters = "&";
    for (const [key, value] of Object.entries(data.parameters)) {
        urlParameters += `${key}=${value}&`
    }
    let mode;
    switch (data.mode) {
        case "transport-type-transit":
            mode = "TRANSIT,WALK";
            break;
        case "transport-type-bicycle":
            mode = "BICYCLE";
            break;
        case "transport-type-car":
            mode = "CAR";
            break;
    }
    let url = `https://otp.vidi.gc2.io/otp/routers/${route}/isochrone?arriveBy=${data.arriveBy ? "True" : "False"}&fromPlace=${data.y},${data.x}&mode=${mode}&date=${data.date}&time=${data.time}&maxWalkDistance=${data.maxWalkDistance}&cutoffSec=${cutOffSec}${urlParameters}`;
    if (data.arriveBy === true) url += `&toPlace=${data.y},${data.x}`;
    console.log(url)
    request.get(url, function (err, res, body) {
        let json;
        try {
            json = JSON.parse(body);
        } catch (e) {
            response.status(400).send({
                success: false,
                message: body
            });
            return;
        }
        if (err || res.statusCode !== 200) {
            response.header('content-type', 'application/json');
            response.status(400).send({
                success: false,
                message: json
            });
            return;
        }
        json.success = true
        response.send(json);
    })
});

module.exports = router;
