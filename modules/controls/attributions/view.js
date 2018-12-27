/**
 * @description Control to show Attributions
 * @memberof AttributionsView
 * @extends Backbone.View
 */
import TemplateShow from "text-loader!./templateShow.html";
import TemplateHide from "text-loader!./templateHide.html";
import Attributions from "./model";

const AttributionsView = Backbone.View.extend({
    events: {
        "click .attributions-button": "toggleIsContentVisible"
    },
    initialize: function () {
        var channel = Radio.channel("AttributionsView"),
            isViewMobile = Radio.request("Util", "isViewMobile");

        this.model = new Attributions();

        this.listenTo(channel, {
            "renderAttributions": this.renderAttributions
        });

        this.listenTo(this.model, {
            "change:isContentVisible": this.renderAttributions,
            "change:attributionList": this.renderAttributions,
            "change:isVisibleInMap": this.toggleIsVisibleInMap,
            "renderAttributions": this.renderAttributions
        });


        if (isViewMobile === true) {
            this.model.setIsContentVisible(this.model.get("isInitOpenMobile"));
        }
        else {
            this.model.setIsContentVisible(this.model.get("isInitOpenDesktop"));
        }
        this.model.checkModelsByAttributions();
        this.render();
    },
    templateShow: _.template(TemplateShow),
    templateHide: _.template(TemplateHide),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.templateShow(attr));
        if (this.model.get("isVisibleInMap") === true) {
            this.$el.show();
            this.$el.addClass("attributions-view");
        }
        else {
            this.$el.hide();
        }

        if (attr.attributionList.length === 0) {
            this.$(".attributions-div").removeClass("attributions-div");
        }
        return this;
    },

    renderAttributions: function () {
        var attr = this.model.toJSON();

        if (this.model.get("isContentVisible") === true) {
            this.$el.html(this.templateShow(attr));
        }
        else {
            this.$el.html(this.templateHide(attr));
        }
        if (_.isEmpty(attr.attributionList) === true) {
            this.$(".attributions-div").removeClass("attributions-div");
        }
        else {
            this.$(".attributions-div").addClass("attributions-div");
        }
    },

    toggleIsContentVisible: function () {
        this.model.toggleIsContentVisible();
    },

    toggleIsVisibleInMap: function (isVisible) {
        if (isVisible) {
            this.$el.show();
            this.$el.addClass("attributions-view");
        }
        else {
            this.$el.hide();
        }
    }
});

export default AttributionsView;
