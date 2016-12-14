<!-- Use the hashchange event to change the tabs. -->
$(window).on('hashchange', function () {
    $('.aui-nav li').each(function () {
        var selected = $(this).find('a').attr('href') === location.hash;
        $(this).toggleClass('aui-nav-selected', selected);
    });
});
