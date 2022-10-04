import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import FilterList from "../../../components/FilterList.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("src/modules/tools/filter/components/FilterList.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(FilterList, {
            propsData: {
                filters: [
                    {
                        "layerId": "8712",
                        "searchInMapExtent": true,
                        "paging": 10,
                        "snippets": [
                            {
                                "attrName": "checkbox",
                                "label": "Ist dies eine Schwerpunktschule?",
                                "type": "checkbox",
                                "operator": "EQ",
                                "prechecked": false,
                                "visible": true
                            }
                        ]
                    }
                ],
                multiLayerSelector: false,
                "layerSelectorVisible": true
            },
            localVue
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should render filters", () => {
        expect(wrapper.findAll(".panel-default").exists()).to.be.true;
    });

    describe("updateSelectedLayers", () => {
        it("should not change selected layers if passed argument is not an id", () => {
            const expected = [];

            wrapper.vm.updateSelectedLayers(null);
            wrapper.vm.updateSelectedLayers(undefined);
            wrapper.vm.updateSelectedLayers([]);
            wrapper.vm.updateSelectedLayers("1234");
            wrapper.vm.updateSelectedLayers({});
            wrapper.vm.updateSelectedLayers(false);
            wrapper.vm.updateSelectedLayers(true);

            expect(wrapper.vm.selectedLayers).to.deep.equal(expected);

        });

        it("should update selected layers", () => {
            const expected = [1234],
                filterId = 1234;

            wrapper.vm.updateSelectedLayers(filterId);
            expect(wrapper.vm.selectedLayers).to.deep.equal(expected);
        });
    });

});
