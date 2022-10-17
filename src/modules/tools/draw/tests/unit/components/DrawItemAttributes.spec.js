import DrawItemAttributes from "../../../components/DrawItemAttributes.vue";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Feature from "ol/Feature";
import sinon from "sinon";
import Vuex from "vuex";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/tools/draw/components/DrawItemAttributes.vue", () => {
    let testFeature, testLayer;

    const store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Draw: {
                            namespaced: true,
                            actions: {
                                setDownloadFeatures: () => sinon.stub()
                            }
                        }
                    }
                }
            }
        }),
        requiredProps = {
            selectedFeature: undefined,
            layer: undefined
        },
        factory = {
            getShallowMount: (props = requiredProps) => {
                return shallowMount(DrawItemAttributes, {
                    propsData: {
                        ...props
                    },
                    store
                });
            }
        };

    beforeEach(function () {
        testFeature = new Feature({
            isVisible: false,
            fromDrawTool: false,
            drawState: {
                drawType: {
                    id: "drawSymbol"
                }
            }
        });
        testLayer = {
            get: () => sinon.stub(),
            set: () => sinon.stub()
        };
    });

    describe("Component DOM", () => {
        it("should exists", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.exists()).to.be.true;
        });
        it("should have a form", () => {
            const wrapper = factory.getShallowMount(),
                formElement = wrapper.find("form");

            expect(formElement.exists()).to.be.true;
        });
        it("should have a form element with the id 'draw-attributes", () => {
            const wrapper = factory.getShallowMount(),
                formElement = wrapper.find("form");

            expect(formElement.attributes("id")).to.equal("draw-attributes");
        });
        it("should have form element without input fields", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.findAll(".form-control")).to.have.lengthOf(0);
        });
        it("should have form element with 2 input fields if a feature is selected", () => {
            const props = {selectedFeature: testFeature},
                wrapper = factory.getShallowMount(props);

            expect(wrapper.findAll(".form-control")).to.have.lengthOf(2);
        });
        it("should have form element with 4 input fields if a feature is selected", async () => {
            const props = {selectedFeature: testFeature},
                wrapper = factory.getShallowMount(props);

            wrapper.vm.attributes = [{
                foo: "bar"
            }];
            await wrapper.vm.$nextTick();
            expect(wrapper.findAll(".form-control")).to.have.lengthOf(4);
        });
    });

    describe("User interaction", () => {
        it("should add attributes to feature and local attributes array", () => {
            const props = {selectedFeature: testFeature},
                wrapper = factory.getShallowMount(props),
                expectedLocal = {key: "foo", value: "bar"},
                expected = {foo: "bar"};

            wrapper.vm.attributeKey = "foo";
            wrapper.vm.attributeValue = "bar";
            wrapper.vm.addAttributesToFeature();
            expect(wrapper.vm.attributes).to.be.an("array").and.to.deep.include(expectedLocal);
            expect(testFeature.get("attributes")).to.deep.equal(expected);
        });
        it("should remove attributes from the feature and row in local attributes array", () => {
            testFeature.set("attributes", {foo: "bar", biz: "buz"});
            const props = {selectedFeature: testFeature},
                wrapper = factory.getShallowMount(props),
                notExpected = {key: "biz", value: "buz"},
                localExpected = {key: "foo", value: "bar"},
                expected = {foo: "bar"};

            wrapper.vm.removeAttribute(1);

            expect(wrapper.vm.attributes).to.be.an("array").and.to.not.include(notExpected);
            expect(wrapper.vm.attributes).to.be.an("array").and.to.deep.include(localExpected);
            expect(testFeature.get("attributes")).to.deep.equal(expected);
        });
        it("should update the attributes on the feature", () => {
            testFeature.set("attributes", {foo: "bar", biz: "buz"});
            const props = {selectedFeature: testFeature},
                wrapper = factory.getShallowMount(props),
                expected = {fow: "bar", biz: "buz"},
                attributes = [{key: "fow", value: "bar"}, {key: "biz", value: "buz"}];

            wrapper.vm.saveChanges(attributes, testFeature, testLayer);

            expect(testFeature.get("attributes")).to.deep.equal(expected);
        });
        it("should update the attributes from the feature", async () => {
            testFeature.set("attributes", {foo: "bar", biz: "buz"});
            const props = {selectedFeature: testFeature},
                wrapper = factory.getShallowMount(props),
                localExpected = [{key: "fow", value: "bar"}, {key: "biz", value: "buz"}],
                expected = {fow: "bar", biz: "buz"};

            wrapper.vm.attributes[0].key = "fow";
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.attributes).to.deep.equal(localExpected);
            expect(testFeature.get("attributes")).to.deep.equal(expected);
        });
    });
    describe("checkAttributes", () => {
        it("should return true if empty array is given", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.vm.checkAttributes([])).to.be.true;
        });
        it("should return true if valid array of objects are given", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.vm.checkAttributes([{key: "foo"}, {key: "bar"}])).to.be.true;
        });
        it("should return false if array of objects has the same keys", () => {
            const wrapper = factory.getShallowMount();

            expect(wrapper.vm.checkAttributes([{key: "foo"}, {key: "foo"}])).to.be.false;
        });
    });
});
