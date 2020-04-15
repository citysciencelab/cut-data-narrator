import SnippetModel from "../model";
import ValueModel from "../value/model";

const MultiCheckboxModel = SnippetModel.extend({
    defaults: {
        values: [],
        preselectedValues: []
    },

    initialize: function () {
        this.superInitialize();
        this.addValueModels(this.get("values"));
        if (this.get("preselectedValues").length > 0) {
            this.get("preselectedValues").forEach(function (preselectedValue) {
                this.updateSelectedValues(preselectedValue, true);
            }, this);
        }
        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        this.listenTo(this.get("valuesCollection"), {
            "change:isSelected": function () {
                this.triggerValuesChanged();
                this.trigger("render");
            }
        });
    },

    /**
     * calls addValueModel for each value
     * @param {string[]} valueList - init dropdown values
     * @returns {void}
     */
    addValueModels: function (valueList) {
        valueList.forEach(function (value) {
            this.addValueModel(value);
        }, this);
    },

    /**
     * creates a model value and adds it to the value collection
     * @param  {string} value - value
     * @returns {void}
     */
    addValueModel: function (value) {
        const isNewVectorStyle = Config.hasOwnProperty("useVectorStyleBeta") && Config.useVectorStyleBeta ? Config.useVectorStyleBeta : false;

        this.get("valuesCollection").add(new ValueModel({
            attr: this.get("name"),
            value: value,
            iconPath: isNewVectorStyle ? this.getIconPath() : this.getIconPathOld(value),
            displayName: value,
            isSelected: this.get("isInitialLoad") ? true : this.get("preselectedValues").indexOf(value) !== -1,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    /**
     * Determines the iconPath and returns it
     * @returns {string} - path to Icon
     */
    getIconPath: function () {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});
        let styleId,
            styleModel,
            iconPath = "";

        if (layerModel) {
            styleId = layerModel.get("styleId");

            if (styleId) {
                styleModel = Radio.request("StyleList", "returnModelById", styleId);
            }
        }

        if (styleModel && styleModel.getLegendInfos() && Array.isArray(styleModel.getLegendInfos())) {

            styleModel.getLegendInfos().forEach(legendInfo => {
                if (legendInfo.geometryType) {
                    if (legendInfo.geometryType === "Point") {
                        const type = legendInfo.styleObject.get("type");

                        if (type === "icon") {
                            iconPath = legendInfo.styleObject.get("imagePath") + legendInfo.styleObject.get("imageName");
                        }
                        else if (type === "circle") {
                            iconPath = this.createCircleSVG(styleModel);
                        }
                    }
                    else if (legendInfo.geometryType === "LineString") {
                        iconPath = this.createLineSVG(legendInfo.styleObject);
                    }
                    else if (legendInfo.geometryType === "Polygon") {
                        iconPath = this.createPolygonSVG(legendInfo.styleObject);
                    }
                }
            });
        }

        return iconPath;
    },

    /**
     * creates a model value and adds it to the value collection
     * @deprecated with new vectorStyle module
     * @param  {string} value - value
     * @returns {string} - path to Icon
     */
    getIconPathOld: function (value) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});
        let styleId,
            styleModel,
            valueStyle,
            iconPath;

        if (layerModel) {
            styleId = layerModel.get("styleId");

            if (styleId) {
                styleModel = Radio.request("StyleList", "returnModelById", styleId);
            }
        }

        if (styleModel) {
            valueStyle = styleModel.get("styleFieldValues").filter(function (styleFieldValue) {
                return styleFieldValue.styleFieldValue === value;
            });
        }

        if (valueStyle) {
            iconPath = styleModel.get("imagePath") + valueStyle[0].imageName;
        }

        return iconPath;
    },

    /**
     * resetCollection
     * @return {void}
     */
    resetValues: function () {
        const models = this.get("valuesCollection").models;

        models.forEach(function (model) {
            model.set("isSelectable", true);
        }, this);
    },

    /**
     * checks the value model if it is selected or not
     * @param {string} value - selected value in the multicheckbox list
     * @param {boolean} checked - is checkbox checked or unchecked
     * @returns {void}
     */
    updateSelectedValues: function (value, checked) {
        const models = this.get("valuesCollection").models;

        models.forEach(function (valueModel) {
            if (valueModel.get("displayName") === value.trim()) {
                valueModel.set("isSelected", checked);
            }
        });
    },

    /**
     * checks the value models if they are selectable or not
     * @param {string[]} values - filtered values
     * @fires MultiCheckboxView#render
     * @returns {void}
     */
    updateSelectableValues: function (values) {
        this.get("valuesCollection").each(function (valueModel) {
            if ((!Array.isArray(values) || values.indexOf(valueModel.get("value")) === -1) && !valueModel.get("isSelected")) {
                valueModel.set("isSelectable", false);
            }
            else {
                valueModel.set("isSelectable", true);
            }
        }, this);

        this.setValueModelsToShow(this.get("valuesCollection").where({isSelectable: true}));
        this.trigger("render");
    },
    /**
     * sets the valueModelsToShow attribute
     * @param  {Backbone.Model[]} value - all value models that can be selected
     * @returns {void}
     */
    setValueModelsToShow: function (value) {
        this.set("valueModelsToShow", value);
    },

    getSelectedValues: function () {
        const selectedModels = this.get("valuesCollection").where({isSelected: true}),
            obj = {
                attrName: this.get("name"),
                type: this.get("type"),
                values: []
            };

        if (selectedModels.length > 0) {
            selectedModels.forEach(function (model) {
                obj.values.push(model.get("value"));
            });
        }
        return obj;
    },
    setDisplayName: function (value) {
        this.set("displayName", value);
    }
});

export default MultiCheckboxModel;
