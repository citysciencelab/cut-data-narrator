import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";

/**
 * Creates a layer containing the given features. If tree in menu shows folders, a new folder is created.
 * The name of the folder and the layer can be defined in config.json's property 'treeHighlightedFeatures'.
 *
 * @param {Array} layerIds contains the ids of the layers, the features are got from
 * @param {Array} features contains the features to add to new layer
 * @param {String} treeType the treeType
 * @param {Object} thfConfig content of config.json's property 'treeHighlightedFeatures'
 * @param {String} callerKey i18n-key of thee caller of this function
 * @returns {void}
 */
function createLayerAddToTree (layerIds, features, treeType, thfConfig = {}, callerKey = "") {
    if (Array.isArray(layerIds)) {
        const layerId = layerIds.join("_"),
            layerNameKey = thfConfig.layerName ? thfConfig.layerName : "common:tree.selectedFeatures",
            layerName = i18next.t(layerNameKey) + " (" + i18next.t(callerKey) + ")",
            originalLayer = getLayer(layerIds[0]);

        if (originalLayer) {
            const id = layerId + "_" + callerKey,
                attributes = setAttributes(originalLayer, id, layerName, layerNameKey, callerKey, treeType);
            let highlightLayer = Radio.request("ModelList", "getModelByAttributes", {"name": layerName}),
                layerSource = null;

            createFolderIfNotExists("markedDataFolder", treeType, thfConfig);
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
            console.warn("Layer with id ", layerIds[0], " not found, folder or layer \"", layerName + "\" was not created!");
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
        const rawLayer = getLayerWhere({id: id});

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
    else {
        Radio.trigger("ModelList", "renderTree");
    }
}

/**
 * Creates a new Folder in menu tree, if not exists.
 * @param {String} id of the layer
 * @param {String} treeType the treeType
 * @param {Object} thfConfig content of config.json's property 'treeHighlightedFeatures'
 * @returns {void}
 */
function createFolderIfNotExists (id, treeType, thfConfig) {
    if ((treeType === "custom" || treeType === "default") && Radio.request("Parser", "getItemByAttributes", {id: id}) === undefined) {
        const folderNameKey = thfConfig.folderName ? thfConfig.folderName : "common:tree.selectedData";

        Radio.trigger("Parser", "addFolder", i18next.t(folderNameKey), id, "tree", 0, true, folderNameKey, false, false, "SelectedLayer");
        Radio.trigger("ModelList", "renderTree");
    }
}

/**
 * Copies the attributesof the given layer and adapts them.
 * @param {Object} layer to copy attributes of
 *  @param {String} id of the layer
 * @param {String} layerName name of the layer
 * @param {String} layerNameKey i18n-key of the name of the layer
 * @param {String} callerKey i18n-key of thee caller of the function 'createLayerAddToTree'
 * @param {String} treeType the treeType
 * @returns {Object} the adapted attributes
 */
function setAttributes (layer, id, layerName, layerNameKey, callerKey, treeType) {
    const attributes = {...layer.attributes};

    // initial set selected and visibility to false, else source is updated before features are added
    attributes.isSelected = false;
    attributes.visibility = false;
    attributes.id = id;
    attributes.typ = "VectorBase";
    attributes.alwaysOnTop = true;
    attributes.name = layerName;
    attributes.selectionIDX = 1000;
    attributes.parentId = treeType === "custom" || treeType === "default" ? "markedDataFolder" : "tree";
    attributes.i18nextTranslate = (setter) => {
        if (typeof setter === "function" && i18next.exists(layerNameKey)) {
            setter("name", i18next.t(layerNameKey) + " (" + i18next.t(callerKey) + ")");
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
            const feat = feature !== undefined ? feature : this;

            return styleModel.createStyle(feat, false);
        });
    }
}

export {createLayerAddToTree};

