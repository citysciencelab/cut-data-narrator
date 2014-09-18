define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'models/Layer',
    'collections/stylelist',
], function (_, Backbone, ol, EventBus, Config, Layer, StyleList) {
    // Definition der Projektion EPSG:25832
    ol.proj.addProjection(new ol.proj.Projection({
        code: 'EPSG:25832',
        units: 'm',
        extent: [265948.8191, 6421521.2254, 677786.3629, 7288831.7014],
        axisOrientation: 'enu', // default
        global: false  // default
    }));
    var proj25832 = ol.proj.get('EPSG:25832');
    proj25832.setExtent([265948.8191, 6421521.2254, 677786.3629, 7288831.7014]);
    /**
     *
     */
    var WFSLayer = Layer.extend({
        /**
         *
         */
        setAttributionLayerSource: function () {
            var getrequest = this.get('url')
                + '?REQUEST=GetFeature'
                + '&SERVICE=WFS';
            if (this.get('featureType') && this.get('featureType') !== '') {
                getrequest += '&TYPENAME=' + this.get('featureType');
            }
            if (this.get('version') && this.get('version') !== '') {
                getrequest += '&VERSION=' + this.get('version');
            }
            if (this.get('outputFormat') && this.get('outputFormat') !== '') {
                getrequest += '&OUTPUTFORMAT=' + this.get('outputFormat');
            }
            if (this.get('srsname') && this.get('srsname') !== '') {
                getrequest += '&SRSNAME=' + this.get('srsname');
            }
            this.set('source', new ol.source.ServerVector({
                format: new ol.format.WFS({
                    featureNS: this.get('featureNS'),
                    featureType: this.get('featureType')
                }),
                loader: function (extent, resolution, projection) {
                    $.ajax({
                        url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(getrequest),
                        async: false,
                        context: this,
                        success: function (data, textStatus, jqXHR) {
                            this.addFeatures(this.readFeatures(data));
                        },
                        error: function (data, textStatus, jqXHR) {
                            console.log(textStatus);
                        }
                    });
                },
                extractStyles: false,
                /* experimental in OL3
                strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
                    maxZoom: 19
                })),*/
                projection: proj25832 //'EPSG:25832'
            }));

            // Finde StyleId zu dieser Layer-Id, hole den Style und weise ihn dem Layer zu
            var id = this.get('id');
            var layerstyle = _.find(Config.layerstyle, function(num) {
                if (num.layer == id) {
                    return num;
                }
            });
            this.set('styleId', layerstyle.style);

            var wfsStyle = _.find(StyleList.models, function (num) {
                if (num.id == layerstyle.style) {
                    return num;
                }
            });
            this.set('style', wfsStyle.attributes.style);
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Vector({
                source: this.get('source'),
                name: this.get('name'),
                typ: this.get('typ'),
                style: this.get('style')
            }));
        }
    });

    return WFSLayer;
});
