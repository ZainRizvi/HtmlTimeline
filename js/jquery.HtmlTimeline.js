/*! jQuery htmlTimeline - v1.0
* https://github.com/b1nj/htmlTimeline
* Copyright (c) 2012 b1nj Licensed MIT */

;(function ( $, window, undefined ) {

    var pluginName = 'htmlTimeline',
        document = window.document,
        defaults = {
            height: 400,
            margeTop: 40
        };

    // Pugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.$element = null;
        this.options = $.extend( {}, defaults, options) ;
        this._dateStart = false;
        this._dateEnd = false;
        this._duration = false;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype.init = function () {
        var self = this;

        $(this.element).addClass('events').wrap('<div class="htmlTimeline" />');

        this.$element = $(this.element).parent();
        this.$element.css('height', this.options.height);

        // Find the old date, the newest date, and the time elapsed in between
        this._dateStart = new moment(this.$element.find('li:first time').attr('datetime'), 'YYYY-MM-DD');
        this._dateEnd = new moment(this.$element.find('li:last time').attr('datetime'), 'YYYY-MM-DD');
        this._duration = this._dateEnd.diff(this._dateStart);

        // Convert each <li> into an event
        this.$element.find('ol > li').each(function () {
            $li = $(this);
            $li.wrapInner('<div class="event" />');
            var date = new moment($li.find('time').attr('datetime'), 'YYYY-MM-DD')
            $li.css('top', self._getTop(date));

            $li.on('click', function (e) {
                self.open(this);
            });
        });

		//
        // Create the timeline bar
		//
        var date = this._dateStart.year();
        var num_years = this._dateEnd.diff(this._dateStart, 'years');

        var tickDuration = 1;
        if (num_years > 500) {
            tickDuration = 100;
        } else if (num_years > 250) {
            tickDuration = 50;
        } else if (num_years > 100) {
            tickDuration = 25;
        } else if (num_years > 50) {
            tickDuration = 10;
        } else if (num_years > 25) {
            tickDuration = 5;
        } else if (num_years > 10) {
            tickDuration = 2;
        }
        date = date + 1;
        while (date % tickDuration != 0) {
            date = date + 1;
        }

        var html_dates = '<ol class="timeline_dates">';
        for (var i = date; i <= this._dateEnd.year(); i = i + tickDuration) {
            var top = self._getTop(new moment(i.toString(), 'YYYY'));
            html_dates += '<li style="top: ' + top + 'px"><div>' + i + '</div></li>';
        }
        html_dates += '<ol>';

        this.$element.find('ol').after(html_dates);

    };

    Plugin.prototype._getTop = function (date) {
        var top = date.diff(this._dateStart) * this.options.height / this._duration;
        top = Math.abs(parseInt(top));
        top = top + this.options.margeTop;
        return top;
    };

    Plugin.prototype.open = function (desc) {
        var $evenement2 = $(desc).find('.event');
        if ($evenement2.hasClass('open')) {
            $evenement2.removeClass('open');
        } else {
            this.$element.find('.event').removeClass('open');
            $evenement2.addClass('open');
        }

    };

    // Adding Plugin to the jQuery.fn object
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };
}(jQuery, window));
