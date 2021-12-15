const React = require("react");
const search = require("./../../../browser/modules/search/danish");
const dayjs = require("dayjs");
const exId = 'otp';
let cloud;
let utils;
let transformPoint;
let backboneEvents;
let store;
let clicktimer;
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
                    date: dayjs().format("YYYY-MM-DD"),
                    time: dayjs().format("HH:mm")
                };

                this.load = this.load.bind(this);
                this.handleChangeTime = this.handleChangeTime.bind(this);
                this.handleChangeDate = this.handleChangeDate.bind(this);
            }

            handleChangeTime(event) {
                this.setState({time: event.target.value});
            }
            handleChangeDate(event) {
                this.setState({date: event.target.value});
            }

            componentDidMount() {
                var me = this;
                let uri = '/api/otp';

                // Stop listening to any events, deactivate controls, but
                // keep effects of the module until they are deleted manually or reset:all is emitted
                backboneEvents.get().on("deactivate:all", () => {});

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
                    styleMap: {
                        weight: 1,
                        color: '#00ff00',
                        dashArray: '',
                        fillOpacity: 0.2,
                        opacity: 0.7
                    },
                    error: function () {
                    },
                    onLoad: function () {
                        cloud.get().zoomToExtentOfgeoJsonStore(this, 17)
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
                                       value={this.state.date} onChange={this.handleChangeDate}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-time">Tid</label>
                                <input type="time" id="otp-time" className="form-control" value={this.state.time}
                                       onChange={this.handleChangeTime}/>
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
