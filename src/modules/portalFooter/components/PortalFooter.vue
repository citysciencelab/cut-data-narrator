<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersPortalFooter";
import mutations from "../store/mutationsPortalFooter";
import ScaleLine from "../../scaleLine/components/ScaleLine.vue";
import LanguageItem from "../../language/components/LanguageItem.vue";
import MousePosition from "../../controls/mousePosition/components/MousePosition.vue";
import store from "../../../app-store/index";
import {getComponent} from "../../../utils/getComponent";

/**
 * Footer that is displayed below the map. The version of the masterportal and links can be displayed here.
 */
export default {
    name: "PortalFooter",
    components: {
        LanguageItem,
        ScaleLine,
        MousePosition
    },
    computed: {
        ...mapGetters(["footerConfig", "mobile", "masterPortalVersionNumber"]),
        ...mapGetters("Maps", ["is3D"]),
        ...mapGetters("PortalFooter", Object.keys(getters)),
        showLanguageSwitcher () {
            return this.$i18n.i18next.options.isEnabled() && Object.keys(this.$i18n.i18next.options.getLanguages()).length > 1;
        },
        showShortMenu () {
            return this.mobile;
        }
    },
    mounted () {
        this.initialize();

        if (this.footerConfig) {
            this.setShowFooter(true);
        }
        if (this.footerInfo) {
            this.renderFooterInfo();
        }
    },
    methods: {
        ...mapActions("PortalFooter", [
            "initialize",
            "renderFooterInfo"
        ]),
        ...mapMutations("PortalFooter", Object.keys(mutations)),

        /**
         * Toggles the given Tool
         * @param {string} toolModelId The Model ID of the tool to activate/deactivate. ID may be empty.
         * @param {object} event The Click event
         * @returns {void}
         */
        toggleTool (toolModelId, event) {
            let model, active;

            if (toolModelId) {
                if (store.state.Tools[toolModelId]) {
                    model = getComponent(store.state.Tools[toolModelId].id);
                    active = store.getters["Tools/" + toolModelId + "/active"];
                    Radio.trigger("ModelList", "setActiveToolsToFalse", store.getters["Tools/getActiveToolNames"]);
                    store.commit("Tools/" + toolModelId + "/setActive", !active);
                }
                else {
                    model = Radio.request("ModelList", "getModelByAttributes", {id: toolModelId});
                }
                if (model) {
                    if (event) {
                        event.preventDefault();
                    }
                    model.setIsActive(!active);
                }
            }
        },
        supportedIn3D (toolModelId) {
            if (!toolModelId) {
                return true;
            }
            if (this.is3D) {
                const toolsSupportedIn3d = Radio.request("Tool", "getSupportedIn3d");

                return toolsSupportedIn3d.find(name => name.toLowerCase() === toolModelId.toLowerCase());
            }
            return true;
        },

        /**
         * toogles the area for the footer information (InfoTabs)
         * @param {Number} index index for the information tabs
         * @returns {void}
        */
        toggleFooterInfo: function (index) {
            if (this.infoShownDiv === index) {
                this.setInfoShownDiv(-1);
            }
            else {
                this.setInfoShownDiv(index);
            }
        },
        /**
         * toogles the footerbar with the info links
         * @param {object} state state
         * @returns {void}
         */
        toggleMobileFooterInfo: function () {
            this.setIsShortMenuOpen(!this.isShortMenuOpen);
        }
    }
};
</script>

<template>
    <footer
        id="portal-footer"
        :class="!showFooter && 'hide-portal-footer'"
    >
        <template
            v-if="footerInfo"
        >
            <div id="footerInfo">
                <div
                    class="accordion"
                    data-bs-parent="#footerInfo"
                >
                    <div
                        v-for="(info, index) in footerInfo"
                        :id="`${info.title}`"
                        :key="`footerInfo-${index}`"
                    >
                        <div
                            v-if="infoShownDiv === index"
                            id="infoDiv-${index}"
                            class="footer-info-div"
                        >
                            <div class="info-top">
                                <p class="info-top-titel">
                                    {{ $t(info.title) }}
                                </p>
                                <div v-if="info.description">
                                    <p
                                        class="info-top-text"
                                        v-html="$t(info.description)"
                                    />
                                </div>
                            </div>
                            <div class="info-bottom">
                                <div
                                    v-for="(subtext, i) in info.subtexts"
                                    id="footer-info-subtext-${i}"
                                    :key="`footer-info-subtext-${i}`"
                                >
                                    <p
                                        class="info-bottom-titel"
                                        v-html="$t(subtext.subtitle)"
                                    />
                                    <p
                                        class="info-bottom-text"
                                        v-html="$t(subtext.text)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <MousePosition class="portal-footer-mouse-position" />
        <!-- keep div#footer as anchor for mouse position even if no footer is to be rendered -->
        <template v-if="showFooter">
            <template v-for="(url, index) in urls">
                <span
                    v-if="supportedIn3D(url.toolModelId)"
                    :key="`portal-footer-url-${index}`"
                >
                    {{ $t(url.bezeichnung) }}
                    <a
                        :href="url.url"
                        target="_blank"
                        @click="toggleTool(url.toolModelId, $event)"
                    >
                        {{ $t(mobile ? $t(url.alias_mobil) : $t(url.alias)) }}
                    </a>
                    <span
                        v-if="index < Object.keys(urls).length - 1 || showVersion"
                        class="separator bootstrap-icon d-none d-md-inline-block"
                    >
                        <b
                            v-html="seperator"
                        />
                    </span>
                </span>
            </template>
            <template v-if="showVersion">
                <span class="d-none d-md-block">
                    {{ $t("masterPortalVersion", {masterPortalVersionNumber}) }}
                </span>
            </template>
            <span class="spacer" />

            <template v-if="footerInfo">
                <template
                    v-if="showShortMenu"
                >
                    <span
                        v-if="isShortMenuOpen"
                        class="bi bi-chevron-down"
                        @click.self="toggleMobileFooterInfo"
                        @keydown="toggleMobileFooterInfo"
                    />
                    <span
                        v-else
                        class="bi bi-chevron-up"
                        @click.self="toggleMobileFooterInfo"
                        @keydown="toggleMobileFooterInfo"
                    />
                </template>
                <template
                    v-for="(info, index) in infoTitles"
                    v-else
                >
                    <span
                        :key="`footer-info-link-${index}`"
                        class="separator"
                    >
                        <a
                            @click="toggleFooterInfo(index)"
                            @keydown="toggleFooterInfo(index)"
                        >
                            {{ $t(info) }}
                        </a>
                        <b
                            v-if="index < infoTitles.length - 1"
                            v-html="seperator"
                        />
                    </span>
                </template>
            </template>

            <span class="spacer" />
            <ScaleLine />
            <LanguageItem v-if="showLanguageSwitcher" />
        </template>
        <ScaleLine
            v-else
            class="portal-footer-scaleLine"
        />
        <template
            v-if="showFooter && showShortMenu && isShortMenuOpen"
        >
            <div id="footerInfoMobile">
                <div
                    class="accordion"
                    data-bs-parent="#footerInfoMobile"
                >
                    <!-- for mobile use -->
                    <template
                        v-for="(info, index) in infoTitles"
                    >
                        <div
                            :key="`${index}`"
                        >
                            <span
                                :key="`footer-info-link-${index}`"
                            >
                                <a
                                    @click="toggleFooterInfo(index)"
                                    @keydown="toggleFooterInfo(index)"
                                >
                                    {{ $t(info) }}
                                </a>

                            </span>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </footer>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    #footerInfo {
        width: 100%;
        position: absolute;
        bottom: 100%;
        left: 0px;
        max-height: 76vh;
        overflow-y: auto;
    }

    #footerInfoMobile {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        position: relative;
        justify-content: center
    }
    #portal-footer {
        width: 100%;

        background: fade($secondary, 90%);

        font-family: $font_family_narrow;
        color: $secondary_contrast;
        font-size: $font-size-sm;

        box-shadow: 0 -6px 12px $shadow;
        padding: 4px 10px;

        z-index: 2;

        display: flex;
        flex-wrap: wrap;
        position: relative;

        a {
            color: darken($secondary_focus, 10%);
            &:hover{
                @include primary_action_hover;
            }
        }

        &.hide-portal-footer {
            padding: 0;
        }

        .spacer {
            flex-grow: 1;
        }

        .separator {
            padding: 0 8px;
        }

        .portal-footer-mouse-position {
            position: absolute;
            left: 0;
            bottom: 100%;
            /* should share bottom-line last control element */
            margin-bottom: 15px;
            z-index: -1;
        }

        a[target=_blank]{
            color: $primary;
            padding: .2rem;
            &:hover{
                @include primary_action_hover;
            }
        }

        .portal-footer-scaleLine {
            position: absolute;
            right: 0;
            bottom: 100%;
        }

        .footer-info-div {
            background-color: $white;
            width: 100%;
            height: 30%;
            bottom: 0px;
            padding: 3rem 20rem;

            .info-top {
                margin-bottom: 2.5rem;

                p.info-top-titel {
                    color: $light_grey_inactive_contrast;
                    font-size: $font-size-lg;
                    margin-bottom: 1rem;
                }
                p.info-top-text {
                    color: $light_grey_inactive_contrast;
                    margin-bottom: 1rem;
                    font-size: $font-size-base;
                }
            }
            .info-bottom {
                display: flex;
                grid-gap: 20px;
                flex-wrap: wrap;

                p.info-bottom-titel {
                    color: $dark_blue;
                    font-size: $font_size_big;
                    margin-bottom: 1rem;
                    line-height: 2.4rem;
                }
                @include media-breakpoint-down(sm) {
                    p.info-bottom-titel {
                        margin-bottom: 0;
                    }
                }
                p.info-bottom-text {
                    color: $light_grey_inactive_contrast;
                    font-size: $font-size-base;
                    line-height: inherit;
                }
            }
        }
        @include media-breakpoint-down(sm) {
            .footer-info-div {
                padding: 2rem 3rem;
            }
        }
    }
</style>
