define([
    "backbone",
    "openlayers",
    "eventbus"
], function (Backbone, ol, EventBus) {

    var Draw = Backbone.Model.extend({

        defaults: {
            source: new ol.source.Vector(),
            types: ["Point", "LineString", "Polygon"],
            colors: [
                { name: "Orange", value: "rgb(255, 127, 0)" },
                { name: "Grau", value: "rgb(153, 153, 153)" },
                { name: "Rot", value: "rgb(228, 26, 28)" },
                { name: "Blau", value: "rgb(55, 126, 184)" },
                { name: "Grün", value: "rgb(77, 175, 74)" },
                { name: "Gelb", value: "rgb(255, 255, 51)" },
                { name: "Schwarz", value: "rgb(0, 0, 0)" },
                { name: "Weiß", value: "rgb(255, 255, 255)" }
            ],
            pointRadiuses: [
                { name: "6 px", value: 6 },
                { name: "8 px", value: 8 },
                { name: "10 px", value: 10 },
                { name: "12 px", value: 12 },
                { name: "14 px", value: 14 },
                { name: "16 px", value: 16 }
            ],
            strokeWidth: [
                { name: "1 px", value: 1 },
                { name: "2 px", value: 2 },
                { name: "3 px", value: 3 },
                { name: "4 px", value: 4 },
                { name: "5 px", value: 5 },
                { name: "6 px", value: 6 }
            ],
            selectedType: "Point",
            color: "rgb(255, 127, 0)",
            radius: 6,
            selectedStrokeWidth: 1
        },

        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus,
                "getDrawlayer": this.getLayer
            });

            this.listenTo(this, {
                "change:drawendCoords": this.triggerDrawendCoords,
                "change:selectedType change:style": this.createInteraction,
                "change:color change:radius change:selectedStrokeWidth": this.setStyle
            });

            this.set("layer", new ol.layer.Vector({
                source: this.get("source")
            }));
            EventBus.trigger("addLayer", this.get("layer"));
        },
        setStatus: function (args) {
            if (args[2] === "draw" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                this.setStyle();
                this.createInteraction();
            }
            else {
                this.set("isCurrentWin", false);
                EventBus.trigger("removeInteraction", this.get("draw"));
            }
        },

        createInteraction: function () {
            EventBus.trigger("removeInteraction", this.get("draw"));
            this.set("draw", new ol.interaction.Draw({
                source: this.get("source"),
                type: this.get("selectedType"),
                style: this.get("style")
            }));
            this.get("draw").on("drawend", function (evt) {
                this.setDrawendCoords(evt.feature.getGeometry());
                evt.feature.setStyle(this.get("style"));
            }, this);
            EventBus.trigger("addInteraction", this.get("draw"));
        },

        setDrawendCoords: function (geom) {
            var geoJSON = new ol.format.GeoJSON();

            this.set("drawendCoords", geoJSON.writeGeometry(geom));
        },

        triggerDrawendCoords: function () {
            EventBus.trigger("getDrawendCoords", this.get("drawendCoords"));
        },

        /**
         * Setzt den Typ der Geometrie (Point, LineString oder Polygon).
         * @param {String} value - Typ der Geometrie
         */
        setType: function (value) {
            this.set("selectedType", value);
            if (this.get("selectedType") !== "Point") {
                this.set("radius", 6);
            }
        },

        setColor: function (value) {
            this.set("color", value);
        },

        setPointRadius: function (value) {
            this.set("radius", parseInt(value, 10));
        },

        setStrokeWidth: function (value) {
            this.set("selectedStrokeWidth", parseInt(value, 10));
        },

        setStyle: function () {
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: this.get("color")
                }),
                stroke: new ol.style.Stroke({
                    color: this.get("color"),
                    width: this.get("selectedStrokeWidth")
                }),
                image: new ol.style.Circle({
                    radius: this.get("radius"),
                    fill: new ol.style.Fill({
                        color: this.get("color")
                     })
                })
            });

            this.set("style", style);
        },

        // Löscht alle Geometrien
        deleteFeatures: function () {
            this.get("source").clear();
        },

        getLayer: function () {
            EventBus.trigger("sendDrawLayer", this.get("layer"));
        }
    });

    return new Draw();
});
