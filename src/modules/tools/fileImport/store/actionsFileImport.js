import getProxyUrl from "../../../../utils/getProxyUrl";
import {GeoJSON, GPX, KML} from "ol/format.js";
import Circle from "ol/geom/Circle";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import {createDrawStyle} from "../../draw/utils/style/createDrawStyle";
import isObject from "../../../../utils/isObject";
import {createEmpty as createEmptyExtent, extend} from "ol/extent";
import uniqueId from "../../../../utils/uniqueId";

const supportedFormats = {
    kml: new KML({extractStyles: true, iconUrlFunction: (url) => proxyGstaticUrl(url)}),
    gpx: new GPX(),
    geojson: new GeoJSON()
};

/**
 * Change the URL for gstatic.com so that it request through a reverse proxy.
 * Note: When exporting a kml from google-maps or -earth, references to the images are specified.
 * These currently do not allow CORS.
 * @param {String} url The image url.
 * @returns {String} The proxy image url.
 */
function proxyGstaticUrl (url) {
    if (url.includes("gstatic.com")) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        return getProxyUrl(url);
    }
    return url;
}

/**
 * Checks given file suffix for any defined Format. Default mappings are defined in state and may be
 * overridden in config.
 * @param {String} filename - Name of the given file.
 * @param {String} selectedFiletype - The name of type of file. This represents a key of supportedFiletypes
 * and defines, how the format will be chosen. Either directly if it matches an available format and
 * supported file type. Or automatically, when set to "auto".
 * @param {Object} supportedFiletypes - Object of supported file types. This has to include a regex for each
 * file type, that will be used to determine the filetype when selectedFiletype is "auto". The defaults are
 * defined in state and may be overridden in config.
 * @param {Object} availableFormats - Object of available formats provided by Openlayers. These are hardcoded
 * in this file and this is only a param for the sake of avoiding global variables.
 * @returns {Object|Boolean} Returns the chosen openlayers format object or false on error.
 */
function getFormat (filename, selectedFiletype, supportedFiletypes, availableFormats) {
    if (selectedFiletype !== "auto") {
        if (availableFormats[selectedFiletype] === undefined) {
            console.warn("File import tool: Selected filetype \"" + selectedFiletype + "\" has no OL Format defined for it.");
            return false;
        }
        return availableFormats[selectedFiletype];
    }

    for (const formatKey in supportedFiletypes) {
        if (supportedFiletypes[formatKey].rgx === undefined) {
            continue;
        }

        if (filename.match(supportedFiletypes[formatKey].rgx) !== null) {
            if (availableFormats[formatKey] === undefined) {
                console.warn("File import tool: Filetype \"" + formatKey + "\" is defined as supported, but there isn't any OL Format defined for it.");
                continue;
            }
            return availableFormats[formatKey];
        }
    }
    return false;
}

/**
 * Checks for OL-unsupported tags and removes them.
 * Currently unsupported tags are:
 *      - cascadingStyle

 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns raw string KML source without unsupported tags.
 */
function removeBadTags (rawSource) {
    let result = rawSource;

    // remove "cascadingStyle" Tags
    result = rawSource.replace(/<.*?cascadingstyle.*?kml:id="(.+)">\s*<style>/gmi, (a, b) => {
        return "<Style id=\"" + b + "\">";
    });
    result = result.replace(/<\/Style>\s*<\/.*?cascadingstyle>/gmi, "</Style>");

    // ... remove more tags eventually

    return result;
}

/**
 * Reads the JSON and extracts the coordinate system.
 * @param {String} rawSource - KML source as string.
 * @returns {String} Returns CRS.Properties.Name - if not found it defaults to EPSG:4326
 */
function getCrsPropertyName (rawSource) {
    let result = "EPSG:4326";

    try {
        const jsonDoc = JSON.parse(rawSource);

        if (jsonDoc &&
            Object.prototype.hasOwnProperty.call(jsonDoc, "crs") &&
            Object.prototype.hasOwnProperty.call(jsonDoc.crs, "properties") &&
            Object.prototype.hasOwnProperty.call(jsonDoc.crs.properties, "name")) {

            result = jsonDoc.crs.properties.name;
        }
    }
    catch (e) {
        // no JSON input
    }

    return result;
}
/**
 * Checks for isVisible setting and in case it's not there adds it.
 * @param {Array} features The Features to be inspected.
 * @returns {Array} Returns Features with isVisible set.
 */
function checkIsVisibleSetting (features) {
    const resFeatures = features;

    resFeatures.forEach(feature => {
        // in case File doesn't have the isVisible setting
        if (Object.prototype.hasOwnProperty.call(feature, "values_")) {
            if (!Object.prototype.hasOwnProperty.call(feature.values_, "isVisible")) {
                feature.values_.isVisible = true;
            }
        }
    });

    return resFeatures;
}

/**
 * Gets custom attributes from feature by parsing given feature keys.
 * @param {ol/Feature} feature The feature.
 * @returns {Object} The parsed attributes.
 */
function getParsedCustomAttributes (feature) {
    if (typeof feature.getKeys !== "function" || !Array.isArray(feature.getKeys())) {
        return {};
    }

    let attributes = feature.get("attributes");

    if (!isObject(attributes)) {
        attributes = {};
    }
    feature.getKeys().forEach(key => {
        if (typeof key.split === "function" && key.split("custom-attribute____").length > 1) {
            const parsedKey = key.split("custom-attribute____")[1];

            attributes[parsedKey] = feature.get(key);
        }
    });
    return attributes;
}

export default {
    /**
     * Sets the selected file type
     * @param {Object} param.commit the commit
     * @param {String} newFiletype the file type
     * @returns {void}
     */
    setSelectedFiletype: ({commit}, newFiletype) => {
        commit("setSelectedFiletype", newFiletype);
    },

    /**
     * Sets the featureExtents
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {ol/Feature[]} payload.features the parsed features
     * @param {String} payload.fileName the file name
     * @returns {void}
     */
    setFeatureExtents: ({state, commit}, {features, fileName}) => {
        const extents = state.featureExtents,
            extent = createEmptyExtent();

        for (let i = 0; i < features.length; i++) {
            extend(extent, features[i].getGeometry().getExtent());
        }

        extents[fileName] = extent;
        commit("setFeatureExtents", extents);
    },

    /**
     * Imports the given KML file from datasrc.raw, creating the features into datasrc.layer.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the root getters
     * @param {Object} datasrc data source to import, with properties filename, layer and raw.
     * @returns {void}
     */
    importKML: ({state, dispatch, rootGetters}, datasrc) => {
        const
            vectorLayer = datasrc.layer,
            fileName = datasrc.filename,
            format = getFormat(fileName, state.selectedFiletype, state.supportedFiletypes, supportedFormats),
            crsPropName = getCrsPropertyName(datasrc.raw),
            customAttributes = {};

        let
            featureError = false,
            alertingMessage,
            features;

        if (format instanceof KML) {
            datasrc.raw = removeBadTags(datasrc.raw);
        }

        if (format === false) {
            const fileNameSplit = fileName.split("."),
                fileFormat = fileNameSplit.length > 0 ? "*." + fileNameSplit[fileNameSplit.length - 1] : "unknown";

            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFormat", {format: fileFormat})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(datasrc.raw);

            if (format instanceof KML) {
                const indices = [];

                features.forEach((feature, i) => {
                    if (feature.getGeometry() !== null && feature.getGeometry().getType() === "Point") {
                        if (feature.values_.name === undefined) {
                            // import of point no text: showPointNames must be false
                            indices.push(i);
                        }
                    }
                });
                if (indices.length > 0) {
                    // type Point with no names (=Icons) have to be imported with special options, else if downloaded over draw tool again there will be an error
                    const specialFormat = new KML({
                            extractStyles: true,
                            showPointNames: false,
                            crossOrigin: null
                        }),
                        featuresNoPointNames = specialFormat.readFeatures(datasrc.raw);

                    indices.forEach((index) => {
                        features[index] = featuresNoPointNames[index];
                    });
                }
            }
        }
        catch (ex) {
            console.warn(ex);
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.formatError", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        features.forEach(feature => {
            const featureAttributes = getParsedCustomAttributes(feature);
            let geometries;

            feature.set("attributes", featureAttributes);
            feature.setProperties(featureAttributes);
            Object.keys(featureAttributes).forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(customAttributes, key)) {
                    customAttributes[key] = key;
                }
            });

            if (feature.get("isGeoCircle")) {
                const circleCenter = feature.get("geoCircleCenter").split(",").map(parseFloat),
                    circleRadius = parseFloat(feature.get("geoCircleRadius"));

                feature.setGeometry(new Circle(circleCenter, circleRadius));
            }
            if (feature.getGeometry() === null) {
                featureError = true;
                alertingMessage = {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.featureError")
                };

                dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            }
            else {
                if (feature.getGeometry().getType() === "GeometryCollection") {
                    geometries = feature.getGeometry().getGeometries();
                }
                else {
                    geometries = [feature.getGeometry()];
                }

                geometries.forEach(geometry => {
                    let mappedCrsPropName = crsPropName;

                    if ((crsPropName === "urn:ogc:def:crs:EPSG:6.6:4326") ||
                       (crsPropName === "urn:ogc:def:crs:OGC:1.3:CRS84") ||
                       (crsPropName === "urn:ogc:def:crs:OGC:1.3:CRS:84") ||
                       (crsPropName === "urn:ogc:def:crs:OGC:2:84") ||
                       (crsPropName === "urn:x-ogc:def:crs:EPSG:4326")) {
                        mappedCrsPropName = "EPSG:4326";
                    }
                    else if ((crsPropName === "EPSG:102100") ||
                        (crsPropName === "EPSG:102113") ||
                        (crsPropName === "EPSG:900913") ||
                        (crsPropName === "urn:ogc:def:crs:EPSG:6.18:3:3857")) {
                        mappedCrsPropName = "EPSG:3857";
                    }

                    geometry.transform(mappedCrsPropName, rootGetters["Maps/projectionCode"]);
                    feature.set("source", fileName);
                });
            }
            if (typeof feature.get === "function" && typeof feature.get("styleId") === "undefined") {
                feature.set("styleId", uniqueId(""));
            }
        });

        features = checkIsVisibleSetting(features);

        vectorLayer.getSource().addFeatures(features);
        vectorLayer.set("gfiAttributes", customAttributes);

        if (featureError) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.successPartly", {filename: fileName})
            };
        }
        else {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.info"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: fileName})
            };
        }

        dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
        dispatch("addImportedFilename", fileName);

        if (state.enableZoomToExtend && features.length) {
            dispatch("setFeatureExtents", {features: features, fileName: fileName});
        }
    },

    /**
     * Imports the given GeoJSON file from datasrc.raw, creating the features into datasrc.layer.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the root getters
     * @param {Object} datasrc data source to import, with properties filename, layer and raw.
     * @returns {void}
     */
    importGeoJSON: ({state, dispatch, rootGetters}, datasrc) => {
        const vectorLayer = datasrc.layer,
            fileName = datasrc.filename,
            format = getFormat(fileName, state.selectedFiletype, state.supportedFiletypes, supportedFormats),
            gfiAttributes = {};

        let
            alertingMessage,
            features;

        if (format === false) {
            const fileNameSplit = fileName.split("."),
                fileFormat = fileNameSplit.length > 0 ? "*." + fileNameSplit[fileNameSplit.length - 1] : "unknown";

            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFormat", {format: fileFormat})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        try {
            features = format.readFeatures(datasrc.raw, {
                dataProjection: getCrsPropertyName(datasrc.raw),
                featureProjection: rootGetters["Maps/projectionCode"]
            });
        }
        catch (ex) {
            console.warn(ex);
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.formatError", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        if (!Array.isArray(features) || features.length === 0) {
            alertingMessage = {
                category: i18next.t("common:modules.alerting.categories.error"),
                content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent", {filename: fileName})
            };

            dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
            return;
        }

        vectorLayer.setStyle((feature) => {
            const drawState = feature.getProperties().drawState;
            let style;

            if (!drawState) {
                const defaultColor = [226, 26, 28, 0.9],
                    defaultFillColor = [228, 26, 28, 0.5],
                    defaultPointSize = 16,
                    defaultStrokeWidth = 1,
                    defaultCircleRadius = 300,
                    geometryType = feature ? feature.getGeometry().getType() : "Cesium";

                if (geometryType === "Point" || geometryType === "MultiPoint") {
                    style = createDrawStyle(defaultColor, defaultColor, geometryType, defaultPointSize, 1, 1);
                }
                else if (geometryType === "LineString" || geometryType === "MultiLineString") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultColor,
                            width: defaultStrokeWidth
                        })
                    });
                }
                else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultColor,
                            width: defaultStrokeWidth
                        }),
                        fill: new Fill({
                            color: defaultFillColor
                        })
                    });
                }
                else if (geometryType === "Circle") {
                    style = new Style({
                        stroke: new Stroke({
                            color: defaultColor,
                            width: defaultStrokeWidth
                        }),
                        fill: new Fill({
                            color: defaultFillColor
                        }),
                        circleRadius: defaultCircleRadius,
                        colorContour: defaultColor
                    });
                }
                else {
                    console.warn("Geometry type not implemented: " + geometryType);
                    style = new Style();
                }

                return style.clone();
            }

            if (drawState.drawType.geometry === "Point") {
                if (drawState.symbol.value !== "simple_point") {
                    style = new Style({
                        image: new Icon({
                            crossOrigin: "anonymous",
                            src: drawState.symbol.value.indexOf("/") > 0 ? drawState.symbol.value : drawState.imgPath + drawState.symbol.value,
                            scale: drawState.symbol.scale
                        })
                    });
                }
                else {
                    style = createDrawStyle(drawState.color, drawState.color, drawState.drawType.geometry, drawState.pointSize, 1, drawState.zIndex);
                }
            }
            else if (drawState.drawType.geometry === "LineString" || drawState.drawType.geometry === "MultiLineString") {
                style = new Style({
                    stroke: new Stroke({
                        color: drawState.colorContour,
                        width: drawState.strokeWidth
                    })
                });
            }
            else if (drawState.drawType.geometry === "Polygon" || drawState.drawType.geometry === "MultiPolygon") {
                style = new Style({
                    stroke: new Stroke({
                        color: drawState.colorContour,
                        width: drawState.strokeWidth
                    }),
                    fill: new Fill({
                        color: drawState.color
                    })
                });
            }
            else if (drawState.drawType.geometry === "Circle") {
                style = new Style({
                    stroke: new Stroke({
                        color: drawState.colorContour,
                        width: drawState.strokeWidth
                    }),
                    fill: new Fill({
                        color: drawState.color
                    }),
                    circleRadius: drawState.circleRadius,
                    circleOuterRadius: drawState.circleOuterRadius,
                    colorContour: drawState.colorContour,
                    outerColorContour: drawState.outerColorContour
                });
            }
            else {
                console.warn("Geometry type not implemented: " + drawState.drawType.geometry);
                style = new Style();
            }

            return style.clone();
        });

        features = checkIsVisibleSetting(features);

        features.forEach(feature => {
            if (isObject(feature.get("attributes"))) {
                Object.keys(feature.get("attributes")).forEach(key => {
                    gfiAttributes[key] = key;
                });
            }

            if (vectorLayer.getStyleFunction()(feature) !== undefined) {
                feature.setStyle(vectorLayer.getStyleFunction()(feature));
            }

            if (feature.get("isGeoCircle")) {
                const circleCenter = feature.get("geoCircleCenter").split(",").map(parseFloat),
                    circleRadius = parseFloat(feature.get("geoCircleRadius"));

                feature.setGeometry(new Circle(circleCenter, circleRadius));
            }

            feature.set("source", fileName);
            vectorLayer.getSource().addFeature(feature);
        });

        if (!vectorLayer.get("gfiAttributes")) {
            vectorLayer.set("gfiAttributes", gfiAttributes);
        }

        alertingMessage = {
            category: i18next.t("common:modules.alerting.categories.info"),
            content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: fileName})
        };

        dispatch("Alerting/addSingleAlert", alertingMessage, {root: true});
        dispatch("addImportedFilename", fileName);

        if (state.enableZoomToExtend && features.length) {
            dispatch("setFeatureExtents", {features: features, fileName: fileName});
        }
    },
    /**
     * Adds the name of a successfully imported file to list of imported filenames
     * @param {String} fileName name of the file
     * @returns {void}
     */
    addImportedFilename: ({state, commit}, fileName) => {
        const fileNames = [... state.importedFileNames];

        fileNames.push(fileName);
        commit("setImportedFileNames", fileNames);
    }
};
