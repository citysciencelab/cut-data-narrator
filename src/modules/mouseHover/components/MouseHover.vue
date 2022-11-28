<script>
import {mapActions, mapMutations, mapGetters} from "vuex";
import actions from "../store/actionsMouseHover";
import mutations from "../store/mutationsMouseHover";
import getters from "../store/gettersMouseHover";

export default {
    name: "MouseHover",
    computed: {
        ...mapGetters("MouseHover", Object.keys(getters)),
        ...mapGetters({
            isMobile: "mobile"
        })
    },
    mounted () {
        if (Config.mouseHover) {
            this.$nextTick(() => {
                this.initialize();
            });
        }
        Backbone.Events.listenTo(Radio.channel("MouseHover"), {
            "toggle": () => this.setIsActive(!this.isActive)
        });
    },
    methods: {
        ...mapActions("MouseHover", Object.keys(actions)),
        ...mapMutations("MouseHover", Object.keys(mutations))
    }
};
</script>

<template>
    <div
        id="mousehover-overlay"
    >
        <div
            v-if="infoBox"
            class="mouseHover"
        >
            <div>
                <div
                    v-for="(info, x) in infoBox"
                    :key="x"
                >
                    <span
                        v-for="(text, i) in info"
                        :key="i"
                    >
                        <p
                            v-if="i === 0"
                            class="title"
                            v-html="text"
                        />
                        <p
                            v-else
                            v-html="text"
                        />
                    </span>
                    <br v-if="x !== infoBox.length - 1 || pleaseZoom">
                </div><span
                    v-if="pleaseZoom"
                    class="info"
                >
                    <p>{{ $t(infoText) }}</p>
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~/css/mixins.scss";
@import "~variables";

.mouseHover {
    font-size: $font-size-base;
    text-align: left;
    max-width: inherit;
    padding: 8px;
    background-color: $white;
    color: $dark-grey;
    white-space: nowrap;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    .title {
        font-size: $font_size_big;
        font-weight: bold;
    }
    .info {
        font-size: $font_size_big;
        font-style: italic;
    }
}
</style>
