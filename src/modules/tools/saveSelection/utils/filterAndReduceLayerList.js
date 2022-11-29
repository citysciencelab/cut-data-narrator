import sortBy from "../../../../utils/sortBy";
/**
     * Filters external layers (property 'isExternal') and sorts the list by 'selectionIDX'.
     * If featureViaURL is contained in Config, these ids are removed from list.
     * If mapMode is 2D, 3D-layers are removed from list.
     * Returns a list with reduced layers, containing 'transparency', 'isVisibleInMap' and 'id'.
     *
     * @param {String} mapMode current map mode
     * @param {Array} layerList List of layers.
     * @returns {Array} a list with reduced layers
     */
export default function filterAndReduceLayerList (mapMode, layerList) {
    const reducedLayerList = [],
        {featureViaURL} = Config,
        featureViaURLIds = [];

    if (!Array.isArray(layerList)) {
        return reducedLayerList;
    }
    let filteredLayerList = layerList.filter(layer => !layer.get("isExternal"));

    if (mapMode === "2D") {
        filteredLayerList = filteredLayerList.filter(layer => {
            return ["Oblique", "TileSet3D", "Terrain3D", "Entities3D"].indexOf(layer.get("typ")) === -1;
        });
    }
    filteredLayerList = sortBy(filteredLayerList, layer => layer.get("selectionIDX"));

    // The layer defined by the featureViaUrl module are excluded, as they are only given if the needed Url parameter is given.
    if (featureViaURL !== undefined) {
        featureViaURL.layers.forEach(layer => {
            featureViaURLIds.push(layer.id);
        });
        filteredLayerList = filteredLayerList.filter(el => !featureViaURLIds.includes(el.id));
    }
    filteredLayerList.forEach(layer => {
        reducedLayerList.push(Object.freeze({
            transparency: layer.get("transparency"),
            isVisibleInMap: layer.get("isVisibleInMap"),
            id: layer.get("id")
        }));
    });
    return reducedLayerList;
}
