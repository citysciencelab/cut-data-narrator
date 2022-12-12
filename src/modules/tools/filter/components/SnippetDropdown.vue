<script>
import Multiselect from "vue-multiselect";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import {getStyleModel, getIconListFromLegend} from "../utils/getIconListFromLegend.js";
import {getDefaultOperatorBySnippetType} from "../utils/compileSnippets.js";
import splitListWithDelimitor from "../utils/splitListWithDelimitor.js";
import isObject from "../../../../utils/isObject";
import SnippetInfo from "./SnippetInfo.vue";
import localeCompare from "../../../../utils/localeCompare";

export default {
    name: "SnippetDropdown",
    components: {
        Multiselect,
        SnippetInfo
    },
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        attrName: {
            type: String,
            required: false,
            default: ""
        },
        addSelectAll: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        adjustment: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        autoInit: {
            type: Boolean,
            required: false,
            default: true
        },
        localeCompareParams: {
            type: [String, Object],
            required: false,
            default: undefined
        },
        delimitor: {
            type: String,
            required: false,
            default: undefined
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        display: {
            type: String,
            required: false,
            default: "default"
        },
        filterId: {
            type: Number,
            required: false,
            default: 0
        },
        info: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        isChild: {
            type: Boolean,
            required: false,
            default: false
        },
        isParent: {
            type: Boolean,
            required: false,
            default: false
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        layerId: {
            type: String,
            required: false,
            default: undefined
        },
        multiselect: {
            type: Boolean,
            required: false,
            default: false
        },
        operator: {
            type: String,
            required: false,
            default: undefined
        },
        optionsLimit: {
            type: Number,
            required: false,
            default: 20000
        },
        placeholder: {
            type: String,
            required: false,
            default: ""
        },
        prechecked: {
            type: [Array, String],
            required: false,
            default: undefined
        },
        renderIcons: {
            type: [String, Object],
            required: false,
            default: undefined
        },
        fixedRules: {
            type: Array,
            required: false,
            default: () => {
                return [];
            }
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        value: {
            type: Array,
            required: false,
            default: undefined
        },
        visible: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data () {
        return {
            disable: true,
            isInitializing: true,
            isAdjusting: false,
            dropdownValue: [],
            dropdownSelected: [],
            styleModel: {},
            legendsInfo: [],
            iconList: {},
            allSelected: false,
            translationKey: "snippetDropdown",
            operatorWhitelist: [
                "EQ",
                "IN",
                "STARTSWITH",
                "ENDSWITH"
            ],
            source: ""
        };
    },
    computed: {
        ariaLabelDropdown () {
            return this.$t("modules.tools.filter.ariaLabel.dropdown", {param: this.attrName});
        },
        ariaLabelRadio () {
            return this.$t("modules.tools.filter.ariaLabel.radio", {param: this.attrName});
        },
        ariaLabelCheckbox () {
            return this.$t("modules.tools.filter.ariaLabel.checkbox", {param: this.attrName});
        },
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        emptyList () {
            return this.$t("modules.tools.filter.dropdown.emptyList");
        },
        noElements () {
            return this.$t("modules.tools.filter.dropdown.noElements");
        },
        dropdownValueComputed () {
            const dropdownValue = [];

            if (!Array.isArray(this.value)) {
                if (Array.isArray(this.dropdownValue)) {
                    this.dropdownValue.forEach(value => {
                        dropdownValue.push(value);
                    });
                }
                dropdownValue.sort((a, b) => {
                    if (typeof this.localeCompareParams === "string") {
                        return localeCompare(a, b, this.localeCompareParams);
                    }
                    else if (isObject(this.localeCompareParams)) {
                        return localeCompare(a, b, this.localeCompareParams.locale, this.localeCompareParams.options);
                    }
                    return localeCompare(a, b);
                });
            }
            else {
                this.value.forEach(key => {
                    if (this.dropdownValue.includes(key)) {
                        dropdownValue.push(key);
                    }
                });
            }

            if (this.multiselect && this.addSelectAll) {
                return [{
                    selectAllTitle: this.selectAllTitle,
                    list: dropdownValue
                }];
            }
            return dropdownValue;
        },
        selectAllTitle () {
            return !this.allSelected ? this.$t("modules.tools.filter.dropdown.selectAll") : this.$t("modules.tools.filter.dropdown.deselectAll");
        },
        securedOperator () {
            if (!this.operatorWhitelist.includes(this.operator)) {
                return getDefaultOperatorBySnippetType("dropdown", typeof this.delimitor === "string" && this.delimitor);
            }
            return this.operator;
        }
    },
    watch: {
        dropdownSelected (value) {
            const prechecked = this.getPrecheckedExistingInValue(this.prechecked, this.dropdownValue);

            if (
                !this.isAdjusting
                && (
                    !this.isInitializing
                    || this.isInitializing && (
                        Array.isArray(prechecked)
                        && prechecked.length
                        || this.prechecked === "all"
                    )
                )
            ) {
                if (typeof value === "string" && value || Array.isArray(value) && value.length) {
                    this.emitCurrentRule(value, this.isInitializing);
                }
                else if (Array.isArray(value) && !value.length && this.source !== "adjust") {
                    this.deleteCurrentRule();
                }
            }
            this.allSelected = this.dropdownValue.length !== 0 && Array.isArray(this.dropdownSelected) && this.dropdownValue.length === this.dropdownSelected.length;
        },
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false || this.isParent) {
                return;
            }

            if (adjusting?.start) {
                if (this.snippetId !== adjusting.snippetId && (!Array.isArray(adjusting.snippetId) || !adjusting.snippetId.includes(this.snippetId))) {
                    this.dropdownValue = [];
                }
                this.isAdjusting = true;
            }

            this.addDropdownValueForAdjustment(this.dropdownValue, this.value, adjusting?.adjust?.value, this.delimitor);

            if (adjusting?.finish) {
                this.setDropdownSelectedAfterAdjustment(this.dropdownValue, this.dropdownSelected, selected => {
                    this.setCurrentSource("adjust");
                    this.dropdownSelected = selected;
                });

                this.$nextTick(() => {
                    this.isAdjusting = false;

                    if (this.delayedPrechecked === "all") {
                        this.dropdownSelected = this.dropdownValue;
                        this.delayedPrechecked = false;
                    }
                    else if (Array.isArray(this.delayedPrechecked) && this.delayedPrechecked.length) {
                        this.dropdownSelected = this.getPrecheckedExistingInValue(this.delayedPrechecked, this.dropdownValue);
                        this.delayedPrechecked = false;
                    }
                });
            }
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        },
        legendsInfo (value) {
            if (this.renderIcons === "fromLegend") {
                this.iconList = getIconListFromLegend(value, this.styleModel);
            }
        }
    },
    created () {
        this.delayedPrechecked = false;
    },
    mounted () {
        this.initializeIcons();

        if (!this.visible) {
            this.dropdownValue = Array.isArray(this.prechecked) ? this.prechecked : [];
            this.dropdownSelected = this.getInitialDropdownSelected(this.prechecked, this.dropdownValue, this.multiselect);
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
                this.emitSnippetPrechecked();
            });
        }
        else if (Array.isArray(this.value)) {
            this.dropdownValue = this.value;
            this.dropdownSelected = this.getInitialDropdownSelected(this.prechecked, this.dropdownValue, this.multiselect);
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
                this.emitSnippetPrechecked(this.prechecked, this.snippetId, this.visible);
            });
        }
        else if (this.api && this.autoInit !== false) {
            this.$nextTick(() => {
                this.api.getUniqueValues(this.attrName, list => {
                    this.dropdownValue = this.splitListWithDelimitor(list, this.delimitor);
                    this.dropdownSelected = this.getInitialDropdownSelected(this.prechecked, this.dropdownValue, this.multiselect);
                    this.$nextTick(() => {
                        this.isInitializing = false;
                        this.disable = false;
                        this.emitSnippetPrechecked(this.prechecked, this.snippetId, this.visible);
                    });
                }, error => {
                    this.disable = false;
                    this.isInitializing = false;
                    this.emitSnippetPrechecked();
                    console.warn(error);
                }, {rules: this.fixedRules, filterId: this.filterId});
            });
        }
        else {
            this.dropdownValue = [];
            this.dropdownSelected = [];
            if (this.isChild && (Array.isArray(this.prechecked) && this.prechecked.length || this.prechecked === "all")) {
                this.delayedPrechecked = this.prechecked;
            }
            this.$nextTick(() => {
                this.isInitializing = false;
                this.disable = false;
                this.emitSnippetPrechecked(this.prechecked, this.snippetId, this.visible);
            });
        }
    },
    methods: {
        translateKeyWithPlausibilityCheck,
        splitListWithDelimitor,

        /**
         * Emits the setSnippetPrechecked event.
         * @param {String[]|String} prechecked The prechecked values.
         * @param {Number} snippetId The snippet id to emit.
         * @param {Boolean} visible true if the snippet is visible, false if not.
         * @returns {void}
         */
        emitSnippetPrechecked (prechecked, snippetId, visible) {
            this.$emit("setSnippetPrechecked", visible && (Array.isArray(prechecked) && prechecked.length || prechecked === "all") ? snippetId : false);
        },
        /**
         * Returns the selected values based on prechecked.
         * @param {String[]|String} prechecked An array of prechecked values or the "all"-flag to select all.
         * @param {String[]} dropdownValue All available values.
         * @param {Boolean} multiselect true if multiselect is activated, false if not.
         * @returns {String[]} A list of preselected values.
         */
        getInitialDropdownSelected (prechecked, dropdownValue, multiselect) {
            if (!Array.isArray(dropdownValue)) {
                return [];
            }
            else if (Array.isArray(prechecked)) {
                return this.getPrecheckedExistingInValue(prechecked, dropdownValue);
            }
            else if (prechecked === "all" && multiselect) {
                return [...dropdownValue];
            }
            return [];
        },
        /**
         * Returns a list of prechecked values that exists in the given dropdown value.
         * @param {String[]|String} prechecked An array of prechecked values or the "all"-flag to select all.
         * @param {String[]} dropdownValue All available values.
         * @returns {String[]} A list of preselected values that exists in dropdown value.
         */
        getPrecheckedExistingInValue (prechecked, dropdownValue) {
            if (!Array.isArray(prechecked) || !Array.isArray(dropdownValue)) {
                return false;
            }
            const result = [],
                dropdownValueAssoc = {};

            dropdownValue.forEach(value => {
                dropdownValueAssoc[value] = true;
            });
            prechecked.forEach(value => {
                if (!Object.prototype.hasOwnProperty.call(dropdownValueAssoc, value)) {
                    return;
                }
                result.push(value);
            });
            return result;
        },
        /**
         * Initializes the icons if any.
         * @returns {void}
         */
        initializeIcons () {
            if (this.renderIcons === "fromLegend") {
                this.styleModel = getStyleModel(this.layerId);

                if (!this.styleModel || !this.styleModel.getLegendInfos() || !Array.isArray(this.styleModel.getLegendInfos())) {
                    this.legendsInfo = [];
                }
                else {
                    this.legendsInfo = this.styleModel.getLegendInfos();
                }
            }
            else if (isObject(this.renderIcons)) {
                this.iconList = this.renderIcons;
            }
        },
        /**
         * Returns true if an icon path exists for the given value.
         * @param {String} value the value to check for
         * @returns {Boolean} true if there is an icon path, false if not
         */
        iconExists (value) {
            return Object.prototype.hasOwnProperty.call(this.iconList, value);
        },
        /**
         * Returns true if there are any icons to show.
         * @returns {Boolean} true if there are any icons, false if not
         */
        anyIconExists () {
            return Object.keys(this.iconList).length > 0;
        },
        /**
         * Returns the title to use in the gui.
         * @returns {String} the title to use
         */
        getTitle () {
            return this.title || this.attrName;
        },
        /**
         * Returns the computed dropdown value to display in the list.
         * @returns {String[]} An array of value to display.
         */
        getDropdownValueForList () {
            const dropdownValue = this.dropdownValueComputed;

            if (!Array.isArray(dropdownValue) || !dropdownValue.length) {
                return [];
            }
            else if (isObject(dropdownValue[0])) {
                return Array.isArray(dropdownValue[0].list) ? dropdownValue[0].list : [];
            }
            return dropdownValue;
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        emitCurrentRule (value, startup = false) {
            let result = [];

            if (typeof value === "string") {
                result = value;
            }
            else if (Array.isArray(value)) {
                value.forEach(obj => {
                    if (typeof obj === "string") {
                        result.push(obj);
                    }
                    else if (isObject(obj) && obj.title) {
                        result.push(obj.title);
                    }
                });
            }
            this.$emit("changeRule", {
                snippetId: this.snippetId,
                startup,
                fixed: !this.visible,
                attrName: this.attrName,
                operator: this.securedOperator,
                value: result
            });
        },
        /**
         * Emits the delete rule function to whoever is listening.
         * @returns {void}
         */
        deleteCurrentRule () {
            this.$emit("deleteRule", this.snippetId);
        },
        /**
         * Resets the values of this snippet.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (onsuccess) {
            if (this.visible) {
                this.dropdownSelected = [];
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            });
        },
        /**
         * Select all items
         * @returns {void}
         */
        selectAll () {
            this.dropdownSelected = [...this.dropdownValue];
        },
        /**
         * Deselect all items
         * @returns {void}
         */
        deselectAll () {
            this.dropdownSelected = [];
        },
        /**
         * Adds a set of new value to dropdownValue.
         * @param {String[]} dropdownValue the current dropdownValue to adjust
         * @param {String[]} configValue the value set by configuration, if any
         * @param {String[]} adjustmentValue the value to adjust dropdownValue with
         * @param {String} [delimitor=false] the delimitor to use, false if not set
         * @returns {void}
         */
        addDropdownValueForAdjustment (dropdownValue, configValue, adjustmentValue, delimitor = false) {
            if (!Array.isArray(dropdownValue) || !Array.isArray(adjustmentValue)) {
                return;
            }
            const dropdownValueAssoc = {},
                configValueAssoc = {};

            dropdownValue.forEach(value => {
                dropdownValueAssoc[value] = true;
            });
            if (Array.isArray(configValue)) {
                configValue.forEach(value => {
                    configValueAssoc[value] = true;
                });
            }

            adjustmentValue.forEach(value => {
                if (delimitor && typeof value === "string" && value.indexOf(delimitor)) {
                    this.addDropdownValueForAdjustment(dropdownValue, configValue, value.split(delimitor), false);
                }
                else if (!dropdownValueAssoc[value] && (!Array.isArray(configValue) || Array.isArray(configValue) && configValueAssoc[value])) {
                    dropdownValueAssoc[value] = true;
                    this.dropdownValue.push(value);
                }
            });
        },
        /**
         * Setter by callback for dropdownSelected.
         * @param {String[]} dropdownValue the current dropdownValue with available data
         * @param {String[]} dropdownSelected all selected value from before the adjustment
         * @param {Function} setDropdownSelected a callback function(selected) to set dropdownSelected with
         * @returns {void}
         */
        setDropdownSelectedAfterAdjustment (dropdownValue, dropdownSelected, setDropdownSelected) {
            const selected = typeof dropdownSelected === "string" ? [dropdownSelected] : dropdownSelected,
                result = [],
                dropdownSelectedAssoc = {};

            if (typeof setDropdownSelected !== "function") {
                return;
            }
            else if (!Array.isArray(dropdownValue) || !Array.isArray(selected)) {
                setDropdownSelected([]);
                return;
            }

            selected.forEach(value => {
                dropdownSelectedAssoc[value] = true;
            });
            dropdownValue.forEach(value => {
                if (dropdownSelectedAssoc[value]) {
                    result.push(value);
                }
            });

            setDropdownSelected(result);
        },
        /**
         * Sets the current source for input data.
         * @param {String} source The type of source 'adjust' and 'dropdown'.
         * @returns {void}
         */
        setCurrentSource (source) {
            if (typeof source !== "string") {
                return;
            }
            this.source = source;
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetDropdownContainer"
    >
        <div
            v-if="info"
            class="right"
        >
            <SnippetInfo
                :info="info"
                :translation-key="translationKey"
            />
        </div>
        <div
            v-if="display === 'default'"
            class="snippetDefaultContainer"
        >
            <div
                v-if="title !== false"
                class="left"
            >
                <label
                    class="select-box-label"
                    :for="'snippetSelectBox-' + snippetId"
                >{{ titleText }}</label>
            </div>
            <div
                ref="selectBoxContainer"
                class="filter-select-box-container"
            >
                <Multiselect
                    :id="'snippetSelectBox-' + snippetId"
                    v-model="dropdownSelected"
                    :aria-label="ariaLabelDropdown"
                    :options="dropdownValueComputed"
                    name="select-box"
                    :disabled="disable"
                    :multiple="multiselect"
                    :placeholder="placeholder"
                    :show-labels="false"
                    open-direction="auto"
                    :options-limit="optionsLimit"
                    :hide-selected="true"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :loading="disable"
                    :group-select="multiselect && addSelectAll"
                    :group-values="(multiselect && addSelectAll) ? 'list' : ''"
                    :group-label="(multiselect && addSelectAll) ? 'selectAllTitle' : ''"
                    @remove="setCurrentSource('dropdown')"
                >
                    <span slot="noOptions">{{ emptyList }}</span>
                    <span slot="noResult">{{ noElements }}</span>
                </Multiselect>
            </div>
        </div>
        <div
            v-if="display === 'list'"
            class="snippetListContainer"
        >
            <div class="grid-container">
                <div
                    class="grid-item"
                >
                    {{ titleText }}
                </div>
                <div
                    v-if="multiselect && addSelectAll"
                    class="grid-item"
                >
                    <a
                        href="#"
                        class="link-dark"
                        @click="!allSelected ? selectAll() : deselectAll()"
                    >
                        {{ selectAllTitle }}
                    </a>
                </div>
                <div
                    v-for="val in getDropdownValueForList()"
                    :key="snippetId + '-' + val"
                    class="grid-item"
                >
                    <span
                        v-if="anyIconExists()"
                        class="subItem"
                    >
                        <label
                            :for="'snippetRadioCheckbox-' + snippetId + '-' + val"
                        >
                            <img
                                v-show="iconExists(val)"
                                class="snippetListContainerIcon"
                                :src="iconList[val]"
                                :alt="val"
                            >
                        </label>
                    </span>
                    <span
                        class="subItem"
                    >
                        <input
                            v-if="multiselect"
                            :id="'snippetRadioCheckbox-' + snippetId + '-' + val"
                            v-model="dropdownSelected"
                            :aria-label="ariaLabelCheckbox"
                            class="checkbox"
                            :disabled="disable"
                            type="checkbox"
                            :value="val"
                            tabindex="0"
                        >
                        <input
                            v-else
                            :id="'snippetRadioCheckbox-' + snippetId + '-' + val"
                            v-model="dropdownSelected[0]"
                            :aria-label="ariaLabelRadio"
                            class="radio"
                            :disabled="disable"
                            type="radio"
                            :value="val"
                            tabindex="0"
                        >
                    </span>
                    <span
                        class="subItem"
                    >
                        <label
                            class="check-box-label"
                            :for="'snippetRadioCheckbox-' + snippetId + '-' + val"
                        >{{ val }}</label>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss">
    @import "~variables";
    .filter-select-box-container .multiselect, .filter-select-box-container .multiselect__input, .filter-select-box-container .multiselect__single {
        font-family: inherit;
        font-size: $font-size-base;
    }
    .filter-select-box-container .multiselect .multiselect__spinner:after, .multiselect__spinner:before {
        position: absolute;
        content: "";
        top: 50%;
        left: 50%;
        margin: -8px 0 0 -8px;
        width: 16px;
        height: 16px;
        border-radius: 100%;
        border: 2px solid transparent;
        border-top-color: $dark_grey;
        box-shadow: 0 0 0 1px transparent;
    }
    .filter-select-box-container .multiselect .multiselect__option {
        display: block;
        min-height: 16px;
        line-height: 8px;
        text-decoration: none;
        text-transform: none;
        vertical-align: middle;
        position: relative;
        cursor: pointer;
        white-space: nowrap;
        padding: 10px 12px;
    }
    .filter-select-box-container .multiselect .multiselect__option--highlight {
        background: $light_blue;
        outline: none;
        color: $white;
    }
    .filter-select-box-container .multiselect .option__image {
        width: 22px;
    }
    .filter-select-box-container .multiselect .multiselect__tag {
        position: relative;
        display: inline-block;
        padding: 4px 26px 4px 10px;
        border-radius: 5px;
        margin-right: 10px;
        color: $white;
        line-height: 1;
        background: $light_blue;
        margin-bottom: 5px;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
    }
    .filter-select-box-container .multiselect .multiselect__tags:focus-within {
        border-color: $light_blue;
        outline: 0;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%), 0 0 8px rgb(102 175 233 / 60%);
    }
    .filter-select-box-container .multiselect .multiselect__option--highlight:after {
        content: attr(data-select);
        background: $light_blue;
        color: $white;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon::after {
        content: "\D7";
        color: $light_grey;
        font-size: $font_size_big;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon:hover {
        background: $light_blue;
    }
    .filter-select-box-container .multiselect .multiselect__placeholder {
        color: $light_grey;
        display: inline-block;
        margin-bottom: 0;
        padding-top: 0;
        font-size: $font_size_big;
    }
    .filter-select-box-container .multiselect .multiselect__tag-icon:focus, .multiselect__tag-icon:hover {
        background: $light_grey;
    }
    .filter-select-box-container .multiselect__select {
        height: 34px;
        line-height: 14px;
    }
    .filter-select-box-container .multiselect__select::before {
        top: 64%;
    }
    .filter-select-box-container .multiselect--active {
        color: $black;
        background-color: $white;
        border-color: $light_blue;
        outline: 0;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    .filter-select-box-container .multiselect .multiselect__tags {
        min-height: 34px;
        font-size: $font-size-base;
        line-height: 1.428571429;
        color: $dark_grey;
        background-color: $white;
        background-image: none;
        border: 1px solid #ccc;
        border-radius: 0;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
        transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
    }
</style>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";
    .snippetListContainer .check-box-label {
        margin: 0;
    }
    .snippetListContainer .subItem {
        padding: 0 5px 0 0;
        vertical-align: text-bottom;
    }
    .snippetListContainer .grid-container {
        display: grid;
        grid-template-columns: auto;
        padding: 5px;
    }
    .snippetListContainer .grid-item {
        padding: 5px;
        text-align: left;
    }
    .snippetListContainer .grid-container > div {
        text-align: left;
        padding: 5px 0;
    }
    select {
        box-sizing: border-box;
        outline: 0;
        position: relative;
        width: 100%;
        margin-bottom: 5px;
    }
    .disabled {
        border-color: $light_grey;
        background-color: $white;
    }
    .enabled {
        border-color: initial;
        background-color: initial;
    }
    .snippetDropdownContainer {
        height: auto;
    }
    .snippetDropdownContainer .radio, .snippetDropdownContainer .checkbox {
        display: inline-block;
    }
    .snippetDropdownContainer label {
        margin-bottom: 0;
    }
    .snippetListContainer .snippetListContainerIcon {
        width: 25px;
    }
    .snippetDropdownContainer select {
        clear: left;
        width: 100%;
    }
    .snippetDropdownContainer .bottom {
        clear: left;
        width: 100%;
    }
    .panel .snippetDropdownContainer .right, .snippetDropdownContainer .right {
        position: absolute;
        right: 0;
    }
</style>
