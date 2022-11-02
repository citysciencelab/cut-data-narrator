import ImageWMS from "ol/source/ImageWMS.js";
import Image from "ol/layer/Image.js";
import WMTSLayer from "../../../../core/layers/wmts";
import View from "ol/View.js";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import store from "../../../../app-store/index";

/**
 * @param {module:ol/Map} map openlayers map
 * @param {?Number} resolution resolution to be set, if any @deprecated
 * @returns {module:ol/View} prepared view for overview map
 */
export function getOverviewMapView (map, resolution) {
    const view = map.getView();

    return new View({
        center: view.getCenter(),
        projection: view.getProjection(),
        resolution: resolution === null ? view.getResolution() : resolution
    });
}

/**
 * @param {String} id id of layer to use from services.json
 * @returns {?module:ol/layer/Image} image layer
 */
export function getOverviewMapLayer (id) {
    const layerId = id || getInitialVisibleBaseLayerId(),
        ovmLayer = layerId ? getOvmLayer(layerId) : null;

    if (!layerId) {
        console.error("Missing layerId for control overviewMap. Could not infer initially visible base layer id.");
        store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.controls.overviewMap.missingLayerId"));
    }
    else if (!ovmLayer) {
        console.error(`Could not create overviewMap for (inferred?) id "${layerId}". Given id: "${id}".`);
        store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.controls.overviewMap.missingLayerId"));
    }

    return ovmLayer;
}

/**
 * @returns {?String} id of initially visible base layer
 */
function getInitialVisibleBaseLayerId () {
    const layer = Radio.request("Parser", "getInitVisibBaselayer");

    return layer ? layer.id : null;
}

/**
 * @param {String} id id of layer to use
 * @returns {ol/BaseLayer} base layer to use for overviewMap
 */
function getOvmLayer (id) {
    const model = rawLayerList.getLayerWhere({id});

    if (model === null) {
        console.error(`No model for id ${id} found in OverviewMap.`);
        return null;
    }

    if (model.typ === "WMS") {
        return new Image({
            source: new ImageWMS(getWmsParameters(model))
        });
    }

    if (model.typ === "WMTS") {
        const wmtsLayer = new WMTSLayer(model, {});

        // overviewMap layer must always be visible – no further controls
        wmtsLayer.layer.setVisible(true);

        return wmtsLayer.layer;
    }

    console.error(`OverviewMap supports WMS/WMTS, but layer ${id} is of type ${model.typ}.`);
    return null;
}

/**
 * @description Derives the WMS parameters from the layer model.
 * @param {object} model model of layer to use
 * @returns {object} parameter object
 */
function getWmsParameters (model) {
    return {
        url: model.url || model.urls,
        params: {
            t: new Date().getMilliseconds(),
            zufall: Math.random(),
            LAYERS: model.layers,
            FORMAT: model.format === "nicht vorhanden" ? "image/png" : model.format,
            VERSION: model.version,
            TRANSPARENT: model.transparent.toString()
        }
    };
}
