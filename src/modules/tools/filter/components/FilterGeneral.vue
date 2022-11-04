<script>
import ToolTemplate from "../../ToolTemplate.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFilter";
import mutations from "../store/mutationsFilter";
import LayerFilterSnippet from "./LayerFilterSnippet.vue";
import MapHandler from "../utils/mapHandler.js";
import {compileLayers} from "../utils/compileLayers.js";
import {
    getLayerByLayerId,
    showFeaturesByIds,
    createLayerIfNotExists,
    zoomToFilteredFeatures,
    zoomToExtent,
    addLayerByLayerId,
    setParserAttributeByLayerId,
    getLayers,
    isUiStyleTable,
    setFilterInTableMenu,
    getSnippetInfos
} from "../utils/openlayerFunctions.js";
import FilterList from "./FilterList.vue";
import isObject from "../../../../utils/isObject.js";
import GeometryFilter from "./GeometryFilter.vue";
import {getFeaturesOfAdditionalGeometries} from "../utils/getFeaturesOfAdditionalGeometries.js";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import {getFeatureGET} from "../../../../api/wfs/getFeature";
import {WFS} from "ol/format.js";

export default {
    name: "FilterGeneral",
    components: {
        ToolTemplate,
        GeometryFilter,
        LayerFilterSnippet,
        FilterList
    },
    data () {
        return {
            storePath: this.$store.state.Tools.Filter,
            mapHandler: new MapHandler({
                getLayerByLayerId,
                showFeaturesByIds,
                createLayerIfNotExists,
                zoomToFilteredFeatures,
                zoomToExtent,
                addLayerByLayerId,
                setParserAttributeByLayerId,
                getLayers
            }),
            layerConfigs: [],
            selectedLayerGroups: [],
            preparedLayerGroups: [],
            flattenPreparedLayerGroups: [],
            layerLoaded: {},
            layerFilterSnippetPostKey: ""
        };
    },
    computed: {
        ...mapGetters("Tools/Filter", Object.keys(getters)),
        console: () => console,
        filters () {
            return this.layerConfigs.layers.filter(layer => {
                return isObject(layer);
            });
        }
    },
    created () {
        this.$on("close", this.close);
        getFeaturesOfAdditionalGeometries(this.geometrySelectorOptions.additionalGeometries);
    },
    mounted () {
        this.convertConfig({
            snippetInfos: getSnippetInfos()
        });

        this.layerConfigs = compileLayers(this.layerGroups, this.layers);

        this.$nextTick(() => {
            if (isUiStyleTable()) {
                setFilterInTableMenu(this.$el.querySelector("#tool-general-filter"));
                this.$el.remove();
            }
        });

        if (Array.isArray(this.layerConfigs.groups) && this.layerConfigs.groups.length > 0) {
            this.layerConfigs.groups.forEach(layerGroup => {
                if (isObject(layerGroup)) {
                    this.preparedLayerGroups.push(layerGroup);
                }
            });
            if (Array.isArray(this.preparedLayerGroups) && this.preparedLayerGroups.length > 0) {
                this.preparedLayerGroups.forEach(group => {
                    group.layers.forEach(layer => {
                        this.flattenPreparedLayerGroups.push(layer);
                    });
                });
            }
        }

        if (Array.isArray(this.layerConfigs?.layers) && this.layerConfigs.layers.length > 0) {
            const selectedFilterIds = [];

            this.layerConfigs.layers.forEach(config => {
                if (typeof config?.active === "boolean" && config.active && config?.filterId) {
                    selectedFilterIds.push(config.filterId);
                }
            });
            if (selectedFilterIds.length > 0) {
                this.setSelectedAccordions(this.transformLayerConfig(this.layerConfigs.layers, selectedFilterIds));
            }
        }
    },
    methods: {
        ...mapMutations("Tools/Filter", Object.keys(mutations)),
        ...mapActions("Tools/Filter", [
            "initialize",
            "convertConfig",
            "updateRules",
            "deleteAllRules",
            "updateFilterHits"
        ]),

        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Gets the features of the additional geometries by the given layer id.
         * @param {Object[]} additionalGeometries - The additional geometries.
         * @param {String} additionalGeometries[].layerId - The id of the layer.
         * @returns {void}
         */
        async getFeaturesOfAdditionalGeometries (additionalGeometries) {
            if (additionalGeometries) {
                const wfsReader = new WFS();

                for (const additionalGeometry of additionalGeometries) {
                    const rawLayer = rawLayerList.getLayerWhere({id: additionalGeometry.layerId}),
                        features = await getFeatureGET(rawLayer.url, {version: rawLayer.version, featureType: rawLayer.featureType});

                    additionalGeometry.features = wfsReader.readFeatures(features);
                }
            }
        },

        /**
         * Update selected layer group.
         * @param {Number} layerGroupIndex index of the layer group
         * @returns {void}
         */
        updateSelectedLayerGroups (layerGroupIndex) {
            const index = this.selectedLayerGroups.indexOf(layerGroupIndex);

            if (index >= 0) {
                this.selectedLayerGroups.splice(index, 1);
            }
            else {
                this.selectedLayerGroups.push(layerGroupIndex);
            }
        },
        /**
         * Update selectedAccordions array in groups.
         * @param {Number} filterId id which should be added or removed
         * @param {Boolean} [isFromGroup=true] true if accordion is in a group, false if not
         * @returns {void|undefined} returns undefinied, if filterIds is not an array and not a number.
         */
        updateSelectedAccordions (filterId, isFromGroup = false) {
            let selectedFilterIds = [];

            if (!this.multiLayerSelector) {
                selectedFilterIds = this.selectedLayers.includes(filterId) ? [] : [filterId];
                this.setSelectedAccordions(this.transformLayerConfig(isFromGroup ? this.flattenPreparedLayerGroups : this.layerConfigs.layers, selectedFilterIds));
                return;
            }

            this.preparedLayerGroups.forEach((layerGroup, groupIdx) => {
                if (layerGroup.layers.some(layer => layer.filterId === filterId) && !this.selectedLayerGroups.includes(groupIdx)) {
                    this.selectedLayerGroups.push(groupIdx);
                }
            });

            const filterIdsOfAccordions = [],
                index = this.selectedAccordions.findIndex(accordion => accordion.filterId === filterId);

            this.selectedAccordions.forEach(accordion => filterIdsOfAccordions.push(accordion.filterId));
            if (index >= 0) {
                filterIdsOfAccordions.splice(index, 1);
            }
            else {
                filterIdsOfAccordions.push(filterId);
            }
            this.setSelectedAccordions(this.transformLayerConfig([...this.layerConfigs.layers, ...this.flattenPreparedLayerGroups], filterIdsOfAccordions));
        },
        /**
         * Transform given layer config to an lightweight array of layerIds and filterIds.
         * @param {Object[]} configs The layer configs.
         * @param {String[]} filterIds The filter ids.
         * @returns {Object[]} array of lightweight filter objects which includes filterId and layerId.
         */
        transformLayerConfig (configs, filterIds) {
            const layers = [];

            configs.forEach(layerConfig => {
                if (Array.isArray(filterIds) && filterIds.includes(layerConfig.filterId)) {
                    layers.push({
                        layerId: layerConfig.layerId,
                        filterId: layerConfig.filterId
                    });
                }
            });
            return layers;
        },
        /**
         * Check if layer filter should be displayed.
         * @param {String} filterId filterId to check
         * @returns {Boolean} true if should be displayed false if not
         */
        isLayerFilterSelected (filterId) {
            if (!Array.isArray(this.selectedAccordions)) {
                return false;
            }
            if (!this.layerSelectorVisible) {
                return true;
            }

            let selected = false;

            this.selectedAccordions.forEach(selectedLayer => {
                if (selectedLayer.filterId === filterId) {
                    if (!this.layerLoaded[filterId]) {
                        this.setLayerLoaded(filterId);
                    }
                    selected = true;
                }
            });

            return selected;
        },
        /**
         * Setting the layer loaded true if the layer is clicked from the filter Id
         * @param {String} filterId filterId to check
         * @returns {void}
         */
        setLayerLoaded (filterId) {
            this.layerLoaded[filterId] = true;
        },
        /**
         * Sets the geometry/area to filter in.
         * @param {ol/geom/Geometry|Boolean} geometry The geometry (polygon, cycle, etc.) or false.
         * @returns {void}
         */
        updateFilterGeometry (geometry) {
            this.setFilterGeometry(geometry);
        },
        /**
         * Sets the geometry feature
         * @param {ol/Feature} feature The geometry feature.
         * @returns {void}
         */
        updateGeometryFeature (feature) {
            this.setGeometryFeature(feature);
        },
        /**
         * Sets the geometry selector options
         * @param {Object} options The geometry select options
         * @returns {void}
         */
        updateGeometrySelectorOptions (options) {
            this.setGeometrySelectorOptions(Object.assign({}, this.geometrySelectorOptions, options));
        },
        /**
         * Checks if the geometry selector should be visible.
         * @returns {Boolean} true if the geometry selector should be visible.
         */
        isGeometrySelectorVisible () {
            return isObject(this.geometrySelectorOptions) && this.geometrySelectorOptions.visible !== false;
        },
        /**
         * Sets the active state of the gfi based on the given param.
         * @param {Boolean} active True to enable it, false to disable it
         * @returns {void}
         */
        setGfiActive (active) {
            if (typeof active !== "boolean") {
                return;
            }
            this.$store.commit("Tools/Gfi/setActive", active);
        },
        /**
         * Resets the jumpToId state property.
         * @returns {void}
         */
        resetJumpToId () {
            this.setJumpToId(undefined);
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        icon="bi-funnel-fill"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="450"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-general-filter"
            >
                <GeometryFilter
                    v-if="isGeometrySelectorVisible()"
                    :circle-sides="geometrySelectorOptions.circleSides"
                    :default-buffer="geometrySelectorOptions.defaultBuffer"
                    :geometries="geometrySelectorOptions.geometries"
                    :additional-geometries="geometrySelectorOptions.additionalGeometries"
                    :invert-geometry="geometrySelectorOptions.invertGeometry"
                    :fill-color="geometrySelectorOptions.fillColor"
                    :stroke-color="geometrySelectorOptions.strokeColor"
                    :stroke-width="geometrySelectorOptions.strokeWidth"
                    :filter-geometry="filterGeometry"
                    :geometry-feature="geometryFeature"
                    :init-selected-geometry-index="geometrySelectorOptions.selectedGeometry"
                    @updateFilterGeometry="updateFilterGeometry"
                    @updateGeometryFeature="updateGeometryFeature"
                    @updateGeometrySelectorOptions="updateGeometrySelectorOptions"
                />
                <div v-if="Array.isArray(layerGroups) && layerGroups.length">
                    <div
                        v-for="(layerGroup, key) in layerGroups"
                        :key="key"
                        class="layerGroupContainer"
                    >
                        <div class="panel panel-default">
                            <div class="panel-body">
                                <h2
                                    class="panel-title"
                                >
                                    <a
                                        role="button"
                                        data-toggle="collapse"
                                        data-parent="#accordion"
                                        tabindex="0"
                                        @click="updateSelectedLayerGroups(layerGroups.indexOf(layerGroup))"
                                        @keydown.enter="updateSelectedLayerGroups(layerGroups.indexOf(layerGroup))"
                                    >
                                        {{ layerGroup.title ? layerGroup.title : key }}
                                        <span
                                            v-if="!selectedLayerGroups.includes(layerGroups.indexOf(layerGroup))"
                                            class="bi bi-chevron-down float-end"
                                        />
                                        <span
                                            v-else
                                            class="bi bi-chevron-up float-end"
                                        />
                                    </a>
                                </h2>
                                <div
                                    role="tabpanel"
                                    :class="['accordion-collapse', 'collapse', selectedLayerGroups.includes(layerGroups.indexOf(layerGroup)) ? 'show' : '']"
                                >
                                    <FilterList
                                        v-if="Array.isArray(preparedLayerGroups) && preparedLayerGroups.length && layerSelectorVisible"
                                        class="layerSelector"
                                        :filters="preparedLayerGroups[layerGroups.indexOf(layerGroup)].layers"
                                        :selected-layers="selectedAccordions"
                                        :multi-layer-selector="multiLayerSelector"
                                        :jump-to-id="jumpToId"
                                        @resetJumpToId="resetJumpToId"
                                        @selectedaccordions="updateSelectedAccordions"
                                        @setLayerLoaded="setLayerLoaded"
                                    >
                                        <template
                                            #default="slotProps"
                                        >
                                            <div
                                                :class="['accordion-collapse', 'collapse', isLayerFilterSelected(slotProps.layer.filterId) ? 'show' : '']"
                                                role="tabpanel"
                                            >
                                                <LayerFilterSnippet
                                                    v-if="isLayerFilterSelected(slotProps.layer.filterId) || layerLoaded[slotProps.layer.filterId]"
                                                    :api="slotProps.layer.api"
                                                    :layer-config="slotProps.layer"
                                                    :map-handler="mapHandler"
                                                    :min-scale="minScale"
                                                    :live-zoom-to-features="liveZoomToFeatures"
                                                    :filter-rules="rulesOfFilters[slotProps.layer.filterId]"
                                                    :filter-hits="filtersHits[slotProps.layer.filterId]"
                                                    :filter-geometry="filterGeometry"
                                                    :is-layer-filter-selected="isLayerFilterSelected"
                                                    @updateRules="updateRules"
                                                    @deleteAllRules="deleteAllRules"
                                                    @updateFilterHits="updateFilterHits"
                                                />
                                            </div>
                                        </template>
                                    </FilterList>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <FilterList
                    v-if="(Array.isArray(layerConfigs.layers) && layerConfigs.layers.length) || (Array.isArray(layerConfigs.groups) && layerConfigs.groups.length) && layerSelectorVisible"
                    class="layerSelector"
                    :filters="filters"
                    :selected-layers="selectedAccordions"
                    :multi-layer-selector="multiLayerSelector"
                    :jump-to-id="jumpToId"
                    @resetJumpToId="resetJumpToId"
                    @selectedaccordions="updateSelectedAccordions"
                    @setLayerLoaded="setLayerLoaded"
                >
                    <template
                        #default="slotProps"
                    >
                        <div
                            :class="['accordion-collapse', 'collapse', isLayerFilterSelected(slotProps.layer.filterId) ? 'show' : '']"
                            role="tabpanel"
                        >
                            <LayerFilterSnippet
                                v-if="isLayerFilterSelected(slotProps.layer.filterId) || layerLoaded[slotProps.layer.filterId]"
                                :api="slotProps.layer.api"
                                :layer-config="slotProps.layer"
                                :map-handler="mapHandler"
                                :min-scale="minScale"
                                :live-zoom-to-features="liveZoomToFeatures"
                                :filter-rules="rulesOfFilters[slotProps.layer.filterId]"
                                :filter-hits="filtersHits[slotProps.layer.filterId]"
                                :filter-geometry="filterGeometry"
                                :is-layer-filter-selected="isLayerFilterSelected"
                                @updateRules="updateRules"
                                @deleteAllRules="deleteAllRules"
                                @updateFilterHits="updateFilterHits"
                            />
                        </div>
                    </template>
                </FilterList>
                <div v-else-if="(Array.isArray(layerConfigs.layers) && layerConfigs.layers.length) || (Array.isArray(layerConfigs.groups) && layerConfigs.groups.length)">
                    <LayerFilterSnippet
                        v-for="(layerConfig, indexLayer) in filters"
                        :key="'layer-' + indexLayer + layerFilterSnippetPostKey"
                        :api="layerConfig.api"
                        :layer-config="layerConfig"
                        :map-handler="mapHandler"
                        :min-scale="minScale"
                        :live-zoom-to-features="liveZoomToFeatures"
                        :filter-rules="rulesOfFilters[layerConfig.filterId]"
                        :filter-hits="filtersHits[layerConfig.filterId]"
                        :filter-geometry="filterGeometry"
                        :is-layer-filter-selected="true"
                        @updateRules="updateRules"
                        @deleteAllRules="deleteAllRules"
                        @updateFilterHits="updateFilterHits"
                    />
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .layerGroupContainer {
        background-color: #f5f5f5;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
    }
</style>
