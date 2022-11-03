import sinon from "sinon";
import {expect} from "chai";
import createLayerAddToTreeModule from "../../../../../../utils/createLayerAddToTree";
import actions from "../../../store/actionsSelectFeatures";
import stateSelectFeatures from "../../../store/stateSelectFeatures";


describe("src/modules/tools/selectFeatures/store/gettersSelectFeatures.js", () => {
    const visibleLayerList = [];
    let dispatch, rootGetters, state, createLayerAddToTreeStub, layerVisible, feature, layerId;

    beforeEach(() => {
        dispatch = sinon.spy();
        createLayerAddToTreeStub = sinon.spy(createLayerAddToTreeModule, "createLayerAddToTree");
        rootGetters = {
            "Maps/getVisibleLayerList": visibleLayerList,
            "treeHighlightedFeatures": {active: true},
            "treeType": "custom"
        };
        state = {...stateSelectFeatures};
        layerId = "visibleLayer";
        layerVisible = {
            id: layerId,
            values_: {
                id: layerId
            },
            get: (key) => {
                return key;
            }
        };
        feature = {
            id: "feature",
            getId: () => "feature",
            getGeometry: () => sinon.spy({
                getType: () => "Point",
                getCoordinates: () => [100, 100]
            }),
            getProperties: () => []
        };
        visibleLayerList.push(layerVisible);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("highlightFeature", () => {
        it("highlightFeature treeHighlightedFeatures is active", () => {
            actions.highlightFeature({state, rootGetters, dispatch}, {feature, layerId});

            expect(dispatch.callCount).to.be.equals(4);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
            expect(dispatch.secondCall.args[1].id).to.equal(feature.id);
            expect(dispatch.secondCall.args[1].type).to.equal("increase");
            expect(dispatch.secondCall.args[1].feature).to.deep.equal(feature);
            expect(dispatch.secondCall.args[1].layer).to.deep.equal(layerVisible);
            expect(dispatch.secondCall.args[1].highlightStyle.fill).to.deep.equal(state.highlightVectorRulesPointLine.fill);
            expect(dispatch.thirdCall.args[0]).to.equal("Maps/setCenter");
            expect(dispatch.thirdCall.args[1]).to.deep.equal([100, 100]);
            expect(dispatch.getCall(3).args[0]).to.equal("Maps/setZoomLevel");
            expect(dispatch.getCall(3).args[1]).to.deep.equal(state.highlightVectorRulesPointLine.zoomLevel);
            expect(createLayerAddToTreeStub.calledOnce).to.be.true;
            expect(createLayerAddToTreeStub.firstCall.args[0]).to.be.deep.equals(layerId);
            expect(createLayerAddToTreeStub.firstCall.args[1]).to.be.deep.equals([feature]);
            expect(createLayerAddToTreeStub.firstCall.args[2]).to.be.equals("custom");
            expect(createLayerAddToTreeStub.firstCall.args[3]).to.be.deep.equals(rootGetters.treeHighlightedFeatures);
        });

        it("highlightFeature treeHighlightedFeatures is not active", () => {
            rootGetters.treeHighlightedFeatures.active = false;
            actions.highlightFeature({state, rootGetters, dispatch}, {feature, layerId});

            expect(dispatch.callCount).to.be.equals(4);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
            expect(dispatch.secondCall.args[1].id).to.equal(feature.id);
            expect(dispatch.secondCall.args[1].type).to.equal("increase");
            expect(dispatch.secondCall.args[1].feature).to.deep.equal(feature);
            expect(dispatch.secondCall.args[1].layer.id).to.deep.equal(layerVisible.id);
            expect(dispatch.secondCall.args[1].highlightStyle.fill).to.deep.equal(state.highlightVectorRulesPointLine.fill);
            expect(dispatch.thirdCall.args[0]).to.equal("Maps/setCenter");
            expect(dispatch.thirdCall.args[1]).to.deep.equal([100, 100]);
            expect(dispatch.getCall(3).args[0]).to.equal("Maps/setZoomLevel");
            expect(dispatch.getCall(3).args[1]).to.deep.equal(state.highlightVectorRulesPointLine.zoomLevel);
            expect(createLayerAddToTreeStub.notCalled).to.be.true;
        });
    });

});
