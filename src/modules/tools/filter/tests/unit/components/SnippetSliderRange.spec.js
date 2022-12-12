import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetSliderRange from "../../../components/SnippetSliderRange.vue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/module/tools/filter/components/SnippetSliderRange.vue", () => {
    let wrapper = null;

    afterEach(() => {
        sinon.restore();
        if (typeof wrapper?.destroy === "function") {
            wrapper.destroy();
        }
    });

    describe("created", () => {
        it("should have correct default vars", () => {
            wrapper = shallowMount(SnippetSliderRange, {localVue});

            expect(wrapper.vm.isInitializing).to.be.true;
            expect(wrapper.vm.isAdjusting).to.be.false;
            expect(wrapper.vm.hasRuleSet).to.be.false;
            expect(wrapper.vm.adjustMinMax).to.be.an("array").that.is.empty;
            expect(wrapper.vm.intvEmitCurrentRule).to.equal(-1);
            expect(wrapper.vm.intvInputReaction).to.equal(-1);
            expect(wrapper.vm.currentSource).to.equal("init");
            expect(wrapper.vm.sliderMouseDown).to.be.false;
            expect(wrapper.vm.operatorWhitelist).to.deep.equal([
                "BETWEEN",
                "INTERSECTS"
            ]);
        });
        it("should have correct default props", () => {
            wrapper = shallowMount(SnippetSliderRange, {localVue});

            expect(wrapper.vm.adjustment).to.be.false;
            expect(wrapper.vm.api).to.be.null;
            expect(wrapper.vm.attrName).to.be.a("string").that.is.empty;
            expect(wrapper.vm.decimalPlaces).to.equal(0);
            expect(wrapper.vm.disabled).to.be.false;
            expect(wrapper.vm.filterId).to.equal(0);
            expect(wrapper.vm.fixedRules).to.be.an("array").that.is.empty;
            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.isParent).to.be.false;
            expect(wrapper.vm.operator).to.be.undefined;
            expect(wrapper.vm.prechecked).to.be.undefined;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.timeoutInput).to.equal(1400);
            expect(wrapper.vm.timeoutSlider).to.equal(800);
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.value).to.be.undefined;
            expect(wrapper.vm.visible).to.be.true;
        });
    });
    describe("mounted", () => {
        describe("api", () => {
            it("should call the api once if attrName is a string", async () => {
                const api = {
                        getMinMax: () =>false
                    },
                    spy = sinon.spy(api, "getMinMax");

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {api, attrName: "attrName"}});
                await wrapper.vm.$nextTick();
                expect(spy.calledOnce).to.be.true;
            });
            it("should call the api once if attrName is an array", async () => {
                const api = {
                        getMinMax: () => false
                    },
                    spy = sinon.spy(api, "getMinMax");

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {api, attrName: ["attrNameA", "attrNameB"]}});
                await wrapper.vm.$nextTick();
                expect(spy.calledOnce).to.be.true;
            });
        });
        describe("template", () => {
            it("should render itself", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue});

                expect(wrapper.find("div").classes("snippetSliderRangeContainer")).to.be.true;
            });
            describe("titleWrapper", () => {
                it("should not render a title wrapper if title and info are false", () => {
                    wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: false,
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").exists()).to.be.false;
                });
                it("should render a title wrapper if title is false but info is set", () => {
                    wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: false,
                        info: true
                    }});

                    expect(wrapper.find(".titleWrapper").exists()).to.be.true;
                });
                it("should render a title wrapper if info is false but title is set", () => {
                    wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: "title",
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").exists()).to.be.true;
                });
                it("should render the attrName as title if title is true", () => {
                    wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: true,
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").find(".title").text()).to.equal("attrName");
                });
                it("should render the title as title if title is set", () => {
                    wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: "title",
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").find(".title").text()).to.equal("title");
                });
                it("should render info if info is set", () => {
                    wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: false,
                        info: true
                    }});

                    expect(wrapper.find(".titleWrapper").find(".info").exists()).to.be.true;
                });
            });
            describe("inputWrapper", () => {
                describe("min and max", () => {
                    it("should set min and max based on api response", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".inputWrapper").find(".from").find("input").attributes("min")).to.equal("8");
                        expect(wrapper.find(".inputWrapper").find(".from").find("input").attributes("max")).to.equal("90");
                        expect(wrapper.find(".inputWrapper").find(".until").find("input").attributes("min")).to.equal("8");
                        expect(wrapper.find(".inputWrapper").find(".until").find("input").attributes("max")).to.equal("90");
                    });
                    it("should cap min and max if props value is given", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            value: [12, 80]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".inputWrapper").find(".from").find("input").attributes("min")).to.equal("12");
                        expect(wrapper.find(".inputWrapper").find(".from").find("input").attributes("max")).to.equal("80");
                        expect(wrapper.find(".inputWrapper").find(".until").find("input").attributes("min")).to.equal("12");
                        expect(wrapper.find(".inputWrapper").find(".until").find("input").attributes("max")).to.equal("80");
                    });
                });
                describe("prechecked", () => {
                    it("should set value to both endings if no prechecked is given", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".inputWrapper").find(".from").find("input").element.value).to.equal("8");
                        expect(wrapper.find(".inputWrapper").find(".until").find("input").element.value).to.equal("90");
                    });
                    it("should set value to endings given by prechecked", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            prechecked: [12, 80]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".inputWrapper").find(".from").find("input").element.value).to.equal("12");
                        expect(wrapper.find(".inputWrapper").find(".until").find("input").element.value).to.equal("80");
                    });
                });
            });
            describe("sliderWrapper", () => {
                describe("min and max", () => {
                    it("should set min and max value for slider based on api response", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("min")).to.equal("8");
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("max")).to.equal("90");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("min")).to.equal("8");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("max")).to.equal("90");
                    });
                    it("should cap min and max value for slider if props value is given", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            value: [12, 80]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("min")).to.equal("12");
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("max")).to.equal("80");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("min")).to.equal("12");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("max")).to.equal("80");
                    });
                });
                describe("prechecked", () => {
                    it("should set value to both borders for slider if no prechecked is given", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").element.value).to.equal("8");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").element.value).to.equal("90");
                    });
                    it("should set value to borders for slider given by prechecked", async () => {
                        const api = {
                            getMinMax: (attrName, onsuccess) => onsuccess({
                                min: 8,
                                max: 90
                            })
                        };

                        wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            prechecked: [12, 80]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").element.value).to.equal("12");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").element.value).to.equal("80");
                    });
                });
            });
        });
    });
    describe("methods", () => {
        describe("setCurrentSource", () => {
            it("should set the given value as current source", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue});

                wrapper.vm.setCurrentSource("test");
                expect(wrapper.vm.isCurrentSource("test")).to.be.true;
            });
        });
        describe("getSliderSteps", () => {
            it("should return the steps the slider should have based on the given decimal places", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue});

                expect(wrapper.vm.getSliderSteps(-2)).to.equal(100);
                expect(wrapper.vm.getSliderSteps(-1)).to.equal(10);
                expect(wrapper.vm.getSliderSteps(0)).to.equal(1);
                expect(wrapper.vm.getSliderSteps(1)).to.equal(0.1);
                expect(wrapper.vm.getSliderSteps(2)).to.equal(0.01);

                wrapper.destroy();
            });
        });
        describe("resetSnippet", () => {
            it("should reset the snippet", async () => {
                const api = {
                    getMinMax: (attrName, onsuccess) => onsuccess({
                        min: 8,
                        max: 90
                    })
                };

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    prechecked: [12, 80]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.sliderFrom).to.equal(12);
                expect(wrapper.vm.sliderUntil).to.equal(80);
                await wrapper.vm.resetSnippet();
                expect(wrapper.vm.sliderFrom).to.equal(8);
                expect(wrapper.vm.sliderUntil).to.equal(90);
            });
        });
        describe("deleteCurrentRule", () => {
            it("should emit deleteRule with its snippetId", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    snippetId: 1
                }});

                wrapper.vm.deleteCurrentRule();
                expect(wrapper.emitted("deleteRule")).to.be.an("array").and.to.have.lengthOf(1);
                expect(wrapper.emitted("deleteRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
                expect(wrapper.emitted("deleteRule")[0][0]).to.equal(1);
            });
        });
        describe("emitCurrentRule", () => {
            it("should emit changeRule function with the expected values", async () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    snippetId: 1,
                    visible: false,
                    attrName: "attrName",
                    operator: "INTERSECTS"
                }});

                wrapper.vm.emitCurrentRule("value", "startup");
                await wrapper.vm.$nextTick();
                expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
                expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
                expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                    snippetId: 1,
                    startup: "startup",
                    fixed: true,
                    attrName: "attrName",
                    operator: "INTERSECTS",
                    value: "value",
                    tagTitle: "0 - 100"
                });
            });
        });
        describe("getMeasureWidth", () => {
            it("should return 100% if value is set to min and max", () => {
                const api = {
                    getMinMax: (attrName, onsuccess) => onsuccess({
                        min: 8,
                        max: 90
                    })
                };

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    api,
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getMeasureWidth()).to.equal("100.0%");
            });
            it("should return the correct width if value is set between min and max", async () => {
                const api = {
                    getMinMax: (attrName, onsuccess) => onsuccess({
                        min: 8,
                        max: 90
                    })
                };

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    prechecked: [12, 80]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getMeasureWidth()).to.equal("83.8%");
            });
        });
        describe("getMeasureLeft", () => {
            it("should return 0% if from value equals min", () => {
                const api = {
                    getMinMax: (attrName, onsuccess) => onsuccess({
                        min: 8,
                        max: 90
                    })
                };

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    api,
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getMeasureLeft()).to.equal("0.0%");
            });
            it("should return correct percentage for left if from value is set", async () => {
                const api = {
                    getMinMax: (attrName, onsuccess) => onsuccess({
                        min: 8,
                        max: 90
                    })
                };

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    prechecked: [12, 80]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getMeasureLeft()).to.equal("4.6%");
            });
        });
        describe("isSelfSnippetId", () => {
            it("should return false if the given snippetId does not equal its snippetId", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId(0)).to.be.false;
            });
            it("should return false if the given snippetId does not include its snippetId", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId([0, 2, 3])).to.be.false;
            });
            it("should return true if the given snippetId equals its snippetId", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId(1)).to.be.true;
            });
            it("should return false if the given snippetId includes its snippetId", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId([0, 1, 2, 3])).to.be.true;
            });
        });
        describe("isPrecheckedValid", () => {
            it("should return false if prechecked is not valid", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue});
                expect(wrapper.vm.isPrecheckedValid()).to.be.false;
            });
            it("should return true if prechecked is valid", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    prechecked: [12, 90]
                }});
                expect(wrapper.vm.isPrecheckedValid()).to.be.true;
            });
        });
        describe("getOperator", () => {
            it("should return the default operator for sliderRange if any illegal operator is set", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    operator: "SOMETHING"
                }});
                expect(wrapper.vm.getOperator()).to.not.equal("SOMETHING");
            });
            it("should return the set operator if operator is part of the whitelist", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    operator: "BETWEEN"
                }});
                expect(wrapper.vm.getOperator()).to.equal("BETWEEN");
            });
        });
        describe("getAttrNameUntil", () => {
            it("should return the set attrName if it is a string", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getAttrNameUntil()).to.equal("attrName");
            });
            it("should return second element of attrName if it is an array of two", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getAttrNameUntil()).to.equal("attrNameB");
            });
        });
        describe("getAttrNameFrom", () => {
            it("should return the set attrName if it is a string", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getAttrNameFrom()).to.equal("attrName");
            });
            it("should return first element of attrName if it is an array of two", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getAttrNameFrom()).to.equal("attrNameA");
            });
        });
        describe("getTagTitle", () => {
            it("should return a certain string to display from and until as tag title", async () => {
                const api = {
                    getMinMax: (attrName, onsuccess) => onsuccess({
                        min: 8,
                        max: 90
                    })
                };

                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    prechecked: [12, 80]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getTagTitle()).to.equal("12 - 80");
            });
        });
        describe("getTitle", () => {
            it("should return the title if set title is a string", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    title: "title"
                }});
                expect(wrapper.vm.getTitle()).to.equal("title");
            });
            it("should return attrName if title is not set and attrName is a string", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getTitle()).to.equal("attrName");
            });
            it("should return attrName for from if title is not set and attrName is an array of two", () => {
                wrapper = shallowMount(SnippetSliderRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getTitle()).to.equal("attrNameA");
            });
        });
    });
});
