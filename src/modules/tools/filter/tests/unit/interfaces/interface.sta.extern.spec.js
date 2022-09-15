import InterfaceStaExtern from "../../../interfaces/interface.sta.extern.js";
import {expect} from "chai";

describe("src/modules/tools/filter/interfaces/utils/interface.sta.extern.js", () => {
    let interfaceStaExtern = null;

    beforeEach(() => {
        interfaceStaExtern = new InterfaceStaExtern({
            getCurrentExtent: false
        });
    });

    describe("constructor", () => {
        it("should set expected variables in the instance", () => {
            const expected = {
                "@Datastreams.0.Observations.0.result": {
                    "http://defs.opengis.net/elda-common/ogc-def/resource?uri=http://www.opengis.net/def/ogc-om/OM_CountObservation": "number",
                    "http://defs.opengis.net/elda-common/ogc-def/resource?uri=http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_CategoryObservation": "string"
                }
            };

            expect(interfaceStaExtern.allFetchedProperties).to.deep.equal({});
            expect(interfaceStaExtern.observationType).to.deep.equal({});
            expect(interfaceStaExtern.waitingListForFeatures).to.to.deep.equal({});
            expect(interfaceStaExtern.listOfResourceTypes).to.deep.equal(expected);
        });
    });
    describe("getAttrTypesByAllFetchedProperties", () => {
        it("should return an empty object if anything but an object is given", () => {
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(null)).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(undefined)).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties("string")).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(1234)).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(true)).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(false)).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties([])).to.deep.equal({});
        });
        it("should return empty object if the values of the keys from given object are not an array", () => {
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: "bar"})).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: 123})).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: undefined})).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: false})).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: true})).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: null})).to.deep.equal({});
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: {}})).to.deep.equal({});
        });
        it("should return empty object if the values of the keys from given object are an array but is empty", () => {
            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties({foo: []})).to.deep.equal({});
        });
        it("should return an object with key value where value is the type of the key based on given namespace", () => {
            const attrName = "fow",
                listOfResourceTypes = {
                    "foo": {
                        "fow": "number"
                    }
                },
                obj = {
                    "foo": ["fow"]
                },
                expected = {
                    foo: "number"
                };

            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(obj, attrName, listOfResourceTypes)).to.deep.equal(expected);
        });
        it("should return an object with key value pair where value is the type of the key", () => {
            const expected = {
                    foo: "string",
                    bar: "boolean",
                    buz: "number"
                },
                obj = {
                    foo: ["foo"],
                    bar: [true],
                    buz: [1234]
                };

            expect(interfaceStaExtern.getAttrTypesByAllFetchedProperties(obj, "", {})).to.deep.equal(expected);
        });
    });
    describe("getMinMaxFromUniqueValue", () => {
        it("should return an empty object if anything but an array is given", () => {
            expect(interfaceStaExtern.getMinMaxFromUniqueValue(undefined)).to.deep.equal({});
            expect(interfaceStaExtern.getMinMaxFromUniqueValue(null)).to.deep.equal({});
            expect(interfaceStaExtern.getMinMaxFromUniqueValue(true)).to.deep.equal({});
            expect(interfaceStaExtern.getMinMaxFromUniqueValue(false)).to.deep.equal({});
            expect(interfaceStaExtern.getMinMaxFromUniqueValue({})).to.deep.equal({});
            expect(interfaceStaExtern.getMinMaxFromUniqueValue("string")).to.deep.equal({});
        });
        it("should return the min if min is set", () => {
            const list = [
                    20,
                    9,
                    30,
                    1
                ],
                expected = {
                    min: 1
                };

            expect(interfaceStaExtern.getMinMaxFromUniqueValue(list, true, false)).to.deep.equal(expected);
        });
        it("should return the max if max is set", () => {
            const list = [
                    20,
                    9,
                    30,
                    1
                ],
                expected = {
                    max: 30
                };

            expect(interfaceStaExtern.getMinMaxFromUniqueValue(list, false, true)).to.deep.equal(expected);
        });
        it("should return the min and max if min and max are set", () => {
            const list = [
                    20,
                    9,
                    30,
                    1
                ],
                expected = {
                    min: 1,
                    max: 30
                };

            expect(interfaceStaExtern.getMinMaxFromUniqueValue(list, true, true)).to.deep.equal(expected);
        });
    });
});
