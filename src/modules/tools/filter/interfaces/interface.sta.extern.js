import isObject from "../../../../utils/isObject.js";
import {getLayerByLayerId} from "../utils/openlayerFunctions.js";
import {fetchAllStaProperties, getUniqueValuesFromFetchedFeatures} from "../utils/fetchAllStaProperties.js";

/**
 * InterfaceStaExtern is the filter interface for STA services
 * @class
 */
export default class InterfaceStaExtern {
    /**
     * @constructor
     */
    constructor () {
        this.allFetchedProperties = {};
        this.observationType = {};
        this.waitingListForFeatures = {};

        this.listOfResourceTypes = {
            "@Datastreams.0.Observations.0.result": {
                "http://defs.opengis.net/elda-common/ogc-def/resource?uri=http://www.opengis.net/def/ogc-om/OM_CountObservation": "number",
                "http://defs.opengis.net/elda-common/ogc-def/resource?uri=http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_CategoryObservation": "string"
            }
        };
    }

    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Object} service The service to call, identical to filterQuestion.service.
     * @param {Function} onsuccess A function({attrName: Type}).
     * @param {Function} onerror A function(errorMsg).
     * @param {Number} filterId The filter id.
     * @returns {void}
     */
    getAttrTypes (service, onsuccess, onerror, filterId) {
        this.getUniqueValues(service, undefined, () => {
            onsuccess(this.getAttrTypesByAllFetchedProperties(this.allFetchedProperties[filterId], this.observationType[filterId], this.listOfResourceTypes));
        }, onerror, filterId);
    }

    /**
     * Returns the min and max values of the given service and attrName.
     * @param {Object} service The service to call, identical to filterQuestion.service.
     * @param {String} attrName The attribute to receive the min and max value from.
     * @param {Function} onsuccess A function({min, max}) with the received values.
     * @param {Function} onerror A function(errorMsg).
     * @param {Boolean} minOnly If only min is of interest.
     * @param {Boolean} maxOnly If only max is of interest.
     * @param {Number} filterId The filter id.
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly, maxOnly, filterId) {
        this.getUniqueValues(service, attrName, uniqueValue => {
            onsuccess(this.getMinMaxFromUniqueValue(uniqueValue, minOnly, maxOnly));
        }, onerror, filterId);
    }

    /**
     * Gets a list of unique values (unsorted) of the given service and attrName.
     * @param {Object} service The service to call, identical to filterQuestion.service.
     * @param {String} attrName The attribute to receive unique values from.
     * @param {Function} onsuccess A function([]) with the received unique values as Array of values.
     * @param {Function} onerror A function(errorMsg).
     * @param {Number} filterId The filter id.
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror, filterId) {
        if (isObject(this.allFetchedProperties[filterId])) {
            if (typeof onsuccess === "function") {
                const uniqueValue = getUniqueValuesFromFetchedFeatures(this.allFetchedProperties[filterId], attrName);

                onsuccess(Array.isArray(uniqueValue) ? uniqueValue : []);
            }
            return;
        }
        if (!Object.prototype.hasOwnProperty.call(this.allFetchedProperties, filterId)) {
            this.allFetchedProperties[filterId] = false;
        }

        if (this.allFetchedProperties[filterId] === false) {
            this.allFetchedProperties[filterId] = true;
            const layerModel = getLayerByLayerId(service?.layerId),
                baseUrl = layerModel.get("url"),
                version = layerModel.get("version"),
                urlParameter = layerModel.get("urlParameter"),
                rootNode = urlParameter?.root,
                url = layerModel.buildSensorThingsUrl(baseUrl, version, urlParameter);

            fetchAllStaProperties(url, rootNode, (allProperties, observationType) => {
                this.allFetchedProperties[filterId] = allProperties;
                this.observationType[filterId] = observationType;
                while (this.waitingListForFeatures[filterId].length) {
                    this.waitingListForFeatures[filterId].shift()();
                }
            }, onerror);
        }

        if (!Array.isArray(this.waitingListForFeatures[filterId])) {
            this.waitingListForFeatures[filterId] = [];
        }
        this.waitingListForFeatures[filterId].push(() => {
            if (typeof onsuccess === "function") {
                const uniqueValue = getUniqueValuesFromFetchedFeatures(this.allFetchedProperties[filterId], attrName);

                onsuccess(Array.isArray(uniqueValue) ? uniqueValue : []);
            }
        });
    }

    /**
     * Cancels the current request.
     * @pre A request is sent to the server and the data is still loading.
     * @post The request is terminated and the server response is aborted.
     * @param {Number} filterId The id of the filter that should stop.
     * @param {Function} onsuccess A function to call when finished.
     * @param {Function} onerror A function to call on error.
     * @returns {void}
     */
    stop (filterId, onsuccess, onerror) {
        onerror(new Error("tbd: InterfaceStaExtern stop not implemented yet"));
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion An object with filterId, service and rules.
     * @param {Function} onsuccess A function(filterAnswer).
     * @param {Function} onerror A function(errorMsg).
     * @param {Function|Boolean} [axiosMock=false] false to use axios, an object with get function(url, {params}) if mock is needed.
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror, axiosMock = false) {
        if (axiosMock) {
            onerror(new Error("tbd: InterfaceStaExtern filter not implemented yet for testing"));
        }
        else {
            onerror(new Error("tbd: InterfaceStaExtern filter not implemented yet"));
        }
    }

    /**
     * Gets the min-max object of given uniqueValue.
     * @param {String[]|Number[]} uniqueValue The list of unique values.
     * @param {Boolean} minOnly If only min is of interest.
     * @param {Boolean} maxOnly If only max is of interest.
     * @returns {Object} An object with min and max values.
     */
    getMinMaxFromUniqueValue (uniqueValue, minOnly, maxOnly) {
        const sortedValues = [],
            result = {};

        if (!Array.isArray(uniqueValue)) {
            return {};
        }

        uniqueValue.forEach(value => {
            sortedValues.push(parseInt(value, 10));
        });
        sortedValues.sort((a, b) => {
            if (a === Infinity) {
                return 1;
            }
            else if (isNaN(a)) {
                return -1;
            }
            return a - b;
        });

        if (minOnly && !maxOnly) {
            result.min = sortedValues[0];
        }
        else if (maxOnly && !minOnly) {
            result.max = sortedValues[sortedValues.length - 1];
        }
        else {
            result.min = sortedValues[0];
            result.max = sortedValues[sortedValues.length - 1];
        }

        return result;
    }

    /**
     * Gets the attr types by all fetched properties.
     * @param {Object} properties The properties.
     * @param {String} observationType The namespace of the observation type.
     * @param {Object} listOfResourceTypes An object of attrNames and their namespace to js type convertion.
     * @returns {Object} Key is attrName value is type.
     */
    getAttrTypesByAllFetchedProperties (properties, observationType, listOfResourceTypes) {
        if (!isObject(properties)) {
            return {};
        }
        const result = {};

        Object.entries(properties).forEach(([attrName, values]) => {
            if (Array.isArray(values) && values.length) {
                if (Object.prototype.hasOwnProperty.call(listOfResourceTypes, attrName) && Object.prototype.hasOwnProperty.call(listOfResourceTypes[attrName], observationType)) {
                    result[attrName] = listOfResourceTypes[attrName][observationType];
                }
                else {
                    result[attrName] = typeof values[0];
                }
            }
        });

        return result;
    }
}
