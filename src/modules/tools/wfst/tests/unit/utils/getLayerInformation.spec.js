import {expect} from "chai";
import sinon from "sinon";
import getLayerInformationModule from "../../../utils/getLayerInformation";

const relevantKeys = ["featureNS", "featurePrefix", "featureType", "gfiAttributes", "id", "style", "isSelected", "isSecured", "name", "url", "version"],
    exampleLayer = {
        get: key => exampleLayer[key],
        altitudeMode: "clampToGround",
        alwaysOnTop: undefined,
        changeClassDivisionText: "Klasseneinteilung ändern",
        domId: "layer-list-group-item-wfstgeom",
        featureNS: "http://www.deegree.org/app",
        featurePrefix: "app",
        featureType: "wfstgeom",
        format: "image/png",
        gfiAttributes: "showAll",
        gfiComplex: "false",
        gfiTheme: "default",
        hitTolerance: "",
        id: "wfst-layer",
        increaseTransparencyText: "Transparenz erhöhen",
        infosAndLegendText: "Informationen und Legende",
        intervalAutoRefresh: -1,
        isAutoRefreshing: false,
        isBaseLayer: true,
        isChildLayer: false,
        isClustered: false,
        isNeverVisibleInTree: false,
        isOutOfRange: false,
        isRemovable: undefined,
        isSecured: false,
        isSelected: true,
        isSettingVisible: false,
        isVisibleInMap: true,
        isVisibleInTree: true,
        layerAttribution: "nicht vorhanden",
        layerInfoClicked: false,
        layerSequence: undefined,
        legendURL: "",
        level: 0,
        levelDownText: "Ebene nach unten",
        levelUpText: "Ebene nach oben",
        maxResolution: Infinity,
        maxScale: "1000000000",
        maxZoom: Infinity,
        minResolution: 0,
        minScale: "0",
        minZoom: -Infinity,
        name: "ZEBIS Point",
        opacity: 1,
        outputFormat: "XML",
        parentId: "tree",
        reduceTransparencyText: "Transparenz verringern",
        removeLayerText: "Layer entfernen",
        removeTopicText: "Thema entfernen",
        securedTopicText: "Abgesichertes Thema",
        selectedTopicsText: "Auswahl entfernen",
        selectionIDX: 2,
        settingsText: "Einstellungen",
        showSettings: true,
        showTopicText: "Thema darstellen",
        singleBaselayer: false,
        sourceUpdated: true,
        style: sinon.spy(),
        styleId: "default",
        styleable: false,
        supported: ["2D", "3D"],
        transparency: 0,
        transparencyText: "Transparenz",
        typ: "WFS",
        type: "layer",
        url: "http://generic.url.com/my/wfst",
        urlIsVisible: true,
        useProxy: false,
        version: "1.1.0",
        visible: true,
        zIndex: undefined
    };

describe("src/modules/tools/wfst/utils/getLayerInformation.js", () => {
    const requestFake = sinon.fake.returns(exampleLayer);

    beforeEach(() => {
        sinon.stub(Radio, "request").callsFake(requestFake);
    });
    afterEach(sinon.restore);

    it("should return an object only including the for the module necessary values of the layer", () => {
        const layerInformation = getLayerInformationModule.getLayerInformation(["wfst-layer"]),
            layerKeys = Object.keys(layerInformation[0]);

        expect(Array.isArray(layerInformation)).to.be.true;
        expect(layerInformation.length).to.equal(1);
        expect(layerKeys.length).to.equal(relevantKeys.length);
        relevantKeys.forEach(key => {
            expect(layerKeys.find(val => val === key)).to.not.equal(-1);
            expect(layerInformation[0][key]).to.eql(exampleLayer[key]);
        });
    });
});
