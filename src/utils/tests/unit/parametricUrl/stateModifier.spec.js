import {expect} from "chai";
import {checkIsURLQueryValid, setValueToState} from "../../../parametricUrl/stateModifier";
import store from "../../../../app-store";
import crs from "@masterportal/masterportalapi/src/crs";

const namedProjections = [
    ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
    ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
];

describe("src/utils/parametricUrl/stateModifier.js", () => {
    let stateCopy;

    describe("setValueToState", () => {
        before(() => {
            stateCopy = {...store.state};
        });
        after(() => {
            store.replaceState(stateCopy);
        });
        it("setValueToState does not react if key is not an array", async () => {
            const state = {
                    urlParams: {},
                    Tools: {
                        Measure: {
                            active: false
                        }
                    }
                },
                value = "true";

            store.replaceState(state);
            setValueToState(store.state, null, value);
            expect(await store.state.Tools.Measure.active).to.be.equals(false);

            setValueToState(store.state, undefined, value);
            expect(await store.state.Tools.Measure.active).to.be.equals(false);

            setValueToState(store.state, {}, value);
            expect(await store.state.Tools.Measure.active).to.be.equals(false);
        });
        it("setValueToState sets a boolean", async () => {
            const key = "Tools/Measure/active",
                state = {
                    urlParams: {},
                    Tools: {
                        Measure: {
                            active: false
                        }
                    }
                };

            store.replaceState(state);
            await setValueToState(store.state, key, "true");
            expect(await store.state.Tools.Measure.active).to.be.equals(true);

            state.Tools.Measure.active = false;
            await setValueToState(store.state, key, true);
            expect(await store.state.Tools.Measure.active).to.be.equals(true);

            await setValueToState(store.state, key, "false");
            expect(await store.state.Tools.Measure.active).to.be.equals(false);

            state.Tools.Measure.active = true;
            await setValueToState(store.state, key, false);
            expect(await store.state.Tools.Measure.active).to.be.equals(false);
        });


        /**
        * These kinds of params are possible for starting tool draw:
        * It doesn't matter if it is controlled by vuex state or by backbone.
        *  ?Tools/Draw/active=true
        *  ?tools/Draw/active=true
        *  ?tools/draw/active=true
        *  ?Draw/active=true
        *  ?draw/active=true
        *  ?Draw/active
        *  ?draw/active
        *  ?isinitopen=draw
        *  ?isinitopen=Draw
        *  ?startupmodul=Draw
        *  ?startupmodul=draw
        */
        describe("test start tool by urlparams", () => {
            it("setValueToState sets tool active with param without incomplete key, no value or key has not expected case", async () => {
                let key = "Tools/Measure/active";
                const state = {
                    urlParams: {},
                    Tools: {
                        Measure: {
                            active: false
                        }
                    }
                };

                store.replaceState(state);

                await setValueToState(store.state, key, "true");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "tools/Measure/active";
                await setValueToState(store.state, key, "true");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "tools/Measure/active";
                await setValueToState(store.state, key, "");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "tools/measure/active";
                await setValueToState(store.state, key, "true");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "Measure/active";
                await setValueToState(store.state, key, "true");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "measure/active";
                await setValueToState(store.state, key, "true");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "Measure/active";
                await setValueToState(store.state, key, "");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "measure/active";
                await setValueToState(store.state, key, "");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

                state.Tools.Measure.active = false;
                key = "measure";
                await setValueToState(store.state, key, "true");
                expect(await store.state.Tools.Measure.active).to.be.equals(true);

            });
            it("setValueToState with isinitopen, tool is in state", async () => {
                const key = "isinitopen",
                    state = {
                        urlParams: {},
                        Tools: {
                            Measure: {
                                active: false
                            }
                        }
                    };
                let value = "measure";

                store.replaceState(state);
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Measure.active).to.be.equals(true);
                expect(await store.state.urlParams[key]).to.be.equals(undefined);

                store.replaceState(state);
                value = "Measure";
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Measure.active).to.be.equals(true);
                expect(await store.state.urlParams[key]).to.be.equals(undefined);

            });
            it("setValueToState with isinitopen, tool is not in state", async () => {
                const key = "isinitopen",
                    state = {
                        urlParams: {},
                        Tools: {}
                    };
                let value = "shadow";


                store.replaceState(state);
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Shadow).to.be.equals(undefined);
                expect(await store.state.urlParams[key]).to.be.equals("shadow");

                store.replaceState(state);
                value = "Shadow";
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Shadow).to.be.equals(undefined);
                expect(await store.state.urlParams[key]).to.be.equals("shadow");
            });


            it("setValueToState with startupmodul, tool is in state", async () => {
                const key = "startupmodul",
                    state = {
                        urlParams: {},
                        Tools: {
                            Measure: {
                                active: false
                            }
                        }
                    };
                let value = "measure";

                store.replaceState(state);
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Measure.active).to.be.equals(true);
                expect(await store.state.urlParams.isinitopen).to.be.equals(undefined);

                store.replaceState(state);
                value = "Measure";
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Measure.active).to.be.equals(true);
                expect(await store.state.urlParams.isinitopen).to.be.equals(undefined);

            });
            it("setValueToState with startupmodul, tool is not in state", async () => {
                const key = "startupmodul",
                    state = {
                        urlParams: {},
                        Tools: {
                        }
                    };
                let value = "shadow";

                store.replaceState(state);

                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Shadow).to.be.equals(undefined);
                expect(await store.state.urlParams.isinitopen).to.be.equals("shadow");

                store.replaceState(state);
                value = "Shadow";
                await setValueToState(store.state, key, value);
                expect(await store.state.Tools.Shadow).to.be.equals(undefined);
                expect(await store.state.urlParams.isinitopen).to.be.equals("shadow");
            });
        });
        it("?Map/center or only center as param-key is set to state", async () => {
            let key = "Map/center",
                valueAsString = "[553925,5931898]";
            const state = {
                    urlParams: {},
                    Maps: {
                        center: [0, 0]
                    },
                    Tools: {}
                },
                value = [553925, 5931898];

            store.replaceState(state);

            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.center).to.be.deep.equals(value);

            store.replaceState(state);
            key = "center";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.center).to.be.deep.equals(value);

            store.replaceState(state);
            key = "Map/center";
            valueAsString = "553925,5931898";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.center).to.be.deep.equals(value);

            store.replaceState(state);
            key = "center";
            valueAsString = "553925,5931898";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.center).to.be.deep.equals(value);
        });
        it("test param marker and MapMarker, coordinates as array or comma separated", async () => {
            let key = "marker",
                valueAsString = "[553925,5931898]";
            const state = {
                    urlParams: {},
                    MapMarker: {
                        coordinates: [0, 0]
                    },
                    Tools: {}
                },
                value = [553925, 5931898];

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.MapMarker.coordinates).to.be.deep.equals(value);

            store.replaceState(state);
            key = "MapMarker";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.MapMarker.coordinates).to.be.deep.equals(value);

            store.replaceState(state);
            key = "mapmarker";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.MapMarker.coordinates).to.be.deep.equals(value);

            store.replaceState(state);
            key = "mapmarker";
            valueAsString = "553925,5931898";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.MapMarker.coordinates).to.be.deep.equals(value);
        });
        it("test param marker with projection", async () => {
            crs.registerProjections(namedProjections);

            // ?Map/projection=EPSG:8395&marker=[3565836,5945355]
            const key = "marker",
                valueAsString = "[3565836,5945355]",
                state = {
                    urlParams: {},
                    MapMarker: {
                        coordinates: [0, 0]
                    }
                },
                value = [3565836, 5945355];

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            await setValueToState(store.state, "Map/projection", "EPSG:8395");
            expect(await store.state.MapMarker.coordinates).to.be.deep.equals(value);
            expect(await store.state.urlParams.projection.name).to.be.deep.equals("http://www.opengis.net/gml/srs/epsg.xml#8395");
        });
        it("test param zoomLevel", async () => {
            let key = "zoomLevel";
            const valueAsString = "5",
                state = {
                    urlParams: {},
                    Maps: {
                        zoomLevel: 2
                    }
                };

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.zoomLevel).to.be.equals(5);

            store.replaceState(state);
            key = "zoomlevel";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.zoomLevel).to.be.deep.equals(5);

        });
        it("test param map", async () => {
            let key = "map",
                valueAsString = "3D";
            const state = {
                urlParams: {},
                Maps: {
                    mapMode: "2D"
                }
            };

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.mapMode).to.be.equals("3D");

            key = "mapmode";
            valueAsString = "2D";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.mapMode).to.be.equals("2D");

            key = "map/mapmode";
            valueAsString = "3D";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.mapMode).to.be.equals("3D");

        });
        it("test param layerIds", async () => {
            let key = "Maps/layerIds";
            const state = {
                    urlParams: {},
                    Maps: {
                        layerIds: null
                    }
                },
                valueAsString = "1711,20622";

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.layerIds).to.be.deep.equals([1711, 20622]);

            key = "layerIds";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.layerIds).to.be.deep.equals([1711, 20622]);

            key = "layerids";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.Maps.layerIds).to.be.deep.equals([1711, 20622]);

        });
        it("test param featureid", async () => {
            let key = "featureid";
            const state = {
                    urlParams: {},
                    ZoomTo: {}
                },
                valueAsString = "1,2",
                result = [1, 2];

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToFeatureId"]).to.be.deep.equals(result);

            key = "zoomToFeatureId";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToFeatureId"]).to.be.deep.equals(result);

            key = "Maps/zoomTofeatureId";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToFeatureId"]).to.be.deep.equals(result);

        });
        it("test param featureViaUrl", async () => {
            let key = "featureViaURL";
            const state = {
                    urlParams: {}
                },
                valueAsString = "[{\"layerId\":\"4020\",\"features\":[{\"coordinates\":[[[10.05,53.5],[10,53.5],[9.80,53.55],[10,53.55]],[[10.072,53.492],[9.92,53.492],[9.736,53.558],[10.008,53.558]]],\"label\":\"TestMultiPolygon\"}]}]";

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams.featureViaURL).to.be.equals(valueAsString);

            key = "featureViaUrl";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams.featureViaURL).to.be.equals(valueAsString);
        });
        it("test param highlightfeature", async () => {
            let key = "highlightfeature";
            const state = {
                    urlParams: {}
                },
                valueAsString = "8712,APP_STAATLICHE_SCHULEN_452280";

            store.replaceState(state);

            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/highlightFeature"]).to.be.equals(valueAsString);

            key = "Maps/highlightFeature";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/highlightFeature"]).to.be.equals(valueAsString);
        });
        it("test param uiStyle", async () => {
            let key = "uiStyle";
            const state = {
                    urlParams: {}
                },
                valueAsString = "SIMPLE";

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams.uiStyle).to.be.equals(valueAsString);

            key = "style";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams.uiStyle).to.be.equals(valueAsString);
        });
        it("test param Map/zoomToExtent", async () => {
            let key = "Maps/zoomToExtent";
            const state = {
                    urlParams: {}
                },
                valueAsString = "510000,5850000,625000,6000000",
                result = [510000, 5850000, 625000, 6000000];

            store.replaceState(state);

            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToExtent"]).to.be.deep.equals(result);

            key = "zoomToExtent";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToExtent"]).to.be.deep.equals(result);
        });
        it("test param Map/zoomToGeometry", async () => {
            let key = "Map/zoomToGeometry";
            const state = {
                    urlParams: {},
                    ZoomTo: {}
                },
                valueAsString = "altona";

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToGeometry"]).to.be.equals(valueAsString);

            key = "zoomToGeometry";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToGeometry"]).to.be.equals(valueAsString);

            key = "bezirk";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/zoomToGeometry"]).to.be.equals(valueAsString);
        });
        it("test param Map/mdId", async () => {
            let key = "Maps/mdId";
            const state = {
                    urlParams: {}
                },
                valueAsString = "F35EAC11-C236-429F-B1BF-751C0C18E8B7";

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/mdId"]).to.be.equals(valueAsString);

            key = "mdId";
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams["Maps/mdId"]).to.be.equals(valueAsString);
        });
        it("test param filter", async () => {
            const key = "filter",
                state = {
                    urlParams: {}
                },
                valueAsString = "[{\"name\":\"Alle Schulen\",\"isSelected\":true})";

            store.replaceState(state);
            await setValueToState(store.state, key, valueAsString);
            expect(await store.state.urlParams.filter).to.be.equals(valueAsString);
        });

        describe("UrlParam brwId, brwlayername", async () => {
            it("test param brwId", async () => {
                const key = "brwId",
                    state = {
                        urlParams: {}
                    },
                    valueAsString = "01510241";

                store.replaceState(state);
                await setValueToState(store.state, key, valueAsString);
                expect(await store.state.urlParams.brwId).to.be.equals(valueAsString);
            });
            it("test param brwlayername", async () => {
                const key = "brwlayername",
                    state = {
                        urlParams: {}
                    },
                    valueAsString = "31.12.2017";

                store.replaceState(state);
                await setValueToState(store.state, key, valueAsString);
                expect(await store.state.urlParams.brwLayerName).to.be.equals(valueAsString);
            });
        });
    });
    describe("checkIsURLQueryValid", function () {
        it("should be false by html input", function () {
            const query = "zoomtogeometry=<h3>Please%20login%20to%20proceed</h3>%20<form>Username:<br><input%20type%3D'username'%20name%3D'username'></br>Password:<br><input%20type%3D'password'%20name%3D'password'></br><br><input%20type%3D'submit'%20value%3D'Logon'></br>";

            expect(checkIsURLQueryValid(query)).to.be.false;
        });
        it("should be false by iframe html input", function () {
            const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com%20/>";

            expect(checkIsURLQueryValid(query)).to.be.false;
        });
        it("should be false by iframe with content input", function () {
            const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com>test</iframe%20>";

            expect(checkIsURLQueryValid(query)).to.be.false;
        });
        it("should be true by zoomtogeometry string without html input", function () {
            const query = "zoomtogeometry=bergedorf";

            expect(checkIsURLQueryValid(query)).to.be.true;
        });
        it("should be true by isinitopen string without html input", function () {
            const query = "isinitopen=measure";

            expect(checkIsURLQueryValid(query)).to.be.true;
        });
        it("should be true by a large string without html input", function () {
            const query = "layerIDs=13032,12884,12883,16100,453,8712,1711&visibility=true,true,true,true,true,true,true&transparency=0,0,0,0,0,0,0&center=569591.1587110137,5939300.381241594&zoomlevel=5";

            expect(checkIsURLQueryValid(query)).to.be.true;
        });
    });
});
