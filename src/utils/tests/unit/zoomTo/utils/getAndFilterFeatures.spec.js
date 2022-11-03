import axios from "axios";
import sinon from "sinon";
import {expect} from "chai";
import getAndFilterFeatures from "../../../../zoomTo/utils/getAndFilterFeatures";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";

const fs = require("fs"),
    exampleFeatureCollection = fs.readFileSync("./src/utils/tests/unit/zoomTo/resources/featureCollection.xml", "utf8");

describe("src/utils/zoomTo/utils/getAndFilterFeatures.js", () => {
    const id = "someId",
        property = "flaechenid",
        values = ["18", "26"];

    afterEach(() => {
        sinon.restore();
    });

    it("should return a rejecting Promise if the layer with the given id can not be found", () => {
        sinon.stub(rawLayerList, "getLayerWhere").returns(null);
        getAndFilterFeatures(id, property, values)
            .catch(error => {
                expect(error).to.equal(`The layer with the id ${id} could not be found.`);
            });
    });
    it("should call the axois request, if layer exists", () => {
        const axiosSpy = sinon.stub(axios, "get").callsFake(() => new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection})));

        sinon.stub(rawLayerList, "getLayerWhere").returns({id: "id"});

        getAndFilterFeatures(id, property, values);
        expect(axiosSpy.calledOnce).to.be.true;
    });
    it("should return a Promise which resolves to Feature[] only including features including an allowed value for the given property", () => {
        sinon.stub(rawLayerList, "getLayerWhere").returns({id: "id"});
        sinon.stub(axios, "get").callsFake(() => new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection})));

        getAndFilterFeatures(id, property, values)
            .then(features => {
                expect(features.length).to.equal(2);
            });
        getAndFilterFeatures(id, property, ["18"])
            .then(features => {
                expect(features.length).to.equal(1);
            });
    });
});
