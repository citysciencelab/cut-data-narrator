define(function (require) {

    var GetCoordTemplate = require("text!modules/tools/getCoord/template.html"),
        GetCoord;

    GetCoord = Backbone.View.extend({
        template: _.template(GetCoordTemplate),
        events: {
            "click .glyphicon-remove": "destroy",
            "change #coordSystemField": "changedPosition",
            "click #coordinatesEastingField": "copyToClipboard",
            "click #coordinatesNorthingField": "copyToClipboard"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isActive change:url": this.render,
                "change:positionMapProjection": this.changedPosition
            });
        },

        render: function (model, value) {
            if (value) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                this.model.createInteraction();
                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.model.setUpdatePosition(true);
                this.model.removeInteraction();
                this.undelegateEvents();
            }
            return this;
        },

        changedPosition: function () {
            var targetProjectionName = this.$("#coordSystemField option:selected").val(),
                position = this.model.returnTransformedPosition(targetProjectionName),
                targetProjection = this.model.returnProjectionByName(targetProjectionName);

            if (position) {
                this.adjustPosition(position, targetProjection);
                this.adjustWindow(targetProjection);
            }
        },

        adjustPosition: function (position, targetProjection) {
            var coord, easting, northing;

            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                coord = this.model.getHDMS(position);
                easting = coord.substr(0, 13);
                northing = coord.substr(14);
            }
            // kartesische Koordinaten
            else {
                coord = this.model.getCartesian(position);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }

            this.$("#coordinatesEastingField").val(easting);
            this.$("#coordinatesNorthingField").val(northing);
        },

        adjustWindow: function (targetProjection) {
            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                this.$("#coordinatesEastingLabel").text("Breite");
                this.$("#coordinatesNorthingLabel").text("Länge");
            }
            // kartesische Koordinaten
            else {
                this.$("#coordinatesEastingLabel").text("Rechtswert");
                this.$("#coordinatesNorthingLabel").text("Hochwert");
            }
        },

        /**
         * Kopiert den Inhalt des Event-Buttons in die Zwischenablage, sofern der Browser das Kommando akzeptiert.
         * @param  {evt} evt Evt-Button
         * @returns {void}
         */
        copyToClipboard: function (evt) {
            var textField = evt.currentTarget;

            this.$(textField).select();

            try {
                document.execCommand("copy");
            }
            catch (e) {
                console.warn("Unable to copy text to clipboard.");
            }
        }
    });

    return GetCoord;
});
