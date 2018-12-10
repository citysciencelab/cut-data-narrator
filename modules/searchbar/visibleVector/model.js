import "../model";

const VisibleVectorModel = Backbone.Model.extend({
    /**
    *
    */
    defaults: {
        inUse: false,
        minChars: 3,
        layerTypes: ["WFS"]
    },
    /**
     * @description Initialisierung der visibleVector Suche
     * @param {Object} config - Das Konfigurationsobjekt der Suche in sichtbaren Vector-Layern.
     * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
     * @returns {void}
     */
    initialize: function (config) {
        if (config.minChars) {
            this.setMinChars(config.minChars);
        }
        if (config.layerTypes) {
            this.setLayerTypes(config.layerTypes);
        }
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.prepSearch
        });

    },
    prepSearch: function (searchString) {
        var prepSearchString,
            vectorLayerModels = [],
            filteredModels;

        if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
            this.setInUse(true);
            prepSearchString = searchString.replace(" ", "");

            _.each(this.getLayerTypes(), function (layerType) {
                vectorLayerModels = vectorLayerModels.concat(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: layerType}));
            }, this);

            filteredModels = _.union(vectorLayerModels).filter(function (model) {
                return model.has("searchField") === true && model.get("searchField") !== "";
            });

            this.findMatchingFeatures(filteredModels, prepSearchString);
            Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
            this.setInUse(false);
        }
    },
    findMatchingFeatures: function (models, searchString) {
        var featureArray = [];

        _.each(models, function (model) {
            var features = model.get("layer").getSource().getFeatures(),
                filteredFeatures;

            if (_.isArray(model.get("searchField"))) {
                _.each(model.get("searchField"), function (field) {
                    filteredFeatures = features.filter(function (feature) {
                        var value = feature.get(field).toString().toUpperCase();

                        return value.indexOf(searchString.toUpperCase()) !== -1;
                    });
                    // createFeatureObject for each feature
                    featureArray.push(this.getFeatureObject(field, filteredFeatures, model));
                }, this);
            }
            else {
                filteredFeatures = features.filter(function (feature) {
                    var value = feature.get(model.get("searchField")).toUpperCase();

                    return value.indexOf(searchString.toUpperCase()) !== -1;
                });
                // createFeatureObject for each feature
                featureArray.push(this.getFeatureObject(model.get("searchField"), filteredFeatures, model));
            }
        }, this);

        Radio.trigger("Searchbar", "pushHits", "hitList", featureArray);
    },


    /**
     * gets a new feature object
     * @param  {string} searchField Attribute feature has to be searche through
     * @param  {ol.Feature} filteredFeatures openlayers feature
     * @param  {Backbone.Model} model model of visibleVector
     * @return {array} array with feature objects
     */
    getFeatureObject: function (searchField, filteredFeatures, model) {
        var featureArray = [];

        _.each(filteredFeatures, function (feature) {
            featureArray.push({
                name: feature.get(searchField),
                type: model.get("name"),
                coordinate: this.getCentroidPoint(feature.getGeometry()),
                imageSrc: this.getImageSource(feature, model),
                id: _.uniqueId(model.get("name")),
                additionalInfo: this.getAdditionalInfo(model, feature),
                feature: feature
            });
        }, this);
        return featureArray;
    },

    /**
     * gets centroid point for a openlayers geometry
     * @param  {ol.geom.Geometry} geometry geometry to get centroid from
     * @return {ol.Coordinate} centroid coordinate
     */
    getCentroidPoint: function (geometry) {
        if (geometry.getType() === "MultiPolygon") {
            return geometry.getExtent();
        }

        return geometry.getCoordinates();

    },

    /**
     * returns an image source of a feature style
     * @param  {ol.Feature} feature openlayers feature
     * @param  {Backbone.Model} model model to get layer to get style from
     * @return {string} imagesource
     */
    getImageSource: function (feature, model) {
        var layerStyle,
            style;

        if (feature.getGeometry().getType() === "Point" || feature.getGeometry().getType() === "MultiPoint") {
            layerStyle = model.get("layer").getStyle(feature);

            // layerStyle returns style
            if (typeof layerStyle === "object") {
                return layerStyle[0].getImage().getSrc();
            }
            // layerStyle returns stylefunction

            style = layerStyle(feature);

            return style.getImage().getSrc();
        }

        return undefined;

    },

    getAdditionalInfo: function (model, feature) {
        var additionalInfo;

        if (!_.isUndefined(model.get("additionalInfoField"))) {
            additionalInfo = feature.getProperties()[model.get("additionalInfoField")];
        }

        return additionalInfo;
    },

    // setter for minChars
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    // setter for LayerTypes to search in
    setLayerTypes: function (value) {
        this.set("layerTypes", value);
    },

    // getter for LayerTypes to search in
    getLayerTypes: function () {
        return this.get("layerTypes");
    },

    // setter for inUse
    setInUse: function (value) {
        this.set("inUse", value);
    }
});

export default VisibleVectorModel;