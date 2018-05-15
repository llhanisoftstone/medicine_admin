/********************************
 * webluker自有的JS库
 * Author: shengli.zhang
 * Creation data: 2010-05-18
 * ******************************/

/********************************
 * 以下的search, onSuccess, onFail, fill, setSearch函数
 * 都是为了实现自动补全搜索框功能（类似与搜索引擎下拉框）。
 * 入口为search函数，参数为一个get请求的url。
 * 使用方法：
 *      1 html中放置一个带有keyup事件的文本框，如<input id="[text_id]" type="text" value="" onkeyup="search([url])"/>,
 *        其中[text_id]替换为自己需要的id，[url]需要替换为自己构建的get请求的url。
 *      2 input下方放置一个隐藏的层，如<div id="[div_id]" style="display:none"></div>，同样[div_id]需要替换。
 *      3 python后端代码需要有能够接受1中的url请求的views函数，假设函数名为fun。
 *      4 fun代码事例如下：
 *        def fun(request) {
 *           # 获得参数处理请求
 *           ....
 *
 *           # 以下为返回结果的关键代码。
 *           # [result]变量为后端的返回结果（一般为列表）
             import simplejson
             #注意dumps只接收字典类型，字段中的key不可修改，否则和js代码中的无法对应。
             #[result]为搜索结果，[text_id]为html也中文本框的id， [div_id]为html中对应文本框下方隐藏层的id
             return HttpResponse(simplejson.dumps({'result':[result],'text_id':[text_id],'div_id':[div_id]}))  
 *        }
 *
 * ******************************/
function search(url) { 
    var d = loadJSONDoc(url);
    d.addCallbacks(onSuccessBack, onFailBack);
}

onSuccessBack = function(data) {
	fill(data);
}

onFailBack = function(data){  
    document.getElementById("processbar").style.display='none';
    showHint('服务端错误!','');
}

function fill(data) {
	var search_suggest = document.getElementById(data.div_id);
	search_suggest.innerHTML = "";
	search_suggest.style.display="none";
	var groups = data.result;
    fun = "setSearch('" + data.text_id + "', '" + data.div_id + "', this.innerHTML)"
	//alert(groups);
	var len = groups.length;
	if (len > 0) {
		for(var i=0; i<len; i++) {
			var suggest = '<div onmouseover="javascript:suggestOver(this);" onmouseout="javascript:sugggestOut(this);" onclick="javascript:' + fun + '(this.innerHTML);" class="suggest_link">'
			//alert(suggest);
			suggest += groups[i] + '<div>';
			search_suggest.innerHTML += suggest;
		}
		search_suggest.style.display="block";
	}	
}

function setSearch(text_id, div_id, div_value)
{ 
   if(document.getElementById(text_id)!=null) {
       div_value = div_value.replace("<DIV></DIV>", "");
       div_value = div_value.replace("<div></div>", "");
       document.getElementById(text_id).value=div_value;
   }    
   document.getElementById(div_id).innerHTML="";
   document.getElementById(div_id).style.display="none";
}

/******* 以下是用户输入内容的安全性检查函数 *********/
/**** 是否为合法域名 ****/
function isDomain(domain) {
	var reg_domain = new RegExp('^[0-9a-zA-Z\\-\\.]{3,127}$');
    if ( ! reg_domain.exec(domain) ) {
        return false;
    }
	
	if(domain[0] == '-') {
		return false;
	}
	
	var strs = domain.split("."); 
	if(strs.length < 2 || 
		(strs.length==2 && strs[1].length==0)) {
		return false;
	}
	for (var i=0;i<strs.length ;i++ ) {   
        if (strs[i].length>63 || strs[i].length<1) {
			if(i==strs.length-1 && strs[i].length==0) {
				return true;
			}
			return false;
		}
    } 
	
	return true;
}

/**** 是否为合法（泛）域名 ****/
function isWildCardDomain(domain) {
	var reg_domain = new RegExp('^(\\*\\.)?[0-9a-zA-Z\\-\\.]{3,127}$');
    if ( ! reg_domain.exec(domain) ) {
        return false;
    }
	
	var strs = domain.split("."); 
	if(strs.length < 2 || 
		(strs.length==2 && strs[1].length==0)) {
		return false;
	}
	for (var i=0;i<strs.length ;i++ ) {   
        if (strs[i].length>63 || strs[i].length<1) {
			if(i==strs.length-1 && strs[i].length==0) {
				return true;
			}
			return false;
		}
    } 
	
	return true;
}

function trim(str){
return str.replace(/(^\s*)|(\s*$)/g, "");
}

/**** 是否为合法外网IP地址 ****/
function isIP(value) {
	var reg_ip = new RegExp('^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$');
    if ( ! reg_ip.exec(value) ) {
        return false; 
    }
	
	var strs = value.split(".");
	if( strs.length != 4) {
		return false; 
	}
	for (var i=0;i<strs.length ;i++ ) {
		if (strs[i].indexOf("0") == 0 && strs[i].length > 1) {
			return false;
		}
    else if (parseInt(strs[i])>255 || parseInt(strs[i])<0) {
			return false;
		}
  }
    if (value.search(/^192\.168\./) != -1 || value.search(/^172/) != -1 || value.search(/^127\.0/) != -1 ) {
        return false;
    }
	return true; 
}

/**** 是否为合法IP地址 ****/
function isAllIP(value, innerIP) {
	var reg_ip = new RegExp('^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$');
    if ( ! reg_ip.exec(value) ) {
        return false; 
    }
	
	var strs = value.split("."); 
	if( strs.length != 4) {
		return false; 
	}
	for (var i=0;i<strs.length ;i++ ) {   
		if (strs[i].indexOf("0") == 0 && strs[i].length > 1) {
			return false;
		}
    else if (parseInt(strs[i])>255 || parseInt(strs[i])<0) {
			return false;
		}
    }
    if (innerIP == false) {
        if (value.search(/^192\.168\./) != -1 || value.search(/^172/) != -1 || value.search(/^127\.0/) != -1 ) {
            return false;
        }
    }
	return true; 
}

/**** 是否为合法Email地址 ****/
function isEmail(value) {
    if(value.search(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/) == -1)
        return false;
    else
        return true;
}

/**** 是否为合法的国内电话号码 ****/
function isTelphone(value) {
    if(value.search(/^(\d{3}-\d{8}|\d{4}-\d{7}|\d{4}-\d{8})$/) == -1)
        return false;
    else
        return true;
}

/**** 是否为合法的手机号码，为了兼容国际写法，目前只判断了是否是+数字 ****/
function isMobilePhone(value) {
    if(value.search(/^(\+\d{2,3})?\d{11}$/) == -1)
        return false;
    else
        return true;
}

/**** 是否为合法的国内邮政编码 ****/
function isZipcode(value) {
    if(value.search(/^[1-9]\d{5}$/) == -1)
        return false;
    else
        return true;
}

/**** 是否为合法的QQ号 ****/
function isQQ(value) {
    if(value.search(/^[1-9][0-9]{4,}$/) == -1)
        return false;
    else
        return true;
}

/**** 是否为数字串，length等于0不限制长度 ****/
function isNumber(value, length) {
    var regx;
    if(length==0)
        regx = new RegExp("^\\d*$");
    else
        regx = new RegExp("^\\d{" + length + "}$");
    if(value.search(regx) == -1)
        return false;
    else
        return true;
}

/**** 是否为Float型，length等于0不限制长度 ****/
function isFloat(value) {
    var regx = new RegExp("^[1-9]\\d*\.?\\d*$");
    if(value.search(regx) == -1)
        return false;
    else
        return true;
}

g_showhint_count=0;
/**** hint显示 ****/
function showHint(message,redirect) {
	if (message == '') {
	  	return;
	}
	redirect=redirect.replace('%26','&');
    var ie4 = document.all && navigator.userAgent.indexOf("Opera") == -1;
    var ns6 = document.getElementById && !document.all;
    var ns4 = document.layers;
    var isIE6 = (Prototype.Browser.IE && parseInt(navigator.appVersion) == 4 && navigator.userAgent.toLowerCase().indexOf('msie 6.') != -1);
    var hint = document.getElementById("hint");
    hint.innerHTML=message;
    hint.style.display="block";
    //hint.style.width="250px";
    //hint.style.height="100px";
    var w = window.screen.width;
    hint.style.right='0px';
    if(isIE6){
        hint.style.position='absolute';
        var y =document.documentElement.scrollTop;
        hint.style.top=y+'px';
    }else{
        hint.style.top='0px';
    }
	g_showhint_count += 1;
	if (redirect=='') {
		setTimeout("hiddenHint('"+redirect+"')", 5000);
	}
	else {
		setTimeout("hiddenHint('"+redirect+"')", 1000);
	}
}

/**** hint隐藏 ****/
function hiddenHint(redirect) {
	g_showhint_count -= 1;
	if(g_showhint_count != 0) {
		return;
	}
    var hint = document.getElementById("hint");
    hint.innerHtml="";
    hint.style.display="none";
   
   if(redirect != ''){
   		window.location = redirect;
   }
}

/***** 页面密码输入校验 *****/
function password_check(pwd1,pwd2,error_box) {
    var pwd1 = document.getElementById(pwd1).value;
    var wd2 = document.getElementById(pwd2).value;
    var error_box = document.getElementById(error_box);
    if (pwd1=="" || pwd2=="") {
        error_box.innerHTML = "<font color=red>请输入密码！</font>";
        error_box.style.display = "block";
    }
    else if (pwd1 != pwd2) {
    		error_box.innerHTML = "<font color=red>两次输入的密码不同！</font>";
        error_box.style.display = "block";
    }else{
    	error_box.style.display = "none";
    }
}

function sendSimpleGet(uri) {
	var d = doSimpleXMLHttpRequest(uri);
	d.addCallbacks(showMessage, onFailBack);
    showProcess('processbar');
}

function sendGet(uri,formObj) {
	var d = doSimpleXMLHttpRequest(uri,formObj);
	d.addCallbacks(showMessage, onFailBack);
    showProcess('processbar');
}

function sendPost(uri,formObj) {
	var d = doPostXMLHttpRequest(uri,formObj);
	d.addCallbacks(showMessage, onFailBack);
    showProcess('processbar');
}

function showMessage(data) {
	xmldoc = data.responseXML;
	var message = xmldoc.getElementsByTagName("message");
	var t = message[0].childNodes[0].nodeValue;
	t = t.replace(/\n/g,'<br>');
	var redirect = xmldoc.getElementsByTagName("redirect");
	var uri='';
	if(redirect[0].childNodes.length>0) {
		var uri = redirect[0].childNodes[0].nodeValue;
	}
    document.getElementById("processbar").style.display='none';
	showHint(t,uri);
}

/** html代码转义 **/
function escapeHTML(str) {  
    var div  = document.createElement('div');  
    var text = document.createTextNode(str);  
    div.appendChild(text);
    return div.innerHTML;  
}  

/** html代码逆转义 **/
function unescapeHTML(str) {  
    var div = document.createElement('div');  
    div.innerHTML = str.replace(/<\/?[^>]+>/gi, '');  
    return div.childNodes[0] ? div.childNodes[0].nodeValue : '';  
}

/*hua.zhang*/
/*字体加上横线，表示待删除*/
function addDeleteLine(lineId, red){
	if (lineId=='' ){ return; }
	if(typeof red != "undefined" && red && typeof red != "null"){
		$('#'+lineId).children().css({'text-decoration':"line-through",color:"#FF0000"});
		$('#'+lineId+' a').css({'text-decoration':"line-through",color:"#FF0000"});
		$('#'+lineId+' input').css({'text-decoration':'line-through','color':'#FF0000'});
	}
	else {
		$('#'+lineId).children().css({ 'text-decoration': "line-through", color: "#BBBBBB" });
		$('#'+lineId+' a').css({ 'text-decoration': "line-through", color: "#BBBBBB" });
		$('#'+lineId+' input').css({'text-decoration':'line-through','color':'#BBBBBB'});
	}
}
/*移除横线*/
function removeDeleteLine(lineId){
	if (lineId=='' ){ return; }
	$('#'+lineId).children().css({ 'text-decoration': "none", color: "" });
	$('#'+lineId+' a').css({ 'text-decoration': "none", color: "" });
	$('#'+lineId+' input').css({'text-decoration':'','color':''});
}
/*Error message Tooltips*/
$(document).ready(function(){
	/*点击隐藏错误提示,如果不想让提示点击消失,需要加上class='not_click_hide'*/
	$('.control-group input').not('.not_click_hide').focus(function(){
		hideTooltips($(this).parent().parent().attr('id'));
	});
});
/*
 *msgid:想让tooltips出现的地方的id
 *msg:提示的内容
 *time:自动消失的时间，如果不想让提示自动消失，则此参数不写
 */
function showTooltips(msgid,msg,parentDiv,time){
	if (msgid==''){ return; }
	if (msg==''){ msg='Error!'; }
	$('#'+msgid,parentDiv).prepend("<div class='for_fix_ie6_bug' style='position:relative;'><div class='tooltips_main'><div class='tooltips_box'><div class='tooltips'><div class='msg'>"+msg+"</div></div><div class='ov'></div></div></div></div>");
	$('#'+msgid+' .tooltips_main',parentDiv).fadeIn("slow").animate({ marginTop: "-23px"}, {queue:true, duration:400});
	try{
		if(typeof time != "undefined"){
			setTimeout('hideTooltips("'+msgid+','+parentDiv+'")',time);
		}
	}catch(err){}
	
}
function hideTooltips(msgid,parentDiv){
	try{
		$('#'+msgid,$(this).parent()).find('.tooltips_main').fadeOut("slow");
		$('#'+msgid,parentDiv).find('.tooltips_main').remove();
	}catch(e){}
}
function hideTooltipstwo(msgid,parentDiv){
    $('.tooltips_main').fadeOut("slow");
    $('.tooltips_main').remove();
}
function hideAllTooltips(){
	$('.tooltips_main').fadeOut("slow");
	$('.tooltips_main').remove();
}
function allTooltipsExists(formId){
	var main = $("#"+formId).find('.tooltips_main');
	if (main.length > 0) return true;
	return false;
}
/*End error message tooltips*/

/* contact js*/
function __addManager() {
		hideAllTooltips();
		var ckh_result = true;
 		var mname=document.getElementById('name2').value;
 		if(mname==""){
 		    showTooltips('name2_id','请输入联系人姓名');
 		    ckh_result = false;
 		}
 		var email=document.getElementById('email2').value;
 		if(email==""){
 				showTooltips('email2_id','请输入联系人邮箱');
 		    ckh_result = false;
 		}
 		var mobile=document.getElementById('mobile2').value;
 		var gtalk=document.getElementById('gtalk2').value;
 		var msn=document.getElementById('msn2').value;
		if (ckh_result == false){
        	return ;
    }else{
    	var mname = encodeURI(mname).replace(/&/g,'%26') ;
 			var d = loadJSONDoc('/seeI/addManagerForOther/?name='+mname+'&mobile='+mobile+'&email='+email+'&gtalk='+gtalk+'&msn='+msn) ;
    	d.addCallbacks(onAddManagerSuccess,onAddManagerFail);
    	disablePopup();
    }
 }
 onAddManagerSuccess = function(data){
    //var manager = document.getElementById('apps')
    var iText = data.man.name ;
    var iValue = data.man.id ;
    $('#apps_select').append("<option value='"+iValue+"'>"+iText+"</option>");
    //manager.options.add(new Option(iText,iValue)) ;
    alert("添加成功！");
 }
 onAddManagerFail = function(){
    alert("添加失败！");
 }


	var conStauts = 0;
	function loadPopup(){   
		if(conStauts==0){
			if($.browser.msie && $.browser.version<7){
				showImg();
			}
			writeHtml();
			$("#contact_bg").css({   
				"opacity": "0.7"  
			});   
			$("#contact_bg").fadeIn("slow");   
			$("#contact_pop").fadeIn("slow");   
			conStauts = 1;   
			}
	}  
	
	function showImg(){
		$('#apps').css({'display':'none'});
		$('#apps_select').css({'display':'none'});
		$('#apps').parent().append("<img class='select_border' src='http://img.webluker.com/img_new/select_border.gif'/>");
		$('#apps_select').parent().append("<img class='select_border' src='http://img.webluker.com/img_new/select_border.gif'/>");
	}
	function hiddenImg(){
		$('#apps').css({'display':''});
		$('#apps_select').css({'display':''});
		$('.select_border').remove();
	}
	
	function disablePopup(){
		if(conStauts==1){
			$("#contact_bg").fadeOut("slow");
			$("#contact_pop").fadeOut("slow");
			if($.browser.msie && $.browser.version<7){
				hiddenImg();
			}
			conStauts = 0;
			removePopChild()
		}   
	} 
	function removePopChild(){
		$('#for_remove_child').remove();
	}
	
	function centerPopup(){   
		var windowWidth = document.documentElement.clientWidth;   
		var windowHeight = document.documentElement.clientHeight;   
		var popupHeight = $("#contact_pop").height();   
		var popupWidth = $("#contact_pop").width();    
		$("#contact_pop").css({   
			"position": "fixed !important",
			"position": "absolute",
			"top": windowHeight/2-popupHeight/2,   
			"left": windowWidth/2-popupWidth/2   
		});
		if($.browser.msie && $.browser.version<7){
			//以下代码仅在IE6下有效
			ie6WindowWidth = document.body.scrollWidth;
			ie6WindowHeight = document.body.scrollHeight ;
			$("#contact_bg").css({   
				"height": ie6WindowHeight,
				"width": ie6WindowWidth   
			});
		}
	}
	
	function writeHtml(){
		$('#contact_pop').append("<div id='for_remove_child'><a id='contact_close' onclick='disablePopup();'>x</a><h1>添加联系人</h1><div style='float:left;width:100%;' class='pop_form'><div class='form_body'><div class='form_submit'><div class='fieldset' style='padding:0 0 10px 0;'><div class='fieldset_left' style='width:80% !important;'><div class='field-group'><label class='required title'>姓名</label><span class='control-group' id='name2_id'><div class='input_add_long_background'><input type='text' id='name2' /></div></span></div><div class='field-group'><label class='required title'>手机</label><span class='control-group'><div class='input_add_long_background'><input type='text' id='mobile2' /></div></span></div><div class='field-group'><label class='required title'>E-mail</label><span class='control-group' id='email2_id'><div class='input_add_long_background'><input type='text' id='email2' /></div></span></div><div class='field-group'><label class='required title'>Gtalk</label><span class='control-group'><div class='input_add_long_background'><input type='text' id='gtalk2' /></div></span></div><div class='field-group'><label class='required title'>MSN</label><span class='control-group'><div class='input_add_long_background'><input type='text' id='msn2' /></div></span></div></div></div></div><div class='div_submit'><input type='button' value='添加' class='button_button' id='c_add_button' onclick='__addManager()'/></div></div></div></div>");
	}
	
$(document).ready(function(){
	
	$("#contact_link").click(function(){
		centerPopup();
		loadPopup();
	});
	
	
	
	$("#contact_bg").click(function(){
		disablePopup();   
	});
	
	$(document).keypress(function(e){
		if(e.keyCode==27 && conStauts==1){
			disablePopup();
		}
	});
	
});

/* end contact js*/

/* Other Pop */
	function showProcess(objId){
		positionOtherPop(objId);
		if($("#"+objId).css('display')=='none'){  
			$("#"+objId).fadeIn("slow");   
		}
	}
	function hideProcess(objId){
		$("#"+objId).hide();
	}

	function showOtherPop(objId){
		if(objId=='' || objId==undefined || objId == null){
			objId='popupContact';
		}
		positionOtherPop(objId);
		if($("#"+objId).css('display')=='none'){
			$("#backgroundPopup").css({   
				"opacity": "0.7"  
			});   
			$("#backgroundPopup").fadeIn("slow");   
			$("#"+objId).fadeIn("slow");   
			}
	}

	function colseOtherPop(objId){
		if(objId=='' || objId==undefined || objId == null){
			objId='popupContact';
		}
		if($("#"+objId).css('display')!='none'){
				$("#backgroundPopup").fadeOut("slow");   
				$("#"+objId).fadeOut("slow");     
			}   
	} 
	
	function positionOtherPop(objId){
		if(objId=='' || objId==undefined || objId == null){
			objId='popupContact';
		}
		var windowWidth = document.documentElement.clientWidth;//$(window).width();
		//var windowWidth = $(window).width();
		var windowHeight = document.documentElement.clientHeight;//$(window).height();
		//var windowHeight = $(window).height();
		var popupHeight = $("#"+objId).height();
		var popupWidth = $("#"+objId).width();
		//alert(windowHeight);
		//alert(popupHeight);
		$("#"+objId).css({
			"position": "absolute",
			"top": windowHeight/2-popupHeight/2,
			"left": windowWidth/2-popupWidth/2,
			"background": "#FFFFFF",
			"border": "2px solid #CECECE",
			"z-index": "4",
			"padding":"12px"
		});
		$("#"+objId+" a.colse").css({
			"color": "#6FA5FD",
			"font-size": "14px",
			"line-height": "14px",
			"right": "6px",
			"top": "4px",
			"position": "absolute",
			"font-weight": "700",
			"display": "block",
			"cursor": "pointer"
		});
		$("#"+objId+" h1").css({
			"color": "#6FA5FD",
			"font-size": "22px",
			"text-align": "center",
			"padding-bottom": "2px",
			"margin-bottom": "20px",
			"font-weight": "700"
		});
		if($.browser.msie && $.browser.version<7){
			windowWidth = document.body.scrollWidth;
			windowHeight = document.body.scrollHeight ;
			//以下代码仅在IE6下有效
			$("#backgroundPopup").css({
				"height": windowHeight,
				"width": windowWidth
			});
		}
		
	}

function simulateEvent(name) {
	if(document.all) {
		document.getElementById(name).click();
	} else {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, true);
		document.getElementById(name).dispatchEvent(evt);
	}
}

$(document).ready(function(){
	$("#pop_button").click(function(){
		showOtherPop();
		//alert("test");
		simulateEvent("pop_button_callback");
	});
	$("#popupContactClose").click(function(){
		colseOtherPop();
		simulateEvent("popupContactClose_callback");
	});
	$("#backgroundPopup").click(function(){
		simulateEvent("popupContactClose");
		simulateEvent("btn_and_popupContactClose");
		//colseOtherPop();
	});
});

/* Other Pop */

/*去除超链接的虚线框*/
$(document).ready(function(){
	$('a').bind('focus',function(){if(this.blur)this.blur();});
}); 
/*end*/

/*CopyRight*/
$(function(){
	var date = new Date();
  var year = date.getFullYear();
	$('#copyright').append(year);
});
/*end CopyRight*/

/*左侧虚浮菜单*/
function set3ndMenu(dataList,targetId){
	if(typeof(targetId)=='undefind'){return;}
	var targetObj = $('#'+targetId);
	var tObj = targetObj.replaceWith("<span id='"+targetId+"' class='box_title_text' style='cursor:pointer;position:relative;'><span style='z-index:2;display:inline-block;'><a>"+targetObj.text()+"</a><span class='more_botton'></span><div class='menu_4th' id='menu_4th_"+targetId+"'></div></span></span>");
	
	$('#menu_4th_'+targetId).append("<div class='circle_box'><div class='rb1'></div><div class='rb2'></div><div class='rb3' id='menu_4th_"+targetId+"_content_value'></div><div class='rb2'></div><div class='rb1'></div></div>");
	
	rContent = $('#menu_4th_'+targetId+'_content_value');
	var rText = "<ul class=''>";
	for(var i=0;i<dataList.length;i++){
		var whic=dataList[i][1].replace(/\//g,'$');
		rText += "<li class='menu_4th_li'><a onclick='sendRequest(\""+whic+"\");'>"+ dataList[i][0] +"</a></li>" ;
	}
	rText += "</ul>";
	rContent.append(rText);
	
	var menuStatus = 0;
	var bindStatus = 0;
	
	$('#'+targetId).hover(
		function(){
			if(menuStatus == 0){
				$("#menu_4th_"+targetId).fadeIn("fast",function(){
					if(bindStatus == 0){
						$('.menu_4th_li').bind('mouseover mouseout',function(){
							$(this).toggleClass('menu_4th_li_over');
							bindStatus = 1;
						});
					}
				});
				menuStatus = 1;
			}
		},
		function(){
			if(menuStatus == 1){
				$("#menu_4th_"+targetId).fadeOut("fast");
				menuStatus = 0;
			}
		}
	);
}
/*end左侧虚浮菜单*/

function sendRequest(whic){
	  var domain_id=document.getElementById("domain_id").value;
		if(parseInt(domain_id)==0){
			  var fullUrl=window.location.href;
		    var uriList=fullUrl.split('=');
		    domain_id=uriList[1]
		}
		var uri=whic.replace(/\$/g,'/');
    window.location.href=uri+domain_id;
}

function set3ndMenuWithoutId(dataList,targetId){
	if(typeof(targetId)=='undefind'){return;}
	var targetObj = $('#'+targetId);
	var tObj = targetObj.replaceWith("<span id='"+targetId+"' class='box_title_text' style='cursor:pointer;position:relative;'><span style='z-index:2;'><a>"+targetObj.text()+"</a><span class='more_botton'></span><div class='menu_4th' id='menu_4th_"+targetId+"'></div></span></span>");
	
	$('#menu_4th_'+targetId).append("<div class='circle_box'><div class='rb1'></div><div class='rb2'></div><div class='rb3' id='menu_4th_"+targetId+"_content_value'></div><div class='rb2'></div><div class='rb1'></div></div>");
	
	rContent = $('#menu_4th_'+targetId+'_content_value');
	var rText = "<ul class=''>";
	for(var i=0;i<dataList.length;i++){
		var whic=dataList[i][1]
		rText += "<li class='menu_4th_li'><a href='"+whic+"'>"+ dataList[i][0] +"</a></li>" ;
	}
	rText += "</ul>";
	rContent.append(rText);
	
	var menuStatus = 0;
	var bindStatus = 0;
	
	$('#'+targetId).hover(
		function(){
			if(menuStatus == 0){
				$("#menu_4th_"+targetId).fadeIn("fast",function(){
					if(bindStatus == 0){
						$('.menu_4th_li').bind('mouseover mouseout',function(){
							$(this).toggleClass('menu_4th_li_over');
							bindStatus = 1;
						});
					}
				});
				menuStatus = 1;
			}
		},
		function(){
			if(menuStatus == 1){
				$("#menu_4th_"+targetId).fadeOut("fast");
				menuStatus = 0;
			}
		}
	);
}

/*右侧虚浮菜单*/
function set4ndMenu(dataList,targetId){
	if(typeof(targetId)=='undefind'){return;}
	var targetObj = $('#'+targetId);
	var ulText = "<ul class='box_buttom_list_ul'><li><a href='javascript:void(0);' class='add_record'>"+targetObj.text()+"</a></li>";
	var liText = "";
	$.each(dataList, function(i,item){
		if(dataList.length==i+1){
			liText += "<li><a href='"+item[1]+"' class='btn_hidden btn_last'>"+item[0]+"</a></li>";
		}else{
			liText += "<li><a href='"+item[1]+"' class='btn_hidden'>"+item[0]+"</a></li>";
		}
	});
	ulText = ulText + liText + "</ul>"
	targetObj.replaceWith("<span id='"+targetId+"' class='box_buttom_list'>"+ulText+"</span>");
	
	var targetObj = $('#'+targetId);
	
	$('.add_record').bind('click',function(){
		if($('.btn_hidden').css('display')=='none'){
			$('.add_record').addClass('add_record_press');
			$('.btn_hidden').slideDown("fast",function(){});
		}else{
			$('.btn_hidden').slideUp("fast",function(){
				$('.add_record').removeClass('add_record_press');
			});
		}
	});
	
	$('.btn_hidden:not(.btn_last)').bind('mouseover mouseout',function(){
		$(this).toggleClass('btn_over');
	});
	
	$('.btn_last').bind('mouseover mouseout',function(){
		$(this).toggleClass('btn_over_last');
	});
	
	$('.btn_hidden').bind('click',function(){
		$('.btn_hidden').slideUp("fast",function(){
			$('.add_record').removeClass('add_record_press');
		});
	})
	
}
/*end右侧虚浮菜单*/

function urlEncode(t){
	var uri=encodeURI(t).replace(/\//g,"%2f")
	return uri;
}
  
//var now = new Date();
//now.addDays(1);//加减日期操作
//alert(now.Format("yyyy-MM-dd"));
Date.prototype.Format = function(fmt) {
  var o ={ 
      "M+" : this.getMonth() + 1, //月份 
      "d+" : this.getDate(), //日 
      "h+" : this.getHours(), //小时 
      "m+" : this.getMinutes(), //分 
      "s+" : this.getSeconds(), //秒 
      "q+" : Math.floor((this.getMonth() + 3) / 3), //季度 
      "S" : this.getMilliseconds() //毫秒 
  }; 
  if (/(y+)/.test(fmt)) 
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)); 
  for (var k in o) 
      if (new RegExp("(" + k + ")").test(fmt)) 
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length))); 
  return fmt; 
}
Date.prototype.addDays = function(d){
   this.setDate(this.getDate() + d);
};
Date.prototype.addWeeks = function(w){
   this.addDays(w * 7);
};
Date.prototype.addMonths= function(m){
  var d = this.getDate();
  this.setMonth(this.getMonth() + m);
  if (this.getDate() < d)
      this.setDate(0);
};
Date.prototype.addYears = function(y){
  var m = this.getMonth();
  this.setFullYear(this.getFullYear() + y);
  if (m < this.getMonth()){
   this.setDate(0);
  }
};

function caculateBytelen(bytelen){
	if(bytelen>=1000000000)
		return (bytelen/1000000000).toFixed(2)+" GB";
	if((bytelen>=1000000) &&(bytelen<1000000000))
		return (bytelen/1000000).toFixed(2)+" MB";
	else if ((bytelen>=1000)&&(bytelen<1000000))
		return (bytelen/1000).toFixed(2)+" KB";
	else 
		return bytelen+" B";	
}
function __getTimeSlot(num){
	
	var startDay = new Date();
	var endDay = new Date();
	
	if(Number(num)==1){
		endDay.addDays(-1);
		startDay.addDays(-1);
		var end_time = endDay.Format("yyyyMMdd");
		var start_time = startDay.Format("yyyyMMdd");
	}else if(Number(num)==0){
		var end_time = endDay.Format("yyyyMMdd");
		var start_time = startDay.Format("yyyyMMdd");
	}else{
		var end_time = endDay.Format("yyyyMMdd");
		targetDay = Number("-"+num) + 1;
		startDay.addDays(targetDay);
		var start_time = startDay.Format("yyyyMMdd");
	}
	
	return [start_time,end_time];
}

/*三级和四级菜单
 *参数分别为：快速菜单，三级菜单，四级菜单，右上角按钮
 *若不是用，则用 '' 代替如: 
 *menu3 = {list:[['m1','菜单m1'],['m2','菜单m2'],['m3','菜单m3']],curNum:2}
 *$('#nav_tab').setMenu('',menu3,'');
 */
jQuery.fn.setMenu = function(menuqEx,menu3Ex,menu4Ex,btnEx){
	var qmenu = {
		title:'快速切换',
		eventFlag:false,
		list:[['','']]
	}
	var menu3 = {
		eventFlag:false,
		curNum:0,
		list:[['','']]
	}
	var menu4 = {
		eventFlag:false,
		curNum:0,
		list:[['','']]
	}
	var btn = {
		eventFlag:false,
		list:[['','']]
	}
	var init = function(obj){
		var menu3Obj = obj;
		var baseUl = "<ul class='nav_list'></ul>";
		var $baseUl = $(baseUl).appendTo(menu3Obj);
		if(menuqEx!=''){
			var qmenuHtml = "<li class='splid_list' id='splid'><a class='splid' href='javascript:void(0);' title='"+qmenu.title+"'></a><ul></ul></li>";
			var $qmenuHtml = $(qmenuHtml).appendTo($baseUl);
			var ulChildObj = $qmenuHtml.children('ul');
			var liHtml = '';
			if(qmenu.eventFlag==false){
				$.each(qmenu.list,function(h,t){
					liHtml += "<li><a href='"+t[0]+"'>"+t[1]+"</a></li>";
				});
			}else{
				$.each(qmenu.list,function(h,t){
					liHtml += "<li><a href='javascript:void(0);' onclick='"+t[0]+"'>"+t[1]+"</a></li>";
				});
			}
			$(liHtml).appendTo(ulChildObj);
			
		}
		if(menu3Ex!=''){
			var liHtml = '';
			if(menu3.eventFlag==false){
				$.each(menu3.list,function(h,t){
					if(h==menu3.curNum){
						liHtml += "<li><a class='nav_cur' href='"+t[0]+"'><span class='nav_l'></span><span class='nav_m'>"+t[1]+"</span><span class='nav_r'></span></a></li>";
					}else{
						liHtml += "<li><a class='nav' href='"+t[0]+"'><span class='nav_l'></span><span class='nav_m'>"+t[1]+"</span><span class='nav_r'></span></a></li>";
					}
				});
			}else{
				//onclick事件
				$.each(menu3.list,function(h,t){
					if(h==menu3.curNum){
						liHtml += "<li><a class='nav_cur' href='javascript:"+t[0]+"'><span class='nav_l'></span><span class='nav_m'>"+t[1]+"</span><span class='nav_r'></span></a></li>";
					}else{
						liHtml += "<li><a class='nav' href='javascript:"+t[0]+"'><span class='nav_l'></span><span class='nav_m'>"+t[1]+"</span><span class='nav_r'></span></a></li>";
					}
				});
			}
			$(liHtml).appendTo($baseUl);
		}
		if(menu4Ex!=''){
			var targetObj = $('#expand_menu_div');
			var cldHtml = "<div class='expand_menu_list'>";
			if(menu4.eventFlag==false){
				$.each(menu4.list,function(h,t){
					if(h==menu4.curNum){
						cldHtml += "<a href='"+t[0]+"' class='e_menu middle_cur'><span>"+t[1]+"</span></a>";
					}else{
						cldHtml += "<a href='"+t[0]+"' class='e_menu middle'><span>"+t[1]+"</span></a>";
					}
				});
			}else{
				//onclick事件
				$.each(menu4.list,function(h,t){
					if(h==menu4.curNum){
						cldHtml += "<a href='javascript:void(0);' onclick='"+t[0]+"' class='e_menu middle_cur'><span>"+t[1]+"</span></a>";
					}else{
						cldHtml += "<a href='javascript:void(0);' onclick='"+t[0]+"' class='e_menu middle'><span>"+t[1]+"</span></a>";
					}
				});
			}
			cldHtml += "</div>";
			$(cldHtml).appendTo(targetObj);
			if(targetObj.children().children(':first').hasClass('middle_cur')){
				targetObj.children().children(':first').removeClass('middle_cur');
				targetObj.children().children(':first').addClass('first_cur');
			}else{
				targetObj.children().children(':first').removeClass('middle');
				targetObj.children().children(':first').addClass('first');
			}
			if(targetObj.children().children(':last').hasClass('middle_cur')){
				targetObj.children().children(':last').removeClass('middle_cur');
				targetObj.children().children(':last').addClass('last_cur');
			}else{
				targetObj.children().children(':last').removeClass('middle');
				targetObj.children().children(':last').addClass('last');
			}
		}
		if(btnEx!=''){
			var html = "<span class='right'>";
			if(btn.eventFlag==false){
				$.each(btn.list,function(h,t){
						html += "<a class='add_btn2' href='"+t[0]+"'><span>"+t[1]+"</span></a>";
				});
			}else{
				//onclick事件
				$.each(btn.list,function(h,t){
						html += "<a class='add_btn2' href='javascript:void(0);' onclick='"+t[0]+"'><span>"+t[1]+"</span></a>";
				});
			}
			html += "</span>";
			menu3Obj.prepend(html);
		}
		setEvent();
	}
	var setEvent = function(){
		$('#splid').hover(
			function(){
				$(this).children('ul').show('fast');
			},
			function(){
				$(this).children('ul').hide('fast');
			}
		);
	}
	$.extend(qmenu,menuqEx);
	$.extend(menu3,menu3Ex);
	$.extend(menu4,menu4Ex);
	$.extend(btn,btnEx);
	init(this);
}
/*end三级和四级菜单*/
$(function(){
	$(".input_text").each(function(){
		var $input = $(this).parent().children('input:visible');
		if($input.val()!=''){
			$(this).hide();
		}
	});
	
	$(".textholder").each(function(){
		var $input = $(this).parent().children('input:visible');
		if($input.val()!=''){
			$(this).hide();
		}
	});
	
	$("input.with_textholder").focus(function(){
		$(this).parent().children('.textholder').hide();
	}).blur(function(){
		if($(this).val()==''){
			$(this).parent().children('.textholder').show();
		}
	});
	if($("p.textholder").length!=0){
		$("p.textholder").each(function(i){
			$(this).bind('click',function(){
				$(this).parent().children('input:visible').focus();
			});
	 	});
	}
});