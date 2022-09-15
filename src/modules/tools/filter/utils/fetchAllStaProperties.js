import isObject from "../../../../utils/isObject.js";
import {SensorThingsHttp} from "../../../../utils/sensorThingsHttp.js";

/**
 * Calls the sta url and collects all properties of the features.
 * @param {String} url The url to the STA.
 * @param {String} rootNode The root node of the sta call.
 * @param {Function} onsuccess A function(Object[], String) to call on success with the properties and namespace of observation type.
 * @param {Function} onerror A function(Error) to call on error.
 * @param {Function|Boolean} [axiosMock=false] false to use axios, a function that is called with the axios configuration if mock is needed.
 * @returns {void}
 */
function fetchAllStaProperties (url, rootNode, onsuccess, onerror, axiosMock = false) {
    const http = new SensorThingsHttp({
            removeIotLinks: true,
            httpClient: axiosMock,
            rootNode
        }),
        resultAssoc = {},
        result = {};

    http.get(url, data => {
        if (!Array.isArray(data) || !data.length) {
            return;
        }
        const observationType = rootNode === "Datastreams" ? data[0].observationType : data[0].Datastreams[0].observationType;

        data.forEach(entity => {
            const properties = rootNode === "Datastreams" ? entity.properties : entity.Datastreams[0].properties,
                observations = rootNode === "Datastreams" ? entity.Observations : entity.Datastreams[0].Observations;

            Object.entries(properties).forEach(([key, value]) => {
                if (!Object.prototype.hasOwnProperty.call(resultAssoc, key)) {
                    resultAssoc["@Datastreams.0.properties." + key] = {};
                }
                resultAssoc["@Datastreams.0.properties." + key][value] = true;
            });
            if (Array.isArray(observations) && observations.length && isObject(observations[0])) {
                if (!Object.prototype.hasOwnProperty.call(resultAssoc, "@Datastreams.0.Observations.0.result")) {
                    resultAssoc["@Datastreams.0.Observations.0.result"] = {};
                }
                resultAssoc["@Datastreams.0.Observations.0.result"][observations[0].result] = true;
            }
        });
        Object.entries(resultAssoc).forEach(([key, obj]) => {
            result[key] = Object.keys(obj);
        });
        onsuccess(result, observationType);
    }, null, null, onerror);
}

/**
 * Gets the unique values from fetched properties.
 * @param {Object} properties The properies.
 * @param {String} attrName The attr name to look for.
 * @returns {String[]|Number[]} The list of unique values.
 */
function getUniqueValuesFromFetchedFeatures (properties, attrName) {
    if (!isObject(properties) || !Object.prototype.hasOwnProperty.call(properties, attrName)) {
        return [];
    }
    return properties[attrName];
}

export {
    fetchAllStaProperties,
    getUniqueValuesFromFetchedFeatures
};
