function main() {
    $(".masker").ppt();
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
