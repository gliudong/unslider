/**
 *   Unslider by @idiot and @damirfoy
 */
define(function() {
    return function($, f) {
        var Unslider = function() {
            //  Object clone
            var _ = this;

            //  Set some options
            _.o = {
                speed: 500,
                // animation speed, false for no transition (integer or boolean)
                delay: 3000,
                // delay between slides, false for no autoplay (integer or boolean)
                init: 0,
                // init delay, false for no delay (integer or boolean)
                pause: ! f,
                // pause on hover (boolean)
                loop: ! f,
                // infinitely looping (boolean)
                keys: f,
                // keyboard shortcuts (boolean)
                dots: f,
                // display ••••o• pagination (boolean)
                arrows: f,
                // display prev/next arrows (boolean)
                prev: '←',
                // text or html inside prev button (string)
                next: '→',
                // same as for prev option
                fluid: f,
                // is it a percentage width? (boolean)
                complete: f,
                // invoke after animation (function with argument)
                items: '>ul',
                // slides container selector
                item: '>li',
                // slidable items selector
                easing: 'swing' // easing function to use for animation
            };
            var visible = {
                "float": "left",
                "position": "relative",
                "opacity": 1,
                "zIndex": 0
            },
            fadeTime = parseFloat(_.o.speed),
            hidden = {
                "float": "none",
                "position": "absolute",
                "opacity": 0,
                "zIndex": -1
            };

            _.init = function(el, o) {
                //  Check whether we're passing any options in to Unslider
                _.o = $.extend(_.o, o);

                _.el = el;
                _.ul = el.find(_.o.items);
                _.max = [el.outerWidth() | 0, el.outerHeight() | 0];
                _.li = _.ul.find(_.o.item).each(function(index) {
                    var me = $(this),
                    width = me.outerWidth(),
                    height = me.outerHeight();

                    //  Set the max values
                    if (width > _.max[0]) _.max[0] = width;
                    if (height > _.max[1]) _.max[1] = height;
                });

                //  Cached vars
                var o = _.o,
                ul = _.ul,
                li = _.li,
                len = li.length;

                li.hide().css(hidden).eq(0).css(visible).show();

                //  Current indeed
                _.i = 0;

                //  Set the main element
                el.css({
                    width: _.max[0],
                    height: li.first().outerHeight(),
                    overflow: 'hidden'
                });

                //  Set the relative widths
                ul.css({
                    position: 'relative',
                    left: 0,
                    width: (len * 100) + '%'
                });
                li.css({
                    'float': 'left',
                    width: (100 / len) + '%'
                });

                //  Autoslide
                setTimeout(function() {
                    if (o.delay | 0) {
                        _.play();

                        if (o.pause) {
                            el.on('mouseover mouseout', function(e) {
                                _.stop();
                                e.type == 'mouseout' && _.play();
                            });
                        };
                    };
                },
                o.init | 0);

                //  Keypresses
                if (o.keys) {
                    $(document).keydown(function(e) {
                        var key = e.which;

                        if (key == 37) _.prev(); // Left
                        else if (key == 39) _.next(); // Right
                        else if (key == 27) _.stop(); // Esc
                    });
                };

                //  Dot pagination
                o.dots && nav('dot');

                //  Arrows support
                o.arrows && nav('arrow');

                //  Patch for fluid-width sliders. Screw those guys.
                if (o.fluid) {
                    $(window).resize(function() {
                        _.r && clearTimeout(_.r);

                        _.r = setTimeout(function() {
                            var styl = {
                                height: li.eq(_.i).outerHeight()
                            },
                            width = el.outerWidth();

                            ul.css(styl);
                            styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
                            el.css(styl);
                        },
                        50);
                    }).resize();
                };

                //  Swipe support
                if ($.event.special['swipe'] || $.Event('swipe')) {
                    el.on('swipeleft swiperight swipeLeft swipeRight', function(e) {
                        e.type.toLowerCase() == 'swipeleft' ? _.next() : _.prev();
                    });
                };
                return _;
            };

            var supportsTransitions = (function() {
                var docBody = document.body || document.documentElement;
                var styles = docBody.style;
                var prop = "transition";
                if (typeof styles[prop] === "string") {
                    return true;
                }
                // Tests for vendor specific prop
                vendor = ["Moz", "Webkit", "Khtml", "O", "ms"];
                prop = prop.charAt(0).toUpperCase() + prop.substr(1);
                var i;
                for (i = 0; i < vendor.length; i++) {
                    if (typeof styles[vendor[i] + prop] === "string") {
                        return true;
                    }
                }
                return false;
            })();

            //  Move Unslider to a slide index
            _.to = function(idx) {
                var $slide = _.li,
                    el = _.el;
                    console.info(idx);
                // If CSS3 transitions are supported
                if (supportsTransitions) {
                    $slide
                        .css(hidden)
                        .fadeIn()
                        .eq(idx)
                        .css(visible)
                        .show();
                    // If not, use jQuery fallback
                } else {
                    $slide
                        .stop()
                        .fadeOut(fadeTime, function() {
                            $(this)
                            .css(hidden)
                            .css("opacity", 1);
                        })
                        .eq(idx).fadeIn(fadeTime, function() {
                            $(this).css(visible);
                        });
                }
                //Handle those pesky dots
                el.find('.dot').eq(idx).addClass('active').siblings().removeClass('active');
            };

            //  Autoplay functionality
            _.play = function() {
                _.t = setInterval(function() {
                    _.to(_.i);
                    _.i = _.i + 1 < _.li.length ? _.i + 1: 0;
                },
                _.o.delay | 0);
            };

            //  Stop autoplay
            _.stop = function() {
                _.t = clearInterval(_.t);
                return _;
            };

            //  Move to previous/next slide
            _.next = function() {
                return _.stop().to(_.i + 1);
            };

            _.prev = function() {
                return _.stop().to(_.i - 1);
            };

            //  Create dots and arrows
            function nav(name) {
                _.el.find('.' + name).click(function() {
                    var me = $(this);
                    me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
                });
            };
        };

        //  Create a jQuery plugin
        $.fn.unslider = function(o) {
            var len = this.length;

            //  Enable multiple-slider support
            return this.each(function(index) {
                //  Cache a copy of $(this), so it
                var me = $(this),
                key = 'unslider' + (len > 1 ? '-' + ++index: ''),
                instance = (new Unslider).init(me, o);

                //  Invoke an Unslider instance
                me.data(key, instance).data('key', key);
            });
        };
    }
});

