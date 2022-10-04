import InterfaceStaExtern from "./interface.sta.extern.js";
import InterfaceWfsIntern from "./interface.wfs.intern.js";

/**
 * InterfaceStaIntern is the filter interface for STA filtered by OpenLayers
 * @class
 */
export default class InterfaceStaIntern {
    /**
     * @constructor
     * @param {IntervalRegister} intervalRegister The object to register and unregister intervals with.
     * @param {Function} handlers.getFeaturesByLayerId A function(layerId) to receive the features from ol with - only used for filter function.
     * @param {Function} handlers.isFeatureInMapExtent A function(feature) to check if the feature is in the current map extent.
     * @param {Function} handlers.isFeatureInGeometry A function(feature, geometry) to check if the feature intersects with the given geometry.
     */
    constructor (intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent, isFeatureInGeometry}) {
        this.intervalRegister = intervalRegister;
        this.getFeaturesByLayerId = getFeaturesByLayerId;
        this.isFeatureInMapExtent = isFeatureInMapExtent;
        this.isFeatureInGeometry = isFeatureInGeometry;
        this.interfaceStaExtern = new InterfaceStaExtern(intervalRegister);
        this.interfaceWfsIntern = new InterfaceWfsIntern(intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent, isFeatureInGeometry});
    }

    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Object} service The service to call, identical to filterQuestion.service.
     * @param {Function} onsuccess A function({attrName: Type}[]).
     * @param {Function} onerror A function(errorMsg).
     * @param {Number} filterId The filter id.
     * @returns {void}
     */
    getAttrTypes (service, onsuccess, onerror, filterId) {
        this.interfaceStaExtern.getAttrTypes(service, onsuccess, onerror, filterId);
    }

    /**
     * Returns the min and max values of the given service and attrName.
     * @param {Object} service The service to call, identical to filterQuestion.service.
     * @param {String} attrName The attribute to receive the min and max value from.
     * @param {Function} onsuccess A function({min, max}) with the received values.
     * @param {Function} onerror A function(errorMsg).
     * @param {Boolean} [minOnly=false] If only min is of interest.
     * @param {Boolean} [maxOnly=false] If only max is of interest.
     * @param {Boolean} [isDate=false] If is date - not implemented yet.
     * @param {Object} obj The filterQuestion.
     * @param {Number} obj.filterId The filter id.
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly, maxOnly, isDate, {filterId}) {
        this.interfaceStaExtern.getMinMax(service, attrName, onsuccess, onerror, minOnly, maxOnly, filterId);
    }

    /**
     * Returns a list of unique values (unsorted) of the given service and attrName.
     * @param {Object} service The service to call, identical to filterQuestion.service.
     * @param {String} attrName The attribute to receive unique values from.
     * @param {Function} onsuccess A function([]) with the received unique values as Array of values.
     * @param {Function} onerror A function(errorMsg).
     * @param {Object} obj The obj.
     * @param {Number} obj.filterId The filter id.
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror, {filterId}) {
        this.interfaceStaExtern.getUniqueValues(service, attrName, onsuccess, onerror, filterId);
    }

    /**
     * Cancels the current filtering.
     * @param {Number} filterId The id of the filter that should stop.
     * @param {Function} onsuccess A function to call when finished.
     * @param {Function} onerror A function to call on error.
     * @returns {void}
     */
    stop (filterId, onsuccess, onerror) {
        this.interfaceWfsIntern.stop(filterId, onsuccess, onerror);
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion An object with filterId, service and rules.
     * @param {Function} onsuccess A function(filterAnswer).
     * @param {Function} onerror A function(errorMsg).
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        this.interfaceWfsIntern.filter(filterQuestion, onsuccess, onerror);
    }
}
