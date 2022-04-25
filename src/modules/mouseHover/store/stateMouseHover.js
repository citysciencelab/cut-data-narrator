import Overlay from "ol/Overlay.js";
/**
 * User type definition
 * @typedef {Object} MouseHoverState
 * @property {Boolean} active If true the overlay gets rendered.
 * @property {Object} overlay =new Overlay({}) mouseHover overlay (tooltip) - paramaters get set during initialization.
 * @property {Number} numFeaturesToShow The number of features that will be shown in the popup.
 * @property {Number} infoText The text that will be shown in the popup.
 * @property {Array} visibleLayerList Array with the visible layers.
 * @property {Array} layersFromConfig Array with layers from the config.
 * @property {Array} layersFromConfig Array with layers from the config.
 * @property {Array} mouseHoverLayers Array with layers from the config that have mouseHoverInfos.
 * @property {Array} mouseHoverInfos Array of the attributes each layer and its features should display.
 * @property {Array} infoBox Array with the Infos from the currently hovered feature/s.
 * @property {Array} hoverPosition Array with coordinates of the currently hovered feature/s.
 * @property {Boolean} pleaseZoom True if more features are being hovered than the configured max in numFeaturesToShow.
 */
export default {
    active: false,
    overlay: new Overlay({
    }),
    numFeaturesToShow: 2,
    infoText: "",
    visibleLayerList: [],
    layersFromConfig: [],
    mouseHoverLayers: [],
    mouseHoverInfos: [],
    infoBox: null,
    hoverPosition: null,
    pleaseZoom: false
};