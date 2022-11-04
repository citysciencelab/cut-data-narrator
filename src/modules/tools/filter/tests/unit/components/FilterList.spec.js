import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import FilterList from "../../../components/FilterList.vue";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("src/modules/tools/filter/components/FilterList.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(FilterList, {
            propsData: {
                filters: [{filterId: 0}],
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
            const filterId = 1234;

            wrapper.vm.updateSelectedLayers(filterId);
            expect(wrapper.emitted()).to.have.property("selectedaccordions");
        });
    });
    describe("scrollToView", () => {
        it("should emit if aynthing but a number is given", () => {
            wrapper.vm.scrollToView([]);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView({});
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView("string");
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(true);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(false);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(undefined);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
            wrapper.vm.scrollToView(null);
            expect(wrapper.emitted()).to.not.have.property("resetJumpToId");
        });
        it("should emit if a number is given", async () => {
            wrapper.vm.$refs = {0: [{
                scrollIntoView: sinon.stub()
            }]};
            await wrapper.vm.$nextTick();
            wrapper.vm.scrollToView(0);
            expect(wrapper.emitted()).to.have.property("resetJumpToId");
        });
    });
});
