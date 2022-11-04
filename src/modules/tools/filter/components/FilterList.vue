<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "FilterList",
    components: {
    },
    props: {
        multiLayerSelector: {
            type: Boolean,
            required: false,
            default: true
        },
        filters: {
            type: Array,
            required: true,
            default: () => []
        },
        selectedLayers: {
            type: Array,
            required: false,
            default: () => []
        },
        jumpToId: {
            type: Number,
            required: false,
            default: undefined
        }
    },
    watch: {
        jumpToId (newFilterId) {
            this.scrollToView(newFilterId);
        }
    },
    mounted () {
        this.scrollToView(this.jumpToId);
    },
    methods: {
        translateKeyWithPlausibilityCheck,
        /**
         * Updates selectedLayers array.
         * @param {Number} filterId id which should be removed or added to selectedLayers array
         * @returns {void}
         */
        updateSelectedLayers (filterId) {
            if (typeof filterId !== "number") {
                return;
            }
            this.$emit("selectedaccordions", filterId, true);
        },
        /**
         * Check if Selector should be disabled.
         * @param {Number} filterId id to check if should be disabled
         * @returns {void}
         */
        disabled (filterId) {
            return !this.multiLayerSelector && this.selectedLayers.length > 0 && !this.selectedLayers.includes(filterId);
        },
        /**
         * Emitting the function by transfering the filter Id of layer
         * @param {Number} filterId id to check if should be disabled
         * @returns {void}
         */
        setLayerLoaded (filterId) {
            this.$emit("setLayerLoaded", filterId);
        },
        /**
         * Scrolls to given filterId.
         * @param {Number} filterId The filterId to jump to.
         * @returns {void}
         */
        scrollToView (filterId) {
            if (typeof filterId !== "number" || !this.filters.some(filter => filter.filterId === filterId)) {
                return;
            }
            const filter = Array.isArray(this.$refs[filterId]) ? this.$refs[filterId][0] : this.$refs[filterId];

            if (filter && typeof filter.scrollIntoView === "function") {
                this.$nextTick(() => {
                    filter.scrollIntoView({behavior: "smooth"});
                });
            }
            else {
                this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.filter.alertingMessages.noMatchingFilterId"), {root: true});
            }
            this.$emit("resetJumpToId");
            if (!this.selectedLayers.some(selectedLayer => selectedLayer.filterId === filterId)) {
                this.updateSelectedLayers(filterId);
            }
        }
    }
};
</script>

<template>
    <div
        class="panel-group"
        role="tablist"
        aria-multiselectable="true"
    >
        <div
            v-for="filter in filters"
            :id="'filter-' + filter.filterId"
            :ref="filter.filterId"
            :key="filter.filterId"
            class="panel panel-default"
            @click="setLayerLoaded(filter.filterId)"
            @keydown.enter="setLayerLoaded(filter.filterId)"
        >
            <h2
                :class="['panel-title', disabled ? 'disabled' : '']"
                @click="updateSelectedLayers(filter.filterId)"
                @keydown.enter="updateSelectedLayers(filter.filterId)"
            >
                <a
                    :disabled="disabled"
                    role="button"
                    data-toggle="collapse"
                    data-parent="#accordion"
                    tabindex="0"
                >
                    {{ filter.title ? filter.title : filter.layerId }}
                    <span
                        v-if="!selectedLayers.some(layers => layers.filterId === filter.filterId)"
                        class="bi bi-chevron-down float-end"
                    />
                    <span
                        v-else
                        class="bi bi-chevron-up float-end"
                    />
                </a>
            </h2>
            <div
                v-if="filter.shortDescription && !selectedLayers.includes(filter.filterId)"
                class="layerInfoText"
            >
                {{ translateKeyWithPlausibilityCheck(filter.shortDescription, key => $t(key)) }}
            </div>
            <slot
                :layer="filter"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#tool-general-filter .panel {
    background-color: $white;
    border: 1px solid #ddd;
    padding: 10px;
}
.panel-group .panel + .panel {
    margin-top: 10px;
}
.panel-default > .panel-heading {
    cursor: default;
    background-color: $white;
}
.panel-default > .panel-heading.disabled {
    background-color: $light_grey;
}
.panel-title {
    cursor: pointer;
}
</style>
