(function ($, global) {
    'use strict';

    /**
     * direction: (baron option)
     *      h - horizontal
     *      v - vertical
     * effect:
     *      none - scrollbars always visible
     *      hover - scrollbars visible on mouse over
     *      touch - scrollbars visible on touch scrolling
     * creationMode:
     *      create - scrollable structure will be added to the DOM and nested inside the root element
     *      [wrap] - root element will be wrapped in a scrollable structure
     *      use_existing - uses existing DOM structures within the root element to initialize baron scroller
     * scrollerClasses: (an array with 4 CSS class names for horizontal scroller, horizontal scrollbar, vertical scroller, vertical scrollbar in that order)
     *      example: ['hscroller', 'hscrollbar', 'vscroller', 'vscrollbar']
     * wrapperAttrs: (an object with some essential attributes for a wrapper element, required only if creationMode is set to 'wrap')
     *      elementId - the id of the wrapper element
     *      elementClass - the classes for the wrapper element
     * validateOptions:
     *      true - will validate the options, if invalid options are encountered, those will be replaced with default values
     *      false - no options validation will be performed
     * [x] - not implemented yet
     */
    var options = {
        direction: 'h',
        effect: 'hover',
        creationMode: 'create',
        scrollerClasses: ['hscroller', 'hscrollbar', 'vscroller', 'vscrollbar'],
        wrapperAttrs: {
            elementId : 'baronzr-wrapper',
            elementClass : 'baronzr-wrapper'
        },
        validateOptions: false
    };

    /**
     * Creates the DOM structures necessary for the scrolling behaviour within the root DOM element.
     */
    var BaronzrCreator = (function () {
        function appendScroller($root, scrollerClass, scrollbarClass) {
            var $scroller = $('<div class="'+scrollerClass+'">').appendTo($root);
            var $scrollbar = $('<div class="'+scrollbarClass+'">').appendTo($scroller);
            return [$scroller, $scrollbar];
        }

        function add($root, scrollerClass, scrollbarClass) {
            var children = $root.children();
            var fix = (children.size() > 0)

            if (fix) {
                $root.empty();
            }

            var scrollerElements = appendScroller($root, scrollerClass, scrollbarClass);

            if (fix) {
                scrollerElements[0].prepend(children);
            }

            $root.baron($.extend({
                root: $root,
                scroller: '.' + scrollerClass,
                bar: '.' + scrollbarClass,
                barOnCls: 'baron'
            }, options));
            BaronzrEffects.setEffect($root, scrollerElements[1]);
        }
       
        return {
            add: add
        };
    })();
    
    /**
     * Wraps the root element within a scrolling structure as expected by Baron. The scrolling structure
     * is created from scratch.
     */
    var BaronzrWrapper = (function() {
        function getWrapperHtml(scrollerClass) {
            var scroller = '<div class="'+scrollerClass+'"></div>';
            var wrapperRoot = '<div';
            if(options.wrapperAttrs.elementId) {
                wrapperRoot += ' id="'+options.wrapperAttrs.elementId+'"';
            }
            if(options.wrapperAttrs.elementClass) {
                wrapperRoot += ' class="'+options.wrapperAttrs.elementClass+'"';
            }
            wrapperRoot += '>';
            wrapperRoot += scroller;
            wrapperRoot += '</div>';
            return wrapperRoot;
        }
        
        function add($root, scrollerClass, scrollbarClass) {
            $root.wrap(getWrapperHtml(scrollerClass));
            
            var $scroller = $root.parent();
            var $wrapperRoot = $scroller.parent();
            var $scrollbar = $('<div class="'+scrollbarClass+'">').appendTo($scroller);
            
            var $baronized = $wrapperRoot.baron($.extend({
                root: $wrapperRoot,
                scroller: '.' + scrollerClass,
                bar: '.' + scrollbarClass,
                barOnCls: 'baron'
            }, options)).update();
            BaronzrEffects.setEffect($wrapperRoot, $scrollbar);
        }
        
        return {
            add: add
        }
    })();

    /**
     * Adds scrolling support to the root element by using existing DOM elements within the root.
     */
    var BaronzrUseExisting = (function () {
        function add($root, scrollerClass, scrollbarClass) {
            $root.baron($.extend({
                root: $root,
                scroller: '.' + scrollerClass,
                bar: '.' + scrollbarClass,
                barOnCls: 'baron'
            }, options));
            var $scrollbar = $('.' + scrollbarClass, $root);
            BaronzrEffects.setEffect($root, $scrollbar);
        }
        
        return {
            add: add
        }
    })();
    
    /**
     * Adds scrolling support to the root element using one of the baronization methods defined by the creation mode.
     */
    var Baronzr = (function() {
        function addScrolling($root, baronzrMethod) {
            if (options.direction === 'v') {
                baronzrMethod.add($root, options.scrollerClasses[2], options.scrollerClasses[3]);
            } else {
                baronzrMethod.add($root, options.scrollerClasses[0], options.scrollerClasses[1]);
            }
        }

        return {
            run: addScrolling
        }
    })();

    /**
     * Sets the effects of the scrollbars, e.g. fading out when not actively used.
     */
    var BaronzrEffects = (function () {
        function setEffect($scrollRoot, $scrollbar) {
            $scrollRoot.css({
                position: 'relative'
            });

            if (options.effect === 'none') {
                $scrollbar.css('display', 'block');
            } else {
                $scrollbar.css('display', 'none');
                if (options.effect === 'hover') {
                    setHoverEffect($scrollRoot, $scrollbar);
                } else if (options.effect === 'touch') {
                    setTouchEffect($scrollRoot, $scrollbar);
                }
            }
        }

        function setHoverEffect($scrollRoot, $scrollbar) {
            $scrollRoot.hover(
                function () {
                    $scrollbar.fadeIn();
                },
                function () {
                    $scrollbar.fadeOut();
                }
            );
        }

        function setTouchEffect($scrollRoot, $scrollbar) {
            $scrollRoot.bind(BaronzrTouchEvents.getTouchStart(), function (event) {
                $scrollbar.fadeIn();
            });
            $scrollRoot.bind(BaronzrTouchEvents.getTouchEnd(), function (event) {
                $scrollbar.fadeOut();
            });
        }

        return {
            setEffect: setEffect
        }
    })();

    /**
     * Provides a list of platform independt events for touch handling
     */
    var BaronzrTouchEvents = (function () {
        function getStartEvent() {
            if (window.navigator.pointerEnabled) {
                return 'pointerdown';
            } else if (window.navigator.msPointerEnabled) {
                return 'MSPointerDown';
            }
            return 'touchstart';
        }

        function getEndEvent() {
            if (window.navigator.pointerEnabled) {
                return 'pointerout';
            } else if (window.navigator.msPointerEnabled) {
                return 'MSPointerOut';
            }
            return 'touchend';
        }

        return {
            getTouchStart: getStartEvent,
            getTouchEnd: getEndEvent
        }
    })();

    /**
     * Validation functions.
     */
    var BaronzrValidator = (function () {
        function validateDirection(opts) {
            if (['h', 'v'].indexOf(opts.direction) < 0) {
                opts.direction = 'h';
            }
        }

        function validateEffect(opts) {
            if (['hover', 'touch'].indexOf(opts.effect) < 0) {
                opts.direction = 'hover';
            }
        }

        function validateCreationMode(opts) {
            if (['create', 'wrap', 'use_existing'].indexOf(opts.creationMode) < 0) {
                opts.creationMode = 'create';
            }
        }

        function validateScrollerClasses(opts) {
            if ((Object.prototype.toString.call(opts.scrollerClasses) === '[object Array]') || (ops.scrollerClasses.length < 4)) {
                opts.scrollerClasses = ['hscroller', 'hscrollbar', 'vscroller', 'vscrollbar'];
            }
        }
                
        function validateWrapperAttrs(opts) {
            if( opts.creationMode === 'wrap' ) {
                if( (opts.wrapperAttrs==null) || (typeof opts.wrapperAttrs !== 'object') ) {
                    opts.wrapperAttrs = {
                        elementId : 'baronzr-wrapper',
                        elementClass : 'baronzr-wrapper'
                    }
                }
            }
        }

        function validateOptions(opts) {
            validateDirection(opts);
            validateEffect(opts);
            validateCreationMode(opts);
            validateScrollerClasses(opts);
            validateWrapperAttrs(opts);
        }

        return {
            validateOptions: validateOptions
        }
    })();

    // Adds scroll support using the Baron library
    $.fn.baronzr = function (opts) {
        return this.each(function () {
            options = $.extend(options, opts);
            if (options.validateOptions) {
                options = BaronzrValidator.validateOptions(options);
            }
            
            switch (options.creationMode) {
            case 'create':
                Baronzr.run($(this), BaronzrCreator);
                break;
            case 'wrap':
                Baronzr.run($(this), BaronzrWrapper);
                break;
            case 'use_existing':
                Baronzr.run($(this), BaronzrUseExisting);
                break;
            default:
                // do nothing
            }
        });
    }
})(jQuery, window);