import {expect} from "chai";
import sinon from "sinon";
import prepareFeatureProperties from "../../../utils/prepareFeatureProperties";
import receivePossiblePropertiesModule from "../../../utils/receivePossibleProperties";

const exampleLayerInformation = {
        id: "wfst-layer",
        isSecured: false,
        featureNS: "http://www.deegree.org/app",
        featurePrefix: "app",
        featureType: "wfstgeom",
        gfiAttributes: "showAll",
        style: sinon.spy(),
        isSelected: true,
        name: "ZEBIS Point",
        url: "http://generic.url.com/my/wfst",
        version: "1.1.0"
    },
    exampleProperties = [
        {
            key: "name",
            label: "name",
            required: false,
            type: "string",
            value: null
        },
        {
            key: "nummer",
            label: "nummer",
            required: false,
            type: "integer",
            value: null
        },
        {
            key: "bemerkung",
            label: "bemerkung",
            required: false,
            type: "string",
            value: null
        },
        {
            key: "datum",
            label: "datum",
            required: false,
            type: "date",
            value: null
        },
        {
            key: "geom",
            label: "geom",
            required: false,
            type: "geometry",
            value: null
        }
    ];

describe.skip("src/modules/tools/wfst/utils/prepareFeatureProperties.js", () => {
    beforeEach(() => {
        sinon.stub(receivePossiblePropertiesModule, "parseDescribeFeatureTypeResponse").callsFake(() => exampleProperties);
    });
    afterEach(sinon.restore);

    it("should return an empty array if the parameter gfiAttributes is set to ignore", async () => {
        exampleLayerInformation.gfiAttributes = "ignore";

        const properties = await prepareFeatureProperties(exampleLayerInformation);

        expect(Array.isArray(properties)).to.be.true;
        expect(properties.length).to.equal(0);
    });
    it("should hand through the array returned from receivePossibleProperties if the parameter gfiAttributes is set to showAll", async () => {
        exampleLayerInformation.gfiAttributes = "showAll";

        const properties = await prepareFeatureProperties(exampleLayerInformation);

        expect(Array.isArray(properties)).to.be.true;
        expect(properties.length).to.equal(5);
        expect(properties).to.eql(exampleProperties);
    });
    it("should filter the properties depending on gfiAttributes including its label if gfiAttributes is set to an object", async () => {
        exampleLayerInformation.gfiAttributes = {
            name: "Name",
            datum: "Datum"
        };

        const properties = await prepareFeatureProperties(exampleLayerInformation);

        expect(Array.isArray(properties)).to.be.true;
        expect(properties.length).to.equal(3);
        expect(properties.find(({key}) => key === "name").label).to.equal("Name");
        expect(properties.find(({key}) => key === "datum").label).to.equal("Datum");
        expect(properties.find(({type}) => type === "geometry")).to.exist;
    });
});
