<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersWmsTime";
import mutations from "../store/mutationsWmsTime";
import RoutingLoadingSpinner from "../../tools/routing/components/RoutingLoadingSpinner.vue";

export default {
    name: "TimeSlider",
    components: {
        RoutingLoadingSpinner
    },
    props: {
        layerId: {
            type: String,
            default: ""
        }
    },
    data: () => ({playing: false, playbackHandle: null, sliderValue: 0}),
    computed: {
        ...mapGetters("WmsTime", Object.keys(getters)),
        sliderOptionCount () {
            return this.timeRange.length - 1;
        },
        selectedTime () {
            return this.timeRange[this.sliderValue];
        }
    },
    watch: {
        defaultValue () {
            this.sliderValue = this.timeRange.indexOf(this.defaultValue);
        },
        sliderValue () {
            if (!this.timeRange[this.sliderValue]) {
                // revert to 0 in case of fault
                this.sliderValue = 0;
            }

            if (this.sliderOptionCount === this.sliderValue) {
                this.playing = false;
            }

            const layer = Radio.request(
                    "ModelList",
                    "getModelByAttributes",
                    {id: this.layerId}
                ),
                targetTime = this.timeRange[this.sliderValue];

            if (layer) {
                layer.updateTime(this.layerId, targetTime);
                if (this.layerSwiper.active) {
                    this.updateMap();
                }
            }
        }
    },
    created () {
        this.sliderValue = this.timeRange.indexOf(this.defaultValue);
    },
    methods: {
        ...mapActions("WmsTime", ["toggleSwiper", "updateMap"]),
        ...mapMutations("WmsTime", Object.keys(mutations)),
        setSliderValue (value) {
            this.sliderValue = Number(value);
        },
        animate () {
            const index = this.nextIndex();

            if (index === this.sliderOptionCount) {
                this.playing = false;
                this.setTimeSliderPlaying(this.playing);
            }

            if (index === this.timeRange.length) {
                this.clearPlayback();
            }
            else {
                this.sliderValue = index;
            }
        },
        clearPlayback () {
            clearInterval(this.playbackHandle);
            this.playbackHandle = null;
        },
        nextIndex (forward = true) {
            return this.sliderValue + (forward ? 1 : -1);
        },
        moveOne (forward) {
            this.sliderValue = this.nextIndex(forward);
        },
        play () {
            this.playing = !this.playing;

            if (this.sliderValue === this.timeRange.length - 1) {
                this.sliderValue = 0;
            }

            // This is true whenever any of the two players is being used.
            this.setTimeSliderPlaying(this.playing);

            if (this.playing) {
                this.playbackHandle = setInterval(this.animate, this.timeSlider.playbackDelay * 1000);
            }
            else {
                this.clearPlayback();
            }
        }
    }
};
</script>

<template>
    <div class="timeSlider-wrapper centered-box-wrapper">
        <RoutingLoadingSpinner
            v-if="!layerId"
        />
        <div
            class="timeSlider-control-row"
            :class="!layerId ? 'disabled' : ''"
        >
            <div
                v-if="minWidth"
                class="timeSlider-innerWrapper"
            >
                <button
                    :id="'timeSlider-activate-layerSwiper-' + layerId"
                    class="btn btn-sm btn-secondary"
                    @click="toggleSwiper(layerId)"
                >
                    {{ $t(`common:modules.wmsTime.timeSlider.buttons.${minWidth && layerSwiper.active ? "deactivateL" : "l"}ayerSwiper`) }}
                </button>
            </div>
            <div class="timeSlider-innerWrapper-interactions">
                <button
                    :id="'timeSlider-button-backward-' + layerId"
                    class="btn btn-sm btn-secondary"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.buttons.backward')"
                    :disabled="nextIndex(false) === -1"
                    @click="moveOne(false)"
                >
                    <i class="bi-skip-start-fill" />
                </button>
                <button
                    :id="'timeSlider-button-play-' + layerId"
                    class="btn btn-sm btn-secondary"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.buttons.play')"
                    @click="play"
                >
                    <i
                        :class="[playing ? 'bi-pause-fill' : 'bi-play-fill']"
                    />
                </button>
                <button
                    :id="'timeSlider-button-forward-' + layerId"
                    class="btn btn-sm btn-secondary"
                    :aria-label="$t('common:modules.wmsTime.timeSlider.buttons.forward')"
                    :disabled="nextIndex() === timeRange.length"
                    @click="moveOne(true)"
                >
                    <i class="bi-skip-end-fill" />
                </button>
            </div>
        </div>
        <label
            :id="`timeSlider-input-range-${layerId}-label`"
            :for="'timeSlider-input-range-' + layerId"
            class="timeSlider-input-range-label"
        >
            <input
                :id="'timeSlider-input-range-' + layerId"
                type="range"
                class="timeSlider-input-range-label-input"
                :value="sliderValue"
                :min="0"
                :max="sliderOptionCount"
                :step="1"
                :aria-label="$t('common:modules.wmsTime.timeSlider.inputRangeLabel')"
                @input="setSliderValue($event.target.value)"
            >
            {{ selectedTime }}
        </label>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.disabled {
    pointer-events: none;
    opacity: 0.4;
}

.spinner {
    width: 50px;
    height: 50px;
    margin-top: -25px;
    margin-left: -25px;
    left: 50%;
    top: 50%;
    position: absolute;
    background: rgba(0, 0, 0, 0);
}

.timeSlider-wrapper {
    $base-margin: 0.25em;
    $bigger-margin: calc(#{$base-margin} * 3);

    position: absolute;
    bottom: 6em;
    left: 50%;
    z-index: 3;

    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: $tool_box_shadow;

    .timeSlider-control-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .timeSlider-innerWrapper {
        display: flex;
        justify-content: flex-start;
        // No margin on bottom
        margin: $bigger-margin;
    }

    .timeSlider-input-range-label {
        margin: $bigger-margin;
    }

    .timeSlider-input-range-label-input {
        display: block;
        width: 100%;
    }

    .timeSlider-innerWrapper-interactions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: $bigger-margin;
    }
}
</style>
