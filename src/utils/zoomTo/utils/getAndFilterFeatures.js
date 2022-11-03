import axios from "axios";
import {rawLayerList} from "@masterportal/masterportalapi/src";
import {WFS} from "ol/format";
import handleAxiosResponse from "../../handleAxiosResponse";

/**
 * Retrieves features from the defined layer.
 *
 * @param {string} layerId Id of the layer to retrieve the features from.
 * @param {string} property Property to filter.
 * @param {string[]} values Array of allowed values.
 * @returns {Promise<Feature[]>} If resolved, returns an array of features.
 */
export default function (layerId, property, values) {
    const layer = rawLayerList.getLayerWhere({id: layerId});

    if (layer === null) {
        return new Promise((_, reject) => reject(`The layer with the id ${layerId} could not be found.`));
    }

    return axios
        .get(`${layer.url}?service=WFS&version=${layer.version}&request=GetFeature&typeName=${layer.featureType}`)
        .then(response => handleAxiosResponse(response, "utils/zoomTo/actionsZoomTo/zoomToFeatures"))
        .then(data => new WFS().readFeatures(data))
        .then(features => features.filter(feature => {
            if (!feature.getKeys().includes(property)) {
                return false;
            }
            return values.includes(feature.get(property).toUpperCase().trim());
        }));
}
