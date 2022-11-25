<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersLanguage";

export default {
    name: "LanguageItem",
    data () {
        return {
            showWindow: false
        };
    },
    computed: {
        ...mapGetters("Language", Object.keys(getters))
    },
    created: function () {
        this.setCurrentLocale(this.$i18n.i18next.language);
    },
    methods: {
        ...mapMutations("Language", ["setCurrentLocale"]),
        translate (language) {
            i18next.changeLanguage(language, () => {
                this.setCurrentLocale(language);
            });
        },
        toggleLanguageWindow () {
            this.showWindow = !this.showWindow;
        }
    }
};
</script>

<template lang="html">
    <div
        id="language-bar"
    >
        <a
            class="current-language"
            role="button"
            tabindex="0"
            @click="toggleLanguageWindow"
            @keydown.enter="toggleLanguageWindow"
        >
            {{ $i18n.i18next.languages[0] }}
        </a>
        <div
            v-if="showWindow"
            class="popup-language"
        >
            <div class="language-header row">
                <div class="col-10 col-md-11">
                    {{ $t("modules.language.languageTitle") }}
                </div>
                <span
                    type="button"
                    class="col-1 bootstrap-icon d-flex justify-content-center"
                    tabindex="0"
                    @click="toggleLanguageWindow"
                    @keydown.enter="toggleLanguageWindow"
                >
                    <i class="bi-x-lg" />
                    <span class="screenreader">$t("modules.language.toggleWindow"</span>
                </span>
            </div>
            <div class="container row row-cols-2">
                <div
                    v-for="(value, key) in $i18n.i18next.options.getLanguages()"
                    :key="key"
                    class="col"
                >
                    <button
                        class="lng btn"
                        :disabled="key === $i18n.i18next.language"
                        @click="translate(key)"
                    >
                        {{ $t("modules.language." + key) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~/css/mixins.scss";
    @import "~variables";

    #language-bar {
        a, span {
            color: darken($secondary_focus, 10%);
            &:hover{
                @include primary_action_hover;
            }
            &.bootstrap-icon{
                padding: 5px;
                width: auto;
            }
        }

        margin-left: 10px;
        .current-language {
            display: block;
            position: relative;
            color: $primary;

            cursor: pointer;

            text-transform: uppercase;
            font-weight: bold;
        }
        .screenreader {
            position: absolute;
            left:-9999px;
        }
        .popup-language {
            position: absolute;

            bottom: calc(100% + 8px);
            right: 8px;

            padding: 10px 0 20px;

            min-width: 400px;

            background: $secondary;
            box-shadow: $shadow;

            .language-header {
                width: 100%;
                border-bottom: 1px solid $light_grey;
                padding: 0 0 3px 10px;
            }
            .form-group {
                display: inline-block;
                width: 100%;
                text-align: center;
                padding: 20px 0 0;
                a {
                    font-size: $font-size-base;
                    &.disabled {
                        background-color: $light_grey;
                    }
                }
            }
        }
    }

    @include media-breakpoint-down(md) {
        #language-bar {
            .current-language {
                text-align: right;
            }
            .popup-language {
                width: calc(100% - 20px);
                min-width: inherit;
                right: 10px;
            }
        }
    }
</style>
