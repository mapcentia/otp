const React = require("react");
const search = require("./../../../browser/modules/search/danish");
const dayjs = require("dayjs");
import Gradient from "javascript-color-gradient";

const exId = 'otp';
let cloud;
let utils;
let transformPoint;
let backboneEvents;
let store;
let clicktimer;
const colorGradient = new Gradient();

module.exports = module.exports = {

    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        cloud = o.cloud;
        utils = o.utils;
        transformPoint = o.transformPoint;
        backboneEvents = o.backboneEvents;
        return this;
    },

    /**
     *
     */
    init: function () {

        const mapObj = cloud.get().map;


        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');

        /**
         *
         */
        class Otp extends React.Component {
            constructor(props) {
                super(props);

                this.state = {
                    date: dayjs("2021-09-10").format("YYYY-MM-DD"),
                    time: dayjs().format("HH:mm"),
                    numOfClass: 3,
                    startTime: 10,
                    endTime: 30,
                    intervals: [600, 1200, 1800],
                    startColor: '#ff0000',
                    endColor: '#00ff00',
                    colorGradient: ['#aa5500', '#55aa00', '#00ff00']
                };

                this.load = this.load.bind(this);
                this.handleChange = this.handleChange.bind(this);
            }

            handleChange(event) {
                switch (event.target.id) {
                    case 'otp-time':
                        this.setState({time: event.target.value});
                        break;
                    case 'otp-date':
                        this.setState({date: event.target.value});
                        break;
                    case 'otp-num-of-class':
                        this.setState({numOfClass: parseInt(event.target.value)});
                        break;
                    case 'otp-start-time':
                        this.setState({startTime: parseInt(event.target.value)});
                        break;
                    case 'otp-end-time':
                        this.setState({endTime: parseInt(event.target.value)});
                        break;
                    case 'otp-start-color':
                        this.setState({startColor: event.target.value});
                        break;
                    case 'otp-end-color':
                        this.setState({endColor: event.target.value});
                        break;
                }
                setTimeout(() => {
                    this.createClasses();
                    console.log(this.state);
                }, 100)
            }

            createClasses() {
                let start = this.state.startTime * 60;
                let end = this.state.endTime * 60;
                let num = this.state.numOfClass;
                let startColor = this.state.startColor;
                let endColor = this.state.endColor;

                let arr = [];
                if (num === 1) {
                    arr.push(start);
                    colorGradient.setGradient(startColor, startColor);
                    colorGradient.setMidpoint(1);
                } else {
                    let diff = end - start;
                    let interval = diff / (num - 1);
                    for (let i = 0; i < num; i++) {
                        arr.push(start + (interval * i));
                    }
                    colorGradient.setGradient(startColor, endColor);
                    colorGradient.setMidpoint(num);

                }
                this.setState({intervals: arr})
                this.setState({colorGradient: colorGradient.getArray()})
            }

            componentDidMount() {
                var me = this;
                let uri = '/api/otp';

                // Stop listening to any events, deactivate controls, but
                // keep effects of the module until they are deleted manually or reset:all is emitted
                backboneEvents.get().on("deactivate:all", () => {
                });

                // Activates module
                backboneEvents.get().on(`on:${exId}`, () => {
                    utils.cursorStyle().crosshair();
                });

                // Deactivates module
                backboneEvents.get().on(`off:${exId} off:all reset:all`, () => {
                    utils.cursorStyle().reset();
                });

                store = new geocloud.sqlStore({
                    jsonp: false,
                    method: "GET",
                    host: "",
                    uri: uri,
                    db: "",
                    clickable: true,
                    sql: "sdssd",
                    styleMap: (feature, layer) => {
                        let time = feature.properties.time;
                        let i = this.state.intervals.indexOf(time);
                        let color = this.state.colorGradient[i];
                        return {
                            weight: 1,
                            color: color,
                            dashArray: '',
                            fillOpacity: 1,
                            opacity: 1
                        }
                    },
                    error: function () {
                    },
                    onLoad: function () {
                        // cloud.get().zoomToExtentOfgeoJsonStore(this, 17)
                    }
                });
                cloud.get().addGeoJsonStore(store);

                search.init(function () {
                    me.makeSearch(this.geoJSON.features[0].geometry, true)
                }, "opt-custom-search");


                // Handle click events on map
                // ==========================

                mapObj.on("dblclick", function () {
                    clicktimer = undefined;
                });
                mapObj.on("click", function (e) {
                    var event = new geocloud.clickEvent(e, cloud);
                    if (clicktimer) {
                        clearTimeout(clicktimer);
                    } else {
                        if (me.state.active === false) {
                            return;
                        }

                        clicktimer = setTimeout(function (e) {

                            clicktimer = undefined;

                            var coords = event.getCoordinate(), p;
                            p = utils.transform("EPSG:3857", "EPSG:4326", coords);

                            me.makeSearch(
                                {
                                    coordinates: [p.x, p.y],
                                    type: "Point"
                                }
                            );


                        }, 250);
                    }
                });
            }

            makeSearch(geojson, zoom) {
                let q = {
                    x: geojson.coordinates[0],
                    y: geojson.coordinates[1],
                    date: dayjs(this.state.date).format('MM-DD-YYYY'),
                    time: this.state.time,
                    intervals: this.state.intervals,
                }
                store.custom_data = JSON.stringify(q);
                store.load();
            }

            load() {
                store.load();
            }

            render() {
                return (
                    <div>
                        <div id="conflict-places" className="places" style={this.marginBottomXl}>
                            <input id="opt-custom-search"
                                   className="ejendom-custom-search typeahead" type="text"
                                   placeholder="Adresse eller matrikelnr."/>
                        </div>
                        <form className="form">
                            <div className="form-group">
                                <label htmlFor="otp-date">Dato</label>
                                <input type="date" id="otp-date" className="form-control" min="09:00" max="18:00"
                                       value={this.state.date} onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-time">Tid</label>
                                <input type="time" id="otp-time" className="form-control" value={this.state.time}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-num-of-class">Antal klasser</label>
                                <input type="number" id="otp-num-of-class" className="form-control"
                                       value={this.state.numOfClass}
                                       min="1"
                                       max="7"
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-start-time">Første tid</label>
                                <input type="number" id="otp-start-time" className="form-control"
                                       value={this.state.startTime}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-end-time">Sidste tid</label>
                                <input type="number" id="otp-end-time" className="form-control"
                                       value={this.state.endTime}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-start-color">Første farve</label>
                                <input type="color" id="otp-start-color" className="form-control"
                                       value={this.state.startColor}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-end-color">Første farve</label>
                                <input type="color" id="otp-end-color" className="form-control"
                                       value={this.state.endColor}
                                       onChange={this.handleChange}/>
                            </div>
                        </form>
                    </div>
                );
            }
        }

        utils.createMainTab(exId, "OTP", "Hej Hej", require('./../../../browser/modules/height')().max, "home", false, exId);

        // Append to DOM
        //==============
        try {

            ReactDOM.render(
                <Otp/>,
                document.getElementById(exId)
            );
        } catch (e) {

        }
    }
};
