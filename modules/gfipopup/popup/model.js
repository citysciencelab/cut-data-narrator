define([
    "backbone",
    "eventbus",
    "openlayers",
    "config",
    "bootstrap/popover",
    "modules/gfipopup/gfiObjects/img/view",
    "modules/gfipopup/gfiObjects/video/view",
    "modules/gfipopup/gfiObjects/routable/view",
    "modules/gfipopup/themes/default/view",
    "modules/gfipopup/themes/mietenspiegel/view",
    "modules/gfipopup/themes/mietenspiegel/view-formular",
    "modules/gfipopup/themes/reisezeiten/view",
    "modules/gfipopup/themes/trinkwasser/view",
    "modules/core/requestor",
    "moment"
], function (Backbone, EventBus, ol, Config, Popover, ImgView, VideoView, RoutableView, DefaultTheme, MietenspiegelTheme, MietenspiegelThemeForm, ReisezeitenTheme, TrinkwasserTheme, Requestor, Moment) {
    "use strict";
    var GFIPopup = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            gfiOverlay: new ol.Overlay({ element: $("#gfipopup") }), // ol.Overlay
            gfiContent: [],
            gfiTitles: [],
            wfsCoordinate: [],
            gfiURLs: [],
            gfiCounter: 0,
            isCollapsed: false,
            isVisible: false
        },
        /**
         *
         */
        initialize: function () {
            this.set("element", this.get("gfiOverlay").getElement());

            EventBus.trigger("addOverlay", this.get("gfiOverlay")); // listnener in map.js
            EventBus.on("setGFIParams", this.setGFIParams, this); // trigger in map.js
            EventBus.on("sendGFIForPrint", this.sendGFIForPrint, this);
            EventBus.on("renderResults", this.createTemplate, this);
        },
        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.get("element").popover("destroy");
            this.set("isPopupVisible", false);
            this.unset("coordinate", {silent: true});
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $("#popovermin").fadeOut(500, function () {
                $("#popovermin").remove();
            });
            this.get("element").popover("show");
            this.set("isPopupVisible", true);
        },
        setGFIParams: function (params) {
            EventBus.trigger("closeGFIParams", this);
            Requestor.requestFeatures(params);
        },
        createTemplate: function (response) {
            var features = response[0],
                coordinate = response[1],
                pContent = [],
                pTitles = [],
                templateView;
            // Erzeugen eines TemplateModels anhand 'gfiTheme'
            _.each(features, function (layer) {
                _.each(layer.content, function (content) {
                    content = this.getManipulateDate(content);
                    switch (layer.ol_layer.get("gfiTheme")) {
                        case "mietenspiegel": {
                            templateView = new MietenspiegelTheme(layer.ol_layer, content, coordinate);
                            break;
                        }
                        case "reisezeiten": {
                            templateView = new ReisezeitenTheme(content);
                            break;
                        }
                        case "trinkwasser": {
                            templateView = new TrinkwasserTheme(layer.ol_layer, content, coordinate);
                            break;
                        }
                        default: {
                            templateView = new DefaultTheme(layer.ol_layer, content, coordinate);
                            break;
                        }
                    }
                    pContent.push(templateView);
                    pTitles.push(layer.name);
                }, this);
            }, this);

            // Abspeichern der gesammelten Informationen
            if (pContent.length > 0) {
                this.get("gfiOverlay").setPosition(coordinate);
                this.set("gfiContent", pContent);
                this.set("gfiTitles", pTitles);
                this.set("gfiCounter", pContent.length);
                this.set("coordinate", coordinate);
            }
        },
        /*
        * @description Liefert die GFI-Infos ans Print-Modul.
        */
        sendGFIForPrint: function () {
            if (this.get("isPopupVisible") === true) {
                var printContent = this.get("gfiContent")[this.get("gfiCounter") - 1].model.returnPrintContent(),
                    attr = printContent[0],
                    title = printContent[1];

                EventBus.trigger("receiveGFIForPrint", [attr, title, this.get("coordinate")]);
            }
            else {
                EventBus.trigger("receiveGFIForPrint", [null, null, null]);
            }
        },
        /**
         * Alle childTemplates im gfiContent müssen hier removed werden.
         * Das gfipopup.model wird nicht removed - nur reset.
         */
        removeChildObjects: function () {
            _.each(this.get("gfiContent"), function (element) {
                element.remove();
            }, this);
        },

        /**
         * Guckt alle Werte durch und prüft, ob es sich dabei um ein ISO8601-konformes Datum handelt.
         * Falls ja, wird es in das Format DD.MM.YYYY umgewandelt.
         * @param  {object} content - GFI Attribute
         * @return {object} content
         */
        getManipulateDate: function (content) {
            _.each(content, function (value, key, list) {
                if (Moment(value).parsingFlags().overflow === -1) {
                    list[key] = Moment(value).format("DD.MM.YYYY");
                }
            });
            return content;
        }
    });

    return new GFIPopup();
});
