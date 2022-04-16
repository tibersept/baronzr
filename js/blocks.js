(function ($, global) {
    'use strict';

    function genHSpaceBlock() {
        var span = document.createElement('span');
        span.className = 'space-span-block';
        return span;
    }

    function genVSpaceBlock() {
        var div = document.createElement('div');
        div.className = 'space-div-block';
        return div;
    }

    function genHScrollBlock() {
        var div = document.createElement('div');
        div.className = 'horizontal-scroll-block';
        return div;
    }

    function genHNonScrollBlock() {
        var div = document.createElement('div');
        div.className = 'horizontal-nonscroll-block';
        return div;
    }

    function genVScrollBlock() {
        var div = document.createElement('div');
        div.className = 'vertical-scroll-block';
        return div;
    }

    function insertBlocks(to, gen, n, id) {
        if (to && n > 0) {
            for (var i = 0; i < n; i++) {
                var elm = gen();
                elm.id = id + i;
                to.prepend(elm);
            }
        }
    }

    function initComposed() {
        insertBlocks($('.hscroller'), genVScrollBlock, 15, 'vb');
        $('.vertical-scroll-block').baronzr({
            direction: 'v',
            creationMode: 'create'
        });

        var hsbs = $('.hscroller .vertical-scroll-block .vscroller');
        for (var i = 0; i < hsbs.size(); i++) {
            insertBlocks($(hsbs[i]), genVSpaceBlock, 20, 'vb-' + i + '-');
        }
    }

    function initHorizontal() {
        insertBlocks($('.hscroller'), genHNonScrollBlock, 40, 'hnb');

        var hsbs = $('.hscroller .horizontal-nonscroll-block');
        for (var i = 0; i < hsbs.size(); i++) {
            insertBlocks($(hsbs[i]), genHSpaceBlock, 40, 'hnb-' + i + '-');
        }
    }

    function initList() {
        var $listRoot = $('.listcontent');
        for (var i = 0; i < 40; i++) {
            $listRoot.append('<li>List item ' + i + '</li>');
        }
    }

    function init(opt) {
        switch (opt) {
        case 'composed':
            initComposed();
            break;
        case 'horizontal':
            initHorizontal();
            break;
        default:
            break;
        }
    }

    if (!global.baronzr) {
        global.baronzr = {};
    }
    global.baronzr.initBlocks = init;
    global.baronzr.initList = initList;
})(jQuery, window);