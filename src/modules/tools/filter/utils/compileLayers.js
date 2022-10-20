import isObject from "../../../../utils/isObject";
import FilterApi from "../interfaces/filter.api.js";

/**
 * Clones, checks and modifies the given original layers to match the needs of Filter.
 * @param {Object[]} originalLayerGroups the configured groups
 * @param {Object[]|String[]} originalLayers the configured layers
 * @returns {Object[]} resulting layers to use in Filter
 */
function compileLayers (originalLayerGroups, originalLayers) {
    let nextFilterId = 0;
    const groups = [],
        layers = removeInvalidLayers(JSON.parse(JSON.stringify(originalLayers)));

    originalLayerGroups.forEach(group => {
        const layersOfGroup = removeInvalidLayers(JSON.parse(JSON.stringify(group.layers)));

        convertStringLayersIntoObjects(layersOfGroup);
        addFilterIds(layersOfGroup, {id: nextFilterId, get: () => nextFilterId, inc: () => nextFilterId++});
        addSnippetArrayIfMissing(layersOfGroup);
        addApi(layersOfGroup);
        groups.push({
            title: group.title,
            layers: layersOfGroup
        });
        nextFilterId = layersOfGroup[layersOfGroup.length - 1].filterId + 1;
    });

    convertStringLayersIntoObjects(layers);
    addFilterIds(layers, {id: nextFilterId, get: () => nextFilterId, inc: () => nextFilterId++});
    addSnippetArrayIfMissing(layers);
    addApi(layers);

    return {groups, layers};
}

/**
 * Removes all non object and non string layers from the given array. Returns the result.
 * @param {*[]} layers a list of layers with a potential object string mix
 * @returns {Object[]|String[]} a list of layers with a object and string mix
 */
function removeInvalidLayers (layers) {
    if (!Array.isArray(layers)) {
        return [];
    }
    const result = [];

    layers.forEach(layer => {
        if (!isObject(layer) && typeof layer !== "string") {
            return;
        }
        result.push(layer);
    });

    return result;
}

/**
 * Converts all string representations of layers into objects.
 * @param {Object[]|String[]} layers a list of layers a with potential object string mix
 * @returns {void}
 */
function convertStringLayersIntoObjects (layers) {
    layers.forEach((layer, idx) => {
        if (typeof layer === "string") {
            layers[idx] = {
                layerId: layer
            };
        }
    });
}

/**
 * Adds a unique filterId to each given layer.
 * @param {Object[]} layers the list of layers
 * @param {Object} [nextFilterId={}] getter, increment and instance for next filter id reference
 * @returns {void}
 */
function addFilterIds (layers, nextFilterId = {}) {
    if (typeof nextFilterId.id !== "number") {
        nextFilterId.id = 0;
        nextFilterId.inc = () => {
            nextFilterId.id++;
        };
        nextFilterId.get = () => {
            return nextFilterId.id;
        };
    }

    layers.forEach(layer => {
        layer.filterId = nextFilterId.get();
        nextFilterId.inc();
    });
}

/**
 * Adds a snippet array for the layer if missing.
 * @param {Object[]} layers the list of layers
 * @returns {void}
 */
function addSnippetArrayIfMissing (layers) {
    layers.forEach(layer => {
        if (!Array.isArray(layer.snippets)) {
            layer.snippets = [];
        }
    });
}

/**
 * Initializes a filter api for every layer.
 * @param {Object[]} layers the list of layers
 * @returns {void}
 */
function addApi (layers) {
    layers.forEach(layer => {
        layer.api = new FilterApi(layer.filterId);
    });
}

/**
 * Setter for layerConfigsAssoc - use getter to grap layer by filterId.
 * @param {Object[]} layers the layers to build the assoc from
 * @param {Object} assoc the object with filterId as key and the layer as value for recursion
 * @returns {Object} an object with filterId as key and the layer as value
 */
function createLayerConfigsAssoc (layers, assoc = {}) {
    layers.forEach(layer => {
        assoc[layer.filterId] = layer;
    });
    return assoc;
}

export {
    compileLayers,
    removeInvalidLayers,
    convertStringLayersIntoObjects,
    addFilterIds,
    addSnippetArrayIfMissing,
    createLayerConfigsAssoc
};
