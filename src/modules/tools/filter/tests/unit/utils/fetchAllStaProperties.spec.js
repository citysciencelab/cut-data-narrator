import {expect} from "chai";
import {getUniqueValuesFromFetchedFeatures} from "../../../utils/fetchAllStaProperties";

describe("src/modules/tools/filter/utils/fetchAllStaProperties.js", () => {
    describe("getUniqueValuesFromFetchedFeatures", () => {
        it("should return empty array if anything but object is given", () => {
            expect(getUniqueValuesFromFetchedFeatures([])).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(null)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(true)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(false)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures("string")).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(1234)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array if the string is not included in the given object", () => {
            const obj = {
                foo: "bar"
            };

            expect(getUniqueValuesFromFetchedFeatures(obj, "bar")).to.be.an("array").that.is.empty;
        });
        it("should return the value of the key from given object if the string is matching a key", () => {
            const obj = {
                foo: "bar"
            };

            expect(getUniqueValuesFromFetchedFeatures(obj, "foo")).to.be.equal("bar");
        });
    });
});
