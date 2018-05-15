/***
 * 表单验证类，在需要验证的input上添加属性datatype，如果需要添加请补充注释
 * 值为一下内容:
 * require:为null验证
 * slenMin：3-10长度验证
 * slen：6-20长度验证
 * phone：手机验证
 * number：数字
 * mlen：金额最大值999999.99元
 * money：钱
 * email：邮箱验证
 * numberletter:"只能输入字母或数字",
 * letter:只能输入字母
 * letterspace:只能输入字母或空格
 * checkbox： checkbox验证
 * submit:提交表单验证，只能添加到button上，否则不起作用
 * timeverify:时间校验，不能大于XXX,不能小于XXX
 * posInteger:大于0的正整数
 * integer:大于等于0的正整数
 */

$(document).ready(function() {
	validator();
	setTimeout(function(){
		btnSubmitValidator();
	},500);

});

function btnSubmitValidator(){
	$("form").each(function() {
		var formId = $(this).attr("id");
		$(this).find("button[datatype]").on("click", checkSubmit_validator);

		function checkSubmit_validator(){
			submitBtn(formId);
		}

		$(this).find("button[datatype]").each(function(){
			var btnId = $(this).attr("id");
			var _arr_events= $._data($("#" + btnId)[0], "events");
			var checkFun, funcArray=[];
			for(var i=0;i<_arr_events.click.length;i++){
				var item = _arr_events.click[i];
				if(item.handler.name == "checkSubmit_validator"){
					checkFun = item.handler;
				}else{
					funcArray.push(item.handler);
				}
			}
			$(this).unbind("click");
			$(this).bind("click",function(){
				checkFun();
				if($(".validatorSpan").length >= 1){
					return;
				}
				$.each(funcArray,function(i,n){
					funcArray[i]();
				});
			});

			//_arr_events.click[1].handler();
		});
	});
}


var tooltips = {
	require : "请输入内容。",
	mail : "邮箱格式不正确",
	number : "请输入数字",
	slen : "输入内容在6-20个长度",
	slenMin : "输入内容在1-9个长度",
	mlen : "金额最大值999999.99元",
	money : "请输入钱数保留2位小数",
	floatNumber : "输入内容保留2位小数",
	phone : "请输入正确的手机号码",
	checkbox : "此次项必须选择",
	select : "此次项必须选择",
	intNumber: "请输入整数",
	numberletter:"只能输入字母或数字",
	letterspace:"只能输入字母或空格",
	letter:"只能输入字母",
	timeverify:'',//这个校验的提示语靠属性传
	posInteger:"最小输入为1",
	integer:"最小输入为0"
};

var Validate = {
	require : function(msgId, type) {
		if(!$(this).is("input") && !$(this).is("select")){
			return;
		}
        // $(this).bind('input propertychange',function(){
        //     var value = $(this).val();
        //     if (value == "" || $.trim(value) == "")
        //     {
        //         showTooltips(msgId, tooltips[type],$(this).parent());
        //         return false;
        //     }else {
        //         hideTooltips(msgId,$(this).parent());
        //     }
        //     return true;
        // })
		$(this).on("change",function(){
            hideTooltipstwo(msgId,$(this).parent());
		})
        var value = $(this).val();
		if (value == "" || $.trim(value) == "")
		{
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		}else {
            hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	mail : function(msgId, type) {
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		if (value.search(/^.+@.+$/) == -1) {
			showTooltips(msgId,  tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	number : function(msgId, type) {
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		if (value.search(/^\d+$/) == -1) {
			showTooltips(msgId,  tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	slen:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		if (value.search(/^.{3,20}$/) == -1) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	slenMin:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		if (value.search(/^.{1,9}$/) == -1) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	mlen:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		if (value.search(/^\d{1,6}(\.\d{1,2})?$/) == -1) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	money:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var moneyReg = /^[0-9]+([.]\d{1,2})?$/;
		if (!moneyReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	floatNumber:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var floatReg = /^[0-9]+([.]\d{1,2})?$/;
		if (!floatReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	intNumber:function(msgId, type)
	{
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var intReg = /^[+-]?\d+(?:\.?\d+)?$/;
		if (!intReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	posInteger:function(msgId, type)
	{
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var intReg = /^\+?[1-9]\d*$/;
		if (!intReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	integer:function(msgId, type)
	{
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var intReg = /^\+?[0-9]\d*$/;
		if (!intReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	phone:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		if (!isMobilePhone(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	checkbox:function(msgId, type){
		if(!$(this).is("checkbox")){
			return;
		}
		if ($(this).attr('checked') == false) {
			showTooltips(msgId, checkbox,$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	select:function(msgId, type){
		if(!$(this).is("select")){
			return;
		}
		if ($($(this).val()).trim() == "") {
			showTooltips(msgId, select,$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	numberletter:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var numberletterReg = /^[A-Za-z0-9]+$/;
		if (!numberletterReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	letter:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var numberletterReg = /^[A-Za-z]+$/;
		if (!numberletterReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	letterspace:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		var letterspaceReg = /^[ A-Za-z]+$/;
		if (!letterspaceReg.test(value)) {
			showTooltips(msgId, tooltips[type],$(this).parent());
			return false;
		} else {
			hideTooltips(msgId,$(this).parent());
		}
		return true;
	},
	timeverify:function(msgId, type){
		if(!$(this).is("input")){
			return;
		}
		var value = $(this).val();
		if (value == "" || $.trim(value) == "") return true;
		
		var compare = "gt";
		var thanName = $(this).attr("gtname");
		if (null == thanName || undefined == thanName)
		{
			thanName = $(this).attr("ltname");
			compare = "lt";
		}
		if (null == thanName || undefined == thanName)
		{
			return true;
		}
		var time = new Date(value.replace(/-/g,"/"));
		var form = $(this).parents("form");
		var comvalue = $("input[name='"+thanName+"']", form).val();
		var comtime = new Date(comvalue.replace(/-/g,"/"));
		switch(compare)
		{
			case "gt":
			{
				if(time.getTime() < comtime.getTime())
				{
					showTooltips(msgId, $(this).attr("pop"),$(this).parent());
					return false;
				}
				else
				{
					hideTooltips(msgId,$(this).parent());
				}
				break;
			}
			case "lt":
			{
				if(time.getTime() > comtime.getTime())
				{
					showTooltips(msgId, $(this).attr("pop"),$(this).parent());
					return false;
				}
				else
				{
					hideTooltips(msgId,$(this).parent());
				}
				break;
			}
			default:break;
		}
		return true;
	}
};

function submitBtn(formId){
	$("#" + formId).find("[datatype]").each(function(){
		$(this).trigger("blur");
	});
}
 
 

function isMobilePhone(value) {
    var isMob=/^((\+?86)|(\(\+86\)))?(13[0123456789][0-9]{8}|15[0123456789][0-9]{8}|17[0123456789][0-9]{8}|18[0123456789][0-9]{8}|147[0-9]{8}|1349[0-9]{7}|19[0123456789][0-9]{8}|16[0123456789][0-9]{8})$/;
    return isMob.test(value);
}

function isValidatePass(formId)
{
	$("#" + formId).find("input,select,checkbox").trigger("blur");
	return !allTooltipsExists(formId);
}

 
function validator(){
	$("form").each(function() {
		// alert("********e***f***" + $(this).is("form"));
		var formId = $(this).attr("id");
		$(this).find("[datatype]").on("blur", function() {
			if($(this).is("button")){
				return;
			}
			var typeVal = $(this).attr("datatype");
			var msgId = ($(this).attr("id") || $(this).attr("name")) + "_input";
			var length = $("#"+msgId, $(this).parent()).length;
			$("#"+msgId, $(this).parent()).remove();
			$(this).before("<span id=\"" + msgId + "\"></span>")
			var func = typeVal.split(" ");
			for (var i = 0; i < func.length; i++) {
				var temp = func[i];
				if(temp != null && $.trim(temp) != ""){
					var res = Validate[func[i]].call(this, msgId, func[i]);
					if(!res){
						$("#" + msgId, $(this).parent()).addClass("validatorSpan");
						break;
					}
				}
			}
		});
	});
}