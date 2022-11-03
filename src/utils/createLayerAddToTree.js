import {rawLayerList} from "@masterportal/masterportalapi/src";


/**
 * Creates a layer containing the given features and shows it in menu tree.
 *
 * @param {String} layerId contains the id of the layer, the features are got from
 * @param {Array} features contains the features to add to new layer
 * @param {String} treeType the treeType
 * @param {Object} thfConfig content of config.json's property 'treeHighlightedFeatures'
 * @returns {void}
 */
function createLayerAddToTree (layerId, features, treeType, thfConfig = {}) {
    if (layerId) {
        const layerNameKey = thfConfig.layerName ? thfConfig.layerName : "common:tree.selectedFeatures",
            originalLayer = getLayer(layerId);

        if (originalLayer) {
            const originalLayerName = originalLayer.get("name").replace(i18next.t(layerNameKey), "").trim(),
                layerName = i18next.t(layerNameKey) + " " + originalLayerName,
                id = layerId.indexOf(originalLayerName) === -1 ? layerId + "_" + originalLayerName : layerId,
                attributes = setAttributes(originalLayer, id, layerName, layerNameKey, treeType);
            let highlightLayer = Radio.request("ModelList", "getModelByAttributes", {"id": id}),
                layerSource = null;

            if (!highlightLayer) {
                highlightLayer = addLayerModel(attributes, id);
            }
            setStyle(highlightLayer, attributes.styleId);
            layerSource = highlightLayer.get("layer").getSource();
            layerSource.getFeatures().forEach(feature => layerSource.removeFeature(feature));
            layerSource.addFeatures(features);
            highlightLayer.setIsSelected(true);
            refreshTree(treeType);
        }
        else {
            console.warn("Layer with id ", layerId, " not found, layer with features was not created!");
        }
    }
}

/**
 * Returns the layer with the given id.
 * @param {String} id of the layer
 * @returns {Object} the layer with the given id
 */
function getLayer (id) {
    let layer = Radio.request("ModelList", "getModelByAttributes", {id: id});

    if (!layer) {
        const rawLayer = rawLayerList.getLayerWhere({id: id});

        layer = addLayerModel(rawLayer, id);
    }
    return layer;
}

/**
 * Adds the layer-model to list of layers.
 * @param {Object} attributes  of the layer
 * @param {String} id of the layer
 * @returns {Object} the created layer
 */
function addLayerModel (attributes, id) {
    Radio.trigger("Parser", "addItem", attributes);
    Radio.trigger("ModelList", "addModelsByAttributes", {id: id});
    return Radio.request("ModelList", "getModelByAttributes", {id: id});
}

/**
 * Refreshes the menu tree.
 * @param {String} treeType the treeType
 * @returns {void}
 */
function refreshTree (treeType) {
    if (treeType === "light") {
        Radio.trigger("ModelList", "refreshLightTree");
    }
}

/**
 * Copies the attributesof the given layer and adapts them.
 * @param {Object} layer to copy attributes of
 *  @param {String} id of the layer
 * @param {String} layerName name of the layer
 * @param {String} layerNameKey i18n-key of the name of the layer
 * @param {String} treeType the treeType
 * @returns {Object} the adapted attributes
 */
function setAttributes (layer, id, layerName, layerNameKey, treeType) {
    const attributes = {...layer.attributes};

    // initial set selected and visibility to false, else source is updated before features are added
    attributes.isSelected = false;
    attributes.visibility = false;
    attributes.id = id;
    attributes.typ = "VectorBase";
    attributes.alwaysOnTop = true;
    attributes.name = layerName;
    attributes.selectionIDX = 1000;
    attributes.parentId = treeType === "custom" || treeType === "default" ? "SelectedLayer" : "tree";
    attributes.i18nextTranslate = (setter) => {
        if (typeof setter === "function" && i18next.exists(layerNameKey)) {
            setter("name", i18next.t(layerNameKey) + " " + attributes.name);
        }
    };
    return attributes;
}


/**
 * Sets the style at the layer.
 * @param {Object} layer to set the style at
 * @param {String} styleId styleId of the style-model
 * @returns {void}
 */
function setStyle (layer, styleId) {
    const styleModel = Radio.request("StyleList", "returnModelById", styleId);

    if (styleModel !== undefined) {
        layer.get("layer").setStyle((feature) => {
            return styleModel.createStyle(feature, false);
        });
    }
}

module.exports = {
    createLayerAddToTree
};

