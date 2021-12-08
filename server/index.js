/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2021 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

const express = require('express');
const router = express.Router();
const configUrl = require('../../../config/config.js').configUrl;
const host = require('../../../config/config.js').gc2.host;
const shared = require('../../../controllers/gc2/shared');
const request = require('request');

router.get('/api/otp/', function (req, response) {
    let url = 'http://localhost:8801/otp/routers/default/isochrone?fromPlace=57.043034621624,9.917040896417&mode=BUS,WALK&date=09-20-2021&time=8:00am&maxWalkDistance=500&cutoffSec=1800&cutoffSec=3600';
    request.get(url, function (err, res, body) {
        let json;
        if (err || res.statusCode !== 200) {
            response.header('content-type', 'application/json');
            response.status(400).send({
                success: false,
                message: "Could not get the requested config JSON file."
            });
            return;
        }
        try {
            json = JSON.parse(body);
        } catch (e) {
            response.status(400).send({
                success: false,
                message: e.message
            });
            return;
        }
        json.success = true
        response.send(json);
    })
});

module.exports = router;
