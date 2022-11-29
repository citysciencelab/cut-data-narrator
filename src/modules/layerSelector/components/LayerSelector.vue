<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLayerSelector";
import mutations from "../store/mutationsLayerSelector";

export default {
    name: "LayerSelector",
    computed: {
        ...mapGetters("LayerSelector", Object.keys(getters))
    },
    watch: {
        execute: function () {
            this.events.forEach(evt => {
                if (evt.event === this.execute.event) {
                    this.handleEvent({cfg: evt});
                }
            });
        }
    },
    mounted () {
        this.initialize();
    },
    methods: {
        ...mapActions("LayerSelector", [
            "initialize",
            "handleEvent"
        ]),
        ...mapMutations("LayerSelector", Object.keys(mutations)),
        ...mapActions("Maps", ["zoomToExtent"])
    }
};
</script>

<template>
    <body id="noTemplate" />
</template>

<style lang="scss">
    #noTemplate {
        display: none;
    }
</style>
