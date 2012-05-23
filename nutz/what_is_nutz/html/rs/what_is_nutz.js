var _tm_begin = z.now();
var _tm_sec;

function main() {
    // 每个 PPT 需要的时间，单位秒
    _tm_sec = 1800 / $("section").size();
    // 开始 PPT
    $(".masker").ppt();
    // 计时
    var H = window.setInterval(function() {
        var tmoff = z.now().seconds - _tm_begin.seconds;
        var pptoff = parseInt(($(".section_hlt").attr("ppt-index") * 1 + 1) * _tm_sec);
        var html = '<i class="' + (pptoff < tmoff ? "delay" : "") + '">';
        html += z.tmstr(z.tm(tmoff));
        html += '</i> / <b>' + z.tmstr(z.tm(pptoff)) + "</b>"
        $("#timer").html(html);
    }, 1000);
}

function _adjust_layout() {
    var box = z.winsz();
    var jMasker = $(".masker");
    var jMaskerIcon = jMasker.children(".masker_icon");
    var jScroller = $(".scroller");
    jMasker.css({
        width: box.width,
        height: box.height
    });
    jScroller.css({
        width: box.width * 3,
        height: box.height
    });
    jScroller.children("section").css({
        width: box.width,
        height: box.height
    });
    var iconWidth = jMaskerIcon.width();
    jMaskerIcon.css({
        "left": box.width / 2 - iconWidth / 2,
        "top": (box.height - iconWidth) * 0.382
    });
    jScroller.find(".section_golden").each(function() {
        var myH = $(this).outerHeight();
        $(this).css({
            "margin-top": (box.height - myH) * 0.382
        });
    });
}

/**
 * 当页面完成加载后，进行得操作
 */
(function($) {
$(document.body).ready(function() {
    // 监视键盘
    // ...

    // 调整界面布局
    _adjust_layout();
    // 随着窗口变化调整
    window.onresize = _adjust_layout;

    // 调用界面主函数
    if( typeof window.main == "function")
        window.main();

});
})(window.jQuery);
