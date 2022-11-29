<script>
export default {
    name: "SliderInput",
    props: {
        label: {
            type: String,
            required: false,
            default: ""
        },
        valuelabel: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        step: {
            type: Number,
            required: false,
            default: 1
        },
        unit: {
            type: String,
            required: false,
            default: ""
        },
        disabled: {
            type: Boolean,
            required: true
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column mt-2">
        <label :for="'shadow-slider-input-' + label">
            <h6>{{ label }}</h6>
        </label>
        <div class="d-flex justify-content-between">
            <!-- <span>{{ unit }}</span> -->
            <span>
            <!--  <b>{{ value }}</b> <span>{{ unit }}</span> -->
            </span>
            <span>{{ valuelabel }}</span>
        </div>
        <input
            :id="'shadow-slider-input-' + label"
            :value="value"
            type="range"
            :min="min"
            :max="max"
            :step="step"
            :disabled="disabled"
            @input="$emit('input', Number($event.target.value))"
        >
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.d-flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
    accent-color: $primary;
}
.justify-content-between {
    justify-content: space-between;
}
h6 {
    font-size: $font-size-base;
}
</style>
