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
                    time: dayjs().format("HH:mm"),
                    numOfClass: 3,
                    startTime: 10,
                    endTime: 30,
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
                }
                setTimeout(()=>{
                    console.log(this.state)
                    this.createClasses()
                }, 100)
            }

            createClasses() {
                let start = this.state.startTime * 60;
                let end = this.state.endTime * 60;
                let num =this.state.numOfClass;

                let diff = end - start;
                let interval = diff / num;
                console.log("diff", diff)
                console.log("interval", interval)
                for (let i = 0; i <= num; i++) {
                    let top = start + (interval * i);
                    let bottom = top - interval;
                    console.log("bottom", bottom)
                }
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
                                       value={this.state.date} onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-time">Tid</label>
                                <input type="time" id="otp-time" className="form-control" value={this.state.time}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-num-of-class">Antal klasser</label>
                                <input type="number" id="otp-num-of-class" className="form-control" value={this.state.numOfClass}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-start-time">Første tid</label>
                                <input type="number" id="otp-start-time" className="form-control" value={this.state.startTime}
                                       onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="otp-end-time">Sidste tid</label>
                                <input type="number" id="otp-end-time" className="form-control" value={this.state.endTime}
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
