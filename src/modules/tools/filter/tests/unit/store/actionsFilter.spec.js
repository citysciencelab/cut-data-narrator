import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsFilter";
import state from "../../../store/stateFilter";

const {
    updateRules,
    deleteAllRules,
    updateFilterHits,
    serializeState,
    setRulesArray,
    deserializeState
} = actions;

describe("tools/filter/store/actionsFilter", () => {
    describe("setRulesArray", () => {
        it("should set the rules array", done => {
            const payload = {
                rulesOfFilters: []
            };

            testAction(setRulesArray, payload, state, {}, [
                {type: "setRulesOfFilters", payload: {
                    rulesOfFilters: payload.rulesOfFilters
                }, commit: true}
            ], {}, done);
        });
    });
    describe("updateRules", () => {
        it("update rules by given rule", done => {
            const payload = {
                filterId: 0,
                snippetId: 0,
                rule: {}
            };

            testAction(updateRules, payload, state, {}, [
                {type: "addSpotForRule", payload: {filterId: payload.filterId}, commit: true},
                {type: "updateRules",
                    payload: {
                        filterId: payload.filterId,
                        rules: [{}]
                    },
                    commit: true
                }
            ], {}, done);
        });
    });
    describe("deleteAllRules", () => {
        it("deletes all rules by given filterId", done => {
            const payload = {
                    filterId: 0
                },
                localState = {
                    rulesOfFilters: [
                        [
                            {},
                            {}
                        ]
                    ]
                };

            testAction(deleteAllRules, payload, localState, {}, [
                {type: "updateRules", payload: {
                    filterId: payload.filterId,
                    rules: [false, false]
                }, commit: true}
            ], {}, done);
        });
    });
    describe("updateFilterHits", () => {
        it("updates the hits for given filterId", done => {
            const payload = {
                filterId: 0,
                hits: 10
            };

            testAction(updateFilterHits, payload, state, {}, [
                {type: "updateFilterHits", payload: {
                    filterId: payload.filterId,
                    hits: payload.hits
                }, commit: true}
            ], {}, done);
        });
    });
    describe("serializeState", () => {
        it("serialize the state", done => {
            const rulesOfFilters = state.rulesOfFilters,
                selectedAccordions = state.selectedAccordions,
                geometryFeature = {},
                geometrySelectorOptions = state.geometrySelectorOptions,
                result = {
                    rulesOfFilters,
                    selectedAccordions,
                    geometryFeature,
                    geometrySelectorOptions
                },
                serializiedString = JSON.stringify(result);

            testAction(serializeState, {}, state, {}, [
                {type: "setSerializedString", payload: {
                    serializiedString
                }, commit: true}
            ], {}, done);
        });
    });
    describe("deserializeState", () => {
        it("deserialize the state", done => {
            const rulesOfFilters = [],
                selectedAccordions = [],
                geometryFeature = {},
                geometrySelectorOptions = {
                    invertGeometry: true
                },
                payload = {
                    rulesOfFilters,
                    selectedAccordions,
                    geometryFeature,
                    geometrySelectorOptions
                };

            testAction(deserializeState, payload, state, {}, [
                {type: "setRulesArray", payload: {rulesOfFilters}, dispatch: true},
                {type: "setSelectedAccordions", payload: selectedAccordions, commit: true},
                {type: "setGeometryFilterByFeature", payload: {jsonFeature: geometryFeature, invert: true}, dispatch: true},
                {type: "setGeometrySelectorOptions", payload: geometrySelectorOptions, commit: true},
                {type: "setActive", payload: true, commit: true}
            ], {}, done);
        });
    });
});
