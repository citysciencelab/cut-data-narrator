import axios from "axios";
import handleAxiosResponse from "../../../../utils/handleAxiosResponse";
import getProxyUrl from "../../../../utils/getProxyUrl";

/**
 * Requests the possible properties of a feature and further values;
 * for more {@see FeatureProperty}.
 *
 * @param {TransactionLayer} layer Layer to request information about the possible properties from.
 * @param {Boolean} useProxy Whether a proxy should be used for requests. Deprecated in v3.0.0.
 * @returns {Promise<FeatureProperty[]>} If the request is successful, an array of prepared feature properties.
 */
export default function (layer, useProxy) {
    const baseUrl = `${layer.url}?SERVICE=WFS&REQUEST=DescribeFeatureType&VERSION=${layer.version}&TYPENAME=${layer.featureType}`,
        url = useProxy ? getProxyUrl(baseUrl) : baseUrl;

    return axios
        .get(url, {withCredentials: layer.isSecured})
        .then(response => handleAxiosResponse(response, "wfsTransaction/featureProperties"))
        .then(data => parseDescribeFeatureTypeResponse(data, layer.featureType))
        .catch(error => console.error("An error occurred while fetching information about the featureTypes of the service.", error));
}

/**
 * Parses the response of a DescribeFeatureType request
 * and prepares its values for later use as an input value for the user.
 *
 * @param {String} responseData XML response data
 * @param {String} featureType Name of the feature type of the service.
 * @returns {FeatureProperty[]} If an <element> with a name of the featureType is present, an array of prepared feature properties; else an empty Array.
 */
function parseDescribeFeatureTypeResponse (responseData, featureType) {
    const rootElement = Object.values(new DOMParser().parseFromString(responseData, "application/xml").getElementsByTagName("element"))
        .find(({attributes}) => Object.values(attributes).find(({localName}) => localName === "name").value === featureType);

    if (rootElement) {
        return Object.values(rootElement.getElementsByTagName("element")).map(el => Object.values(el.attributes).reduce((obj, att) => {
            if (att.localName === "minOccurs") {
                obj.required = att.value === "1";
            }
            else if (att.localName === "type") {
                obj.type = att.value.trim().startsWith("gml") ? "geometry" : att.value;
            }
            else if (att.localName === "name") {
                obj.label = obj.key = att.value;
            }
            return obj;
        }, {
            label: "",
            key: "",
            value: null,
            type: "string",
            required: false
        }));
    }
    return [];
}

module.exports = {parseDescribeFeatureTypeResponse};
