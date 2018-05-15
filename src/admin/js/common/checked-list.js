(function ($) {
    $.fn.checkedlist = function (options) {
    	 var id = $(this).selector;
         
    	if(options == "getCheckedData"){
    		var checkedItems = {}, counter = 0;
            $(id+" li.active").each(function(idx, li) {
                checkedItems[li.id] = $(li).text();
                counter++;
            });
            return checkedItems;
    	}
       
        $(id + " .list-group-item").each(function () {
            var $widget = $(this);
            var $checkbox = $('<input type="checkbox" class="hidden" />');
            var color = ($widget.data('color') ? $widget.data('color') : "primary");
            var style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-");
            var settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };

            $widget.css('cursor', 'pointer');
            $widget.append($checkbox);

            // Event Handlers
            $widget.on('click', function () {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
                $checkbox.triggerHandler('change');
                updateDisplay();
            });
            $checkbox.on('change', function () {
                updateDisplay();
                if(options.onchange){
                	options.onchange();
                }
            });

            // Actions
            function updateDisplay() {
                var isChecked = $checkbox.is(':checked');
                // Set the button's state
                $widget.data('state', (isChecked) ? "on" : "off");
                // Set the button's icon
                $widget.find('.state-icon').removeClass().addClass(
                    'state-icon ' + settings[$widget.data('state')].icon);
                // Update the button's color
                if (isChecked) {
                    $widget.addClass(style + color + ' active');
                } else {
                    $widget.removeClass(style + color + ' active');
                }
            }
            // Initialization
            function init() {
                if ($widget.data('checked') == true) {
                    $checkbox.prop('checked', !$checkbox.is(':checked'));
                }
                updateDisplay();
                // Inject the icon if applicable
                if ($widget.find('.state-icon').length == 0) {
                    $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
                }
            }
            init();
        });
    };
})(jQuery);