import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetDateRange from "../../../components/SnippetDateRange.vue";
import moment from "moment";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/module/tools/filter/components/SnippetDateRange.vue", () => {
    let wrapper = null;

    afterEach(() => {
        sinon.restore();
        if (typeof wrapper?.destroy === "function") {
            wrapper.destroy();
        }
    });

    describe("created", () => {
        it("should have correct default vars", () => {
            wrapper = shallowMount(SnippetDateRange, {localVue});

            expect(wrapper.vm.isInitializing).to.be.true;
            expect(wrapper.vm.isAdjusting).to.be.false;
            expect(wrapper.vm.hasRuleSet).to.be.false;
            expect(wrapper.vm.adjustMinMax).to.be.an("array").that.is.empty;
            expect(wrapper.vm.internalFormat).to.equal("YYYY-MM-DD");
            expect(wrapper.vm.initialDateRef).to.be.an("array").that.is.empty;
            expect(wrapper.vm.intvEmitCurrentRule).to.equal(-1);
            expect(wrapper.vm.sliderMouseDown).to.be.false;
            expect(wrapper.vm.operatorWhitelist).to.deep.equal([
                "BETWEEN",
                "INTERSECTS"
            ]);
        });
        it("should have correct default props", () => {
            wrapper = shallowMount(SnippetDateRange, {localVue});

            expect(wrapper.vm.adjustment).to.be.false;
            expect(wrapper.vm.api).to.be.null;
            expect(wrapper.vm.attrName).to.be.a("string").that.is.empty;
            expect(wrapper.vm.disabled).to.be.false;
            expect(wrapper.vm.display).to.equal("all");
            expect(wrapper.vm.filterId).to.equal(0);
            expect(wrapper.vm.fixedRules).to.be.an("array").that.is.empty;
            expect(wrapper.vm.format).to.equal("YYYY-MM-DD");
            expect(wrapper.vm.info).to.be.false;
            expect(wrapper.vm.isParent).to.be.false;
            expect(wrapper.vm.operator).to.be.undefined;
            expect(wrapper.vm.prechecked).to.be.undefined;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.subTitles).to.be.false;
            expect(wrapper.vm.timeoutSlider).to.equal(800);
            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.value).to.be.undefined;
            expect(wrapper.vm.visible).to.be.true;
        });
    });
    describe("mounted", () => {
        describe("api", () => {
            it("should not try to call the api if attrName is neither a string nor an array", async () => {
                const api = {
                        getUniqueValues: () => false
                    },
                    spy = sinon.spy(api, "getUniqueValues");

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {api}});
                await wrapper.vm.$nextTick();
                expect(spy.notCalled).to.be.true;
            });
            it("should call the api once if attrName is a string", async () => {
                const api = {
                        getUniqueValues: () =>false
                    },
                    spy = sinon.spy(api, "getUniqueValues");

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {api, attrName: "attrName"}});
                await wrapper.vm.$nextTick();
                expect(spy.calledOnce).to.be.true;
            });
            it("should call the api once if attrName is an array", async () => {
                const api = {
                        getUniqueValues: () => false
                    },
                    spy = sinon.spy(api, "getUniqueValues");

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {api, attrName: ["attrNameA", "attrNameB"]}});
                await wrapper.vm.$nextTick();
                expect(spy.calledOnce).to.be.true;
            });
        });
        describe("template", () => {
            it("should render itself", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});

                expect(wrapper.find("div").classes("snippetDateRangeContainer")).to.be.true;
            });
            describe("titleWrapper", () => {
                it("should not render a title wrapper if title and info are false", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: false,
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").exists()).to.be.false;
                });
                it("should render a title wrapper if title is false but info is set", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: false,
                        info: true
                    }});

                    expect(wrapper.find(".titleWrapper").exists()).to.be.true;
                });
                it("should render a title wrapper if info is false but title is set", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: "title",
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").exists()).to.be.true;
                });
                it("should render the attrName as title if title is true", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: true,
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").find(".title").text()).to.equal("attrName");
                });
                it("should render the title as title if title is set", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: "title",
                        info: false
                    }});

                    expect(wrapper.find(".titleWrapper").find(".title").text()).to.equal("title");
                });
                it("should render info if info is set", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        attrName: "attrName",
                        title: false,
                        info: true
                    }});

                    expect(wrapper.find(".titleWrapper").find(".info").exists()).to.be.true;
                });
            });
            describe("datepickerWrapper", () => {
                describe("props display", () => {
                    it("should not render datepicker wrapper if display is anything but `all` or `datepicker`", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            display: "anything"
                        }});

                        expect(wrapper.find(".datepickerWrapper").exists()).to.be.false;
                    });
                    it("should render datepicker wrapper if display is set to `all`", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            display: "all"
                        }});

                        expect(wrapper.find(".datepickerWrapper").exists()).to.be.true;
                    });
                    it("should render datepicker wrapper if display is set to `datepicker`", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            display: "datepicker"
                        }});

                        expect(wrapper.find(".datepickerWrapper").exists()).to.be.true;
                    });
                });
                describe("props subTitles", () => {
                    it("should not display a subtitle for from and until if subtitle is false", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            subTitles: false
                        }});

                        expect(wrapper.find(".datepickerWrapper").find(".from").find("label").exists()).to.be.false;
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("label").exists()).to.be.false;
                    });
                    it("should display attrName as subTitle for from and no subtitle for until if subtitle is true and attrName is a string", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            attrName: "attrName",
                            subTitles: true
                        }});

                        expect(wrapper.find(".datepickerWrapper").find(".from").find("label").text()).to.equal("attrName");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("label").text()).to.be.a("string").that.is.empty;
                    });
                    it("should display attrName as subTitle for from and for until if subtitle is true and attrName is an array", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            attrName: ["attrNameA", "attrNameB"],
                            subTitles: true
                        }});

                        expect(wrapper.find(".datepickerWrapper").find(".from").find("label").text()).to.equal("attrNameA");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("label").text()).to.equal("attrNameB");
                    });
                    it("should display subTitles for from and for until", () => {
                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            subTitles: ["subTitleA", "subTitleB"]
                        }});

                        expect(wrapper.find(".datepickerWrapper").find(".from").find("label").text()).to.equal("subTitleA");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("label").text()).to.equal("subTitleB");
                    });
                });
                describe("min and max", () => {
                    it("should set min and max date for datepicker based on api response", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".datepickerWrapper").find(".from").find("input").attributes("min")).to.equal("2022-08-10");
                        expect(wrapper.find(".datepickerWrapper").find(".from").find("input").attributes("max")).to.equal("2022-08-30");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("input").attributes("min")).to.equal("2022-08-10");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("input").attributes("max")).to.equal("2022-08-30");
                    });
                    it("should cap min and max date for datepicker if props value is given", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY",
                            value: ["11.08.2022", "29.08.2022"]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".datepickerWrapper").find(".from").find("input").attributes("min")).to.equal("2022-08-16");
                        expect(wrapper.find(".datepickerWrapper").find(".from").find("input").attributes("max")).to.equal("2022-08-26");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("input").attributes("min")).to.equal("2022-08-16");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("input").attributes("max")).to.equal("2022-08-26");
                    });
                });
                describe("prechecked", () => {
                    it("should set value to both borders for datepicker if no prechecked is given", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".datepickerWrapper").find(".from").find("input").element.value).to.equal("2022-08-10");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("input").element.value).to.equal("2022-08-30");
                    });
                    it("should set value to borders for datepickers given by prechecked", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY",
                            prechecked: ["11.08.2022", "29.08.2022"]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".datepickerWrapper").find(".from").find("input").element.value).to.equal("2022-08-16");
                        expect(wrapper.find(".datepickerWrapper").find(".until").find("input").element.value).to.equal("2022-08-26");
                    });
                });
            });
            describe("sliderWrapper", () => {
                it("should not render slider wrapper if display is anything but `all` or `slider`", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        display: "anything"
                    }});

                    expect(wrapper.find(".sliderWrapper").exists()).to.be.false;
                });
                it("should render slider wrapper if display is set to `all`", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        display: "all"
                    }});

                    expect(wrapper.find(".sliderWrapper").exists()).to.be.true;
                });
                it("should render slider wrapper if display is set to `slider`", () => {
                    wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                        display: "slider"
                    }});

                    expect(wrapper.find(".sliderWrapper").exists()).to.be.true;
                });
                describe("min and max", () => {
                    it("should set min and max value for slider based on api response", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("min")).to.equal("0");
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("max")).to.equal("4");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("min")).to.equal("0");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("max")).to.equal("4");
                    });
                    it("should cap min and max value for slider if props value is given", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY",
                            value: ["11.08.2022", "29.08.2022"]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("min")).to.equal("0");
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").attributes("max")).to.equal("2");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("min")).to.equal("0");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").attributes("max")).to.equal("2");
                    });
                });
                describe("prechecked", () => {
                    it("should set value to both borders for slider if no prechecked is given", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY"
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").element.value).to.equal("0");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").element.value).to.equal("4");
                    });
                    it("should set value to borders for slider given by prechecked", async () => {
                        const api = {
                            getUniqueValues: (attrName, onsuccess) => onsuccess([
                                "20.08.2022",
                                "30.08.2022",
                                "26.08.2022",
                                "10.08.2022",
                                "16.08.2022"
                            ])
                        };

                        wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                            api,
                            attrName: "attrName",
                            format: "DD.MM.YYYY",
                            prechecked: ["11.08.2022", "29.08.2022"]
                        }});
                        await wrapper.vm.$nextTick();
                        expect(wrapper.find(".sliderWrapper").find(".from").find("input").element.value).to.equal("1");
                        expect(wrapper.find(".sliderWrapper").find(".until").find("input").element.value).to.equal("3");
                    });
                });
            });
        });
    });
    describe("methods", () => {
        describe("resetSnippet", () => {
            it("should reset the snippet", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY",
                    prechecked: ["11.08.2022", "29.08.2022"]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.sliderFrom).to.equal(1);
                expect(wrapper.vm.sliderUntil).to.equal(3);
                await wrapper.vm.resetSnippet();
                expect(wrapper.vm.sliderFrom).to.equal(0);
                expect(wrapper.vm.sliderUntil).to.equal(4);
            });
        });
        describe("deleteCurrentRule", () => {
            it("should emit deleteRule with its snippetId", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
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
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    snippetId: 1,
                    visible: false,
                    attrName: "attrName",
                    operator: "INTERSECTS",
                    format: "DD.MM.YYYY"
                }});

                await wrapper.vm.$nextTick();
                wrapper.vm.emitCurrentRule(["01.01.2019", "31.12.2022"], "startup", "immediate");
                expect(wrapper.emitted("changeRule")).to.be.an("array").and.to.have.lengthOf(1);
                expect(wrapper.emitted("changeRule")[0]).to.be.an("array").and.to.have.lengthOf(1);
                expect(wrapper.emitted("changeRule")[0][0]).to.deep.equal({
                    snippetId: 1,
                    startup: "startup",
                    fixed: true,
                    attrName: "attrName",
                    operator: "INTERSECTS",
                    format: "DD.MM.YYYY",
                    value: ["01.01.2019", "31.12.2022"],
                    tagTitle: "10.08.2022 - 30.08.2022"
                });
            });
        });
        describe("getMeasureWidth", () => {
            it("should return 100% if value is set to min and max", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getMeasureWidth()).to.equal("100.0%");
            });
            it("should return the correct width if value is set between min and max", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY",
                    prechecked: ["11.08.2022", "29.08.2022"]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getMeasureWidth()).to.equal("52.5%");
            });
        });
        describe("getMeasureLeft", () => {
            it("should return 0% if from value equals min", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getMeasureLeft()).to.equal("0.0%");
            });
            it("should return correct percentage for left if from value is set", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY",
                    prechecked: ["11.08.2022", "29.08.2022"]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getMeasureLeft()).to.equal("23.8%");
            });
        });
        describe("isSelfSnippetId", () => {
            it("should return false if the given snippetId does not equal its snippetId", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId(0)).to.be.false;
            });
            it("should return false if the given snippetId does not include its snippetId", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId([0, 2, 3])).to.be.false;
            });
            it("should return true if the given snippetId equals its snippetId", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId(1)).to.be.true;
            });
            it("should return false if the given snippetId includes its snippetId", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    snippetId: 1
                }});
                expect(wrapper.vm.isSelfSnippetId([0, 1, 2, 3])).to.be.true;
            });
        });
        describe("isPrecheckedValid", () => {
            it("should return false if prechecked is not valid", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.isPrecheckedValid()).to.be.false;
            });
            it("should return true if prechecked is valid", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    format: ["DD.MM.YYYY", "YYYY/DD/MM"]
                }});
                expect(wrapper.vm.isPrecheckedValid(["11.08.2022", "2022/29/08"])).to.be.true;
            });
        });
        describe("getOperator", () => {
            it("should return the default operator for dateRange if any illegal operator is set", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    operator: "SOMETHING"
                }});
                expect(wrapper.vm.getOperator()).to.not.equal("SOMETHING");
            });
            it("should return the set operator if operator is part of the whitelist", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    operator: "BETWEEN"
                }});
                expect(wrapper.vm.getOperator()).to.equal("BETWEEN");
            });
        });
        describe("getFormat", () => {
            it("should return the set format if set format is a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    format: "format"
                }});
                expect(wrapper.vm.getFormat()).to.equal("format");
            });
            it("should return internal format if anything but a string or an array is set as format", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    format: undefined
                }});
                expect(wrapper.vm.getFormat()).to.equal(wrapper.vm.internalFormat);
            });
            it("should return first part of format if format is an array and requested format is for from", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    format: ["formatA", "formatB"]
                }});
                expect(wrapper.vm.getFormat("from")).to.equal("formatA");
            });
            it("should return second part of format if format is an array and requested format is for until", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    format: ["formatA", "formatB"]
                }});
                expect(wrapper.vm.getFormat("until")).to.equal("formatB");
            });
        });
        describe("addListToUnixAssoc", () => {
            it("should return false if list is not an array", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc(undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc(null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc(1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc("string")).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc(true)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc(false)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc({})).to.be.false;
            });
            it("should return false if format is not a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc([], undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], 1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], true)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], false)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], {})).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], [])).to.be.false;
            });
            it("should return false if minValid is not boolean", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc([], "format", undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", 1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", "string")).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", {})).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", [])).to.be.false;
            });
            it("should return false if maxValid is not boolean", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, 1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, "string")).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, {})).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, [])).to.be.false;
            });
            it("should return false if minMoment is not recognized as moment object", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, 1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, "string")).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, true)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, false)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, {})).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, [])).to.be.false;
            });
            it("should return false if maxMoment is not recognized as moment object", () => {
                const minMoment = {
                    isValid: () => false
                };

                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, 1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, "string")).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, true)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, false)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, {})).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, [])).to.be.false;
            });
            it("should return false if result is not an object", () => {
                const minMoment = {
                        isValid: () => false
                    },
                    maxMoment = {
                        isValid: () => false
                    };

                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, undefined)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, null)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, 1234)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, "string")).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, true)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, false)).to.be.false;
                expect(wrapper.vm.addListToUnixAssoc([], "format", true, true, minMoment, maxMoment, [])).to.be.false;
            });
            it("should alter the result by list for all entries between minMoment and maxMoment", () => {
                const result = {};

                wrapper = shallowMount(SnippetDateRange, {localVue});
                expect(wrapper.vm.addListToUnixAssoc(
                    [
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ],
                    "DD.MM.YYYY",
                    true,
                    true,
                    moment("11.08.2022", "DD.MM.YYYY"),
                    moment("29.08.2022", "DD.MM.YYYY"),
                    result
                )).to.be.true;
                expect(result).to.be.an("object").that.is.not.empty;
            });
        });
        describe("getInitialDateReference", () => {
            it("should merge both given lists into one, sorted by time, should remove doublings", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"],
                    format: "DD.MM.YYYY"
                }});
                expect(wrapper.vm.getInitialDateReference(
                    [
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ],
                    [
                        "16.08.2022",
                        "22.08.2022",
                        "26.08.2022"
                    ]
                )).to.deep.equal([
                    "2022-08-10",
                    "2022-08-16",
                    "2022-08-20",
                    "2022-08-22",
                    "2022-08-26",
                    "2022-08-30"
                ]);
            });
        });
        describe("getSliderIdxCloseToUntilDate", () => {
            it("should return the last index of initialized date list, if untilDate isn't given", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getSliderIdxCloseToUntilDate()).to.equal(4);
            });
            it("should return the next downward index", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getSliderIdxCloseToUntilDate("2022-08-29")).to.equal(3);
            });
            it("should return the index equal to given untilDate", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getSliderIdxCloseToUntilDate("2022-08-26")).to.equal(3);
            });
        });
        describe("getSliderIdxCloseToFromDate", () => {
            it("should return the first index of initialized date list, if fromDate isn't given", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getSliderIdxCloseToFromDate()).to.equal(0);
            });
            it("should return the next upward index", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getSliderIdxCloseToFromDate("2022-08-11")).to.equal(1);
            });
            it("should return the index equal to given fromDate", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY"
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getSliderIdxCloseToFromDate("2022-08-16")).to.equal(1);
            });
        });
        describe("getAttrNameUntil", () => {
            it("should return the set attrName if it is a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getAttrNameUntil()).to.equal("attrName");
            });
            it("should return second element of attrName if it is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getAttrNameUntil()).to.equal("attrNameB");
            });
        });
        describe("getAttrNameFrom", () => {
            it("should return the set attrName if it is a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getAttrNameFrom()).to.equal("attrName");
            });
            it("should return first element of attrName if it is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getAttrNameFrom()).to.equal("attrNameA");
            });
        });
        describe("getTagTitle", () => {
            it("should return a certain string to display from and until as tag title", async () => {
                const api = {
                    getUniqueValues: (attrName, onsuccess) => onsuccess([
                        "20.08.2022",
                        "30.08.2022",
                        "26.08.2022",
                        "10.08.2022",
                        "16.08.2022"
                    ])
                };

                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    api,
                    attrName: "attrName",
                    format: "DD.MM.YYYY",
                    prechecked: ["11.08.2022", "29.08.2022"]
                }});
                await wrapper.vm.$nextTick();
                expect(wrapper.vm.getTagTitle()).to.equal("16.08.2022 - 26.08.2022");
            });
        });
        describe("getSubTitleUntil", () => {
            it("should return set subTitle for until if subTitles is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    subTitles: ["subTitleA", "subTitleB"]
                }});
                expect(wrapper.vm.getSubTitleUntil()).to.equal("subTitleB");
            });
            it("should return set attrName if subTitles is not set and attrName is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getSubTitleUntil()).to.equal("attrNameB");
            });
            it("should return an empty string if subTitles is not set and attrName is not an array", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getSubTitleUntil()).to.equal("");
            });
        });
        describe("getSubTitleFrom", () => {
            it("should return set subTitle for from if subTitles is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    subTitles: ["subTitleA", "subTitleB"]
                }});
                expect(wrapper.vm.getSubTitleFrom()).to.equal("subTitleA");
            });
            it("should return set attrName if subTitles is not set and attrName is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getSubTitleFrom()).to.equal("attrNameA");
            });
            it("should return attrName if subTitles is not set and attrName is a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getSubTitleFrom()).to.equal("attrName");
            });
        });
        describe("getTitle", () => {
            it("should return the title if set title is a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    title: "title"
                }});
                expect(wrapper.vm.getTitle()).to.equal("title");
            });
            it("should return attrName if title is not set and attrName is a string", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: "attrName"
                }});
                expect(wrapper.vm.getTitle()).to.equal("attrName");
            });
            it("should return attrName for from if title is not set and attrName is an array of two", () => {
                wrapper = shallowMount(SnippetDateRange, {localVue, propsData: {
                    attrName: ["attrNameA", "attrNameB"]
                }});
                expect(wrapper.vm.getTitle()).to.equal("attrNameA");
            });
        });
    });
});
