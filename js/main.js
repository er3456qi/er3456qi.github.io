hljs.initHighlightingOnLoad();

$(document).ready(function () {
    $('.post').first().find("h2,h3,h4,h5,h6").each(function (i, item) {
        var tag = $(item).get(0).localName;
        $(item).attr("id", "dir" + i);
        $("#paragraph").append('<a class="new' + tag + '" href="#dir' + i + '">• ' + $(this).text() + '</a></br>');
        $(".newh2").css("margin-left", 25);
        $(".newh3").css("margin-left", 45);
        $(".newh4").css("margin-left", 65);
        $(".newh5").css("margin-left", 85);
        $(".newh6").css("margin-left", 105);
    });
});