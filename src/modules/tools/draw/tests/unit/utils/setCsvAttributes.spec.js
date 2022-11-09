import {expect} from "chai";
import {setCsvAttributes} from "../../../utils/setCsvAttributes";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

describe("src/modules/tools/draw/utils/setCsvAttributes.js", () => {
    let features, code;

    beforeEach(function () {
        features = [
            new Feature({
                geometry: new Polygon([[[30, 10], [40, 40], [130, 130], [240, 40], [30, 10]]]),
                name: "featureOne",
                isGeoCircle: true
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
        code = "EPSG:25382";
    });

    it("should return false if the given param is not an array", function () {
        expect(setCsvAttributes({}, code)).to.be.false;
        expect(setCsvAttributes(true, code)).to.be.false;
        expect(setCsvAttributes("string", code)).to.be.false;
        expect(setCsvAttributes(undefined, code)).to.be.false;
        expect(setCsvAttributes(null, code)).to.be.false;
        expect(setCsvAttributes(42, code)).to.be.false;
    });

    it("should set the property attributes to the feature if it is not available", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[0].get("attributes")).to.be.an("object");
    });

    it("should add the key 'geometry' and 'epsg' to the feature attributes", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[1].get("attributes")).to.have.all.keys(["epsg", "geometry", "name"]);
    });

    it("should set the point geometry as wkt", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[1].get("attributes").geometry).to.be.equal("POINT(123 456)");
    });

    it("should set the linestring geometry as wkt", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[2].get("attributes").geometry).to.be.equal("LINESTRING(30 10,40 40)");
    });

    it("should set the polygon geometry as wkt", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[0].get("attributes").geometry).to.be.equal("POLYGON((30 10,40 40,130 130,240 40,30 10))");
    });

    it("should set the point geometry with default epsg code", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[1].get("attributes").epsg).to.be.equal(code);
    });

    it("should set the linestring geometry with default epsg code", function () {
        const wktFeatures = setCsvAttributes(features, code);

        expect(wktFeatures[2].get("attributes").epsg).to.be.equal(code);
    });

    it("should set the polygon geometry with another epsg code", function () {
        const wktFeatures = setCsvAttributes(features, code);

        code = "EPSG:4326";

        expect(wktFeatures[0].get("attributes").epsg).to.be.equal(code);
    });
});
