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

        this.generateTimelineElements();

        // Find the old date, the newest date, and the time elapsed in between
        this._dateStart = new moment(this.$element.find('li:first time').attr('datetime'), 'YYYY-MM-DD');
        this._dateEnd = new moment(this.$element.find('li:last time').attr('datetime'), 'YYYY-MM-DD');
        this._duration = this._dateEnd.diff(this._dateStart);

        this.positionTimelineEvents();
        this.generateTimelineDates();
    };

    /*******************************************************
    * Timeline Generation
    ********************************************************/

    Plugin.prototype.generateTimelineElements = function () {
        var self = this;

        // Create a div to contain the timeline. All elements for the timeline will go in here
        $(this.element).addClass('events').wrap('<div class="htmlTimeline" />').wrap('<div class="timelineContents" />');

        this.$element = $(this.element).parent().parent();
        $(this.$element).find("ol.events").css('height', this.options.height);

        // Add zoom in and zoom out buttons
        this.$element.prepend('<div class="buttons">' +
                                   '<p>Zoom</p>' +
		                           '<button id="timelineZoomIn">+</button>' +
		                           '<button id="timelineZoomOut">-</button>' +
		                      '</div>');
        this.$element.prepend('');

        this.$element.find("#timelineZoomIn").click(function () {
            self.ZoomIn();
        });

        this.$element.find("#timelineZoomOut").click(function () {
            self.ZoomOut();
        });
        
        // Convert each <li> into an event
        this.$element.find('ol.events > li').each(function () {
            $li = $(this);
            $li.wrapInner('<div class="event" />');
            $li.on('click', function (e) {
                self.open(this);
            });
        });
    };

    Plugin.prototype.positionTimelineEvents = function () {
        var self = this;
        
        this.$element.find('ol.events > li').each(function () {
            $li = $(this);

            var date = new moment($li.find('time').attr('datetime'), 'YYYY-MM-DD');

            // Ensure the element is within the timespan displayed on the timeline
            if (!(date.isBefore(self._dateStart) || date.isAfter(self._dateEnd))) {
                $li.show();
                $li.css('top', self._getTop(date));
            } else {
                $li.hide();
            }
        });
    };

    Plugin.prototype.generateTimelineDates = function() {

        // Remove any old copy of the timeline dates in case we're regenerating them
        this.$element.find('ol.timeline_dates').remove();
        
        var date = this._dateStart.year();
        var num_years = this._dateEnd.diff(this._dateStart, 'years');

        // Determine tick spacing
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

        // Generate the timeline bar
        var html_dates = '<ol class="timeline_dates">';
        for (var i = date; i <= this._dateEnd.year(); i = i + tickDuration) {
            var top = this._getTop(new moment(i.toString(), 'YYYY'));
            html_dates += '<li style="top: ' + top + 'px"><div>' + i + '</div></li>';
        }
        html_dates += '<ol>';

        // Add timeline to page
        this.$element.find('ol.events').after(html_dates);
    };

    Plugin.prototype._getTop = function (date) {
        var top = date.diff(this._dateStart) * (this.options.height - this.options.margeTop * 2) / this._duration;
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

    /*******************************************************/

    /*******************************************************
    * Zoom functions
    ********************************************************/

    Plugin.prototype.ZoomIn = function() {
        var zoomFactor = 3 / 4;
        this.Zoom(zoomFactor);
    };

    Plugin.prototype.ZoomOut = function() {
        var zoomFactor = 4 / 3;
        this.Zoom(zoomFactor);
    };

    Plugin.prototype.Zoom = function (zoomFactor) {
        // Determine what the new time span of the timeline should be
        var durationNew = this._duration * zoomFactor;
        
        this._dateStart.add((this._duration - durationNew) / 2, 'milliseconds');
        this._dateEnd.subtract((this._duration - durationNew) / 2, 'milliseconds');
        this._duration = durationNew;

        this.positionTimelineEvents();
        this.generateTimelineDates();
    };
    
    /*******************************************************/

    // Adding Plugin to the jQuery.fn object
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };
    
    
}(jQuery, window));
