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
        
        this.drawTimeline();  
    };

    /*******************************************************
    * Timeline Generation
    ********************************************************/

    Plugin.prototype.drawTimeline = function() {
        this.generateTimelineDates();  
        this.positionTimelineEvents();      
    }

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

        //
        // Determine tick spacing
        //
        var date = this._dateStart; //.year();
        var num_years = this._dateEnd.diff(this._dateStart, 'years');

        var tickDuration = this.generateTimelineDateTickInterval();

        this.roundDownToTick(date, tickDuration);
                
        // Calculate new end date with the ticks
        var endDate = new moment(date);
        while(endDate <= this._dateEnd) {
            endDate.add(tickDuration);
            //this.addDurationToTime(endDate, tickDuration);
        }
        this._dateEnd = endDate;
        this._duration = this._dateEnd.diff(this._dateStart);

        //
        // Generate the timeline bar
        //
        var html_dates = '<ol class="timeline_dates">';
        for (var i = new moment(date); i <= this._dateEnd; i.add(tickDuration)) {  // this.addDurationToTime(i, tickDuration)) {
            var top = this._getTop(i); //new moment(i.toString(), 'YYYY'));
            html_dates += '<li style="top: ' + top + 'px"><div>' + i.format(this.getTickFormat(i)) + '</div></li>';
        }
        html_dates += '<ol>';

        // Add timeline to page
        this.$element.find('ol.events').after(html_dates);
    };

    Plugin.prototype.roundDownToTick = function (date, tick) {
        if (tick.milliseconds() == 0) {
            date.milliseconds(0);    
            if (tick.seconds() == 0) {
                date.seconds(0);    
                if (tick.minutes() == 0) {
                    date.minutes(0);
                    if (tick.hours() == 0) {
                        date.hours(0);
                        if (tick.days() == 0) {
                            date.date(1);
                            if (tick.months() == 0) {
                                date.months(0);
                                var tickYearOffset = date.years() % tick.years();
                                date.years(date.years() - tickYearOffset)
                            } else {
                                if (date.months() != 0) {
                                    date.months(date.months() - (date.months() % tick.months()));
                                }
                            }
                        } else {
                            date.days(date.days() - (date.days() % tick.days()));
                        }
                    }
                }
            }
        }
    };

    Plugin.prototype.addDurationToTime = function (date, duration) {
        date.years(date.years() + duration.years());
        date.months(date.months() + duration.months());
        date.dates(date.dates() + duration.days());
        date.add(duration.milliseconds());    
        date.add(duration.seconds());    
        date.add(duration.minutes());
        date.add(duration.hours());
    };

    // tick is the date represented by a given tick mark on the timeline
    // Method returns the correct format that should be used to display the tick date
    Plugin.prototype.getTickFormat = function(tick) {
        if (tick.date() != 1) {
            return "MMM D"; // Tick will display the day of the month
        }
        if (tick.month() != 0) {
            return "MMM 'YY"; // Tick will display the month name
        }
        return "YYYY"; // Tick will display the year
    };

    var validTicks = [
        moment.duration(1,  'days'),
        moment.duration(2,  'days'),
        moment.duration(5,  'days'),
        moment.duration(1,  'months'),
        moment.duration(2,  'months'),
        moment.duration(4,  'months'),
        moment.duration(6,  'months'),
        moment.duration(1,  'years'),
        moment.duration(2,  'years'),
        moment.duration(4,  'years'),
        moment.duration(5,  'years'),
        moment.duration(10, 'years'),
        moment.duration(20, 'years'),
        moment.duration(25, 'years')
    ];
    
    Plugin.prototype.generateTimelineDateTickInterval = function() {
        var self = this;
        var date = this._dateStart;
        var tickDuration;
        var idealHeight = 40;
        var currentBestHeightDiff = Number.MAX_VALUE;
        var currentBestHeightIndex = -1;

        jQuery.each(validTicks, function(index, value) {
            var tickDuration = value.asMilliseconds();
            var height = self.getDurationHeight(tickDuration);
            var heightDiff = Math.abs(height - idealHeight);
            if (heightDiff <= currentBestHeightDiff) {
                currentBestHeightDiff = heightDiff;
                currentBestHeightIndex = index;
                
            } 
        });

        return validTicks[currentBestHeightIndex];
    };

    Plugin.prototype._getTop = function (date) {
        var top = date.diff(this._dateStart) * (this.options.height - this.options.margeTop * 2) / this._duration;
        top = Math.abs(parseInt(top));
        top = top + this.options.margeTop;
        return top;
    };

    

    Plugin.prototype.getDurationTop = function (duration) {
        var top = duration * (this.options.height - this.options.margeTop * 2) / this._duration;
        top = Math.abs(parseInt(top));
        top = top + this.options.margeTop;
        return top;
    };

    Plugin.prototype.getDurationHeight = function (duration) {
        var top = duration * (this.options.height - this.options.margeTop * 2) / this._duration;
        top = Math.abs(parseInt(top));
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

    /*******************************************************
    * Zoom methods
    ********************************************************/

    Plugin.prototype.ZoomIn = function() {
        var zoomFactor = 0.5;
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
        
        this.drawTimeline();
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
