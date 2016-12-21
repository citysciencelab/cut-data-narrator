/**
@Discription:
    Dieses Model beinhaltet die Logik, um einen WMS Capabillity Request auszuführen und die Response zu parsen.
    Aus dem geparseten Objekt werden die Layer ausgelesen und aus diesen Informationen Layerobjekte erzeugt und an die Collection,
    die die Layer verwaltet geschickt
@Autor: RL
**/

define([
    "backbone",
    "backbone.radio",
    "openlayers"
], function (Backbone, Radio, ol) {

    var AddWMSModel = Backbone.Model.extend({
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.checkStatus
            });
        },
        checkStatus: function (args) { // Fenstermanagement
            if (args[2].getId() === "addWMS") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        // Diese funktion wird benutzt, um Fehlermeldungen im WMSView darzustellen
        displayError: function (text) {
                if (text === "" || typeof text === "undefined") {
                    text = "Leider konnte unter der angegebenen URL kein (gültiger) WMS gefunden werden!";
                }
             $(".addWMS.win-body").prepend("<div class=\"addwms_error\">" + text + "</div>");
        },

        // Lädt die Capabillities, parsed sie und extrahiert die Daten-Layer
        loadAndAddLayers: function () {
            $(".addwms_error").remove();
            var url = $("#wmsUrl").val();

            if (url === "") {
                this.displayError("Bitte die URL eines WMS in das Textfeld eingeben!");
                return;
            }
            Radio.trigger("Util", "showLoader");
            $.ajax({
                timeout: 4000,
                context: this,
                url: Radio.request("Util", "getProxyURL", url) + "?request=GetCapabilities&service=WMS",
                success: function (data) {
                    Radio.trigger("Util", "hideLoader");
                    try {
                        var parser = new ol.format.WMSCapabilities(),
                            uniqId = _.uniqueId("external_"),
                            capability = parser.read(data);

                        this.setWMSVersion(capability.version);
                        this.setWMSUrl(Radio.request("Util", "getProxyURL", url));
                        if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}))) {
                            this.addFolder("Externe Fachdaten", "ExternalLayer", "Themen", 0);
                            Radio.trigger("ModelList", "renderTree");
                            $("#Overlayer").parent().after($("#ExternalLayer").parent());
                        }
                        this.addFolder(capability.Service.Title, uniqId, "ExternalLayer", 0);

                        _.each(capability.Capability.Layer.Layer, function (layer) {
                            this.parseLayer(layer, uniqId, 1);
                        }, this);
                    }
                    catch (e) {
                       this.displayError();
                    }
                },
                error: function () {
                    Radio.trigger("Util", "hideLoader");
                    this.displayError();
                }
            });

        },

        parseLayer: function (object, parentId, level) {
            if (_.has(object, "Layer")) {
                _.each(object.Layer, function (layer) {
                    this.parseLayer(layer, object.Title, level + 1);
                }, this);
                this.addFolder(object.Title, object.Title, parentId, level);
            }
            else {
                this.addLayer(object.Title, object.Title, parentId, level, object.Name);
            }
        },

        addFolder: function (name, id, parentId, level) {
            var folder = {
                type: "folder",
                name: name,
                glyphicon: "glyphicon-plus-sign",
                id: id,
                parentId: parentId,
                isExpanded: false,
                level: level
            };

            Radio.trigger("Parser", "addItem", folder);
            $("ul#Themen ul#ExternalLayer").addClass("LayerListMaxHeight");
            $('.LayerListMaxHeight').css("max-height","calc(100vH - 212px)");
        },

        addLayer: function (name, id, parentId, level, layers) {
            var layer = {
                type: "layer",
                name: name,
                id: id,
                parentId: parentId,
                level: level,
                url: this.getWMSUrl(),
                typ: "WMS",
                layers: layers,
                format: "image/png",
                version: this.getWMSVersion(),
                singleTile: false,
                transparent: true,
                tilesize: "512",
                gutter: "0",
                featureCount: 3,
                minScale: "0",
                maxScale: "350000",
                gfiAttributes: "showAll",
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                isbaselayer: false,
                cache: false,
                datasets: []
            };

            Radio.trigger("Parser", "addItem", layer);
        },

        setWMSVersion: function (value) {
            this.set("version", value);
        },

        setWMSUrl: function (value) {
            this.set("wmsUrl", value);
        },

        getWMSVersion: function () {
            return this.get("version");
        },

        getWMSUrl: function () {
            return this.get("wmsUrl");
        }

    });

    return new AddWMSModel();

});
