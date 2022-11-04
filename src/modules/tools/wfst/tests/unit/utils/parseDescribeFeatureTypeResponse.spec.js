import {expect} from "chai";
import receivePossiblePropertiesModule from "../../../utils/receivePossibleProperties";
// import {parseDescribeFeatureTypeResponse} from "../../../utils/receivePossibleProperties";

const exampleDescribeFeatureType = "<?xml version='1.0' encoding='UTF-8'?>\n" +
        "<schema xmlns=\"http://www.w3.org/2001/XMLSchema\" xmlns:gml=\"http://www.opengis.net/gml\" xmlns:app=\"http://www.deegree.org/app\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" targetNamespace=\"http://www.deegree.org/app\" elementFormDefault=\"qualified\" attributeFormDefault=\"unqualified\">\n" +
        "  <import namespace=\"http://www.opengis.net/gml\" schemaLocation=\"http://schemas.opengis.net/gml/3.1.1/base/gml.xsd\"/>\n" +
        "  <element name=\"wfstgeom\" substitutionGroup=\"gml:_Feature\">\n" +
        "    <complexType>\n" +
        "      <complexContent>\n" +
        "        <extension base=\"gml:AbstractFeatureType\">\n" +
        "          <sequence>\n" +
        "            <element name=\"name\" minOccurs=\"0\" type=\"string\"/>\n" +
        "            <element name=\"nummer\" minOccurs=\"0\" type=\"integer\"/>\n" +
        "            <element name=\"bemerkung\" minOccurs=\"0\" type=\"string\"/>\n" +
        "            <element name=\"datum\" minOccurs=\"0\" type=\"date\"/>\n" +
        "            <element name=\"geom\" minOccurs=\"0\" type=\"gml:GeometryPropertyType\"/>\n" +
        "          </sequence>\n" +
        "        </extension>\n" +
        "      </complexContent>\n" +
        "    </complexType>\n" +
        "  </element>\n" +
        "</schema>",
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


describe("src/modules/tools/wfst/utils/parseDescribeFeatureTypeResponse.js", () => {
    let featureType;

    it("should retrieve the element values (required, type, key) from the parsed XML string if an element with name = featureType can be found in the XML", () => {
        featureType = "wfstgeom";

        const featureProperties = receivePossiblePropertiesModule.parseDescribeFeatureTypeResponse(exampleDescribeFeatureType, featureType);

        expect(Array.isArray(featureProperties)).to.be.true;
        expect(featureProperties.length).to.equal(5);
        exampleProperties.forEach(property => {
            const parsedProperty = featureProperties.find(({key}) => key === property.key);

            expect(parsedProperty).to.not.equal(undefined);
            expect(parsedProperty).to.eql(property);
        });
    });
    it("should return an empty array if no element with name = featureType can be found in the XML", () => {
        featureType = "myCoolType";

        const featureProperties = receivePossiblePropertiesModule.parseDescribeFeatureTypeResponse(exampleDescribeFeatureType, featureType);

        expect(Array.isArray(featureProperties)).to.be.true;
        expect(featureProperties.length).to.equal(0);
    });
});
