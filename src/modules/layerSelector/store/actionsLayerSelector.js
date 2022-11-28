import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import store from "../../../app-store";
import isMobile from "../../../utils/isMobile";

/**
 * @const {String} configPaths an array of possible config locations. First one found will be used
 * @const {Object} actions vue actions
 */
const configPaths = [
        "configJs.layerSelector"
    ],
    actions = {
        /**
         * Sets the config-params into state.
         * @param {Object} context the context Vue instance
         * @returns {Boolean} false, if config does not contain the layerselector
         */
        initialize: context => {
            const cfg = fetchFirstModuleConfig(context, configPaths, "layerSelector");

            context.dispatch("fillConfig");

            context.dispatch("receiveEvents");

            return cfg;
        },

        /**
         * fills configs with the default values
         * @param {Object} context the context
         * @returns {void}
         */
        fillConfig: function ({state}) {
            const events = state.events,
                defaultValues = state.default;

            for (const object of events) {
                if (object.event) {
                    if (object.showLayerId === undefined) {
                        object.showLayerId = defaultValues.showLayerId;
                    }
                    if (object.deselectPreviousLayers === undefined) {
                        object.deselectPreviousLayers = defaultValues.deselectPreviousLayers;
                    }
                    if (object.layerIds === undefined) {
                        object.layerIds = defaultValues.layerIds;
                    }
                    if (object.openFolderForLayerIds === undefined) {
                        object.openFolderForLayerIds = defaultValues.openFolderForLayerIds;
                    }
                }
            }
        },

        /**
         * create configured watches
         * @param {Object} context the context
         * @returns {void}
         */
        receiveEvents: function ({state, dispatch}) {
            const events = state.events;

            for (const evt of events) {
                const event = state.eventMap[evt.event];

                store.watch((mainState, mainGetters) => mainGetters[event], () => {
                    dispatch("handleEvent", {cfg: evt});
                });
            }
        },

        /**
         * deselects already selected layers
         * @param {Object} context the context
         * @param {String} treeType type of used layer tree
         * @returns {void}
         */
        deselectSelectedLayers: function (context, treeType) {
            let selectedLayerList;

            if (treeType === "custom") {
                selectedLayerList = Radio.request("ModelList", "getModelsByAttributes", {isSelected: true});
                for (const selectedLayer of selectedLayerList) {
                    Radio.trigger("ModelList", "setModelAttributesById", selectedLayer.id, {isSelected: false});
                }
            }
            else {
                console.warn("function is supported in treeType custom only");
            }
        },

        /**
         * handles the event if it was executed
         * @param {Object} context the context
         * @param {Object} param.cfg the configured object for this case
         * @returns {void}
         */
        handleEvent: async function ({dispatch, rootGetters}, {cfg}) {
            const layerIds = cfg.layerIds,
                showLayerId = cfg.showLayerId,
                deselectPreviousLayers = cfg.deselectPreviousLayers,
                openFolderForLayerIds = cfg.openFolderForLayerIds,
                extent = cfg.extent,
                minResolution = cfg.minResolution,
                treeType = rootGetters.treeType;

            // remove current selected
            if (deselectPreviousLayers === "always") {
                await dispatch("deselectSelectedLayers", treeType);
            }

            // select and add layer
            await dispatch("handleEventAddLayers", {layerIds: layerIds, treeType: treeType});

            // show layer
            if (typeof showLayerId === "string") {
                await dispatch("handleEventShowLayers", {showLayerId: showLayerId, isMobileMode: isMobile()});
            }

            // opens the corresponding folders for the configured layers
            if (!isMobile()) {
                await dispatch("handleEventOpenFolder", openFolderForLayerIds);
            }

            // zoom to configured extent
            if (extent instanceof Array && extent.length === 4) {
                await dispatch("handleEventExtend", {extent: extent, minResolution: minResolution});
            }
        },

        /**
         * selects layers in the tree and adds them to the map
         * @param {Object} context the context
         * @param {String[]} param.layerIds layer ids
         * @param {String} param.treeType type of the layertree
         * @returns {void}
         */
        handleEventAddLayers: function (context, {layerIds, treeType}) {
            for (const layerId of layerIds) {
                if (treeType === "custom") {
                    Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
                    Radio.trigger("ModelList", "setModelAttributesById", layerId, {isSelected: true});
                }
                else {
                    console.warn("function is supported in treeType custom only");
                }
            }
        },

        /**
         * activates and show the given layer in the layer tree
         * @param {Object} context the context
         * @param {String} showLayerId the layer id to show in the tree
         * @returns {void}
         */
        handleEventShowLayers: function (context, {showLayerId, isMobileMode}) {
            if (!isMobileMode) {
                Radio.trigger("ModelList", "showModelInTree", showLayerId);
            }
            else {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: showLayerId});
                Radio.trigger("ModelList", "setModelAttributesById", showLayerId, {isSelected: true});
            }
        },

        /**
         * opens configured layer folders
         * @param {Object} context the context
         * @param {String[]} openFolderForLayerIds configured layer ids
         * @returns {void}
         */
        handleEventOpenFolder: function (context, openFolderForLayerIds) {
            for (const layerId of openFolderForLayerIds) {
                const lightModel = Radio.request("Parser", "getItemByAttributes", {id: layerId});

                if (lightModel && lightModel.parentId) {
                    Radio.trigger("ModelList", "addAndExpandModelsRecursive", lightModel.parentId);
                }
            }
        },

        /**
         * zooms to the given extent with the given resolution
         * @param {Object} context the context
         * @param {Integer[]} param.extent the extent to zoom to
         * @param {Number} param.minResolution the minimal resolution to zoom to
         * @returns{void}
         */
        handleEventExtend: function ({dispatch}, {extent, minResolution}) {
            if (typeof minResolution === "number") {
                dispatch("zoomToExtent", {extent: extent, options: {minResolution: minResolution}}, {root: true});
            }
            else {
                dispatch("zoomToExtent", {extent: extent}, {root: true});
            }
        }
    };

export default actions;
