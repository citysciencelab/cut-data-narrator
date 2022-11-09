import {WKT} from "ol/format.js";
import isObject from "../../../../utils/isObject";
import Feature from "ol/Feature";

/**
 * Sets the geometry of each feature as WKT and epsg to its attributes.
 * @param {ol/Feature[]} features - An array of features.
 * @param {String} code The EPSG-Code in which the features are coded.
 * @returns {ol/Feature[]|Boolean} The features incl. the wkt geometries. False if the given parameter is not an array.
 */
export function setCsvAttributes (features, code) {
    if (!Array.isArray(features)) {
        return false;
    }
    const wktParser = new WKT();

    features.forEach(feature => {
        if (feature instanceof Feature) {
            const wktGeometry = wktParser.writeGeometry(feature.getGeometry());

            if (!isObject(feature.get("attributes"))) {
                feature.set("attributes", {});
            }
            feature.get("attributes").geometry = wktGeometry;

            if (feature.get("isGeoCircle")) {
                feature.get("attributes").epsg = "EPSG:4326";
            }
            else {
                feature.get("attributes").epsg = code;
            }
        }
    });

    return features;
}

