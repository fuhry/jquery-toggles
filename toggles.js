/**
@license jQuery Toggles v2.0.4
Copyright 2013 Simon Tabor - MIT License
https://github.com/simontabor/jquery-toggles / http://simontabor.com/labs/toggles
*/
(function($) {

$.fn['toggles'] = function(options) {

  // if you call .toggles() on a checkbox, the checkbox is converted to a toggle,
  // and the original checkbox is hidden.
  if ( $(this).is(':checkbox') ) {
    // Older browsers would only transfer a variable into the scope of
    // anonymous functions if you "touched" the variable somehow.
    // This may or not still be necessary in 2014, but I still do it.
    void(options);
    return this.each(function() {

      var container = $('<div />'),
          $el = $(this),
          checked = $el.prop('checked'),
          disabled = $el.prop('disabled');
          
      container.insertAfter(this);
      
      options = options || {};
      options = $.extend(options, { disabled: disabled, on: checked, checkbox: this });
      
      $(container).toggles(options);
    });
  }
  
  options = options || {};
  
  // extend default opts with the users options
  var opts = $.extend({
    'drag': true, // can the toggle be dragged
    'click': true, // can it be clicked to toggle
    'text': {
      'on': 'ON', // text for the ON position
      'off': 'OFF' // and off
    },
    'on': false, // is the toggle ON on init
    'disabled': false, // is the toggle grayed out and unable to be clicked
    'animate': 250, // animation time
    'transition': 'ease-in-out', // animation transition,
    'checkbox': null, // the checkbox to toggle (for use in forms)
    'width': 50, // width used if not set in css
    'height': 20, // height if not set in css
    'type': 'compact', // defaults to a compact toggle, other option is 'select' where both options are shown at once
    'theme': 'light'
  },options);

  var selectType = (opts['type'] == 'select');

  // ensure these are jquery elements
  opts['checkbox'] = $(opts['checkbox']); // doesnt matter for checkbox

  // use native transitions if possible
  var transition = 'margin-left '+opts['animate']+'ms '+opts['transition'];
  var transitions = {
    '-webkit-transition': transition,
    '-moz-transition': transition,
    'transition': transition
  };

  // for resetting transitions to none
  var notransitions = {
    '-webkit-transition': '',
    '-moz-transition': '',
    'transition': ''
  };

  // this is the actual toggle function which does the toggling
  var setSliderState = function(slide, width, height, new_state) {
    console.debug('setSliderState(', new_state, ')');
    // do nothing if new_state === current_state
    var current_state = slide.hasClass('active');
    if (new_state === current_state) return;

    slide.toggleClass('active');

    var inner = slide.find('.toggle-inner').css(transitions);

    slide.find('.toggle-off').toggleClass('active');
    slide.find('.toggle-on').toggleClass('active');

    if (selectType) return;

    var margin = new_state ? 0 : -width + height;

    // move the toggle!
    inner.css('margin-left',margin);

    // ensure the toggle is left in the correct state after animation
    setTimeout(function() {
      inner.css(notransitions);
      inner.css('margin-left',margin);
    },opts['animate']);
  };
  
  var setCheckboxState = function(checkbox, state) {
    console.debug('setCheckboxState(', state, ')');
    (checkbox.get(0)).checked = !!state;
  };
  
  var setDisabled = function(slide, checkbox, state) {
    state ? slide.addClass('toggle-disabled') : slide.removeClass('toggle-disabled');
    (checkbox.get(0)).disabled = !!state;
  }
  
  var getState = function(slide, checkbox) {
    if ( typeof(checkbox) == 'object' ) {
      return !!checkbox.attr('checked');
    }
    else {
      return slide.hasClass('active');
    }
  };
  
  var isDisabled = function(slide, checkbox) {
    if ( typeof(checkbox) == 'object' ) {
      return !!checkbox.attr('disabled');
    }
    else {
      return slide.hasClass('toggle-disabled');
    }
  };

  // start setting up the toggle(s)
  return this.each(function() {
    var toggle = $(this);

    var height = toggle.height();
    var width = toggle.width();

    // if the element doesnt have an explicit height/width in css, set them
    if (!height || !width) {
      toggle.height(height = opts.height);
      toggle.width(width = opts.width);
    }

    var div = '<div class="toggle-';
    var slide = $(div+'slide">'); // wrapper inside toggle
    var inner = $(div+'inner">'); // inside slide, this bit moves
    var on = $(div+'on">'); // the on div
    var off = $(div+'off">'); // off div
    var blob = $(div+'blob">'); // the grip toggle blob
    
    var checkbox = opts['checkbox'];

    var halfheight = height/2;
    var onoffwidth = width - halfheight;

    // set up the CSS for the individual elements
    on
      .css({
        height: height,
        width: onoffwidth,
        textAlign: 'center',
        textIndent: selectType ? '' : -halfheight,
        lineHeight: height+'px'
      })
      .html(opts['text']['on']);

    off
      .css({
        height: height,
        width: onoffwidth,
        marginLeft: selectType ? '' : -halfheight,
        textAlign: 'center',
        textIndent: selectType ? '' : halfheight,
        lineHeight: height+'px'
      })
      .html(opts['text']['off'])
      .addClass('active');

    blob.css({
      height: height,
      width: height,
      marginLeft: -halfheight
    });

    inner.css({
      width: width * 2 - height,
      marginLeft: selectType ? 0 : -width + height
    });

    if (selectType) {
      slide.addClass('toggle-select');
      toggle.css('width', onoffwidth*2);
      blob.hide();
    }

    // construct the toggle
    toggle.html(slide.html(inner.append(on,blob,off)))
      .addClass('toggle-' + opts['theme']);

    // when toggle is fired, toggle the toggle
    slide.on('toggle', function(e,active) {
      if (e) e.stopPropagation();
      
      
    });

    // setup events for toggling on or off
    toggle.on('toggleOn', function() {
      setSliderState(slide, width, height, true);
    });
    toggle.on('toggleOff', function() {
      setSliderState(slide, width, height, false);
    });

    if (opts['on']) {
      // toggle immediately to turn the toggle on
      setSliderState(slide,width,height,true);
    }
    if (opts['disabled']) {
      setDisabled(slide, checkbox, true);
    }

    // if click is enabled
    if (opts['click']) {

      // bind the click, ensuring its not the blob being clicked on
      toggle.on('click',function(e) {
        if ( isDisabled(slide, checkbox) ) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        var state = getState(slide, checkbox);
        setSliderState(slide, width, height, !state);
        setCheckboxState(checkbox, !state);
      }).data('toggle-opts', opts);
    }
    
    if ( typeof(checkbox) == 'object' ) {
      checkbox.on('change', function(event) {
          var state = getState(slide, checkbox);
          setSliderState(slide, width, height, state);
        })
        .on('disable', function(event) {
            var state = !!(checkbox.get(0)).disabled;
            setDisabled(slide, checkbox, state);
        });
    }

    // we're done with all the non dragging stuff
    if (!opts['drag'] || selectType) return;

    // time to begin the dragging parts/blob clicks
    var diff;
    var slideLimit = (width - height) / 4;

    // fired on mouseup and mouseleave events
    var upLeave = function(e) {
      toggle.off('mousemove');
      slide.off('mouseleave');
      blob.off('mouseup');

      var old_state = getState(slide, checkbox);

      if (!diff && opts.click && e.type !== 'mouseleave') {

        // theres no diff so nothing has moved. only toggle if its a mouseup
        //var state = getState(slide, checkbox);
        //setSliderState(slide, width, height, !state);
        //setCheckboxState(checkbox, !state);
        return;
      }

      if (old_state) {
        // if the movement enough to toggle?
        if (diff < -slideLimit) {
          console.debug('slid to "off"');
          setSliderState(slide, width, height, false);
          setCheckboxState(checkbox, false);
        } else {

          // go back
          inner.animate({
            marginLeft: 0
          },opts.animate/2);
        }
      } else {

        // inactive
        if (diff > slideLimit) {
          console.debug('slid to "off"');
          setSliderState(slide, width, height, true);
          setCheckboxState(checkbox, true);
        } else {

          // go back again
          inner.animate({
            marginLeft: -width + height
          },opts.animate/2);
        }
      }

    };

    var wh = -width + height;

    blob.on('mousedown', function(e) {

      if ( isDisabled(slide, checkbox) ) return;

      // reset diff
      diff = 0;

      blob.off('mouseup');
      slide.off('mouseleave');
      var cursor = e.pageX;

      toggle.on('mousemove', blob, function(e) {
        diff = e.pageX - cursor;
        var marginLeft;
        if (slide.hasClass('active')) {

          marginLeft = diff;

          // keep it within the limits
          if (diff > 0) marginLeft = 0;
          if (diff < wh) marginLeft = wh;
        } else {

          marginLeft = diff + wh;

          if (diff < 0) marginLeft = wh;
          if (diff > -wh) marginLeft = 0;

        }

        inner.css('margin-left',marginLeft);
      });

      blob.on('mouseup', upLeave);
      slide.on('mouseleave', upLeave);
    });


  });

};

// our jQuery hooks to fire events when a checkbox is
// disabled or enabled
$.propHooks.checked = {
  set: function(element, value, attribute) {

    // do not fire the event if the property is unchanged
    if ( (!!element[attribute]) === !!value )
      return;
    
    // set the attribute, then fire the event.
    element[attribute] = !!value;
    
    console.debug('prophook checked');

    $(element).triggerHandler('change', !!value);

    return !!value;
  }
};

$.propHooks.disabled = {
  set: function(element, value, attribute) {

    // do not fire the event if the property is unchanged
    if ( (!!element[attribute]) === !!value )
      return;
    
    // set the attribute, then fire the event.
    element[attribute] = !!value;

    $(element).triggerHandler('disable', !!value);

    return !!value;
  }
};

})(jQuery);
