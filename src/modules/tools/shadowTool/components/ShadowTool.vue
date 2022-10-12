<script>
import {mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsShadowTool";
import {getComponent} from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import SliderInput from "./SliderInput.vue";
import ToggleCheckbox from "../../../../share-components/toggleCheckbox/components/ToggleCheckbox.vue";
import {updateShadow, updateCesiumTime} from "../utils/utilsShadowTool.js";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import moment from "moment";

export default {
    name: "ShadowTool",
    components: {
        ToolTemplate,
        SliderInput,
        ToggleCheckbox,
        DatePicker
    },
    data () {
        return {
            currentYear: moment().format("YYYY"),
            currentMonth: moment().format("MM"),
            currentDay: moment().format("DD"),
            currentHour: moment().hour(),
            currentMinute: moment().minute(),
            date: moment().format("YYYY-MM-DD"),
            showDate: moment().format("YYYY-MM-DD"),
            showTime: moment().format("HH:mm"),
            displayedShadowTime: null,
            timeSliderValue: 0,
            dateSliderValue: 0,
            shadowActivated: this.isShadowEnabled,
            pickDates: null,
            pickDateFormat: "DD.MM.YYYY"
        };
    },
    computed: {
        ...mapGetters("Tools/Shadow", ["id", "isShadowEnabled", "active", "renderToWindow", "resizableWindow", "deactivateGFI", "icon", "name", "shadowTime"]),
        ...mapGetters("Language", ["layerIds", "currentLocale"])
    },
    watch: {
        /**
         * watches the status of the tool
         * starts initial processes if the tool has been activated for the first time
         * @param {Boolean} value true if the tool has been activated
         * @returns {void}
         */
        active (value) {
            this.$nextTick(() => {
                if (value) {
                    this.setActive(value);
                    this.createDate();
                    if (this.isShadowEnabled) {
                        this.toggleShadow(true);
                    }
                }
            });
        },
        shadowActivated (value) {
            if (!value) {
                document.getElementById("control").style.display = "none";
            }
            else {
                document.getElementById("control").style.display = "block";
            }

        },
        currentLocale () {
            this.checkDateFormat();
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/Shadow", Object.keys(mutations)),
        updateShadow,
        updateCesiumTime,

        close () {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
            this.toggleShadow(false);
        },
        /**
         * Prepares the dates for picker, slider and display
         * @returns {void}
         */
        createDate () {
            const year = this.shadowTime.year ? this.shadowTime.year : this.currentYear,
                checkedMonth = this.shadowTime?.month?.length === 1 ? "0" + this.shadowTime.month : this.shadowTime.month,
                checkedDay = this.shadowTime?.day?.length === 1 ? "0" + this.shadowTime.day : this.shadowTime.day,
                checkedHour = this.shadowTime?.hour?.length === 1 ? "0" + this.shadowTime.hour : this.shadowTime.hour,
                checkedMinute = this.shadowTime?.minute?.length === 1 ? "0" + this.shadowTime.minute : this.shadowTime.minute,
                month = this.shadowTime.month ? checkedMonth : this.currentMonth,
                day = this.shadowTime.day ? checkedDay : this.currentDay,
                hour = this.shadowTime.hour ? checkedHour : this.currentHour,
                minute = this.shadowTime.minute ? checkedMinute : this.currentMinute,
                showDate = [year, month, day].join("-"),
                showTime = [hour, minute].join(":");


            this.showTime = showTime;
            if (this.$refs.datePicker) {
                this.pickDates = new Date(showDate);
            }

            this.date = showDate;
            this.checkDateFormat();

            this.dateSliderValue = moment(this.date).dayOfYear();
            this.initTimeSlider(hour, minute);
            this.updateShadowTime();
        },
        /**
         * Sync function for the date slider
         * @param {Object} pickDate - date from the date picker
         * @returns {void}
         */
        syncDateSlider (pickDate) {
            const date = moment(pickDate).format("YYYY-MM-DD");

            if (this.$refs.datePicker) {
                this.date = date;
                this.checkDateFormat();
                this.updateShadowTime();
                this.dateSliderValue = moment(date).dayOfYear();
            }
        },
        /**
         * Inition of the time slider
         * @param {String} hour - current hour
         * @param {String} minute - current minute
         * @returns {void}
         */
        initTimeSlider (hour, minute) {
            let initMinuteValue;

            this.shadowTime.minute = this.shadowTime.minute ? this.shadowTime.minute : "0";
            this.shadowTime.hour = this.shadowTime.hour ? this.shadowTime.hour : "0";
            if (this.shadowTime.hour !== "0" || this.shadowTime.minute !== "0") {
                initMinuteValue = Number(this.shadowTime.hour) * 60 + Number(this.shadowTime.minute);
            }
            else {
                initMinuteValue = Number(hour) * 60 + Number(minute);
            }
            this.syncTimeSlider(initMinuteValue);

        },
        /**
         * Sync function for the time slider
         * @param {Number} minuteValue - date from the date picker
         * @returns {void}
         */
        syncTimeSlider (minuteValue) {
            const timeSliderValue = minuteValue,
                hours = Math.floor(timeSliderValue / 60),
                minutes = (timeSliderValue % 60).toString(),
                minutesDisplay = minutes?.length === 1 ? "0" + minutes : minutes;

            this.timeSliderValue = minuteValue;
            this.showTime = hours + ":" + minutesDisplay;
            this.updateShadowTime();
        },
        /**
         * Sync function for the date picker
         * @param {Number} totalDaysInYear - day number of the year
         * @returns {void}
         */
        syncDatePicker (totalDaysInYear) {
            const startDate = new Date(Number(this.currentYear), 0),
                calculateDate = new Date(startDate.setDate(Number(totalDaysInYear))), // initialize a date in `year-01-01`
                formatCalculateDate = moment(calculateDate).format("YYYY-MM-DD");

            if (this.$refs.datePicker) {
                this.date = formatCalculateDate;
                this.pickDates = new Date(formatCalculateDate);
                this.checkDateFormat();
                this.dateSliderValue = totalDaysInYear;
            }
            this.updateShadowTime();
        },
        /**
         * Adapts date formats to EN or DE
         * @returns {void}
         */
        checkDateFormat () {
            if (this.currentLocale === "de" || this.currentLocale === "platt") {
                this.showDate = moment(this.date).format("DD-MM-YYYY");
                this.pickDateFormat = "DD.MM.YYYY";

            }
            else {
                this.showDate = moment(this.date).format("MM-DD-YYYY");
                this.pickDateFormat = "MM.DD.YYYY";
            }
        },
        /**
         * Toggles the shadow
         * @param {Boolean} visible - shadow active
         * @returns {void}
         */
        toggleShadow (visible) {
            this.shadowActivated = visible;
            this.updateShadow(visible);

        },
        /**
         * Combines the given timestamps for time and date together and updates the Cesium time
         * @returns {void}
         */
        updateShadowTime () {
            this.displayedShadowTime = new Date(this.date + " " + this.showTime + ":00");
            this.updateCesiumTime(this.displayedShadowTime.getTime());
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div class="d-flex justify-content-between mb-3">
                <label
                    class="form-label"
                    for="tool-shadow-checkbox"
                    @click="toggleShadow(!shadowActivated)"
                    @keydown.enter="toggleShadow(!shadowActivated)"
                >
                    {{ $t('common:modules.tools.shadow.shadowDisplay') }}
                </label>
                <ToggleCheckbox
                    id="tool-shadow-checkbox"
                    ref="shadowCheckBox"
                    :default-state="isShadowEnabled"
                    :text-on="$t('common:snippets.checkbox.on')"
                    :text-off="$t('common:snippets.checkbox.off')"
                    @change="toggleShadow"
                />
            </div>
            <div
                id="control"
            >
                <div class="d-flex justify-content-between mb-3">
                    <label
                        class="form-label"
                        for="datePicker"
                    >
                        {{ $t('common:modules.tools.shadow.pickDate') }}
                    </label>
                    <div
                        id="dateSelector"
                    >
                        <DatePicker
                            id="datePicker"
                            ref="datePicker"
                            v-model="pickDates"
                            type="date"
                            :format="pickDateFormat"
                            :clearable="false"
                            :show-week-number="true"
                            title-format="pickDateFormat"
                            :lang="$t('common:libraries.vue2-datepicker.lang', {returnObjects: true})"
                            @change="syncDateSlider($event)"
                        />
                    </div>
                </div>
                <SliderInput
                    id="dateSlider"
                    :valuelabel="showDate"
                    :value="dateSliderValue"
                    :min="0"
                    :step="1"
                    :disabled="false"
                    :max="366"
                    @input="syncDatePicker($event)"
                />
                <br>
                <SliderInput
                    id="timeSlider"
                    :label="$t('common:modules.tools.shadow.slideHour')"
                    :value="timeSliderValue"
                    :valuelabel="showTime"
                    :min="1"
                    :disabled="false"
                    :step="1"
                    :max="1440"
                    @input="syncTimeSlider($event)"
                />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~variables";

#dateSelector {
    .mx-input {
        border-radius: 0px;
    }
}
#control {
display: none
}
label {
text-align: left;
width: 300px;
line-height: 26px;
margin-bottom: 10px;
}

input {
  height: 20px;
  flex: 0 0 200px;
  margin-left: 10px;
}
</style>
