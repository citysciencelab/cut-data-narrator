const StyleModel = Backbone.Model.extend(/** @lends StyleModel.prototype */{
    /**
     * @description Class to maintain some methods.
     * @class PolygonStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     */
    defaults: {},

    /*
    * setter for feature
    * @param {ol/feature} value feature
    * @returns {void}
    */
    setFeature: function (value) {
        this.set("feature", value);
    },

    /*
    * setter for isClustered
    * @param {Boolean} value isClustered
    * @returns {void}
    */
    setIsClustered: function (value) {
        this.set("isClustered", value);
    },

    /*
    * setter for styles
    * @param {object} styles styles
    * @returns {void}
    */
    overwriteStyling: function (styles) {
        let key;

        for (key in styles) {
            const value = styles[key];

            this.set(key, value);
        }
    }
});

export default StyleModel;