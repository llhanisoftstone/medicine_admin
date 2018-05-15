(function($) {
    $.fn.scombobox = function(options) {
        var id = $(this).selector;
        id = id.replace("#", "");
        if (options == "getValue") {
            return $(id + "_select").val();
        }

        var $divgourp = $('<div class="input-group"></div>');
        var $sinput = $('<input id="' + id + '_tiValue" type="text" class="form-control">');
        var $scombox = $('<select id="' + id + '_select"></select>');
        var $sspan = $('<span class = "input-group-addon"></span>');

        $sinput.on('change', function() {
            var value = $sinput.val();
            $scombox.val(value);
            if(!$scombox.val()){
                $scombox.val("-1");
            }
        });

        $scombox.on('change', function() {
            var value = $scombox.val();
            if (value == "-1") {
                value = "";
            }
            $sinput.val(value);
        });

        var domain = options.domain;
        var optionsstr = '<option value="-1">请选择</option>';
        zhget('/scombox/' + domain, null, function(result) {
            for (index in result) {
                var item = result[index];
                optionsstr += '<option value="' + item[options.value] + '">' + item[options.label] + '</option>';
            }
            $scombox.append(optionsstr);
        });

        $sspan.append($scombox);
        $divgourp.append($sinput);
        $divgourp.append($sspan);
        $(this).html($divgourp);
    }
})(jQuery);
