import Vuex from "vuex";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SelectFeaturesComponent from "../../../components/SelectFeatures.vue";
import SelectFeaturesModule from "../../../store/indexSelectFeatures";
import * as clatt from "../../../../../../utils/createLayerAddToTree";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/selectFeatures/components/SelectFeatures.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            "selectFeatures":
                            {
                                "name": "translate#common:menu.tools.selectFeatures"
                            }
                        }
                    }
                }
            }
        },
        mockMapActions = {
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub()
        },
        mockSelectedFeaturesWithRenderInformation = [
            {
                item: null,
                properties: [
                    ["Name", "Max-Brauer-Schule"],
                    ["Schulform", "Grundschule"],
                    ["Schulstandort", "Hauptstandort"],
                    ["Scherpunktschule Inklusion", ""]
                ]
            }
        ];

    let store, map, layer1, layer2, createLayerAddToTreeStub, treeHighlightedFeatures;

    beforeEach(() => {
        treeHighlightedFeatures = false;
        layer1 = new VectorLayer();
        layer2 = new VectorLayer();
        map = {
            id: "ol",
            mode: "2D",
            getLayers: () => {
                return {
                    getArray: () => [layer1, layer2]
                };
            }
        };
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Maps: {
                    namespaced: true,
                    actions: mockMapActions
                },
                Tools: {
                    namespaced: true,
                    modules: {
                        SelectFeatures: SelectFeaturesModule
                    }
                }
            },
            getters: {
                uiStyle: () => true,
                treeType: () => "light",
                treeHighlightedFeatures: () => {
                    return {active: treeHighlightedFeatures};
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        createLayerAddToTreeStub = sinon.spy(clatt, "createLayerAddToTree");
        store.commit("Tools/SelectFeatures/setActive", true);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the SelectFeatures tool if active", () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.find("#selectFeatures").exists()).to.be.true;
        expect(wrapper.find(".selectFeaturesDefaultMessage").exists()).to.be.true;
    });

    it("do not render the SelectFeatures tool if not active", async () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue}),
            spyRemoveInteractions = sinon.spy(wrapper.vm, "removeInteractions");

        await store.commit("Tools/SelectFeatures/setActive", false);
        expect(spyRemoveInteractions.calledOnce).to.be.true;

        expect(wrapper.find("#selectFeatures").exists()).to.be.false;

        spyRemoveInteractions.restore();
    });

    it("renders the SelectFeatures-Table if it has data", async () => {
        await store.commit("Tools/SelectFeatures/setSelectedFeaturesWithRenderInformation", mockSelectedFeaturesWithRenderInformation);
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.find(".select-features-tables").exists()).to.be.true;
        expect(wrapper.find(".featureName").exists()).to.be.true;
        expect(wrapper.find(".featureValue").exists()).to.be.true;
        expect(wrapper.find(".select-features-zoom-link").exists()).to.be.true;
    });

    it("selectFeatures functions return correct results", async () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.vm.beautifyKey("very_important_field")).to.equal("Very Important Field");
        expect(wrapper.vm.beautifyValue("very|important|field")).to.equal("very<br/>important<br/>field");
        expect(wrapper.vm.isValidValue("NULL")).to.equal(false);
        expect(wrapper.vm.isValidValue(1)).to.equal(false);
        expect(wrapper.vm.isValidValue("Wert")).to.equal(true);
    });

    it("setFeaturesFromDrag shall call createLayerAddToTree", async () => {
        let wrapper = null;

        treeHighlightedFeatures = true;
        store.state.Tools.SelectFeatures.dragBoxInteraction = {
            getGeometry: () => {
                return {
                    getExtent: () => [100, 2000]
                };
            }
        };
        layer1.setSource(new VectorSource());
        layer1.set("visible", true);
        layer1.set("id", "id");
        layer1.getSource().addFeature(new Feature());
        wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});
        wrapper.vm.setFeaturesFromDrag();

        expect(createLayerAddToTreeStub.calledOnce).to.be.true;
        expect(createLayerAddToTreeStub.firstCall.args[0]).to.be.deep.equals(["id"]);
        expect(createLayerAddToTreeStub.firstCall.args[1]).to.be.deep.equals([]);
        expect(createLayerAddToTreeStub.firstCall.args[2]).to.be.deep.equals("light");
    });
    it("setFeaturesFromDrag shall not call createLayerAddToTree", async () => {
        let wrapper = null;

        store.state.Tools.SelectFeatures.dragBoxInteraction = {
            getGeometry: () => {
                return {
                    getExtent: () => [100, 2000]
                };
            }
        };
        layer1.setSource(new VectorSource());
        layer1.set("visible", true);
        layer1.set("id", "id");
        layer1.getSource().addFeature(new Feature());

        wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});
        wrapper.vm.setFeaturesFromDrag();

        expect(createLayerAddToTreeStub.notCalled).to.be.true;
    });
});
