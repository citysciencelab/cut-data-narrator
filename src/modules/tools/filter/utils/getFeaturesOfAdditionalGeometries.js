import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getFeatureGET} from "../../../../api/wfs/getFeature";
import {WFS} from "ol/format.js";

/**
 * Gets the features of the additional geometries by the given layer id.
 * @param {Object[]} additionalGeometries - The additional geometries.
 * @param {String} additionalGeometries[].layerId - The id of the layer.
 * @returns {void}
 */
export async function getFeaturesOfAdditionalGeometries (additionalGeometries) {
    if (Array.isArray(additionalGeometries)) {
        const wfsReader = new WFS();

        for (const additionalGeometry of additionalGeometries) {
            const rawLayer = rawLayerList.getLayerWhere({id: additionalGeometry.layerId}),
                features = await getFeatureGET(rawLayer.url, {version: rawLayer.version, featureType: rawLayer.featureType});

            additionalGeometry.features = wfsReader.readFeatures(features);
        }
    }
}
