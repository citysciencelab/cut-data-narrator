import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import GeometryFilter from "../../../components/GeometryFilter.vue";
import {expect} from "chai";
import sinon from "sinon";
import Draw from "ol/interaction/Draw.js";
import {Vector as VectorLayer} from "ol/layer";
import Feature from "ol/Feature";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/filter/components/GeometryFilter.vue", () => {
    let wrapper = null,
        sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        wrapper = shallowMount(GeometryFilter, {
            localVue,
            store: new Vuex.Store({
                namespaced: true,
                modules: {
                    Maps: {
                        namespaced: true,
                        actions: {
                            addInteraction: sinon.stub(),
                            removeInteraction: sinon.stub(),
                            addLayer: sinon.stub()
                        },
                        mutations: {
                            removeLayerFromMap: sinon.stub()
                        }
                    },
                    Tools: {
                        namespaced: true,
                        modules: {
                            Gfi: {
                                namespaced: true,
                                mutations: {
                                    setGfiActive: sinon.stub()
                                }
                            }
                        }
                    }
                }
            })
        });
    });

    afterEach(() => {
        sandbox.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("Component DOM", () => {
        it("should exist", () => {
            expect(wrapper.exists()).to.be.true;
        });
        it("should render correctly if component is created", () => {
            expect(wrapper.find("#geometryFilterChecked").exists()).to.be.true;
            expect(wrapper.find("#geometryFilterHelp").exists()).to.be.true;
            expect(wrapper.find("#geometrySelect").exists()).to.be.false;
            expect(wrapper.find("#inputLineBuffer").exists()).to.be.false;
            expect(wrapper.find("#buttonRemoveGeometry").exists()).to.be.false;
        });

        it("should render geometry selection dropdown", async () => {
            await wrapper.setData({isActive: true});

            expect(wrapper.find("#geometrySelect").exists()).to.be.true;
        });

        it("should render buffer input", async () => {
            await wrapper.setData({isActive: true, isBufferInputVisible: true});

            expect(wrapper.find("#inputLineBuffer").exists()).to.be.true;
        });

        it("should render remove button", async () => {
            await wrapper.setData({isGeometryVisible: true});

            expect(wrapper.find("#buttonRemoveGeometry").exists()).to.be.true;
        });
    });

    describe("User Interactions", () => {
        it("should render geometry selection dropdown if user sets checked value to the checkbox", async () => {
            const radioInput = wrapper.find("#geometryFilterChecked");

            await radioInput.setChecked();

            expect(radioInput.element.checked).to.be.true;
            expect(wrapper.find("#geometrySelect").exists()).to.be.true;
        });

        it("should render the correct value in the dropdown if user changes it", async () => {
            const radioInput = wrapper.find("#geometryFilterChecked");

            await radioInput.setChecked();
            await wrapper.find("select").findAll("option").at(1).setSelected();

            expect(wrapper.find("option:checked").element.value).to.be.equal("1");
            expect(wrapper.find("option:checked").text()).to.be.equal("common:modules.tools.filter.geometryFilter.geometries.rectangle");
        });

        it("should call reset if user click on the remove button", async () => {
            await wrapper.setData({isGeometryVisible: true});
            await wrapper.find("#buttonRemoveGeometry").trigger("click");

            expect(wrapper.vm.isGeometryVisible).to.be.false;
            expect(wrapper.vm.isBufferInputVisible).to.be.false;
            expect(wrapper.vm.layer.getSource().getFeatures()).to.have.lengthOf(0);
        });
    });

    describe("methods", () => {
        describe("getGeometries", () => {
            it("should return a specific structure", () => {
                expect(wrapper.vm.getGeometries()).to.deep.equal([
                    {
                        "type": "Polygon",
                        "name": "common:modules.tools.filter.geometryFilter.geometries.polygon"
                    },
                    {
                        "type": "Rectangle",
                        "name": "common:modules.tools.filter.geometryFilter.geometries.rectangle"
                    },
                    {
                        "type": "Circle",
                        "name": "common:modules.tools.filter.geometryFilter.geometries.circle"
                    },
                    {
                        "type": "LineString",
                        "name": "common:modules.tools.filter.geometryFilter.geometries.lineString"
                    }
                ]);
            });
        });
        describe("prepareAdditionalGeometries", () => {
            it("should return an empty array", () => {
                expect(wrapper.vm.prepareAdditionalGeometries(false)).to.be.an("array").that.is.empty;
            });

            it("should return the correct name and type of the additonal geometry", () => {
                const feature = new Feature({
                        bezirk: "Altona"
                    }),
                    additionalGeometries = [{
                        attrNameForTitle: "bezirk",
                        features: [feature]
                    }],
                    results = wrapper.vm.prepareAdditionalGeometries(additionalGeometries);

                expect(results[0]).to.deep.equal({
                    type: "additional",
                    feature: feature,
                    name: "Altona"
                });
            });
        });

        describe("getSelectedGeometry", () => {
            it("should return the first geometry on startup", () => {
                expect(wrapper.vm.getSelectedGeometry(0)).to.deep.equal({
                    "type": "Polygon",
                    "name": "common:modules.tools.filter.geometryFilter.geometries.polygon"
                });
            });

            it("should return the second geometry if data.selectedGeometry is set 1", () => {
                expect(wrapper.vm.getSelectedGeometry(1)).to.deep.equal({
                    "type": "Rectangle",
                    "name": "common:modules.tools.filter.geometryFilter.geometries.rectangle"
                });
            });

            it("should return the third geometry if data.selectedGeometry is set 2", () => {
                expect(wrapper.vm.getSelectedGeometry(2)).to.deep.equal({
                    "type": "Circle",
                    "name": "common:modules.tools.filter.geometryFilter.geometries.circle"
                });
            });

            it("should return the fourth geometry if data.selectedGeometry is set 3", () => {
                expect(wrapper.vm.getSelectedGeometry(3)).to.deep.equal({
                    "type": "LineString",
                    "name": "common:modules.tools.filter.geometryFilter.geometries.lineString"
                });
            });
        });

        describe("setDrawInteraction", () => {
            it("should set the draw state", () => {
                wrapper.vm.draw = false;
                wrapper.vm.setDrawInteraction("LineString");
                expect(wrapper.vm.draw).to.be.instanceOf(Draw);
            });
        });

        describe("setLayer", () => {
            it("should set the layer", () => {
                wrapper.vm.layer = false;
                wrapper.vm.setLayer();
                expect(wrapper.vm.layer).to.be.instanceOf(VectorLayer);
            });
        });

        describe("reset", () => {
            it("should set isGeometryVisible to false", () => {
                wrapper.vm.isGeometryVisible = true;
                wrapper.vm.reset();
                expect(wrapper.vm.isGeometryVisible).to.be.false;
            });
        });
    });
});
