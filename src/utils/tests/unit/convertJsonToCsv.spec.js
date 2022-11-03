import {expect} from "chai";
import {
    convertJsonToCsv,
    organizeKeys,
    escapeFields,
    escapeField,
    findRecordWithMaxNumberOfFields,
    joinRecord
} from "../../convertJsonToCsv.js";

describe("src/utils/convertJsonToCsv.js", () => {
    describe("joinRecord", () => {
        it("should return an empty string if anything but an array is given", () => {
            expect(joinRecord(undefined)).to.be.a("string").and.to.be.empty;
            expect(joinRecord(null)).to.be.a("string").and.to.be.empty;
            expect(joinRecord("string")).to.be.a("string").and.to.be.empty;
            expect(joinRecord(1234)).to.be.a("string").and.to.be.empty;
            expect(joinRecord(true)).to.be.a("string").and.to.be.empty;
            expect(joinRecord(false)).to.be.a("string").and.to.be.empty;
            expect(joinRecord({})).to.be.a("string").and.to.be.empty;
        });
        it("should return a delimiter seperated string of the given array", () => {
            expect(joinRecord([1, 2, 3, 4], ",", 4)).to.equal("1,2,3,4");
        });
        it("should limit the values to the given maxNumberOfFields", () => {
            expect(joinRecord([1, 2, 3, 4], ",", 3)).to.equal("1,2,3");
        });
        it("should add missing values up to the given maxNumberOfFields", () => {
            expect(joinRecord([1, 2, 3, 4], ",", 5)).to.equal("1,2,3,4,");
        });
    });
    describe("findRecordWithMaxNumberOfFields", () => {
        it("should return null if anything but an array is given", () => {
            expect(findRecordWithMaxNumberOfFields(undefined)).to.be.null;
            expect(findRecordWithMaxNumberOfFields(null)).to.be.null;
            expect(findRecordWithMaxNumberOfFields("string")).to.be.null;
            expect(findRecordWithMaxNumberOfFields(1234)).to.be.null;
            expect(findRecordWithMaxNumberOfFields(true)).to.be.null;
            expect(findRecordWithMaxNumberOfFields(false)).to.be.null;
            expect(findRecordWithMaxNumberOfFields({})).to.be.null;
        });
        it("should return the max number of fields of the given structure", () => {
            expect(findRecordWithMaxNumberOfFields([
                [1, 2, 3, 4],
                undefined,
                false,
                [5, 6, 7]
            ])).to.deep.equal([1, 2, 3, 4]);
        });
    });
    describe("escapeField", () => {
        it("should convert anything to string", () => {
            expect(escapeField(undefined)).to.equal("undefined");
            expect(escapeField(null)).to.equal("null");
            expect(escapeField(false)).to.equal("false");
            expect(escapeField(true)).to.equal("true");
            expect(escapeField(1234)).to.equal("1234");
            expect(escapeField([])).to.equal("");
            expect(escapeField({})).to.equal("[object Object]");
        });
        it("should not escape nor set dquotes for the given textData if nothing to escape was found", () => {
            expect(escapeField("string")).to.equal("string");
        });
        it("should set dquotes if a carriage return was found", () => {
            expect(escapeField("str\ring")).to.equal("\"str\ring\"");
        });
        it("should set dquotes if a line feed was found", () => {
            expect(escapeField("str\ning")).to.equal("\"str\ning\"");
        });
        it("should set dquotes if the given delimiter was found", () => {
            expect(escapeField("string", "r")).to.equal("\"string\"");
        });
        it("should set dquotes and escape dquotes with dquotes (see rfc4180) in the string if a dquotes were found", () => {
            expect(escapeField("str\"ing")).to.equal("\"str\"\"ing\"");
        });
    });
    describe("escapeFields", () => {
        it("should return an empty array if anything but an array or object was given", () => {
            expect(escapeFields(undefined)).to.be.an("array").and.to.be.empty;
            expect(escapeFields(null)).to.be.an("array").and.to.be.empty;
            expect(escapeFields(1234)).to.be.an("array").and.to.be.empty;
            expect(escapeFields("string")).to.be.an("array").and.to.be.empty;
            expect(escapeFields(true)).to.be.an("array").and.to.be.empty;
            expect(escapeFields(false)).to.be.an("array").and.to.be.empty;
        });
        it("should return an array with escaped variants of the given array values", () => {
            const record = [
                    "string",
                    "str\ring",
                    "str\ning",
                    "str,ing",
                    "str\"ing"
                ],
                expected = [
                    "string",
                    "\"str\ring\"",
                    "\"str\ning\"",
                    "\"str,ing\"",
                    "\"str\"\"ing\""
                ];

            expect(escapeFields(record, ",")).to.deep.equal(expected);
        });
    });
    describe("organizeKeys", () => {
        it("should return the input if anything but an array is given", () => {
            expect(organizeKeys(undefined)).to.be.undefined;
            expect(organizeKeys(null)).to.be.null;
            expect(organizeKeys("string")).to.equal("string");
            expect(organizeKeys(1234)).to.equal(1234);
            expect(organizeKeys(true)).to.be.true;
            expect(organizeKeys(false)).to.be.false;
            expect(organizeKeys({})).to.be.an("object").that.is.empty;
        });
        it("should return the input if anything but an array with an object at index 0 is given", () => {
            expect(organizeKeys([undefined])).to.deep.equal([undefined]);
            expect(organizeKeys([null])).to.deep.equal([null]);
            expect(organizeKeys(["string"])).to.deep.equal(["string"]);
            expect(organizeKeys([1234])).to.deep.equal([1234]);
            expect(organizeKeys([true])).to.deep.equal([true]);
            expect(organizeKeys([false])).to.deep.equal([false]);
            expect(organizeKeys([[]])).to.deep.equal([[]]);
        });
        it("should organize the input with missing keys", () => {
            const data = [
                    {d: 3, a: 1, b: 2},
                    {c: 4, d: 5},
                    {a: 6, b: 7}
                ],
                expected = [
                    {d: 3, a: 1, b: 2, c: ""},
                    {d: 5, a: "", b: "", c: 4},
                    {d: "", a: 6, b: 7, c: ""}
                ];

            expect(organizeKeys(data)).to.deep.equal(expected);
        });
    });
    describe("convertJsonToCsv", () => {
        it("should return false and handle the error if anything but an array is given", () => {
            let lastError = false;
            const result = convertJsonToCsv(undefined, error => {
                lastError = error;
            });

            expect(result).to.be.false;
            expect(lastError).to.be.a("string");
        });
        it("should return a string and handle errors for each unexpected record found in the given array", () => {
            let errorCount = 0;
            const jsonData = [
                    [1, 2, 3, 4],
                    undefined,
                    [5, 6, 7],
                    false,
                    [9, 10]
                ],
                expected = "1,2,3,4\r\n5,6,7,\r\n9,10,,";

            expect(convertJsonToCsv(jsonData, () => {
                errorCount++;
            })).to.equal(expected);
            expect(errorCount).to.equal(2);
        });
        it("should use the keys of the record as headers, organizing csv data", () => {
            const jsonData = [
                    {a: 1, b: 2, c: 3},
                    {d: 4, e: 5, f: 6, g: 7},
                    {h: 8, i: 9}
                ],
                expected = "a,b,c,d,e,f,g,h,i\r\n1,2,3,,,,,,\r\n,,,4,5,6,7,,\r\n,,,,,,,8,9";

            expect(convertJsonToCsv(jsonData)).to.equal(expected);
        });
        it("should convert the given jsonData into a csv string according to rfc4180", () => {
            const jsonData = [
                    {a: 1, b: 2, c: 3},
                    {a: "aaa", b: "bb;b", c: "c\"cc"}
                ],
                expected = "a;b;c\n1;2;3\naaa;\"bb;b\";\"c\"\"cc\"";

            expect(convertJsonToCsv(jsonData, () => {
                return false;
            }, true, true)).to.equal(expected);
        });
    });
});
