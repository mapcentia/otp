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
const routes = config?.extensionConfig?.otp?.routes || ['default'];
const defaults = config?.extensionConfig?.otp?.defaults;
const parameters = config?.extensionConfig?.otp?.parameters || {};
const helpText = config?.extensionConfig?.otp?.helpText || "";

const setSnapShot = (state) => {
    mState = state;
    backboneEvents.get().trigger(`${MODULE_ID}:state_change`);
}

let defaultState = {
    numOfClass: null,
    startTime: defaults?.startTime || 10,
    endTime: defaults?.endTime || 30,
    intervals: defaults?.intervals || [600, 1200, 1800],
    startColor: defaults?.startColor || '#ff0000',
    endColor: defaults?.endColor || '#00ff00',
    opacity: defaults?.opacity || 0.7,
    arriveBy: defaults?.arriveBy || false,
    route: defaults?.route || 'default',
    maxWalkDistance: defaults?.maxWalkDistance || 500,
    colorGradient: [],
    geoJSON: null,
    legendChecks: [],
    fromSnapShot: false,
    coords: null,
    date: dayjs().format("YYYY-MM-DD"),
    time: dayjs().format("HH:mm"),
    mode: "transport-type-transit",
};

colorGradient.setGradient(defaultState.startColor, defaultState.endColor);
colorGradient.setMidpoint(defaultState.intervals.length);
defaultState.colorGradient = colorGradient.getArray();
defaultState.numOfClass = defaultState.intervals.length;
defaultState.legendChecks = Array(defaultState.numOfClass).fill(true)

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
        this.download = this.download.bind(this);
        this.marginBottomXl = {
            marginBottom: "24px"
        };
    }

    handleChange(event) {
        console.log(event);
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
            case 'otp-max-walk-distance':
                this.setState({maxWalkDistance: parseInt(event.target.value)});
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
            case 'transport-type-transit':
            case 'transport-type-bicycle':
            case 'transport-type-car':
                this.setState({mode: event.target.value});
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
                            opacity: 0
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
                let fillOpacity = this.state.legendChecks[i] ? me.state.opacity : 0;
                let opacity = this.state.legendChecks[i] ? 0.5 : 0;
                return {
                    weight: 1,
                    color,
                    dashArray: '',
                    fillOpacity,
                    opacity
                }
            },
            onEachFeature: function (f, l) {
                l._vidi_type = "query_result";
            },
            error: function (o, err) {
                console.error(err.responseJSON.message);
                alert('Det er sket en fejl. Det er sandsynligvis forårsaget af et ugyldigt parametervalg. Tilpasse indstillingerne og prøv igen');
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
        }, ".otp-custom-search");

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
                if (ds.geoJSON) store.layer.addData(ds.geoJSON);
                if (marker) mapObj.removeLayer(marker);
                if (ds.coords) addMarker([ds.coords[1], ds.coords[0]]);
                setSnapShot(this.state)
            }, 500)
        }
    }

    makeSearch(coords, zoom) {
        if (this.state.startTime > this.state.endTime) {
            alert("'Første rejsetidsinddeling i minutter' må ikke være større end 'Maksimale rejsetid i minutter'");
            return;
        }
        if (marker) mapObj.removeLayer(marker);
        addMarker([coords[1], coords[0]]);
        let q = {
            x: coords[0],
            y: coords[1],
            date: dayjs(this.state.date).format('MM-DD-YYYY'),
            time: this.state.time,
            intervals: this.state.intervals,
            arriveBy: this.state.arriveBy,
            route: this.state.route,
            maxWalkDistance: this.state.maxWalkDistance,
            mode: this.state.mode,
            parameters
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
        this.setState({geoJSON: null});
        this.setState({coords: null});
        setTimeout(() => {
            setSnapShot(this.state);
            resetMap();
        }, 100)
    }

    refresh() {
        this.makeSearch(this.state.coords)
    }

    download() {
        console.log(this.state.geoJSON)
        let blob = new Blob([JSON.stringify(this.state.geoJSON)], {type: 'application/json'});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'file.geojson';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        const legendItems = this.state.colorGradient.map((f, i) => <li key={i} className="mb-2">
            <div className="d-flex "><input className="form-check-input me-2" type="checkbox" name={i}
                                            value={this.state.intervals[i]}
                                            checked={this.state.legendChecks[i]}
                                            onChange={this.handleLegendCheck}/>
                <div className="d-flex align-items gap-2">
                    <div className="d-inline-block"
                         style={{
                             width: "30px",
                             height: "30px",
                             backgroundColor: f
                         }}></div>
                    <div>&#60;</div>
                    {Math.round(this.state.intervals[i] / 60)} minutter
                </div>
            </div>
        </li>);

        return (
            <div>
                <div className="d-flex mb-3">
                    <span className="btn-group w-100">
                        <input className="btn-check" type="radio" name="transport-type" id="transport-type-transit"
                               value="transport-type-transit"
                               checked={this.state.mode === "transport-type-transit"} onChange={this.handleChange}/>
                        <label htmlFor="transport-type-transit" className="btn btn-sm btn-outline-secondary">
                            Offentlig transport
                        </label>
                        <input className="btn-check" type="radio" name="transport-type" id="transport-type-bicycle"
                               value="transport-type-bicycle"
                               checked={this.state.mode === "transport-type-bicycle"} onChange={this.handleChange}/>
                        <label htmlFor="transport-type-bicycle" className="btn btn-sm btn-outline-secondary">
                            Cykel
                        </label>
                        {/*<input className="btn-check" type="radio" name="transport-type" id="transport-type-car"*/}
                        {/*       value="transport-type-car"*/}
                        {/*       checked={this.state.mode === "transport-type-car"} onChange={this.handleChange}/>*/}
                        {/*<label htmlFor="transport-type-car" className="btn btn-sm btn-outline-secondary">*/}
                        {/*    Bil*/}
                        {/*</label>*/}
                    </span>
                </div>
                <div className="places mb-3">
                    <div className="input-group mb-3">
                        <input className="typeahead form-control otp-custom-search" type="text"
                               placeholder="Adresse eller matrikelnr."/>
                        <button className="btn btn-outline-secondary searchclear" type="button">
                            <i className="bi bi-x-lg"/>
                        </button>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="otp-route">Køreplan</label>
                    <select value={this.state.route} id="otp-route" className="form-select"
                            onChange={this.handleChange}>
                        {routes.map(rt =>
                            <option key={rt} value={rt}>{rt}</option>
                        )};
                    </select>
                </div>
                <div className="mb-3 d-flex gap-2 mb-3">
                    <div>Afgangstid</div>
                    <div className="form-check form-switch">
                        <input type="checkbox" id="otp-arrive-by" className="form-check-input"
                               checked={this.state.arriveBy} onChange={this.handleChange}/>
                    </div>
                    <div>Ankomsttid</div>
                </div>
                <div className="d-flex gap-2 mb-3">
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
                </div>
                <div className="mb-3">
                    <label htmlFor="otp-start-time">Første rejsetidsinddeling i minutter</label>
                    <input type="number" id="otp-start-time" className="form-control"
                           value={this.state.startTime}
                           onChange={this.handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="otp-end-time">Maksimale rejsetid i minutter</label>
                    <input type="number" id="otp-end-time" className="form-control"
                           value={this.state.endTime}
                           onChange={this.handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="otp-num-of-class">Antal intervaller (max. 7)</label>
                    <input type="number" id="otp-num-of-class" className="form-control"
                           value={this.state.numOfClass}
                           min="1"
                           max="7"
                           onChange={this.handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="otp-max-walk-distance">Maksimal gangafstand i meter</label>
                    <input type="number" id="otp-max-walk-distance" className="form-control"
                           value={this.state.maxWalkDistance}
                           onChange={this.handleChange}/>
                </div>
                <div className="d-flex w-100 gap-2 mb-3">
                    <div className="w-50">
                        <label htmlFor="otp-start-color">Startfarve</label>
                        <input type="color" id="otp-start-color" className="form-control"
                               value={this.state.startColor}
                               onChange={this.handleChange}/>
                    </div>
                    <div className="w-50">
                        <label htmlFor="otp-end-color">Slutfarve</label>
                        <input type="color" id="otp-end-color" className="form-control"
                               value={this.state.endColor}
                               onChange={this.handleChange}/>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="opacity">Gennemsigtighed</label>
                    <input className="form-range" type="range" id="opacity" name="opacity"
                           min="0.01" max="1" step="0.01" value={this.state.opacity}
                           onChange={this.handleOpacityChange}/>
                </div>
                <div className="mb-3 d-flex gap-2">
                    <button disabled={this.state.geoJSON === null} className="btn btn-outline-primary"
                            onClick={this.refresh}>Genberegn
                    </button>
                    <button className="btn btn-outline-danger" onClick={this.resetOnlyMap}
                            disabled={this.state.geoJSON === null}>Ryd kort
                    </button>
                    <button className="btn btn-outline-secondary" onClick={this.download}
                            disabled={this.state.geoJSON === null}>Hent isokron som GeoJSON
                    </button>
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
        utils.createMainTab(MODULE_ID, "Rejsetid", helpText, require('./../../../browser/modules/height')().max, "bi bi-stopwatch", false, MODULE_ID);
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
        const state = newState ? newState : defaultState;
        return new Promise((resolve) => {
            state.fromSnapShot = true;
            ReactDOM.render(
                <Otp defaultState={state}/>,
                document.getElementById(MODULE_ID)
            );
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

