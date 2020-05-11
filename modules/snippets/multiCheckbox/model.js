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
            iconPath: isNewVectorStyle ? this.getIconPath(value) : this.getIconPathOld(value),
            displayName: value,
            isSelected: this.get("isInitialLoad") ? true : this.get("preselectedValues").indexOf(value) !== -1,
            isSelectable: true,
            type: this.get("type")
        }));
    },

    /**
     * Determines the iconPath and returns it
     * @param  {string} value - value of category to display in multiCheckbox
     * @returns {string} - path to Icon
     */
    getIconPath: function (value) {
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

            styleModel.getLegendInfos().forEach(function (legendInfo) {
                if (legendInfo.label === value) {
                    if (legendInfo.styleObject.get("type") === "icon") {
                        iconPath = legendInfo.styleObject.get("imagePath") + legendInfo.styleObject.get("imageName");
                    }
                    else if (legendInfo.geometryType) {
                        if (legendInfo.geometryType === "Point") {
                            iconPath = this.createCircleSVG(styleModel);
                        }
                        else if (legendInfo.geometryType === "LineString") {
                            iconPath = this.createLineSVG(legendInfo.styleObject);
                        }
                        else if (legendInfo.geometryType === "Polygon") {
                            iconPath = this.createPolygonSVG(legendInfo.styleObject);
                        }
                    }
                }
            }.bind(this));
        }

        return iconPath;
    },

    /**
     * Creates an SVG for a polygon
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createPolygonSVG: function (style) {
        let svg = "";
        const fillColor = style.get("polygonFillColor") ? this.colorToRgb(style.get("polygonFillColor")) : "black",
            strokeColor = style.get("polygonStrokeColor") ? this.colorToRgb(style.get("polygonStrokeColor")) : "black",
            strokeWidth = style.get("polygonStrokeWidth"),
            fillOpacity = style.get("polygonFillColor")[3] || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3] || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
        svg += fillColor;
        svg += ";fill-opacity:";
        svg += fillOpacity;
        svg += ";stroke:";
        svg += strokeColor;
        svg += ";stroke-opacity:";
        svg += strokeOpacity;
        svg += ";stroke-width:";
        svg += strokeWidth;
        svg += ";'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a circle
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createCircleSVG: function (style) {
        let svg = "";
        const circleStrokeColor = style.get("circleStrokeColor") ? this.colorToRgb(style.get("circleStrokeColor")) : "black",
            circleStrokeOpacity = style.get("circleStrokeColor")[3] || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.get("circleFillColor") ? this.colorToRgb(style.get("circleFillColor")) : "black",
            circleFillOpacity = style.get("circleFillColor")[3] || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
        svg += circleStrokeColor;
        svg += "' stroke-opacity='";
        svg += circleStrokeOpacity;
        svg += "' stroke-width='";
        svg += circleStrokeWidth;
        svg += "' fill='";
        svg += circleFillColor;
        svg += "' fill-opacity='";
        svg += circleFillOpacity;
        svg += "'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a line
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createLineSVG: function (style) {
        let svg = "";
        const strokeColor = style.get("lineStrokeColor") ? this.colorToRgb(style.get("lineStrokeColor")) : "black",
            strokeWidth = style.get("lineStrokeWidth"),
            strokeOpacity = style.get("lineStrokeColor")[3] || 0,
            strokeDash = style.get("lineStrokeDash") ? style.get("lineStrokeDash").join(" ") : undefined;

        svg += "<svg height='35' width='35'>";
        svg += "<path d='M 05 30 L 30 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
        if (strokeDash) {
            svg += "' stroke-dasharray='";
            svg += strokeDash;
        }
        svg += "' fill='none'/>";
        svg += "</svg>";

        return svg;
    },


    /**
     * Returns a rgb color string that can be interpreted in SVG.
     * @param   {integer[]} color color set in style
     * @returns {string} svg color
     */
    colorToRgb: function (color) {
        return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
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
