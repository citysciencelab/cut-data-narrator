import {isRule} from "../utils/isRule.js";
import {GeoJSON} from "ol/format.js";
import {
    Polygon
} from "ol/geom";
import FilterConfigConverter from "../utils/filterConfigConverter.js";
import isObject from "../../../../utils/isObject.js";

export default {
    /**
     * Converts the current config to a new version if the current config is of an older version.
     * @param {Object} context the context Vue instance
     * @param {Object} payload the payload Vue instance
     * @param {Object} payload.snippetInfos an object with key value pairs as attrName and text content
     * @returns {void}
     */
    convertConfig: (context, {snippetInfos}) => {
        const converter = new FilterConfigConverter(context.state);

        if (!converter.isOldConfig()) {
            return;
        }
        if (converter.checkboxClassicExists()) {
            context.commit("setActive", true);
        }
        context.commit("setSaveTo", converter.getSaveTo());
        context.commit("setLayerSelectorVisible", converter.getLayerSelectorVisible());
        context.commit("setLayers", converter.getLayers(snippetInfos));
    },
    /**
     * Sets the rulesOfFilters array with the given payload.
     * @param {Object} context the context Vue instance
     * @param {Object} payload the payload
     * @param {Oject[]} payload.rulesOfFilters the array of rules for each filter
     * @returns {void}
     */
    setRulesArray: (context, {rulesOfFilters}) => {
        if (!Array.isArray(rulesOfFilters)) {
            return;
        }

        context.commit("setRulesOfFilters", {
            rulesOfFilters
        });
    },
    /**
     * Update rules depending on given rule.
     * @param {Object} context the context Vue instance
     * @param {Object} payload the payload Vue instance
     * @param {Number} payload.filterId the filterId to match
     * @param {Number} payload.snippetId the snippetId to change the rules for
     * @param {Object|Boolean} payload.rule the rule - can be false to reset the rule for given snippetId
     * @returns {void}
     */
    updateRules: (context, {filterId, snippetId, rule}) => {
        if (typeof filterId !== "number" || typeof snippetId !== "number") {
            return;
        }
        let rules;

        if (!Array.isArray(context.state.rulesOfFilters[filterId])) {
            context.commit("addSpotForRule", {
                filterId
            });
            rules = [];
        }
        else {
            try {
                rules = JSON.parse(JSON.stringify(context.state.rulesOfFilters[filterId]));
            }
            catch (error) {
                console.warn("Cannot parse rules in action updateRules", error);
                return;
            }
        }

        rules[snippetId] = rule;
        context.commit("updateRules", {
            filterId,
            rules
        });
    },
    /**
     * Delete all rules (set them to false).
     * @param {Object} context the context Vue instance
     * @param {Object} payload the payload Vue instance
     * @param {Number} payload.filterId the filterId to delete rules for
     * @returns {void}
     */
    deleteAllRules: (context, {filterId}) => {
        if (typeof filterId !== "number") {
            return;
        }
        let rules;

        try {
            rules = JSON.parse(JSON.stringify(context.state.rulesOfFilters[filterId]));
        }
        catch (error) {
            console.warn("Cannot parse rules in action updateRules", error);
            return;
        }

        rules.forEach((rule, idx) => {
            if (isRule(rule) && rule?.fixed) {
                return;
            }
            rules[idx] = false;
        });
        context.commit("updateRules", {
            filterId,
            rules
        });
    },
    /**
     * Updates the hits for given filterId.
     * @param {Object} context the context Vue instance
     * @param {Object} payload the payload Vue instance
     * @param {Number} payload.filterId the filterId to change the hits for
     * @param {Number} payload.hits the hits
     * @returns {void}
     */
    updateFilterHits: (context, {filterId, hits}) => {
        if (typeof filterId !== "number") {
            return;
        }
        context.commit("updateFilterHits", {
            filterId,
            hits
        });
    },
    /**
     * Serialize the state (includes rules, filterHits, selectedAccordions).
     * @param {Object} context the context Vue instance
     * @returns {void}
     */
    serializeState: (context) => {
        const rulesOfFilters = context.state.rulesOfFilters,
            selectedAccordions = context.state.selectedAccordions,
            geometrySelectorOptions = context.state.geometrySelectorOptions,
            geometryFeature = getGeometryFeature(context.state.geometryFeature, geometrySelectorOptions.invertGeometry),
            result = {
                rulesOfFilters,
                selectedAccordions,
                geometryFeature,
                geometrySelectorOptions
            };
        let resultString = "";

        try {
            resultString = JSON.stringify(result);
        }
        catch (error) {
            resultString = "";
        }
        context.commit("setSerializedString", {
            serializiedString: resultString
        });
    },
    /**
     * Deserialize the state.
     * @param {Object} context the context Vue instance
     * @param {Object} payload The payload
     * @param {Object[]} payload.rulesOfFilters The rules of the filters
     * @param {Object[]} payload.selectedAccordions The selected accordions
     * @return {void}
     */
    deserializeState: (context, payload) => {
        const rulesOfFilters = payload?.rulesOfFilters,
            selectedAccordions = payload?.selectedAccordions;
        let rulesOfFiltersCopy;

        if (Array.isArray(rulesOfFilters) && Array.isArray(selectedAccordions)) {
            rulesOfFiltersCopy = JSON.parse(JSON.stringify(payload.rulesOfFilters));

            rulesOfFilters.forEach((ruleOfFilter, idx) => {
                if (ruleOfFilter === null) {
                    rulesOfFiltersCopy[idx] = undefined;
                }
            });
            context.dispatch("setRulesArray", {rulesOfFilters: rulesOfFiltersCopy});
            context.commit("setSelectedAccordions", selectedAccordions);
            context.dispatch("setGeometryFilterByFeature", {jsonFeature: payload?.geometryFeature, invert: payload?.geometrySelectorOptions?.invertGeometry});
            context.commit("setGeometrySelectorOptions", payload?.geometrySelectorOptions);
            context.commit("setActive", true);
        }
    },
    /**
     * Sets the geometryFilter by given feature.
     * @param {Object} context the context Vue instance.
     * @param {Object} payload The payload.
     * @param {Object} payload.jsonFeature The feature as json.
     * @param {Object} payload.invert True if geometry should be inverted.
     * @returns {void}
     */
    setGeometryFilterByFeature (context, {jsonFeature, invert}) {
        if (!jsonFeature) {
            return;
        }
        let feature;

        try {
            feature = new GeoJSON().readFeature(jsonFeature);
        }
        catch (error) {
            context.dispatch("Alerting/addSingleAlert",
                i18next.t("common:modules.tools.filter.upload.geometryParseError"),
                {root: true}
            );
            return;
        }
        const cleanGeometryFromFeature = feature.getGeometry(),
            geometryWithInvert = new Polygon([
                [
                    [-1877994.66, 3932281.56],
                    [-1877994.66, 9494203.2],
                    [804418.76, 9494203.2],
                    [804418.76, 3932281.56],
                    [-1877994.66, 3932281.56]
                ],
                cleanGeometryFromFeature.getCoordinates()[0]
            ]);

        if (invert && isObject(feature) && typeof feature.setGeometry === "function") {
            feature.setGeometry(geometryWithInvert);
        }
        context.commit("setGeometryFeature", feature);
        context.commit("setFilterGeometry", cleanGeometryFromFeature);
    }
};
/**
 * Gets the feature as GeoJSON parsed.
 * @param {ol/Feature} feature The ol feature.
 * @param {Boolean} invert True if feature has inverted geometry.
 * @returns {Object} The JSON object.
 */
function getGeometryFeature (feature, invert) {
    if (typeof feature?.getGeometry !== "function") {
        return {};
    }

    const coordinates = feature.getGeometry().getCoordinates()[1],
        geometryFeature = feature.clone();

    if (invert) {
        geometryFeature.setGeometry(new Polygon([
            coordinates
        ]));
    }
    return JSON.parse(new GeoJSON().writeFeature(geometryFeature));
}
