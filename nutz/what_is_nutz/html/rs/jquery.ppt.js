/**
 * 根据约定的 DOM 结构，生成一个幻灯片的动画
 */
(function($) {
var ANI_SPEED_IN = 300;
var ANI_SPEED_OUT = 500;
/**
 * 帮助方法
 */
var util = {
    selection: function(ele) {
        var jq = $(ele);
        if(jq.hasClass("ppt"))
            return jq;
        var re = jq.parents(".ppt");
        if(re.size() > 0)
            return re;
        return $(".ppt");
    },
    current: function(ele) {
        if(!ele)
            return $(".ppt .section_hlt");
        var jq = $(ele);
        if(jq.hasClass("section_hlt"))
            return jq
        return util.selection(jq).find(".section_hlt");
    },
    /**
     * ele - 当前页相关的 jq 或 DOM 对象
     * off - 偏移，0 回到首页，1 向后一页， -1 向前一页，-2, -3 等以此类推
     */
    gotoSection: function(ele, off) {
        var selection = util.selection(ele);
        var me = util.current(ele);
        // 寻找目标 sec
        var ta;
        if(0 == off) {
            ta = me.parent().children().first();
        } else if(off > 0) {
            ta = me;
            while(ta.size() > 0 && off > 0) {
                ta = ta.next();
                off--;
            }
        } else if(off < 0) {
            ta = me;
            while(ta.size() > 0 && off < 0) {
                ta = ta.prev();
                off++;
            }
        } else {
            throw "Unknow off for current PPT!";
        }
        // 如果寻找到了目标
        if(ta.size() > 0) {
            var myEffect = effects[me.attr("effect")];
            var taEffect = effects[ta.attr("effect")];
            var myIndex = me.attr("ppt-index") * 1;
            var taIndex = ta.attr("ppt-index") * 1;

            if(myIndex == taIndex)
                return;

            // 确保它先进入
            taEffect.doIn.apply(selection, [ta]);
            // 如果我盖住了它，我就退出
            if(myIndex < taIndex)
                myEffect.doOut.apply(selection, [me]);
            // 标记
            ta.addClass("section_hlt");
            me.removeClass("section_hlt");
            selection.find(".masker_num").text(taIndex);
        }
    }
};
/**
 * 效果
 */
var effects = {
    door: {
        doIn: function(jSec) {
            jSec.animate({
                opacity: 1.0
            }, ANI_SPEED_OUT);
            jSec.find(".door_left").animate({
                left: 0
            }, ANI_SPEED_IN);
            jSec.find(".door_right").animate({
                right: 0
            }, ANI_SPEED_IN);
        },
        doOut: function(jSec) {
            var doorWidth = jSec.width() / 2;
            jSec.animate({
                opacity: 0
            }, ANI_SPEED_IN);
            jSec.find(".door_left").animate({
                left: doorWidth * -1
            }, ANI_SPEED_OUT);
            jSec.find(".door_right").animate({
                right: doorWidth * -1
            }, ANI_SPEED_OUT);
        }
    },
    fade: {
        doIn: function(jSec) {
            jSec.show().animate({
                opacity: 1.0
            }, ANI_SPEED_IN);
        },
        doOut: function(jSec) {
            var doorWidth = jSec.width() / 2;
            jSec.animate({
                opacity: 0
            }, ANI_SPEED_OUT, function() {
                jSec.hide();
            });
        }
    }
};
/**
 * 事件处理
 */
var events = {
    bind: function() {
        if(window._nutz_ppt_events_bind)
            return;
        $(window).keydown(events.onKeyDown);
        window._nutz_ppt_events_bind = true;
    },
    onKeyDown: function(e) {
        // 38 上箭头
        if(38 == e.which)
            events.onGoNext();
        // 40 下箭头
        else if(40 == e.which)
            events.onGoPrev();
        // 72 H 键
        else if(72 == e.which)
            events.onGoHome();
    },
    onGoNext: function() {
        util.gotoSection(util.current(), 1);
    },
    onGoPrev: function() {
        util.gotoSection(util.current(), -1);
    },
    onGoHome: function() {
        util.gotoSection(util.current(), 0);
    }
};
/**
 * 增加 jQuery 插件
 */
$.fn.extend({
    ppt: function() {
        var jSecs = $("section", this);
        // 标记初始显示位置
        jSecs.removeClass("section_hlt").first().addClass("section_hlt");

        // 重新设置幻灯片的 z-index
        var topZIndex = jSecs.size() * 100;
        jSecs.each(function(index, ele) {
            $(this).css("z-index", topZIndex--).attr("ppt-index", index);
        });
        $(".masker_num", this).text(0);

        // 绑定事件
        events.bind.apply(this);
    }
});
})(window.jQuery);
