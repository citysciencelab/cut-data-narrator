import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import Layer from "../../../../../../modules/core/modelList/layer/model.js";
import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsLayerSelector";

chai.use(sinonChai);

const {fillConfig, deselectSelectedLayers, handleEventAddLayers, handleEventShowLayers, handleEventOpenFolder, handleEventExtend} = actions;

describe("src/modules/layerSelector/store/actionsLayerSelector.js", () => {
    let dispatch;

    beforeEach(()=> {
        dispatch = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("fillConfig", () => {
        it("should fill the config if source is not set and channel or event do not exist", done => {
            const state = {
                events: [
                    {
                        source: "measure_geometry",
                        deselectPreviousLayers: "category",
                        layerIds: ["2101"],
                        extent: [578563, 5692144, 579669, 5692806]
                    }
                ],
                default: {
                    showLayerId: null,
                    deselectPreviousLayers: "allways",
                    layerIds: [],
                    openFolderForLayerIds: []
                }
            };

            testAction(fillConfig, null, state, {}, [], {}, done);
        });
    });

    describe("deselectSelectedLayers", () => {
        let model;

        before(function () {
            model = new Layer();
            model.set("id", "model1");
            model.set("parentId", "Baselayer");
            model.set("layerSource", {});
        });
        afterEach(function () {
            sinon.restore();
        });
        it("should call function setModelAttributesById if treeType is 'custom'", () => {
            const spy = sinon.spy(Radio, "trigger");

            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getModelsByAttributes") {
                        ret = [model];
                    }
                });
                return ret;
            });
            deselectSelectedLayers(context, "custom");
            expect(spy).to.have.been.calledWith("ModelList", "setModelAttributesById", "model1", {isSelected: false});
        });
        it("should call function console.warn if treeType is not 'custom'", () => {
            const spy = sinon.spy(console, "warn");

            deselectSelectedLayers(context, "light");
            expect(spy).to.have.been.calledWith("function is supported in treeType custom only");
        });
    });

    describe("handleEventAddLayers", () => {
        const layerIds = ["model1"],
            treeType = "custom";

        afterEach(function () {
            sinon.restore();
        });
        it("should call function addModelsByAttributes for each layerId if treeType is 'custom'", () => {
            const spy = sinon.spy(Radio, "trigger");

            handleEventAddLayers(context, {layerIds: layerIds, treeType: treeType});
            expect(spy).to.have.been.calledWith("ModelList", "addModelsByAttributes", {id: "model1"});
        });
        it("should call function setModelAttributesById for each layerId if treeType is 'custom'", () => {
            const spy = sinon.spy(Radio, "trigger");

            handleEventAddLayers(context, {layerIds: layerIds, treeType: treeType});
            expect(spy).to.have.been.calledWith("ModelList", "setModelAttributesById", "model1", {isSelected: true});
        });
        it("should call function console.warn if treeType is not 'custom'", () => {
            const spy = sinon.spy(console, "warn");

            handleEventAddLayers(context, {layerIds: layerIds, treeType: "light"});
            expect(spy).to.have.been.calledWith("function is supported in treeType custom only");
        });
    });
    describe("handleEventShowLayers", () => {
        const showLayerId = "model1";

        afterEach(function () {
            sinon.restore();
        });
        it("should call function showModelInTree if application is not in mobile mode", () => {
            const spy = sinon.spy(Radio, "trigger");

            handleEventShowLayers(context, {showLayerId: showLayerId, isMobileMode: false});
            expect(spy).to.have.been.calledWith("ModelList", "showModelInTree", "model1");
        });
        it("should call function addModelsByAttributes if application is in mobile mode", () => {
            const spy = sinon.spy(Radio, "trigger");

            handleEventShowLayers(context, {showLayerId: showLayerId, isMobileMode: true});
            expect(spy).to.have.been.calledWith("ModelList", "addModelsByAttributes", {id: "model1"});
        });
        it("should call function setModelAttributesById if application is in mobile mode", () => {
            const spy = sinon.spy(Radio, "trigger");

            handleEventShowLayers(context, {showLayerId: showLayerId, isMobileMode: true});
            expect(spy).to.have.been.calledWith("ModelList", "setModelAttributesById", "model1", {isSelected: true});
        });
    });
    describe("handleEventOpenFolder", () => {
        const openFolderForLayerIds = ["model1"];
        let model;

        before(function () {
            model = new Layer();
            model.set("id", "model1");
            model.set("parentId", "Baselayer");
            model.set("layerSource", {});
        });
        afterEach(function () {
            sinon.restore();
        });
        it("should call function getItemByAttributes for each layerId in attribute openFolderForLayerIds", () => {
            const spy = sinon.spy(Radio, "request");

            handleEventOpenFolder(context, openFolderForLayerIds);
            expect(spy).to.have.been.calledWith("Parser", "getItemByAttributes", {id: "model1"});
        });
        it("should call function addAndExpandModelsRecursive for each layerId in attribute openFolderForLayerIds", () => {
            const spy = sinon.spy(Radio, "trigger");

            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getItemByAttributes") {
                        ret = model.attributes;
                    }
                });
                return ret;
            });

            handleEventOpenFolder(context, openFolderForLayerIds);
            expect(spy).to.have.been.calledWith("ModelList", "addAndExpandModelsRecursive", "Baselayer");
        });
    });
    describe("handleEventExtend", () => {
        const extent = [547196.95, 5924113.45, 580216.93, 5938983.02];

        it("should call function zoomToExtent with minResolution if minReolution is type of number", () => {
            const minResolution = 1.54323,
                parameter = {extent: extent, minResolution: minResolution};

            handleEventExtend({dispatch}, parameter);

            expect(dispatch.firstCall.args[0]).to.equal("zoomToExtent");
        });
        it("should call function zoomToExtent without minResolution if minResolution is not type of number", () => {
            const minResolution = "1.54323",
                parameter = {extent: extent, minResolution: minResolution};

            handleEventExtend({dispatch}, parameter);

            expect(dispatch.firstCall.args[0]).to.equal("zoomToExtent");
        });
    });
});
