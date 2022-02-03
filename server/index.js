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
    let data = JSON.parse(req.query.custom_data);
    console.log(data)
    let cutOffSec = data.intervals.join('&cutoffSec=')
    console.log(cutOffSec);
    let url = `http://otp.vidi.gc2.io/otp/routers/default/isochrone?fromPlace=${data.y},${data.x}&mode=BUS,WALK&date=${data.date}&time=${data.time}&maxWalkDistance=500&cutoffSec=${cutOffSec}`;
    console.log(url)
    request.get(url, function (err, res, body) {
        let json;
        try {
            json = JSON.parse(body);
        } catch (e) {
            response.status(400).send({
                success: false,
                message: e.message
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
