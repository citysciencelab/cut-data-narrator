import {expect} from "chai";
import {setGeometriesToWkt} from "../../../utils/setGeometriesToWkt";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

describe("src/modules/tools/draw/utils/writeGeometriesToWkt.js", () => {
    let features;

    beforeEach(function () {
        features = [
            new Feature({
                geometry: new Polygon([[[30, 10], [40, 40], [130, 130], [240, 40], [30, 10]]]),
                name: "featureOne"
            }),
            new Feature({
                geometry: new Point([123, 456]),
                name: "featureTwo",
                attributes: {
                    name: "featureTwo"
                }
            }),
            new Feature({
                geometry: new LineString([[30, 10], [40, 40]]),
                name: "featureTwo",
                attributes: {
                    name: "featureTwo"
                }
            })
        ];

    });

    it("should return false if the given param is not an array", function () {
        expect(setGeometriesToWkt({})).to.be.false;
        expect(setGeometriesToWkt(true)).to.be.false;
        expect(setGeometriesToWkt("string")).to.be.false;
        expect(setGeometriesToWkt(undefined)).to.be.false;
        expect(setGeometriesToWkt(null)).to.be.false;
        expect(setGeometriesToWkt(42)).to.be.false;
    });

    it("should set the property attributes to the feature if it is not available", function () {
        const wktFeatures = setGeometriesToWkt(features);

        expect(wktFeatures[0].get("attributes")).to.be.an("object");
    });

    it("should add the key 'geometry' to the feature attributes", function () {
        const wktFeatures = setGeometriesToWkt(features);

        expect(wktFeatures[1].get("attributes")).to.have.all.keys(["geometry", "name"]);
    });

    it("should set the point geometry as wkt", function () {
        const wktFeatures = setGeometriesToWkt(features);

        expect(wktFeatures[1].get("attributes").geometry).to.be.equal("POINT(123 456)");
    });

    it("should set the linestring geometry as wkt", function () {
        const wktFeatures = setGeometriesToWkt(features);

        expect(wktFeatures[2].get("attributes").geometry).to.be.equal("LINESTRING(30 10,40 40)");
    });

    it("should set the polygon geometry as wkt", function () {
        const wktFeatures = setGeometriesToWkt(features);

        expect(wktFeatures[0].get("attributes").geometry).to.be.equal("POLYGON((30 10,40 40,130 130,240 40,30 10))");
    });
});
