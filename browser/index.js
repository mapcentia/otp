import ReactDOM from "react-dom";

const React = require("react");
const search = require("./../../../browser/modules/search/danish");
const dayjs = require("dayjs");
import Gradient from "javascript-color-gradient";


const MODULE_ID = 'otp';
let cloud;
let utils;
let transformPoint;
let backboneEvents;
let store;
let state;
let clicktimer;
let _self;
let mState = null;
let mapObj;
let marker;
let active = false;
const colorGradient = new Gradient();
const config = require('../../../config/config.js');
const otpRoutes = config?.extensionConfig?.otp?.routes || ['default'];

const setSnapShot = (state) => {
    mState = state;
    backboneEvents.get().trigger(`${MODULE_ID}:state_change`);
}

const defaultState = {
    date: dayjs().format("YYYY-MM-DD"),
    time: dayjs().format("HH:mm"),
    numOfClass: 3,
    startTime: 10,
    endTime: 30,
    intervals: [600, 1200, 1800],
    startColor: '#ff0000',
    endColor: '#00ff00',
    colorGradient: ['#aa5500', '#55aa00', '#00ff00'],
    geoJSON: null,
    legendChecks: [true, true, true],
    fromSnapShot: false,
    coords: null,
    opacity: 1,
    arriveBy: false,
    route: 'nt'
};

class Otp extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.defaultState;
        this.load = this.load.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleOpacityChange = this.handleOpacityChange.bind(this);
        this.handleLegendCheck = this.handleLegendCheck.bind(this);
        this.resetAll = this.resetAll.bind(this);
        this.resetOnlyMap = this.resetOnlyMap.bind(this);
        this.refresh = this.refresh.bind(this);
        this.marginBottomXl = {
            marginBottom: "24px"
        };
    }

    handleChange(event) {
        switch (event.target.id) {
            case 'otp-route':
                this.setState({route: event.target.value});
                break;
            case 'otp-arrive-by':
                this.setState({arriveBy: event.target.checked});
                break;
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
            setSnapShot(this.state)
        }, 500)
    }

    handleOpacityChange(event) {
        let v = event.target.value;
        this.setState({opacity: v});
        store.layer.eachLayer(l => {
            if (l.options.fillOpacity !== 0)
                l.setStyle({fillOpacity: v});

        })
        setSnapShot(this.state)
    }

    handleLegendCheck(event) {
        let me = this
        const checked = event.target.checked;
        const value = event.target.value;
        this.setState({
            legendChecks: this.state.legendChecks.map((e, i) => {
                let res = e
                if (i === parseInt((event.target.name))) {
                    res = checked === true;
                }
                return res
            })
        })
        store.layer.eachLayer((l) => {
            if (parseInt(value) === l.feature.properties.time) {
                if (checked) {
                    l.setStyle(
                        {
                            fillOpacity: me.state.opacity,
                            opacity: 0.5
                        }
                    )
                } else {
                    l.setStyle(
                        {
                            fillOpacity: 0,
                            opacity: 0.5
                        }
                    )
                }
            }
        })
        setTimeout(() => {
            setSnapShot(this.state)
        }, 500)
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
        this.setState({legendChecks: Array(num).fill(true)})
    }

    componentDidMount() {
        let me = this;
        let uri = '/api/otp';
        store = new geocloud.sqlStore({
            jsonp: false,
            method: "GET",
            host: "",
            uri: uri,
            db: "",
            clickable: false,
            sql: "sdssd",
            styleMap: (feature, layer) => {
                let time = feature.properties.time;
                let i = this.state.intervals.indexOf(time);
                let color = this.state.colorGradient[i];
                let opacity = this.state.legendChecks[i] ? me.state.opacity : 0;
                return {
                    weight: 1,
                    color: color,
                    dashArray: '',
                    fillOpacity: opacity,
                    opacity: 0.5
                }
            },
            onEachFeature: function (f, l) {
                l._vidi_type = "query_result";
            },
            error: function (o, err) {
                alert(err.responseJSON.message)
            },
            onLoad: function (e) {
                // cloud.get().zoomToExtentOfgeoJsonStore(this, 17)
                me.setState({geoJSON: e.geoJSON});
                setSnapShot(me.state)
            }
        });
        cloud.get().addGeoJsonStore(store);

        search.init(function () {
            let coords = [...this.geoJSON.features[0].geometry.coordinates];
            me.setState({coords: coords})
            me.makeSearch(coords, true)
        }, "opt-custom-search");

        // Handle click events on map
        mapObj.on("dblclick", function () {
            clicktimer = undefined;
        });
        mapObj.on("click", function (e) {
            if (active) {
                const event = new geocloud.clickEvent(e, cloud);
                if (clicktimer) {
                    clearTimeout(clicktimer);
                } else {
                    if (me.state.active === false) {
                        return;
                    }
                    clicktimer = setTimeout(function (e) {
                        clicktimer = undefined;
                        let coords = event.getCoordinate(), p;
                        p = utils.transform("EPSG:3857", "EPSG:4326", coords);
                        let arr = [p.x, p.y];
                        me.setState({coords: arr})
                        me.makeSearch(arr);
                    }, 250);
                }
            }
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.defaultState.fromSnapShot) {
            this.props.defaultState.fromSnapShot = false;
            this.setState(this.props.defaultState);
            this.setState({fromSnapShot: false})
            resetMap();
            setTimeout(() => {
                let ds = this.props.defaultState
                store.layer.addData(ds.geoJSON);
                if (marker) mapObj.removeLayer(marker);
                addMarker([ds.coords[1], ds.coords[0]]);
                setSnapShot(this.state)
            }, 500)
        }
    }

    makeSearch(coords, zoom) {
        if (marker) mapObj.removeLayer(marker)
        addMarker([coords[1], coords[0]]);
        let q = {
            x: coords[0],
            y: coords[1],
            date: dayjs(this.state.date).format('MM-DD-YYYY'),
            time: this.state.time,
            intervals: this.state.intervals,
            arriveBy: this.state.arriveBy,
            route: this.state.route
        }
        store.custom_data = JSON.stringify(q);
        store.load();
    }

    load() {
        store.load();
    }


    resetAll() {
        resetMap();
        this.setState(defaultState);
    }

    resetOnlyMap() {
        this.setState({geoJSON: null})
        setSnapShot(this.state);
        resetMap();
    }

    refresh() {
        this.makeSearch(this.state.coords)
    }

    render() {
        const legendItems = this.state.colorGradient.map((f, i) => <li key={i}><input type="checkbox" name={i}
                                                                                      value={this.state.intervals[i]}
                                                                                      checked={this.state.legendChecks[i]}
                                                                                      onChange={this.handleLegendCheck}/>
            <div
                style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: f,
                    display: "inline-block"
                }}>&nbsp;</div>
            &nbsp;&#60;&nbsp;
            {Math.round(this.state.intervals[i] / 60)} minutter</li>);

        return (
            <div>
                <div id="conflict-places" className="places" style={this.marginBottomXl}>
                    <input id="opt-custom-search"
                           className="ejendom-custom-search typeahead" type="text"
                           placeholder="Adresse eller matrikelnr."/>
                </div>
                <div className="form-group">
                    <label htmlFor="otp-route">Køreplan</label>
                    <select value={this.state.route} id="otp-route" className="form-control" onChange={this.handleChange}>
                        {otpRoutes.map(rt =>
                            <option  key={rt} value={rt}>{rt}</option>
                        )};
                    </select>
                </div>
                <div className="form-group">
                    <div className="togglebutton">
                        <label>
                            <input type="checkbox" id="otp-arrive-by" className="togglebutton"
                                   checked={this.state.arriveBy} onChange={this.handleChange}/> Ankomsttid
                        </label>
                    </div>
                </div>
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
                    <label htmlFor="otp-num-of-class">Antal intervaller (max. 7)</label>
                    <input type="number" id="otp-num-of-class" className="form-control"
                           value={this.state.numOfClass}
                           min="1"
                           max="7"
                           onChange={this.handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="otp-start-time">Første rejsetidsinddeling i minutter</label>
                    <input type="number" id="otp-start-time" className="form-control"
                           value={this.state.startTime}
                           onChange={this.handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="otp-end-time">Maksimale rejsetid i minutter</label>
                    <input type="number" id="otp-end-time" className="form-control"
                           value={this.state.endTime}
                           onChange={this.handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="otp-start-color">Startfarve</label>
                    <input type="color" id="otp-start-color" className="form-control"
                           value={this.state.startColor}
                           onChange={this.handleChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="otp-end-color">Slutfarve</label>
                    <input type="color" id="otp-end-color" className="form-control"
                           value={this.state.endColor}
                           onChange={this.handleChange}/>
                </div>
                <div>
                    <label htmlFor="opacity">Gennemsigtighed</label>
                    <input type="range" id="opacity" name="opacity"
                           min="0.01" max="1" step="0.01" value={this.state.opacity}
                           onChange={this.handleOpacityChange}/>
                </div>
                <div>
                    <button disabled={this.state.coords === null} className="btn btn-primary"
                            onClick={this.refresh}>Genberegn
                    </button>
                    <button className="btn btn-danger" onClick={this.resetOnlyMap}>Ryd kort</button>
                </div>
                <div>
                    <ul style={{listStyleType: "none", padding: 0, margin: 0}}>{legendItems}</ul>
                </div>
            </div>
        );
    }
}

module.exports = module.exports = {

    set: function (o) {
        cloud = o.cloud;
        utils = o.utils;
        state = o.state;
        transformPoint = o.transformPoint;
        backboneEvents = o.backboneEvents;
        _self = this;
        return this;
    },

    init: function () {
        const me = this;
        mapObj = cloud.get().map;
        state.listenTo(MODULE_ID, _self);
        state.listen(MODULE_ID, `state_change`);
        utils.createMainTab(MODULE_ID, "Rejsetid", "Hej Hej", require('./../../../browser/modules/height')().max, "timer", false, MODULE_ID);
        backboneEvents.get().on(`off:all`, () => {
            utils.cursorStyle().reset();
            active = false;
            // resetMap();
        });
        backboneEvents.get().on("on:" + MODULE_ID, () => {
            utils.cursorStyle().crosshair();
            active = true;
            state.getModuleState(MODULE_ID).then(initialState => {
                let ds = initialState || defaultState;
                ReactDOM.render(
                    <Otp defaultState={ds}/>,
                    document.getElementById(MODULE_ID)
                );
                resetMap();
                setTimeout(() => {
                    if (ds.geoJSON) {
                        store.layer.addData(ds.geoJSON);
                    }
                    if (marker) {
                        mapObj.removeLayer(marker)
                    }
                    if (ds.coords) {
                        addMarker([ds.coords[1], ds.coords[0]])
                    }
                }, 100)
            });
        })
    },


    getState: () => {
        // console.log("GET STATE", mState)
        return mState;
    },

    applyState: (newState) => {
        return new Promise((resolve) => {
            newState.fromSnapShot = true;
            if (newState) {
                ReactDOM.render(
                    <Otp defaultState={newState}/>,
                    document.getElementById(MODULE_ID)
                );
            }
            resolve();
        });
    },
};
const resetMap = () => {
    if (marker) mapObj.removeLayer(marker)
    if (store) store.reset();
}
const addMarker = (coord) => {
    marker = L.marker(coord).addTo(mapObj);
    marker._vidi_type = "query_draw";
    marker._vidi_marker = true
}

