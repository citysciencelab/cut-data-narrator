import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import createLayerAddToTreeModule from "../../../../utils/createLayerAddToTree";
import {getCenter} from "ol/extent";

export default {
    /**
     * Highlights a feature depending on its geometryType.
     * If config parameter 'treeHighlightedFeatures' is active, a layer containing the highlighted feature is added to menu tree.
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {String} feature feature to be highlighted
     * @param {String} layerId id of the dedicated layer
     * @returns {void}
     */
    highlightFeature ({state, rootGetters, dispatch}, {feature, layerId}) {
        dispatch("Maps/removeHighlightFeature", "decrease", {root: true});
        const layer = rootGetters["Maps/getVisibleLayerList"].find((l) => l.values_.id === layerId),
            featureGeometryType = feature.getGeometry().getType(),
            featureId = feature.getId(),
            styleObj = featureGeometryType.toLowerCase().indexOf("polygon") > -1 ? state.highlightVectorRulesPolygon : state.highlightVectorRulesPointLine,
            highlightObject = {
                type: featureGeometryType === "Point" || featureGeometryType === "MultiPoint" ? "increase" : "highlightPolygon",
                id: featureId,
                layer: layer,
                feature: feature,
                scale: styleObj.image?.scale
            },
            rawLayer = rawLayerList.getLayerWhere({id: layerId});

        if (featureGeometryType === "LineString") {
            highlightObject.type = "highlightLine";
        }
        layer.id = layerId;
        highlightObject.zoomLevel = styleObj.zoomLevel;
        if (rawLayer && rawLayer.styleId) {
            highlightObject.styleId = rawLayer.styleId;
        }
        else if (layer && layer.styleId) {
            highlightObject.styleId = layer.styleId;
        }

        highlightObject.highlightStyle = {
            fill: styleObj.fill,
            stroke: styleObj.stroke,
            image: styleObj.image
        };
        dispatch("Maps/highlightFeature", highlightObject, {root: true});

        if (styleObj && styleObj.zoomLevel) {
            if (featureGeometryType === "Point") {
                dispatch("Maps/setCenter", feature.getGeometry().getCoordinates(), {root: true});
            }
            else {
                dispatch("Maps/setCenter", getCenter(feature.getGeometry().getExtent()), {root: true});
            }
            dispatch("Maps/setZoomLevel", styleObj.zoomLevel, {root: true});
        }
        if (rootGetters.treeHighlightedFeatures?.active) {
            createLayerAddToTreeModule.createLayerAddToTree(layerId, [feature], rootGetters.treeType, rootGetters.treeHighlightedFeatures);
        }
    }
};

