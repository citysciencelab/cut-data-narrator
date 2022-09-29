<script>
import Draw, {createBox} from "ol/interaction/Draw.js";
import {createRegularPolygon} from "ol/interaction/Draw";
import {Fill, Stroke, Style} from "ol/style";
import {Vector as VectorSource} from "ol/source";
import {Vector as VectorLayer} from "ol/layer";
import {mapActions, mapMutations} from "vuex";
import * as jsts from "jsts/dist/jsts";
import {
    LineString,
    LinearRing,
    Point,
    Polygon,
    MultiPolygon
} from "ol/geom";
import isObject from "../../../../utils/isObject.js";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import sortBy from "../../../../utils/sortBy";

export default {
    name: "GeometryFilter",
    props: {
        circleSides: {
            type: Number,
            required: false,
            default: 256
        },
        defaultBuffer: {
            type: Number,
            required: false,
            default: 20
        },
        fillColor: {
            type: String,
            required: false,
            default: "rgba(0, 0, 0, 0.33)"
        },
        geometries: {
            type: Array,
            required: false,
            default: () => ["Polygon", "Rectangle", "Circle", "LineString"]
        },
        additionalGeometries: {
            type: [Array, Boolean],
            required: false,
            default: false
        },
        invertGeometry: {
            type: Boolean,
            required: false,
            default: true
        },
        strokeColor: {
            type: String,
            required: false,
            default: "rgba(0, 0, 0, 1)"
        },
        strokeWidth: {
            type: Number,
            required: false,
            default: 1
        },
        filterGeometry: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        geometryFeature: {
            type: Object,
            required: false,
            default: undefined
        },
        initSelectedGeometryIndex: {
            type: Number,
            required: false,
            default: 0
        }
    },
    data () {
        return {
            isActive: false,
            buffer: this.defaultBuffer,
            isBufferInputVisible: false,
            isGeometryVisible: false,
            selectedGeometryIndex: this.initSelectedGeometryIndex
        };
    },
    watch: {
        selectedGeometryIndex (newValue) {
            const selectedGeometry = this.getSelectedGeometry(newValue);

            this.removeInteraction(this.draw);
            if (selectedGeometry.type === "additional") {
                this.layer.getSource().clear();
                this.update(selectedGeometry.feature, selectedGeometry.type, selectedGeometry.feature.getGeometry());
                this.layer.getSource().addFeature(this.feature);
            }
            else {
                this.setDrawInteraction(selectedGeometry.type);
            }
        },
        isActive (val) {
            this.draw.setActive(val);
            this.setGfiActive(!val);
        },
        buffer (val) {
            if (!this.feature) {
                return;
            }
            const newValue = isNaN(parseInt(val, 10)) ? this.defaultBuffer : val,
                jstsGeom = this.ol3Parser.read(this.initFeatureGeometry),
                buffered = jstsGeom.buffer(newValue);

            if (newValue <= 0) {
                return;
            }
            this.setGeometryAtFeature(this.feature, this.ol3Parser.write(buffered), this.invertGeometry);

            clearInterval(this.intvBuffer);
            this.intvBuffer = setInterval(() => {
                clearInterval(this.intvBuffer);
                this.emitGeometryOfLineBuffer(this.feature.getGeometry().getCoordinates());
            }, 800);
            if (!isNaN(parseInt(val, 10))) {
                this.$emit("updateGeometrySelectorOptions", {
                    "defaultBuffer": Number(val)
                });
            }
        }
    },
    created () {
        this.setNonReactiveData();
        this.initializeLayer(this.filterGeometry);
    },

    beforeDestroy () {
        this.removeInteraction(this.draw);
        this.removeLayerFromMap(this.layer);
    },

    methods: {
        ...mapActions("Maps", ["addInteraction", "removeInteraction", "addLayer"]),
        ...mapMutations("Maps", ["removeLayerFromMap"]),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),
        translateKeyWithPlausibilityCheck,

        /**
         * Sets all needed non reactive data.
         * @returns {void}
         */
        setNonReactiveData () {
            // the current feature of the geometry filter
            this.feature = undefined;

            // jsts is used to calculate a buffer around a linestring
            this.ol3Parser = new jsts.io.OL3Parser();
            this.ol3Parser.inject(
                Point,
                LineString,
                LinearRing,
                Polygon
            );

            // is also used to calculate the buffer around a linestring
            this.initFeatureGeometry = null;

            // sets the layer representing the filter geometry
            this.setLayer();

            // sets the interaction to draw the filter geometry
            this.setDrawInteraction(this.getSelectedGeometry(this.selectedGeometryIndex).type);
        },

        /**
         * Initializes the layer and registers it at the map.
         * @returns {void}
         */
        setLayer () {
            this.layer = new VectorLayer({
                id: "geometry-filter",
                name: "geometry-filter",
                source: new VectorSource(),
                style: new Style({
                    fill: new Fill({
                        color: this.fillColor
                    }),
                    stroke: new Stroke({
                        color: this.strokeColor,
                        width: this.strokeWidth
                    })
                }),
                alwaysOnTop: true
            });

            this.addLayer(this.layer);
            if (typeof this.geometryFeature !== "undefined") {
                this.layer.getSource().addFeature(this.geometryFeature);
            }
        },

        /**
         * Sets interaction for drawing feature geometries and registers it at the map.
         * @param {String} drawType - Geometry type of the geometry being drawn with this interaction.
         * @returns {void}
         */
        setDrawInteraction (drawType) {
            this.draw = new Draw({
                source: this.layer.getSource(),
                type: drawType === "Rectangle" ? "Circle" : drawType,
                geometryFunction: this.getGeometryFunction(drawType, this.circleSides)
            });

            this.draw.on("drawend", (evt) => {
                const feature = evt.feature,
                    geometry = this.getGeometryOnDrawEnd(feature, drawType, this.buffer);

                this.initFeatureGeometry = feature.getGeometry();
                this.update(feature, drawType, geometry);
            });

            this.draw.on("drawstart", () => {
                this.isGeometryVisible = false;
                this.layer.getSource().clear();
            });

            this.draw.setActive(this.isActive);
            this.addInteraction(this.draw);
        },

        /**
         * Returns the currently selected geometry bases on the index set at the select box.
         * @param {Number} index - The index of the selected geometry.
         * @returns {Object} The currently selected geometry as object with type and name.
         */
        getSelectedGeometry (index) {
            const geometries = this.getGeometries();

            return geometries[index];
        },

        /**
         * Returns the list of all possible geometries with translations.
         * @returns {Object[]} A list of objects containing type and name of geometries.
         */
        getGeometries () {
            const result = [],
                possibleGeometries = {
                    "Polygon": this.$t("common:modules.tools.filter.geometryFilter.geometries.polygon"),
                    "Rectangle": this.$t("common:modules.tools.filter.geometryFilter.geometries.rectangle"),
                    "Circle": this.$t("common:modules.tools.filter.geometryFilter.geometries.circle"),
                    "LineString": this.$t("common:modules.tools.filter.geometryFilter.geometries.lineString")
                },
                additionalGeometries = this.prepareAdditionalGeometries(this.additionalGeometries);

            this.geometries.forEach(type => {
                if (Object.prototype.hasOwnProperty.call(possibleGeometries, type)) {
                    result.push({
                        type,
                        name: possibleGeometries[type]
                    });
                }
            });

            return result.concat(sortBy(additionalGeometries, "name"));
        },

        /**
         * Returns a list of all additional geometries.
         * @param {Object|Boolean} additionalGeometries - The additional geometries otherwise false.
         * @returns {Object[]} A list of objects containing the prepared additional geometries.
         */
        prepareAdditionalGeometries (additionalGeometries) {
            const result = [];

            if (!additionalGeometries) {
                return result;
            }
            additionalGeometries.forEach(additionalGeometry => {
                additionalGeometry.features.forEach(feature => {
                    result.push({
                        type: "additional",
                        feature: feature,
                        name: feature.get(`${additionalGeometry.attrNameForTitle}`)
                    });
                });
            });

            return result;
        },

        /**
         * Returns the geometry of the given feature and calculates a buffer around the geometry if it is a linestring.
         * @param {ol/Feature} feature - The feature to get the geometry from.
         * @param {String} type - The type of the feature geometry.
         * @param {Number} buffer - The buffer to use for buffered line.
         * @returns {ol/geom/Geometry} The geometry of the feature.
         */
        getGeometryOnDrawEnd (feature, type, buffer) {
            if (type === "LineString") {
                const jstsGeom = this.ol3Parser.read(feature.getGeometry()),
                    buffered = jstsGeom.buffer(buffer);

                return this.ol3Parser.write(buffered);
            }
            return feature.getGeometry();
        },

        /**
         * Returns the geometryFunction for the given geometry type.
         * @param {String} selectedGeometryType The geometry type.
         * @param {Number} circleSides The number of points to use in case of a circle to polygon transformation.
         * @returns {Function} The function to use or undefined.
         */
        getGeometryFunction (selectedGeometryType, circleSides) {
            if (selectedGeometryType === "Rectangle") {
                return createBox();
            }
            else if (selectedGeometryType === "Circle") {
                return createRegularPolygon(circleSides < 3 ? 3 : circleSides);
            }
            return undefined;
        },

        /**
         * Update the geometry filter.
         * @param {ol/Feature} feature - The current feature to get the geometry from.
         * @param {String} type - The type of the feature geometry.
         * @param {ol/geom/Geometry} geometry - The geometry to set.
         * @returns {void}
         */
        update (feature, type, geometry) {
            this.feature = feature;
            this.isGeometryVisible = true;
            this.isBufferInputVisible = type === "LineString";
            this.setGeometryAtFeature(this.feature, geometry, this.invertGeometry);
            this.$emit("updateFilterGeometry", geometry);
            this.$emit("updateGeometryFeature", this.feature);
            this.$emit("updateGeometrySelectorOptions", {
                "selectedGeometry": this.selectedGeometryIndex,
                "defaultBuffer": Number(this.buffer)
            });
        },

        /**
         * Sets the given geometry or the inverted at the feature of the instance.
         * @param {ol/Feature} feature - The feature to set the geometry at.
         * @param {ol/geom/Geometry} geometry - The geometry to set.
         * @param {Boolean} invertGeometry - If the geometry should be inverted.
         * @returns {void}
         */
        setGeometryAtFeature (feature, geometry, invertGeometry) {
            if (invertGeometry && typeof invertGeometry === "boolean") {
                const quiteLargePolygon = new Polygon([
                    [
                        [-1877994.66, 3932281.56],
                        [-1877994.66, 9494203.2],
                        [804418.76, 9494203.2],
                        [804418.76, 3932281.56],
                        [-1877994.66, 3932281.56]
                    ]
                ]);

                if (geometry instanceof Polygon) {
                    this.addInteriorPolygon(quiteLargePolygon, geometry);
                    feature.setGeometry(quiteLargePolygon);
                }
                else if (geometry instanceof MultiPolygon) {
                    geometry.getPolygons().forEach(polygon => {
                        this.addInteriorPolygon(quiteLargePolygon, polygon);
                    });
                    feature.setGeometry(quiteLargePolygon);
                }
            }
            else {
                feature.setGeometry(geometry);
            }
        },

        /**
         * Adds interior linear ring(s) to a polygon.
         * If necessary, the coordinates are converted to the correct geometry layout (e.g. "XYZ" -> "XY").
         * @param {ol/geom/Polygon} polygon - The surface of the polygon (outer-boundary).
         * @param {ol/geom/Polygon} interiorPolygon - The hole(s) in the surface of the polygon (inner-boundary).
         * @return {void}
         */
        addInteriorPolygon (polygon, interiorPolygon) {
            if (interiorPolygon.getLayout() !== "XY") {
                const coords = interiorPolygon.getCoordinates();

                interiorPolygon.setCoordinates(coords, "XY");
            }
            interiorPolygon.getLinearRings().forEach(linearRing => {
                polygon.appendLinearRing(linearRing);
            });
        },

        /**
         * Resets the geometry filter.
         * @returns {void}
         */
        reset () {
            this.isGeometryVisible = false;
            this.isBufferInputVisible = false;
            this.layer.getSource().clear();
            this.$emit("updateFilterGeometry", false);
            this.$emit("updateGeometryFeature", undefined);
            this.$emit("updateGeometrySelectorOptions", {
                "selectedGeometry": 0,
                "defaultBuffer": 20
            });
        },

        /**
         * Emits updateFilterGeometry with a new polygon, using the given coordinates.
         * @param {ol/coordinate[]} coordinates The coordinates of the polygon.
         * @returns {void}
         */
        emitGeometryOfLineBuffer (coordinates) {
            if (!Array.isArray(coordinates)) {
                this.$emit("updateFilterGeometry", false);
                return;
            }
            const geomCoordinate = coordinates.length === 2 ? coordinates[1] : coordinates[0];

            this.$emit("updateFilterGeometry", new Polygon([geomCoordinate]));
        },

        /**
         * Initializes the layer if the geometry exists already
         * @param {ol/geom/Geometry|Boolean} filterGeometry The filtered geometry, false if it does not exist.
         * @returns {void}
         */
        initializeLayer (filterGeometry) {
            if (isObject(filterGeometry)) {
                this.isGeometryVisible = true;
                this.isActive = true;
            }
        }
    }
};
</script>

<template lang="html">
    <div>
        <form>
            <div class="mb-3">
                <div class="form-check">
                    <input
                        id="geometryFilterChecked"
                        v-model="isActive"
                        class="form-check-input"
                        type="checkbox"
                        value=""
                    >
                    <label
                        class="form-check-label"
                        for="geometryFilterChecked"
                    >
                        {{ translateKeyWithPlausibilityCheck("common:modules.tools.filter.geometryFilter.activate", key => $t(key)) }}
                    </label>
                    <div
                        id="geometryFilterHelp"
                        class="form-text"
                    >
                        {{ translateKeyWithPlausibilityCheck("common:modules.tools.filter.geometryFilter.help", key => $t(key)) }}
                    </div>
                </div>
            </div>
            <div
                v-if="isActive"
                class="mb-3"
            >
                <div class="form-floating">
                    <select
                        id="geometrySelect"
                        v-model="selectedGeometryIndex"
                        class="form-select"
                    >
                        <option
                            v-for="(geometry, index) in getGeometries()"
                            :key="index"
                            :value="index"
                        >
                            {{ geometry.name }}
                        </option>
                    </select>
                    <label for="geometrySelect">
                        {{ translateKeyWithPlausibilityCheck("common:modules.tools.filter.geometryFilter.selectGeometry", key => $t(key)) }}
                    </label>
                </div>
            </div>
            <div
                v-if="isActive && isBufferInputVisible"
                class="mb-3"
            >
                <label
                    for="inputLineBuffer"
                    class="form-label"
                >
                    {{ translateKeyWithPlausibilityCheck("common:modules.tools.filter.geometryFilter.buffer", key => $t(key)) }}
                </label>
                <input
                    id="inputLineBuffer"
                    v-model="buffer"
                    class="form-control"
                    type="number"
                    min="1"
                >
            </div>
            <div v-if="isGeometryVisible">
                <button
                    id="buttonRemoveGeometry"
                    class="btn btn-primary"
                    @click="reset"
                >
                    {{ translateKeyWithPlausibilityCheck("common:modules.tools.filter.geometryFilter.removeGeometry", key => $t(key)) }}
                </button>
            </div>
        </form>
        <hr>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    form {
        font-size: $font-size-lg;
    }

    hr {
        margin-left: -20px;
        margin-right: -20px;
    }

    .form-check {
        label {
            margin-top: 3px;
        }
    }
</style>
