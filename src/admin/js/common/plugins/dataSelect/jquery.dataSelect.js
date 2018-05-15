/**
 * Created by xuxm on 2015/3/25.
 */
(function($) {
    $.fn.addDataSelect = function(options) {
        var id = $(this).selector;
        id = id.replace("#", "");

        var $scombox = $('<select id="' + id + '_select" class="form-control"></select>');
        var domain = options.domain;
        var optionsstr = '<option value="-1">请选择</option>';

        zhget('/b_dataSelect/' + domain, null, function(result) {
            for (index in result) {
                var item = result[index];
                optionsstr += '<option value="' + item[options.value] + '">' + item[options.label] + '</option>';
            }
            $scombox.append(optionsstr);
        });

        $(this).html($scombox);
    }

    $.fn.addDataOption = function(options) {
        var selectID = $(this);
        var optionsstr = '<option value="-1">请选择</option>';
        var domain = options.domain;
        zhget('/b_dataSelect/' + domain, null, function(result) {
            for (index in result) {
                var item = result[index];
                optionsstr += '<option value="' + item[options.value] + '">' + item[options.label] + '</option>';
            }
            selectID.html(optionsstr);
        });
    }
})(jQuery);