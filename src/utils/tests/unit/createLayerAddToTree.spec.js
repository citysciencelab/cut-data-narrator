import {expect} from "chai";
import sinon from "sinon";
import createLayerAddToTreeModule from "../../createLayerAddToTree.js";

describe("src/utils/createLayerAddToTree.js", () => {
    let styleSetAtNewLayer = false,
        addedFeatures = null,
        setIsSelectedSpy,
        originalLayer,
        newLayer,
        createdLayer;
    const treeHighlightedFeatures = {
        active: true,
        layerName: "common:tree.selectedFeatures"
    };

    describe("createLayerAddToTree", () => {
        let addItemCalled = 0,
            addItemAttributes = null,
            refreshLightTreeCalled = false,
            returnStyleModelCalled = false,
            addedModelId = null,
            layerInCollection = false;

        before(() => {
            i18next.init({
                lng: "cimode",
                debug: false
            });
        });

        beforeEach(() => {
            addItemCalled = 0;
            addItemAttributes = null;
            styleSetAtNewLayer = false;
            addedFeatures = null;
            refreshLightTreeCalled = false;
            addedModelId = null;
            layerInCollection = false;
            setIsSelectedSpy = sinon.spy();
            createdLayer = {
                get: (key) => {
                    if (key === "layer") {
                        return newLayer;
                    }
                    return null;
                },
                setIsSelected: setIsSelectedSpy
            };
            newLayer = {
                getSource: () => {
                    return {
                        addFeatures: (features) => {
                            addedFeatures = features;
                        },
                        getFeatures: () => {
                            return addedFeatures ? [...addedFeatures] : [];
                        }
                    };
                },
                setStyle: () => {
                    styleSetAtNewLayer = true;
                }

            };
            originalLayer = {
                id: "idOriginal",
                name: "originalName",
                get: (key) => {
                    if (key === "layer") {
                        return {};
                    }
                    if (key === "name") {
                        return "originalName";
                    }
                    return null;
                },
                setIsSelected: sinon.stub(),
                attributes: {}
            };
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getModelByAttributes") {
                        if (args[2].id === "idOriginal") {
                            ret = originalLayer;
                        }
                        else if (args[2].id?.indexOf("_") > -1) {
                            if (layerInCollection) {
                                ret = createdLayer;
                            }
                            else {
                                layerInCollection = true;
                            }
                        }
                    }
                    if (arg === "returnModelById") {
                        returnStyleModelCalled = true;
                    }
                });
                return ret;
            });
            sinon.stub(Radio, "trigger").callsFake((...args) => {
                const ret = null;

                args.forEach(arg => {
                    if (arg === "addItem") {
                        addItemCalled++;
                        addItemAttributes = args[2];
                    }
                    if (arg === "addModelsByAttributes") {
                        addedModelId = args[2].id;
                    }
                    if (arg === "refreshLightTree") {
                        refreshLightTreeCalled = true;
                    }
                });
                return ret;
            });
        });

        afterEach(() => {
            sinon.restore();
        });

        it("test create new layer - layerId is null shall do nothing", () => {
            const layerId = null,
                features = [{featureId: "featureId"}],
                treeType = "light";

            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeType);

            expect(addItemCalled).to.be.equals(0);
            expect(addedModelId).to.be.null;
            expect(returnStyleModelCalled).to.be.false;
            expect(setIsSelectedSpy.notCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.false;
            expect(addedFeatures).to.be.null;
            expect(refreshLightTreeCalled).to.be.false;
        });

        it("test create new layer - layer does not exist", () => {
            const layerId = "unknown",
                features = [{featureId: "featureId"}],
                treeType = "light";

            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeType);

            expect(addItemCalled).to.be.equals(1);
            expect(addedModelId).to.be.equals("unknown");
            expect(returnStyleModelCalled).to.be.false;
            expect(setIsSelectedSpy.notCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.false;
            expect(addedFeatures).to.be.null;
            expect(refreshLightTreeCalled).to.be.false;
        });

        it("test create new layer and addFeatures, treeType light", () => {
            const layerId = "idOriginal",
                features = [{featureId: "featureId"}],
                treeType = "light";

            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

            expect(addItemCalled).to.be.equals(1);
            expect(addedModelId.indexOf("idOriginal_")).to.be.equals(0);
            expect(addItemAttributes.parentId).to.be.equals("tree");
            expect(setIsSelectedSpy.calledOnce).to.be.true;
            expect(returnStyleModelCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.true;
            expect(addedFeatures).to.be.deep.equals(features);
            expect(refreshLightTreeCalled).to.be.true;
        });

        it("test use existing layer and addFeatures, treeType light", () => {
            const layerId = "idOriginal",
                features = [{featureId: "featureId"}],
                treeType = "light";

            layerInCollection = true;
            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

            expect(addItemCalled).to.be.equals(0);
            expect(setIsSelectedSpy.calledOnce).to.be.true;
            expect(returnStyleModelCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.true;
            expect(addedFeatures).to.be.deep.equals(features);
            expect(refreshLightTreeCalled).to.be.true;
        });

        it("test create new layer and addFeatures, treeType NOT light", () => {
            const layerId = "idOriginal",
                features = [{featureId: "featureId"}],
                treeType = "custom";

            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

            expect(addItemCalled).to.be.equals(1);
            expect(addedModelId.indexOf("idOriginal_")).to.be.equals(0);
            expect(addItemAttributes.parentId).to.be.equals("SelectedLayer");
            expect(setIsSelectedSpy.calledOnce).to.be.true;
            expect(returnStyleModelCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.true;
            expect(addedFeatures).to.be.deep.equals(features);
            expect(refreshLightTreeCalled).to.be.false;
        });

        it("test use existing layer and addFeatures, treeType NOT light", () => {
            const layerId = "idOriginal",
                features = [{featureId: "featureId"}],
                treeType = "custom";

            layerInCollection = true;
            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

            expect(addItemCalled).to.be.equals(0);
            expect(setIsSelectedSpy.calledOnce).to.be.true;
            expect(returnStyleModelCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.true;
            expect(addedFeatures).to.be.deep.equals(features);
            expect(refreshLightTreeCalled).to.be.false;
        });
    });
});
