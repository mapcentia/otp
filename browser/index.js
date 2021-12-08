const React = require("react");
const search = require("./../../../browser/modules/search/danish");
const ReactDOM = require("react-dom");
const exId = 'otp';
let cloud;
let utils;
let transformPoint;
let backboneEvents;
let store;
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

                this.state = {};

                this.load = this.load.bind(this);
            }

            componentDidMount() {
                var me = this;
                let uri = '/api/otp';


                store = new geocloud.sqlStore({
                    jsonp: false,
                    method: "GET",
                    host: "",
                    uri: uri,
                    db: "",
                    clickable: true,
                    sql: "sdssd",
                    styleMap: {
                        weight: 5,
                        color: '#660000',
                        dashArray: '',
                        fillOpacity: 0.2
                    },
                    error: function () {
                    },
                    onLoad: function () {
                        cloud.get().zoomToExtentOfgeoJsonStore(this, 17)
                    }
                });
                cloud.get().addGeoJsonStore(store);
            }

            load() {
                store.load();
            }

            render() {
                return (
                    <div>
                        <button className="btn btn-danger" onClick={this.load}>Isokron</button>
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
