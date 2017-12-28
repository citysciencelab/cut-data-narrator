define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config"
], function (Backbone, Radio, ol, Config) {

    var WFSStyle = Backbone.Model.extend({
        defaults: {
            imagePath: "",
            class: "POINT",
            subClass: "SIMPLE",
            styleField: "",
            styleFieldValues: [],
            labelField: "",
            // für subclass SIMPLE
            imageName: "blank.png",
            imageWidth: 1,
            imageHeight: 1,
            imageScale: 1,
            imageOffsetX: 0,
            imageOffsetY: 0,
            // für subclass CIRCLE
            circleRadius: 10,
            circleFillColor: [0, 153, 255, 1],
            circleStrokeColor: [0, 0, 0, 1],
            // Für Label
            textAlign: "left",
            textFont: "Courier",
            textScale: 1,
            textOffsetX: 0,
            textOffsetY: 0,
            textFillColor: [255, 255, 255, 1],
            textStrokeColor: [0, 0, 0, 1],
            textStrokeWidth: 3,
            // Für ClusterText
            clusterFont: "Courier",
            clusterScale: 1,
            clusterOffsetX: 0,
            clusterOffsetY: 0,
            clusterFillColor: [255, 255, 255, 1],
            clusterStrokeColor: [0, 0, 0, 1],
            clusterStrokeWidth: 3,
            // Für Polygon
            fillColor: [255, 255, 255, 1]
        },
        initialize: function () {
            this.set("imagePath", Radio.request("Util", "getPath", Config.wfsImgPath))
        },
        createStyle: function (feature, isClustered) {
            var style,
                styleClass = this.get("class").toUpperCase();

            if (styleClass === "POINT") {
                style = this.createPointStyle(feature, isClustered);
            }
            return style;
        },
        createPointStyle: function (feature, isClustered) {
            var style,
                styleSubClass = this.get("subClass").toUpperCase(),
                labelField = this.get("labelField");

            if (styleSubClass === "SIMPLE") {
                style = this.createSimplePointStyle(feature, isClustered);
                if (labelField.length > 0) {
                    style.setText(this.createTextStyle(feature, labelField));
                }
            }
            else if (styleSubClass === "CUSTOM") {
                style = this.createCustomPointStyle(feature, isClustered);
                if (labelField.length > 0) {
                    style.setText(this.createTextStyle(feature, labelField));
                }
            }
            else if (styleSubClass === "CIRCLE") {
                style = this.createCirclePointStyle();
                if (labelField.length > 0) {
                    style.setText(this.createTextStyle(feature, labelField));
                }
            }
            return style;
        },
        createSimplePointStyle: function (feature, isClustered) {
            var src = this.get("imagePath") + this.get("imageName"),
                isSVG = src.indexOf(".svg") > -1 ? true : false,
                width = this.get("imageWidth"),
                height = this.get("imageHeight"),
                scale = parseFloat(this.get("imageScale")),
                offset = [parseFloat(this.get("imageOffsetX")), parseFloat(this.get("imageOffsetY"))],
                imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,
                    imgSize: isSVG ? [width, height] : ""
                }),
                style = new ol.style.Style({
                    image: imagestyle
                });

            return style;

        },
        createCustomPointStyle: function (feature, isClustered) {
            var styleField = this.get("styleField"),
                featureValue,
                styleFieldValueObj,
                src,
                isSVG,
                width,
                height,
                scale,
                imageoffsetx,
                imageoffsety,
                offset,
                imagestyle,
                style;

                // clustered
                if (isClustered) {
                    // clusterstyle aber nur 1 feature, dann custom style anwenden
                    if (feature.get("features").length === 1) {
                        featureValue = feature.get("features")[0].get(styleField);

                        styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                            return styleFieldValue.styleFieldValue === featureValue;
                        })[0];

                        src = (!_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName")) ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName");
                        isSVG = src.indexOf(".svg") > -1 ? true : false;
                        width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.get("imageWidth");
                        height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.get("imageHeight");
                        scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.get("imageScale"));
                        imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.get("imageOffsetX");
                        imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.get("imageOffsetY");
                        offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                    }
                    // bei clusterstyle mit mehreren Features wird das Icon genommen, das im style unter imageName definiert ist
                    else {
                        src = this.get("imagePath") + this.get("imageName");
                        isSVG = src.indexOf(".svg") > -1 ? true : false;
                        width = this.get("imageWidth");
                        height = this.get("imageHeight");
                        scale = parseFloat(this.get("imageScale"));
                        imageoffsetx = this.get("imageOffsetX");
                        imageoffsety = this.get("imageOffsetY");
                        offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                    }

                }
                // Custom Style bei nicht geclustertem Feature
                else {
                    featureValue = feature.get(styleField);
                    styleFieldValueObj = _.filter(this.get("styleFieldValues"), function (styleFieldValue) {
                        return styleFieldValue.styleFieldValue === featureValue;
                    })[0],
                    src = (!_.isUndefined(styleFieldValueObj) && _.has(styleFieldValueObj, "imageName")) ? this.get("imagePath") + styleFieldValueObj.imageName : this.get("imagePath") + this.get("imageName"),
                    isSVG = src.indexOf(".svg") > -1 ? true : false,
                    width = styleFieldValueObj.imageWidth ? styleFieldValueObj.imageWidth : this.get("imageWidth"),
                    height = styleFieldValueObj.imageHeight ? styleFieldValueObj.imageHeight : this.get("imageHeight"),
                    scale = styleFieldValueObj.imageScale ? styleFieldValueObj.imageScale : parseFloat(this.get("imageScale")),
                    imageoffsetx = styleFieldValueObj.imageOffsetX ? styleFieldValueObj.imageOffsetX : this.get("imageOffsetX"),
                    imageoffsety = styleFieldValueObj.imageOffsetY ? styleFieldValueObj.imageOffsetY : this.get("imageOffsetY"),
                    offset = [parseFloat(imageoffsetx), parseFloat(imageoffsety)];
                }

                imagestyle = new ol.style.Icon({
                    src: src,
                    width: width,
                    height: height,
                    scale: scale,
                    anchor: offset,
                    imgSize: isSVG ? [width, height] : ""
                });
                style = new ol.style.Style({
                    image: imagestyle
                });

            return style;
        },
        createCirclePointStyle: function () {
            var radius = parseInt(this.get("circleRadius"), 10),
                fillcolor = this.returnColor(this.get("circleFillColor")),
                strokecolor = this.returnColor(this.get("circleStrokeColor")),
                circleStyle = new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor
                    })
                }),
                style = new ol.style.Style({
                    image: circleStyle
                });

                return style;
        },
        createTextStyle: function (feature, labelField, isClustered) {
            var text = !_.isUndefined(labelField) ? feature.get(labelField): "",
                textAlign = this.get("textAlign"),
                font = this.get("textFont").toString(),
                scale = parseInt(this.get("textScale"), 10),
                offsetX = parseInt(this.get("textOffsetX"), 10),
                offsetY = parseInt(this.get("textOffsetY"), 10),
                fillcolor = this.returnColor(this.get("textFillColor")),
                strokecolor = this.returnColor(this.get("textStrokeColor")),
                strokewidth = parseInt(this.get("textStrokeWidth"), 10),
                textStyle;

                if (isClustered) {
                    text = feature.get("features").length.toString();
                    if (text === "1") {
                        return null;
                    }
                }
                textStyle = new ol.style.Text({
                    text: text,
                    textAlign: textAlign,
                    offsetX: offsetX,
                    offsetY: offsetY,
                    font: font,
                    scale: scale,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokecolor,
                        width: strokewidth
                    })
                });

                return textStyle;
        },
        returnColor: function (textstring) {
            if (typeof textstring === "string") {
                var pArray = [];

                pArray = textstring.replace("[", "").replace("]", "").replace(/ /g, "").split(",");
                return [pArray[0], pArray[1], pArray[2], pArray[3]];
            }
            else {
                return textstring;
            }
        }
        /*
        * Fügt dem normalen Symbol ein Symbol für das Cluster hinzu und gibt evtl. den Cache zurück
        */
        // getClusterStyle: function (feature) {
        //     var mycoll = new ol.Collection(feature.get("features")),
        //         size = mycoll.getLength(),
        //         style = this.get("styleCache")[size];
        //     if (!style) {
        //         if (size !== 1) {
        //             style = this.getClusterSymbol(size);
        //         }
        //         else {
        //             style = this.getSimpleStyle();
        //         }
        //         this.get("styleCache")[size] = style;
        //     }
        //     return style;
        // },
        // getClusterSymbol: function (anzahl) {
        //     if (anzahl !== "") {
        //         var font = this.get("clusterfont").toString(),
        //             color = this.returnColor(this.get("clustercolor")),
        //             scale = parseInt(this.get("clusterscale"), 10),
        //             offsetX = parseInt(this.get("clusteroffsetx"), 10),
        //             offsetY = parseInt(this.get("clusteroffsety"), 10),
        //             fillcolor = this.returnColor(this.get("clusterfillcolor")),
        //             strokecolor = this.returnColor(this.get("clusterstrokecolor")),
        //             strokewidth = parseInt(this.get("clusterstrokewidth"), 10),
        //             clusterText = new ol.style.Text({
        //                 text: anzahl.toString(),
        //                 offsetX: offsetX,
        //                 offsetY: offsetY,
        //                 font: font,
        //                 color: color,
        //                 scale: scale,
        //                 fill: new ol.style.Fill({
        //                     color: fillcolor
        //                 }),
        //                 stroke: new ol.style.Stroke({
        //                     color: strokecolor,
        //                     width: strokewidth
        //                 })
        //             }),
        //             style = this.getSimpleStyle();

        //         style.push(
        //         new ol.style.Style({
        //             text: clusterText,
        //             zIndex: "Infinity"
        //         }));
        //         return style;
        //     }
        // },
        // getCustomLabeledStyle: function (label) {
        //     this.set("textlabel", label);
        //     var style = this.getSimpleStyle();

        //     return style;
        // },
        // getSimpleStyle: function () {
        //     var imagestyle, symbolText, strokestyle, fill;

        //     this.set("imagepath", Radio.request("Util", "getPath", Config.wfsImgPath))
        //     if (this.get("subclass") === "Icon") {
        //         var src = this.get("imagepath") + this.get("imagename"),
        //             isSVG = src.indexOf(".svg") > -1 ? true : false,
        //             width = this.get("imagewidth"),
        //             height = this.get("imageheight"),
        //             scale = parseFloat(this.get("imagescale")),
        //             offset = [parseFloat(this.get("imageoffsetx")), parseFloat(this.get("imageoffsety"))];

        //             imagestyle = new ol.style.Icon({
        //                 src: src,
        //                 width: width,
        //                 height: height,
        //                 scale: scale,
        //                 anchor: offset,
        //                 imgSize: isSVG ? [width, height] : ""
        //             });
        //     }
        //     else if (this.get("subclass") === "IconWithText") {
        //         var src = this.get("imagepath") + this.get("imagename"),
        //             width = this.get("imagewidth"),
        //             height = this.get("imageheight"),
        //             scale = parseFloat(this.get("imagescale")),
        //             font = this.get("textfont").toString(),
        //             text = this.get("textlabel"),
        //             color = this.returnColor(this.get("textcolor")),
        //             scale = parseInt(this.get("textscale"), 10),
        //             offsetX = parseInt(this.get("textoffsetx"), 10),
        //             offsetY = parseInt(this.get("textoffsety"), 10),
        //             fillcolor = this.returnColor(this.get("textfillcolor")),
        //             strokecolor = this.returnColor(this.get("textstrokecolor")),
        //             strokewidth = parseInt(this.get("textstrokewidth"), 10);

        //             imagestyle = new ol.style.Icon({
        //                 src: src,
        //                 width: width,
        //                 height: height,
        //                 scale: scale
        //             });
        //             symbolText = new ol.style.Text({
        //                 text: text,
        //                 offsetX: offsetX,
        //                 offsetY: offsetY,
        //                 font: font,
        //                 color: color,
        //                 scale: scale,
        //                 fill: new ol.style.Fill({
        //                     color: fillcolor
        //                 }),
        //                 stroke: new ol.style.Stroke({
        //                     color: strokecolor,
        //                     width: strokewidth
        //                 })
        //             });
        //     }
        //     else if (this.get("subclass") === "Circle") {
        //         var radius = parseInt(this.get("circleradius"), 10),
        //             fillcolor = this.returnColor(this.get("circlefillcolor")),
        //             strokecolor = this.returnColor(this.get("circlestrokecolor"));

        //             imagestyle = new ol.style.Circle({
        //                 radius: radius,
        //                 fill: new ol.style.Fill({
        //                     color: fillcolor
        //                 }),
        //                 stroke: new ol.style.Stroke({
        //                     color: strokecolor
        //                 })
        //             });
        //     }
        //     else if (this.get("subclass") === "Stroke") {
        //         var strokecolor = this.returnColor(this.get("strokecolor")),
        //             strokewidth = parseInt(this.get("strokewidth"), 10);

        //             strokestyle = new ol.style.Stroke({
        //                 color: strokecolor,
        //                 width: strokewidth
        //             });
        //     }
        //     else if (this.get("subclass") === "Polygon") {
        //         var strokestyle = new ol.style.Stroke({
        //             color: this.returnColor(this.get("color")),
        //             width: this.returnColor(this.get("strokewidth"))
        //         });

        //         fill = new ol.style.Fill({
        //             color: this.returnColor(this.get("fillcolor"))
        //         });
        //     }
        //     else {
        //         return;
        //     }
        //     var style = [
        //         new ol.style.Style({
        //             image: imagestyle,
        //             text: symbolText,
        //             zIndex: "Infinity",
        //             stroke: strokestyle,
        //             fill: fill
        //         })
        //     ];

        //     return style;
        // }
    });

    return WFSStyle;
});
