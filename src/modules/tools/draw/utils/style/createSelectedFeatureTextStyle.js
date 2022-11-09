import {Fill, Text, Stroke} from "ol/style.js";

/**
 * Creates and returns a feature text style for selected feature.
 * @param {ol/Feature} feature The feature.
 * @returns {module:ol/style/Style/Text} text style for features.
 */
export function createSelectedFeatureTextStyle (feature) {
    return new Text({
        font: "32px bold sans-serif",
        fill: new Fill({
            color: "#93f105"
        }),
        stroke: new Stroke({
            width: 4,
            color: "#2752d9"
        }),
        text: "*",
        offsetX: 10,
        offsetY: -5,
        zIndex: 99,
        placement: feature.getGeometry()?.getType() === "Point" ? "point" : "line"
    });
}
