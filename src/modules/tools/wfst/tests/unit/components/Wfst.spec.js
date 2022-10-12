import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import WfsTransaction from "../../../components/WfsTransaction.vue";
import WfstModule from "../../../store/indexWfst";
import prepareFeaturePropertiesModule from "../../../utils/prepareFeatureProperties";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/wfst/components/WfsTransaction.vue", () => {
    const layerIds = ["wfstOne", "wfstTwo"],
        exampleLayerOne = {
            get: key => exampleLayerOne[key],
            featureNS: "http://www.deegree.org/app",
            featurePrefix: "app",
            featureType: "wfstOne",
            gfiAttributes: "showAll",
            style: sinon.fake(),
            isSelected: false,
            name: "Wfs-T one",
            url: "some.generic.url",
            version: "1.1.0"
        },
        exampleLayerTwo = {
            get: key => exampleLayerTwo[key],
            featureNS: "http://www.deegree.org/app",
            featurePrefix: "app",
            featureType: "wfstTwo",
            gfiAttributes: "showAll",
            style: sinon.fake(),
            isSelected: false,
            name: "Wfs-T two",
            url: "some.generic.url",
            version: "1.1.0"
        };
    let store,
        wrapper;

    beforeEach(() => {
        sinon.stub(prepareFeaturePropertiesModule, "prepareFeatureProperties").resolves([
            {
                label: "stringAtt",
                key: "stringAtt",
                value: null,
                type: "string",
                required: false
            },
            {
                label: "numAtt",
                key: "numAtt",
                value: null,
                type: "integer",
                required: false
            },
            {
                label: "boolAtt",
                key: "boolAtt",
                value: null,
                type: "boolean",
                required: false
            },
            {
                label: "dateAtt",
                key: "dateAtt",
                value: null,
                type: "date",
                required: false
            }
        ]);
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Wfst: WfstModule
                    }
                }
            },
            getters: {
                uiStyle: sinon.stub()
            }
        });
    });
    afterEach(sinon.restore);

    // form -> form-Element mit input-Elementen und dazugehörigen label als auch div-Element mit 2 SimpleButton
    it("renders a container for the whole tool", () => {
        const requestStub = sinon.stub(Radio, "request");

        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.dispatch("Tools/Wfst/setActive", true).then(() => {
            wrapper = mount(WfsTransaction, {
                localVue,
                store
            });

            expect(wrapper.find("#tool-wfsTransaction-container").exists()).to.be.true;
        });
    });
    it("renders a container for the layer selection including a select element and its label", () => {
        const requestStub = sinon.stub(Radio, "request");

        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.commit("Tools/Wfst/setLayerIds", layerIds);
        store.dispatch("Tools/Wfst/setActive", true).then(() => {
            wrapper = mount(WfsTransaction, {
                localVue,
                store
            });

            expect(wrapper.find("#tool-wfsTransaction-layerSelect-container").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-layerSelect").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-layerSelect").element.options.length).to.equal(2);
            expect(wrapper.find("#tool-wfsTransaction-layerSelect").element.options[0].selected).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-layerSelect").element.options[0].text).to.equal(exampleLayerOne.name);
            expect(wrapper.find("#tool-wfsTransaction-layerSelect").element.options[1].selected).to.be.false;
            expect(wrapper.find("#tool-wfsTransaction-layerSelect").element.options[1].text).to.equal(exampleLayerTwo.name);
            expect(wrapper.find("#tool-wfsTransaction-layerSelect-label").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-layerSelect-label").text()).to.equal("common:modules.tools.wfsTransaction.layerSelectLabel");
        });
    });
    it("renders a container including the failure message that no layer has been selected in the layer tree", () => {
        const requestStub = sinon.stub(Radio, "request");

        exampleLayerOne.isSelected = false;
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.commit("Tools/Wfst/setLayerIds", layerIds);
        store.dispatch("Tools/Wfst/setActive", true).then(() => {
            wrapper = mount(WfsTransaction, {
                localVue,
                store
            });

            expect(wrapper.find("#tool-wfsTransaction-layerFailure").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-layerFailure").text()).to.equal("modules.tools.wfsTransaction.error.allLayersNotSelected");
        });
    });
    it("renders a container including the failure message that the current layer has not been selected in the layer tree", () => {
        const requestStub = sinon.stub(Radio, "request");

        exampleLayerOne.isSelected = true;
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.commit("Tools/Wfst/setLayerIds", layerIds);
        store.dispatch("Tools/Wfst/setActive", true)
            .then(() => {
                store.commit("Tools/Wfst/setLayerInformation", [{...exampleLayerOne, isSelected: false}, exampleLayerTwo]);
                return store.dispatch("Tools/Wfst/setFeatureProperties");
            })
            .then(() => {
                wrapper = mount(WfsTransaction, {
                    localVue,
                    store
                });

                expect(wrapper.find("#tool-wfsTransaction-layerFailure").exists()).to.be.true;
                expect(wrapper.find("#tool-wfsTransaction-layerFailure").text()).to.equal("modules.tools.wfsTransaction.error.layerNotSelected");
            });
    });
    it("renders a container including the failure message that the current layer is missing the property featurePrefix", () => {
        const requestStub = sinon.stub(Radio, "request");

        exampleLayerOne.isSelected = true;
        delete exampleLayerOne.featurePrefix;
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.commit("Tools/Wfst/setLayerIds", layerIds);
        store.dispatch("Tools/Wfst/setActive", true).then(() => {
            wrapper = mount(WfsTransaction, {
                localVue,
                store
            });

            expect(wrapper.find("#tool-wfsTransaction-layerFailure").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-layerFailure").text()).to.equal("modules.tools.wfsTransaction.error.layerNotConfiguredCorrectly");
        });
    });
    it("renders a container including a button for an insert transaction if lineButton is configured", () => {
        const requestStub = sinon.stub(Radio, "request");

        exampleLayerOne.isSelected = true;
        exampleLayerOne.featurePrefix = "app";
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.commit("Tools/Wfst/setLineButton", [{
            layerId: exampleLayerOne.id,
            available: true
        }]);
        store.commit("Tools/Wfst/setLayerIds", layerIds);
        store.dispatch("Tools/Wfst/setActive", true).then(() => {
            wrapper = mount(WfsTransaction, {
                localVue,
                store
            });

            expect(wrapper.find("#tool-wfsTransaction-interactionSelect-container").exists()).to.be.true;
        });
    });
    it("renders a form which includes a label and an input element for every gfi attribute of the layer", () => {
        const requestStub = sinon.stub(Radio, "request");

        exampleLayerOne.isSelected = true;
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[0]}).returns(exampleLayerOne);
        requestStub.withArgs("ModelList", "getModelByAttributes", {id: layerIds[1]}).returns(exampleLayerTwo);
        store.commit("Tools/Wfst/setLineButton", [{
            layerId: exampleLayerOne.id,
            available: true
        }]);
        store.commit("Tools/Wfst/setSelectedInteraction", "insert");
        store.commit("Tools/Wfst/setLayerIds", layerIds);
        store.dispatch("Tools/Wfst/setActive", true).then(() => {
            wrapper = mount(WfsTransaction, {
                localVue,
                store
            });

            expect(wrapper.find("#tool-wfsTransaction-form").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-form-input-stringAtt").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-form-input-stringAtt").attributes().type).to.equal("text");
            expect(wrapper.find("#tool-wfsTransaction-form-input-numAtt").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-form-input-numAtt").attributes().type).to.equal("number");
            expect(wrapper.find("#tool-wfsTransaction-form-input-boolAtt").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-form-input-boolAtt").attributes().type).to.equal("checkbox");
            expect(wrapper.find("#tool-wfsTransaction-form-input-dateAtt").exists()).to.be.true;
            expect(wrapper.find("#tool-wfsTransaction-form-input-dateAtt").attributes().type).to.equal("date");
            expect(wrapper.find("#tool-wfsTransaction-form-buttons").exists()).to.be.true;
        });
    });
});
