<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getLayerInformationModule from "../utils/getLayerInformation";
import ToolTemplate from "../../ToolTemplate.vue";
import {getComponent} from "../../../../utils/getComponent";
import SimpleButton from "../../../../share-components/SimpleButton.vue";

export default {
    name: "WfsTransaction",
    components: {SimpleButton, ToolTemplate},
    computed: {
        ...mapGetters("Tools/Wfst", ["currentInteractionConfig", "currentLayerIndex", "featureProperties", "layerIds", "layerInformation", "layerSelectDisabled", "layerSelectLabel", "selectedInteraction", "showInteractionsButtons", "active", "deactivateGFI", "icon", "name"])
    },
    watch: {
        active (val) {
            this.setActive(val);
        }
    },
    created () {
        this.$on("close", this.close);
        Backbone.Events.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": async () => {
                const newLayerInformation = await getLayerInformationModule.getLayerInformation(this.layerIds),
                    firstActiveLayer = newLayerInformation.findIndex(layer => layer.isSelected),
                    currentLayerDeactivated = this.currentLayerIndex > -1 && !newLayerInformation[this.currentLayerIndex].isSelected;

                this.setLayerInformation(newLayerInformation);
                if ((this.currentLayerIndex === -1 && firstActiveLayer > -1) ||
                    (this.currentLayerIndex > -1 && firstActiveLayer === -1) ||
                    (currentLayerDeactivated && firstActiveLayer > -1)) {
                    this.setCurrentLayerIndex(firstActiveLayer);
                }
                if (currentLayerDeactivated) {
                    this.reset();
                }
                this.setFeatureProperties();
            }
        });
    },
    methods: {
        ...mapMutations("Tools/Wfst", ["setCurrentLayerIndex", "setLayerInformation"]),
        ...mapActions("Tools/Wfst", ["prepareInteraction", "reset", "save", "setActive", "setFeatureProperty", "setFeatureProperties"]),
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        layerChanged (index) {
            this.setCurrentLayerIndex(index);
            this.setFeatureProperties();
            this.reset();
        },
        getInputType (type) {
            if (type === "string") {
                return "text";
            }
            if (["integer", "int", "decimal"].includes(type)) {
                return "number";
            }
            if (type === "boolean") {
                return "checkbox";
            }
            if (type === "date") {
                return "date";
            }
            return "";
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div id="tool-wfsTransaction-container">
                <div id="tool-wfsTransaction-layerSelect-container">
                    <label
                        id="tool-wfsTransaction-layerSelect-label"
                        for="tool-wfsTransaction-layerSelect"
                    >
                        {{ $t(layerSelectLabel) }}
                    </label>
                    <select
                        id="tool-wfsTransaction-layerSelect"
                        class="form-select"
                        :disabled="layerSelectDisabled"
                        @change="layerChanged($event.target.options.selectedIndex)"
                    >
                        <option
                            v-for="(layer, index) of layerInformation"
                            :key="layer.id"
                            :selected="index === currentLayerIndex"
                        >
                            {{ $t(layer.name) }}
                        </option>
                    </select>
                </div>
                <template v-if="typeof featureProperties === 'string'">
                    <div id="tool-wfsTransaction-layerFailure">
                        {{ $t(featureProperties) }}
                    </div>
                </template>
                <div
                    v-else-if="showInteractionsButtons"
                    id="tool-wfsTransaction-interactionSelect-container"
                >
                    <template v-for="(config, key) in currentInteractionConfig">
                        <SimpleButton
                            v-if="config.available"
                            :key="key"
                            :text="config.text"
                            :icon="config.icon"
                            :interaction="() => prepareInteraction(key)"
                        />
                    </template>
                </div>
                <template v-else>
                    <div id="tool-wfsTransaction-form-container">
                        <hr>
                        <p v-if="currentInteractionConfig.Polygon.available">
                            {{ $t("common:modules.tools.wfsTransaction.polygonHint") }}
                        </p>
                        <form id="tool-wfsTransaction-form">
                            <template v-for="property of featureProperties">
                                <template v-if="property.type !== 'geometry'">
                                    <label
                                        :key="`${property.key}-label`"
                                        :for="`tool-wfsTransaction-form-input-${property.key}`"
                                        class="form-label"
                                    >
                                        {{ $t(property.label) }}
                                    </label>
                                    <input
                                        :id="`tool-wfsTransaction-form-input-${property.key}`"
                                        :key="`${property.key}-input`"
                                        class="form-control"
                                        :type="getInputType(property.type)"
                                        :required="property.required"
                                        :value="property.value"
                                        @input="event => setFeatureProperty({key: property.key, type: getInputType(property.type), value: event.target.value})"
                                    >
                                </template>
                            </template>
                            <div id="tool-wfsTransaction-form-buttons">
                                <SimpleButton
                                    :interaction="reset"
                                    text="common:modules.tools.wfsTransaction.form.discard"
                                />
                                <SimpleButton
                                    :interaction="save"
                                    text="common:modules.tools.wfsTransaction.form.save"
                                    type="submit"
                                />
                            </div>
                        </form>
                    </div>
                </template>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
$margin: 1rem;

#tool-wfsTransaction-container {
    #tool-wfsTransaction-layerSelect-container {
        display: flex;
        justify-content: space-between;

        #tool-wfsTransaction-layerSelect-label {
            width: 10em;
            align-self: center;
        }
    }

    #tool-wfsTransaction-layerFailure {
        display: flex;
        justify-content: center;
        align-content: center;
        margin-top: $margin;
    }

    #tool-wfsTransaction-interactionSelect-container {
        display: flex;
        justify-content: space-between;
        margin-top: $margin;

        button {
            margin: 5px;
        }
        button:first-child {
            margin-left: 0;
        }
        button:last-child {
            margin-right: 0;
        }
    }

    #tool-wfsTransaction-form-container {
        width: 40em;
    }

    #tool-wfsTransaction-form {
        display: grid;
        grid-template-columns: 10em 30em;
        grid-row-gap: calc(#{$margin} / 2);

        label {
            align-self: center;
            margin: 0;
        }
    }

    #tool-wfsTransaction-form-buttons {
        display: grid;
        grid-template-columns: repeat(2, 20em);
        margin-top: calc(#{$margin} / 2);

        button:first-child {
            margin-right: calc(#{$margin} / 2);
        }
        button:last-child {
            margin-left: calc(#{$margin} / 2);
        }
    }
}
</style>
