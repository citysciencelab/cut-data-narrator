import {WKT} from "ol/format.js";
import isObject from "../../../../utils/isObject";
import Feature from "ol/Feature";

/**
 * Sets the geometry of each feature as WKT to its attributes.
 * @param {ol/Feature[]} features - An array of features.
 * @returns {ol/Feature[]|Boolean} The features incl. the wkt geometries. False if the given parameter is not an array.
 */
export function setGeometriesToWkt (features) {
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
        }
    });

    return features;
}

