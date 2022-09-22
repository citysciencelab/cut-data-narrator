import {expect} from "chai";
import sinon from "sinon";
import {createLayerAddToTree} from "../../createLayerAddToTree.js";

describe("src/utils/createLayerAddToTree.js", () => {
    let styleSetAtNewLayer = false,
        addedFeatures = null,
        setIsSelectedSpy,
        createdLayer;

    const newLayer = {
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

        },
        originalLayer = {
            id: "idOriginal",
            get: (key) => {
                if (key === "layer") {
                    return {};
                }
                return null;
            },
            setIsSelected: sinon.stub(),
            attributes: {}
        },
        treeHighlightedFeatures = {
            active: true,
            layerName: "common:tree.selectedFeatures",
            folderName: "common:tree.selectedData"
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
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;


                args.forEach(arg => {
                    if (arg === "getModelByAttributes") {
                        if (args[2].id === "idOriginal") {
                            ret = originalLayer;
                        }// name -> layerName
                        else if (args[2].id?.indexOf("_") > -1) {
                            ret = createdLayer;
                        }
                        else if (layerInCollection && args[2].name.indexOf("tree.selectedFeatures") > -1) {
                            ret = createdLayer;
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

            createLayerAddToTree(layerId, features, treeType);

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

            createLayerAddToTree(layerId, features, treeType);

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

            createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

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
            createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

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

            createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

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
            createLayerAddToTree(layerId, features, treeType, treeHighlightedFeatures);

            expect(addItemCalled).to.be.equals(0);
            expect(setIsSelectedSpy.calledOnce).to.be.true;
            expect(returnStyleModelCalled).to.be.true;
            expect(styleSetAtNewLayer).to.be.true;
            expect(addedFeatures).to.be.deep.equals(features);
            expect(refreshLightTreeCalled).to.be.false;
        });
    });
});
