<script>
import isObject from "../../../../utils/isObject";
import {mapActions} from "vuex";

export default {
    name: "DrawItemAttributes",
    props: {
        selectedFeature: {
            type: Object,
            requried: false,
            default: undefined
        },
        layer: {
            type: Object,
            requried: false,
            default: undefined
        }
    },
    data () {
        return {
            attributeKey: "",
            attributeValue: "",
            attributes: [],
            validKeys: [],
            addKey: {valid: true, message: ""}
        };
    },
    watch: {
        selectedFeature (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            this.setAttributesFromFeature();
        },
        attributes: {
            handler () {
                if (!this.checkAttributes(this.attributes)) {
                    return;
                }
                this.saveChanges(this.attributes, this.selectedFeature, this.layer);
            },
            deep: true
        }
    },
    mounted () {
        this.setAttributesFromFeature();
    },
    methods: {
        ...mapActions("Tools/Draw", ["setDownloadFeatures"]),

        /**
         * Sets the local attributes by the attributes from the selected feature.
         * @returns {void}
         */
        setAttributesFromFeature () {
            if (!this.isFeature()) {
                return;
            }
            this.attributes = [];
            const attributes = this.selectedFeature.get("attributes");

            if (isObject(attributes)) {
                Object.entries(attributes).forEach(([key, value]) => {
                    const attr = {key, value};

                    if (key !== "geometry") {
                        this.attributes.push(attr);
                    }
                });
            }
            this.attributeKey = "";
            this.attributeValue = "";
            this.addKey = {valid: true, message: ""};
            this.switchToRef("attributeKey");
        },
        /**
         * Add new attribute to the selected feature and the local attributes array.
         * @returns {void}
         */
        addAttributesToFeature () {
            if (!this.isFeature()) {
                return;
            }
            if (!this.attributeKey) {
                this.addKey = {
                    valid: false,
                    message: this.$t("common:modules.tools.draw.attributeSelect.attributeKeyError")
                };
                return;
            }
            if (this.attributes.some(attr => attr?.key === this.attributeKey)) {
                this.addKey = {
                    valid: false,
                    message: this.$t("common:modules.tools.draw.attributeSelect.attributeDuplicatedKeyError")
                };
                return;
            }

            if (!isObject(this.selectedFeature.get("attributes"))) {
                this.selectedFeature.set("attributes", {});
            }
            this.selectedFeature.get("attributes")[this.attributeKey] = this.attributeValue;
            const attr = {key: this.attributeKey, value: this.attributeValue};

            this.attributes.push(attr);
            this.attributeKey = "";
            this.attributeValue = "";
            this.setDownloadFeatures();
        },
        /**
         * Removes attribute row from the local attributes array and removes the attribute from the feature.
         * @param {Number} idx The index of the row of the local attributes.
         * @returns {void}
         */
        removeAttribute (idx) {
            if (!this.isFeature() || !isObject(this.attributes[idx])) {
                return;
            }
            const key = this.attributes[idx].key;

            delete this.selectedFeature.get("attributes")[key];
            this.selectedFeature.unset(key);
            this.$delete(this.attributes, idx);
            this.setDownloadFeatures();
        },
        /**
         * Save the current changes which were made on already existing attributes.
         * @param {String[]} addedAttributes the added feature attributes
         * @param {ol/Feature} selectedFeature the selected feature to add attributes
         * @param {module:ol/layer/Vector} layer The drawn layer
         * @returns {void}
         */
        saveChanges (addedAttributes, selectedFeature, layer) {
            if (!Array.isArray(addedAttributes)) {
                return;
            }
            const attributes = {},
                gfiAttributes = isObject(layer?.get("gfiAttributes")) ? layer?.get("gfiAttributes") : {};

            addedAttributes.forEach(attributeRow => {
                if (!isObject(attributeRow)) {
                    return;
                }
                const key = attributeRow.key,
                    value = attributeRow.value;

                attributes[key] = value;
                gfiAttributes[key] = key;
            });

            if (Object.keys(attributes).length) {
                selectedFeature.set("attributes", attributes);
                selectedFeature.setProperties(attributes);
                layer.set("gfiAttributes", gfiAttributes);
            }
        },
        /**
         * Checks if the selectedFeature is a feature.
         * @returns {Boolean} true if its a feature, false if not.
         */
        isFeature () {
            return isObject(this.selectedFeature);
        },
        /**
         * Checks the given attributes on duplicated keys and empty keys.
         * @param {Object[]} attributes The attributes array.
         * @returns {Boolean} true if attributes array is fine, false if key is duplicated or empty.
         */
        checkAttributes (attributes) {
            const keyStatus = {};
            let success = true;

            attributes.forEach(attribute => {
                if (!Object.prototype.hasOwnProperty.call(keyStatus, attribute.key)) {
                    keyStatus[attribute.key] = {valid: true};
                    if (!attribute.key) {
                        keyStatus[attribute.key].valid = false;
                        keyStatus[attribute.key].message = this.$t("common:modules.tools.draw.attributeSelect.attributeKeyError");
                        success = false;
                    }
                }
                else {
                    if (!isObject(keyStatus[attribute.key])) {
                        keyStatus[attribute.key] = {};
                    }
                    keyStatus[attribute.key].valid = false;
                    keyStatus[attribute.key].message = this.$t("common:modules.tools.draw.attributeSelect.attributeDuplicatedKeyError");
                    success = false;
                }
            });
            this.validKeys = keyStatus;
            return success;
        },
        switchToRef (ref) {
            if (typeof this.$refs[ref]?.focus === "function") {
                this.$refs[ref].focus();
            }
        }
    }
};
</script>

<template>
    <form id="draw-attributes">
        <div
            v-if="isFeature()"
            class="form-group form-group-sm"
        >
            <div
                v-for="(attribute, idx) in attributes"
                :key="idx"
                class="row align-items-center text-center justify-content-center mb-1"
            >
                <div class="col-5 position-relative">
                    <div class="input-group has-validation">
                        <input
                            :id="'key-input-'+idx"
                            v-model="attribute.key"
                            aria-label="attribute"
                            type="text"
                            :title="validKeys[attribute.key].valid === false ? validKeys[attribute.key].message : false"
                            :class="[validKeys[attribute.key].valid === false ? 'is-invalid' : '', 'form-control']"
                            placeholder="Attribute key"
                        >
                    </div>
                </div>
                <div class="col-1">
                    -
                </div>
                <div class="col-5">
                    <input
                        v-model="attribute.value"
                        aria-label="attribute"
                        type="text"
                        class="form-control"
                        placeholder="Attribute value"
                    >
                </div>
                <div class="col-1">
                    <i
                        :title="$t('common:modules.tools.draw.attributeSelect.remove')"
                        class="bi bi-trash"
                        @click="removeAttribute(idx)"
                        @keypress.enter="removeAttribute(idx) "
                    />
                </div>
            </div>
            <div class="row align-items-center text-center justify-content-center">
                <div class="col-5">
                    <div class="input-group has-validation">
                        <input
                            id="attribute-key-input"
                            ref="attributeKey"
                            v-model="attributeKey"
                            aria-label="attribute"
                            type="text"
                            :title="addKey.valid === false ? addKey.message : false"
                            :class="[addKey.valid === false ? 'is-invalid' : '', 'form-control']"
                            :placeholder="$t('common:modules.tools.draw.attributeSelect.input.key')"
                            @input="addKey.valid = true"
                            @keyup.enter="switchToRef('attributeValue')"
                        >
                    </div>
                </div>
                <div class="col-1">
                    -
                </div>
                <div class="col-5">
                    <input
                        ref="attributeValue"
                        v-model="attributeValue"
                        aria-label="attribute"
                        type="text"
                        class="form-control"
                        :placeholder="$t('common:modules.tools.draw.attributeSelect.input.value')"
                        @keyup.enter="addAttributesToFeature(), switchToRef('attributeKey')"
                    >
                </div>
                <div
                    class="col-1"
                    tabindex="0"
                    @click="addAttributesToFeature()"
                    @keypress.enter="addAttributesToFeature()"
                >
                    <i
                        :title="$t('common:modules.tools.draw.attributeSelect.save')"
                        class="bi bi-save"
                    />
                </div>
            </div>
        </div>
        <div v-else>
            <span>{{ $t("common:modules.tools.draw.attributeSelect.noFeatureSelected") }}</span>
        </div>
    </form>
</template>

<style scoped>
hr {
    margin: 0;
}
.bi-trash, .bi-save {
    cursor: pointer;
}
.col-1 {
    padding: 0;
    width: auto;
}
</style>
