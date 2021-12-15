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
    let data = JSON.parse(req.query.custom_data);
    console.log(data)
    let url = `http://localhost:8801/otp/routers/default/isochrone?fromPlace=${data.y},${data.x}&mode=BUS,WALK&date=${data.date}&time=${data.time}&maxWalkDistance=500&cutoffSec=900&cutoffSec=1800&cutoffSec=3600`;
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
