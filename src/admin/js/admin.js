var localURL = 'http://'+location.hostname + (location.port ? ":" + location.port : "");
include("/configs.js");

function include(jssrc){
    $.ajax({type:'GET',url:localURL+jssrc,async:false,dataType:'script'});
}

function initEvent() {
    $(window).bind("load resize", function () {
        resizePage();
    })
}

function setlocalStorageCookie(name, value){
    localStorage.setItem(name, value);
}

function getlocalStorageCookie(name){
    return localStorage.getItem(name);
}

function dellocalStorageCookie(name){
    localStorage.removeItem(name);
}

function resizePage(){
    topOffset = 50;
    width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
        $('div.navbar-collapse').addClass('collapse')
        topOffset = 100; // 2-row-menu
    } else {
        $('div.navbar-collapse').removeClass('collapse')
    }

    height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
    height = height - topOffset;
    height = $("#side-menu").height();
    // height = this.window.innerHeight+20;
    if (height < 1) height = 1;
    if (height > topOffset) {
        var addheight=0
        if($("#side-menu li").hasClass("active")){
            $("#side-menu li").each(function(index){
                if($(this).hasClass("active")){
                    addheight=$(this).children("ul").length*$(this).height();
                }
            })
        }
        $("#page-wrapper").css("min-height", (height+addheight) + "px");
    }
}

function hashchangehandler() {
    var hash = window.location.hash || '#pages/home.html';
    hash = hash.replace("#", "");
    var tarpage = getlocalStorageCookie("thispage");
    var thisUrl = window.location.hash;
    if(thisUrl.indexOf("?")<0&&tarpage != hash){
        dellocalStorageCookie("thispage");
        // dellocalStorageCookie("pageRecord");
        dellocalStorageCookie("searchForm");
        $("#pageIndex").val("");
    }
    var trypage = getlocalStorageCookie("trypage");
    if(thisUrl.indexOf("?")<0&&trypage != hash){
        dellocalStorageCookie("trypage");
        delCookie("objtype");
    }
    var url = getCookie("url");
    divLoadPage(hash);
    scroll(0, 0);
    thisUrl = thisUrl.replace('#pages/','');
    $("ul.nav.collapse").removeClass('active');
    $("ul[urlid='"+thisUrl+"']").addClass('active');
    if($("ul[urlid='"+thisUrl+"']").not('active')){
        $("ul[urlid='"+url+"']").addClass('active');
    }
}

function onMenuClick(url,dom) {
    ajaxInitSession("/op/authorization", function (rs) {
        if (rs.username.length > 2) {
            if(location.hash.indexOf(url) >= 0){
                hashchangehandler();
            }
            //正常操作
            location.hash = url;
            setCookie("url",location.hash.replace('#pages/',''));
            // hashchangehandler(); 去掉，否则会导致界面ready方法执行2次

        }else {
            showError('登录超时，即将跳转到登录页面');
            setTimeout(
                "window.location = 'adminLogin.html';",1000);
        }
    });

}

function divLoadPage(url) {
    $.get(url, function (result) {
        $("#page-wrapper").html(result);
    });
}


function initPara() {
    // Messenger.options = {
    //     extraClasses: 'messenger-fixed messenger-on-bottom',
    //     theme: 'flat'
    // };
    Handlebars.registerHelper("math", function (lvalue, operator, rvalue,
                                                options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue,
            "idx": (lvalue + 1) + ((currentPageNo - 1) * pageRows)
        }[operator];
    });
}
function zhget(url, data, callback) {
    return zhajax(url, data, 'GET', callback);
}

function zhpost(url, data, callback) {
    return zhajax(url, data, 'POST', callback);
}

function zhput(url, data, callback) {
    return zhajax(url, data, 'PUT', callback);
}

function zhdelete(url, data, callback) {
    return zhajax(url, data, 'DELETE', callback);
}

function zhajax(url, data, type, callback) {
    if(type=='GET'){
        var result = $.ajax({
            url: targetUrl + url,
            headers:{"Authorization":"jwt " + getCookie('sid')},
            data: data,
            // data: data,
            type: type,
            success: function (result, textStatus, jqXHR) {
                if (callback) {
                    callback(result);
                }
            }
        });
        return result;
    }else{
        var result = $.ajax({
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers:{"Authorization":"jwt " + getCookie('sid')},
            url: targetUrl + url,
            data: JSON.stringify(data),
            // data: data,
            type: type,
            success: function (result, textStatus, jqXHR) {
                if (callback) {
                    callback(result);
                }
            }
        });
        return result;
    }
}

function ajaxSynGet(url, data) {   //同步GET请求
    var result = $.ajax({
        url:  targetUrl + url,
        headers:{"Authorization":"jwt " + getCookie('sid')},
        data: data,
        async: false,
        type: 'GET',
    }).then(function (rs) {
        return rs;
    });
    return result;
}

function ajaxInitSession(url, callback) {   //专用于session初始调用
    $.ajax({
        url: targetUrl + url,
        headers:{"Authorization":"jwt " + getCookie('sid')},
        data: {},
        type: 'POST',
        success: function (result, textStatus, jqXHR) {
            if (callback) {
                callback(result);
            }
        }
    });
}

function upajax(url, data, callback) {
    return $.ajax({
        url: targetUrl + url,
        // data: data,
        headers:{"Authorization":"jwt " + getCookie('sid')},
        data: data,
        type: 'POST',
        processData: false,        //必须false才会避开jQuery对 formdata 的默认处理;XMLHttpRequest会对 formdata 进行正确的处理
        contentType: false,        //必须false才会自动加上正确的Content-Type
        success: function (result, textStatus, jqXHR) {
            if (callback) {
                callback(result);
            }
        }
    });
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            var c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

function setCookie(c_name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString())
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
/*
function showSuccess(message,time) {
    time = time?time:1.5;
    Messenger().post({
        message: message,
        type: 'success',
        hideAfter: time,//多长时间消失
        showCloseButton: true,
        id:'errorMsg'
    });
}
*/
function showError(message,time) {
    time = time?time:1.5;
    Messenger().post({
        message: message,
        type: 'error',
        hideAfter: time,//多长时间消失
        showCloseButton: true,
        id:'errorMsg'
    });
}
//换为layer.msg
function showSuccess(message,time) {
    time = time?time:1500;
    layer.msg(
        message,
        {
            icon: 1,
            time: time
        }
    );
}
function showError(message,time) {
    time = time?time:1500;
    layer.msg(
        message,
        {
            icon: 2,
            time: time
        }
    );
}
$._messengerDefaults = {
    extraClasses: 'messenger-fixed messenger-theme-future messenger-on-bottom'
}
function buildTableNoPage(datas, template, placeholder) {

    var temp = Handlebars.compile($("#" + template).html());
    $("#" + placeholder).html(temp({
        datas: datas.rows
    }));
}


function buildTable(datas, template, placeholder, callBack) {
    var temp = Handlebars.compile($("#" + template).html());
    $("#" + placeholder).html(temp({
        datas: datas.rows
    }));
    if (datas.count > 0) {
        buildPaginator('paginator', datas.count,callBack,datas.records);
    }
}

function buildPaginator(paginator, total,callBack,records) {
    var pageIndex = $("#pageIndex").val();
    if(pageIndex){
        $("#pageIndex").val("");
        currPage = pageIndex;
    }else{
        var currPage = $('.pagination .active').find('a').text();
    }
    if(!currPage||currentPageNo==1){
        currPage = 1;
    }
    var options = {
        currentPage: currPage,
        totalPages: total,
        numberOfPages:5,//显示的页码数，默认：5
        bootstrapMajorVersion: 3,
        onPageClicked: function (e, originalEvent, type, page) {
            currentPageNo = page;
            queryList();
            if(callBack){
                callBack(page,pageRows);
            }
        }
    };
    $('#' + paginator).bootstrapPaginator(options);
    $($('#' + paginator).siblings()).remove();
    var endPage = currPage*10;
    var startPage = endPage-9;
    var html = "<span id='pagSpan' style='display: block;float:left; margin: 20px 0; line-height: 30px; padding-right:15px;'>显示  "+startPage +"- "+endPage+" 条 共计 "+records+" 条</span><input onkeyup=\"this.value=this.value.replace(/\\D/g,'')\" placeholder='' max='"+total+"' type='number'id='goToPagePaginator' style='width: 60px;float:left; margin: 20px 0;' name='name' class='form-control ' maxlength='50'><div onclick='goToPagePaginator(\""+paginator+"\","+total+")' style='float: left;cursor:pointer;margin: 20px 10px;padding: 6px 12px;line-height: 1.42857143;color: #337ab7;text-decoration: none;background-color: #fff;border: 1px solid #ddd;'>GO</div>";
    $(html).insertBefore($('#' + paginator))
}
function goToPagePaginator(paginator,endPage){
    "use strict";
    var page=$("#goToPagePaginator").val();
    if(page==''){
        showError('请输入正确的页码');
        return;
    }else if(page>endPage){
        showError('页数不存在');
        return;
    }
    $("#" + paginator).bootstrapPaginator("show",page);
    currentPageNo = page;
    queryList();
}
//为了解决同一个页面有两个table用分页加载页码传入页码div的ID，查询列表的函数名fu,id为tableid的div存储当前页码
function buildTableByke(datas, template, placeholder,paginator,fu,sizePage,tableid,is_pageNo,callBack) {
    var temp = Handlebars.compile($("#" + template).html());
    $("#" + placeholder).html(temp({
        datas: datas.rows
    }));
    if (datas.count > 0) {
        buildPaginatorByke(paginator,datas.count,fu,callBack,datas.records,sizePage,tableid,is_pageNo);
    }
}


function buildPaginatorByke(paginator,total,fu,callBack,records,sizePage,tableid,is_pageNo) {
    var pageIndex = $("#pageIndex").val();
    if(pageIndex){
        $("#pageIndex").val("");
        currPage = pageIndex;
    }else{
        if(is_pageNo){
            var currPage =$("#"+tableid).attr("_pageNo");
        }else{
            var currPage = $('#'+paginator+' .active').find('a').text();
        }
    }
    if(!currPage||currentPageNo==1){
        currPage = 1;
    }
    var options = {
        currentPage: currPage,
        totalPages: total,
        numberOfPages:5,
        bootstrapMajorVersion: 3,
        onPageClicked: function (e, originalEvent, type, page) {
            currentPageNo = page;
            $("#"+tableid).attr("_pageNo",page);
            clickByke(function(){fu()});
            if(callBack){
                callBack(page,pageRows);
            }
        }
    };

    $('#' + paginator).bootstrapPaginator(options);
    $($('#' + paginator).siblings()).remove();
    var endPage = currPage*sizePage;
    var startPage = endPage-(sizePage-1);
    var html = "<span id='pagSpan' style='display: block;float:left; margin: 20px 0; line-height: 30px; padding-right:15px;'>显示  "+startPage +"- "+endPage+" 条 共计 "+records+" 条</span><input onkeyup=\"this.value=this.value.replace(/\\D/g,'')\" placeholder='' max='"+total+"' type='number'id='goToPagePaginator' style='width: 60px;float:left; margin: 20px 0;' name='name' class='form-control ' maxlength='50'><div id='gotoPage' style='float: left;cursor:pointer;margin: 20px 10px;padding: 6px 12px;line-height: 1.42857143;color: #337ab7;text-decoration: none;background-color: #fff;border: 1px solid #ddd;'>GO</div>";
    $(html).insertBefore($('#' + paginator));
    $("#gotoPage").click(function(){
        var thispage=$("#goToPagePaginator").val();
        if(thispage==''){
            showError('请输入正确的页码');
            return;
        }
        if(thispage>$("#goToPagePaginator").attr("max")){
            showError('页数不存在');
            return;
        }
        $("#" + paginator).bootstrapPaginator("show",thispage);
        currentPageNo = thispage;
        $("#"+tableid).attr("_pageNo",thispage);
        clickByke(function(){fu()});
    })
}
function clickByke(fu1){
    fu1();
}

function templateRender(data, id) {

    var temp = Handlebars.compile($("#" + id).html());
    $("#" + id).html(temp(data));

}
function buildTableByPage(datas, template, placeholder,isAppend){

    var temp = Handlebars.compile($("#"+template).html());
    if(!isAppend){
        $("#"+placeholder).html(temp({datas: datas}));
    }else{
        $("#"+placeholder).append(temp({datas: datas}));
    }
}
function loginout() {
    delCookie('signature')
    delCookie('compid');
    delCookie('organiz_id');
    delCookie('sid');
    delCookie('userrank');
    delCookie('storeid');
    sessionStorage.removeItem('organiz_id');
    sessionStorage.removeItem('compid');
    sessionStorage.removeItem('userrank');
    sessionStorage.removeItem('uid');
    window.location = 'adminLogin.html';
    // zhpost('/op/loginout', {}, function (rs) {
    //     if (rs.err) {
    //         alert(rs.error);
    //         $('#username').focus();
    //     }
    //     else {
    //         // window.location = rs.target;
    //         window.location = 'adminLogin.html';
    //     }
    // });
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
    initSession();
    $("#side-menu").bind("click",function(){
        resizePage();
    })
    //查询订单
    // getNewOrder();
    // setInterval(getNewOrder,60000);
})
var AUTHS = ['admin'];
function initSession() {
    ajaxInitSession("/op/authorization", function (rs) {
        var menuCookie = sessionStorage.getItem('menu');
        if (rs.code == 200 && rs.username && rs.username.length > 2 && rs.userrank > 2 && menuCookie) {
            setCookie('username', rs.username, 1);
            setCookie('userid', rs.userid, 1);
            if(rs.userrank>8||rs.compid==2){
                //如果是rank>8为超管时，或者compid=2为达人网管理的时候。显示所有列表内容，否则为供应商
                delCookie("compid");
            }else {
                setCookie('compid',rs.compid||2,1);
            }
            if(location.href.indexOf('Login') < 0) {
                // debugger
                var rows=JSON.parse(menuCookie)
                rows.sort(function(a,b){
                    return Number(a.order_code) < Number(b.order_code)
                })
                // console.log(rows)
                var res=JSON.parse(menuCookie)
                for(var i=0;i<res.length;i++){
                    for(j=0;j<res[i].subItem.length;j++){
                        var urlarr=res[i].subItem[j].url.split("?")
                        if(urlarr.length>1){
                            urlarr[0]=urlarr[0]+".html?"
                            res[i].subItem[j].url=urlarr.join("")
                        }else{
                            urlarr[0]=urlarr[0]+".html"
                            res[i].subItem[j].url=urlarr.join("")
                        }

                    }
               }
                buildTable({rows:res}, 'sideMenu-template', 'side-menu');
                $('#side-menu').metisMenu();
            }
            initEvent();
            initPara();
            $(window).bind('hashchange', hashchangehandler);
            hashchangehandler();
            var tmphash  = window.location.hash;
            tmphash = tmphash.replace('#pages/','');
            resizePage();
            $("#adminUser").html(rs.username);
            $("#admin_username").html(rs.username);
            $("ul[urlid='"+tmphash+"']").addClass('active');
            $("ul[urlid='"+tmphash+"']").parent('li').children("a").trigger('click');
        }
        else {                                    //没有特殊权限，不允许访问
            var curUrl = location.href;
            for (var al in AUTHS) {
                if (curUrl.indexOf(AUTHS[al]) > -1 && curUrl.indexOf('adminLogin')<=0) {
                    window.location = "adminLogin.html";
                }
            }
        }
        window.document.getElementsByTagName('body')[0].style.display = "block";
    });


}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var url = window.location.href;
    var params = url.substr(url.lastIndexOf("?"));
    var r = params.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}


/*视频管理*/
var curvideoId = 0, videoDeep = 0, videoDeeps = [0], videoDeepNames = ['当前位置:ROOT'];
function onVideoCategoryClick(curid, deep) {
    curvideoId = curid;
    videoDeep = deep;
    videoDeeps[videoDeep] = curid;
    if (videoDeep > 0) {
        var index = 0;
        for (index in video_category.rows) {
            var item = video_category.rows[index];
            if (item.id == curid) {
                videoDeepNames[videoDeep] = item.title;
                break;
            }
        }
    }
    $.get('pages/video_category.html', function (result) {
        $("#page-wrapper").html(result);
        updateLocationInfo();
    });
}

function updateLocationInfo() {
    $("#curLocation").html(videoDeepNames.slice(0, videoDeep + 1).join('>'));

}

/*信息管理*/
var curinfoId = 0, infoDeep = 0, infoDeeps = [0], infoDeepNames = ['当前位置:ROOT'];
function onInfoCategoryClick(curid, deep) {
    curinfoId = curid;
    infoDeep = deep;
    infoDeeps[infoDeep] = curid;
    if (infoDeep > 0) {
        var index = 0;
        for (index in infoCategory.rows) {
            var item = infoCategory.rows[index];
            if (item.id == curid) {
                infoDeepNames[infoDeep] = item.title;
                break;
            }
        }
    }
    $.get('pages/infoCategory.html', function (result) {
        $("#page-wrapper").html(result);
        updateInfoLocationInfo();
    });
}

function updateInfoLocationInfo() {
    $("#infocurLocation").html(CityZoneDeepNames.slice(0, CityZoneDeep + 1).join('>'));

}


/*行政区域管理*/
var curCityZoneId = 0, CityZoneDeep = 0, CityZoneDeeps = [0], CityZoneDeepNames = ['当前位置:ROOT'];
function onCityZoneClick(curid, deep) {
    curCityZoneId = curid;
    CityZoneDeep = deep;
    CityZoneDeeps[CityZoneDeep] = curid;
    if (CityZoneDeep > 0) {
        var index = 0;
        for (index in city_zone.rows) {
            var item = city_zone.rows[index];
            if (item.id == curid) {
                CityZoneDeepNames[CityZoneDeep] = item.name;
                break;
            }
        }
    }
    $.get('pages/city_zone.html', function (result) {
        $("#page-wrapper").html(result);
        updateCityZoneLocationInfo();
    });
}

function updateCityZoneLocationInfo() {
    $("#CityZoneCurLocation").html(CityZoneDeepNames.slice(0, CityZoneDeep + 1).join('>'));

}

/*菜单管理*/
var curMenuId = 0, MenuDeep = 0, MenuDeeps = [0], MenuDeepNames = ['当前位置:ROOT'];
function onMenu_ManageClick(curid, deep) {
    //debugger
    curMenuId = curid;
    MenuDeep = deep;
    MenuDeeps[MenuDeep] = curid;
    if (MenuDeep > 0) {
        var index = 0;
        for (index in menu.rows) {
            var item = menu.rows[index];
            if (item.id == curid) {
                MenuDeepNames[MenuDeep] = item.name;
                break;
            }
        }
    }
    $.get('pages/menu.html', function (result) {
        $("#page-wrapper").html(result);
        updateMenuLocationInfo();
    });

}

function updateMenuLocationInfo() {
    $("#MenuCurLocation").html(MenuDeepNames.slice(0, MenuDeep + 1).join('>'));
}

//这个只是针对后台url传参，在参数只有一个的情况下有效:http://localhost:3000/admin/admin.html#pages/goods/addGoods.html?id=13341####
function getIdByUrl() {
    var num=window.location.href.indexOf("#");
    var str=window.location.href.substr(num+1,window.location.href.length);
    console.log(str)
    var r=str.indexOf("=");
    if(r<0){
        return '';
    }
    var leng=str.indexOf("#")>-1?str.indexOf("#"):str.length+1;
    r=str.substring(r+1,leng);
    return r;
}
//获取页面的参数 paramName为参数名
function getUrlParamsValue(paramName) {
    var num=window.location.href.indexOf("#");
    var url=window.location.href.substr(num+1,window.location.href.length);
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    var i, j;
    for(i = 0; j = paraString[i]; i++) {
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
    }
    var returnValue = paraObj[paramName.toLowerCase()];
    //需要解码浏览器编码
    returnValue = decodeURIComponent(returnValue);
    if(typeof(returnValue) == "undefined") {
        return null;
    } else {
        return returnValue;
    }
}
function formatPriceFixed2(price,num) {
    if(price>1){
        return parseFloat(parseInt(price)/100).toFixed(2);
    }else {
        return parseFloat(price/100).toFixed(2);
    }

}

function getQueryByName(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式
    var num=window.location.href.indexOf("?");

    var str=window.location.href.substr(num+1,window.location.href.length);
    var r = str.match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
//返回数据和操作类型delete put post get,
function checkData(result,type,fu,thisTable,paginator) {
    var boo=false;
    $("#"+thisTable).find("#querylistnull").remove();
    switch (result.code){
        case 200:
            $("#"+thisTable).next("div").css("display","block");
            $(".center-block").show();
            $(".pagination").show();
            $("#"+thisTable).find("#querylistnull").remove();
            // $("#querylistnull").hide();
            switch (type){
                case 'delete':
                    showSuccess('删除成功');
                    break;
                case 'put':
                    showSuccess('修改成功');
                    break;
                case 'post':
                    showSuccess('保存成功');
                    break;
            }
            boo=true;
            break;
        case 204:
            switch (type){
                case 'delete':
                    showError('删除失败');
                    break;
                case 'put':
                    showError('修改失败');
                    break;
                case 'post':
                    showError('保存失败');
                    break;
            }
            break;
        case 205:
            showError('非法操作');
            break;
        case 301:
            showError('请检查您是否正确填写数据');//参数错误
            break;
        case 302:
            showError('请检查您是否正确填写数据');//参数错误
            break;
        case 303:
            showError('请检查您是否正确填写数据');//参数错误
            break;
        case 304:
            showError('此产品已参加其他活动');//参数错误
            break;
        case 601:
            showError('登录超时');//参数错误
            setTimeout(
                "window.location = 'adminLogin.html'",1000);
            break;
        case 602:
            // showError('请检查您是否正确填写数据');
            if(fu=='queryList'){
                $("#"+thisTable).next("div").css("display","none");
                $(".noresult").hide();
                $(".paginator").show();
                if(result.records=="0"){
                    $("#"+thisTable).children().children("tbody").html('');
                    $("#" + paginator).hide();
                    var html = "<div id='querylistnull'  style='text-align: center;line-height: 45px;' class=\"noresult  col-sm-12\">暂无内容</div>";
                    $("#"+thisTable).append(html)
                }
            }else{
                showError('暂无内容');
            }
            break;
        case 603:
            showError(err);
            break;
        case 604:
            showError(err);
            break;
        case 613:
            showError("该时间段信息已存在");
            break;
        case 500:
            showError("该信息已存在");
             break;
    }
    return boo;
}
Handlebars.registerHelper('geturl', function(v1, options) {
    if(v1.indexOf("?")>-1){
        return v1.replace("?",".html?");
    }
    return v1+".html";
});
function formReset(){
    var form = $(this);
    form.find("input").val("");
    var selects = form.find("select");
    selects.each(function(){
        var option = $(this).children();
        if (option.size() > 0)
        {
            option[0].selected = true;
        }
    });
    form.find("textarea").val("");
};

// el     ==> element ==> input元素;    ---------必填--------
// obj    ==> object  ==> {             ---------必填--------
// max    ==> number  ==> 最大位数;
// maxval ==> number  ==> 最大值
// minus  ==> bool    ==> 是否可以输入负数.  默认：不能输入负数;
// dec    ==> number  ==> 允许输入的小数位数,值为false时不能输入小数，
// }
function num_limit(el,obj){
    var minus=obj.minus||false;
    var dec=obj.dec||false;
    var max=obj.max;
    var maxval=obj.maxval;
    if(minus&&dec){//负数和小数
        el.value = el.value.replace(/[^\d.\-]/g,""); //清除"数字"和".""和"-"以外的字符
    }else if(minus){//负数
        el.value = el.value.replace(/[^\d\-]/g,""); //清除"数字"和"-"以外的字符
    }else if(dec){//小数
        el.value = el.value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
    }else{//正整数
        el.value = el.value.replace(/[^\d]/g,""); //清除"数字"和"."以外的字符
    }
    el.value = el.value.replace(/^\./g,""); //验证第一个字符是数字
    el.value = el.value.replace(/\.{2,}/g,"."); //只保留第一个., 清除多余的
    el.value = el.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
    el.value = el.value.replace(/\-{2,}/g,"-"); //只保留第一个字符-, 清除多余的
    el.value = el.value.replace(/^\-/g,"$#$").replace(/\-/g,"").replace("$#$","-");
    if(dec){
        var reg=new RegExp("^(\\-)*(\\d+)\\.(\\d{0,"+dec+"}).*$","i");
        el.value = el.value.replace(reg,'$1$2.$3'); //只能输入两个小数
    }
    if(el.value.length>max){  //最大位数
        el.value = el.value.substring(0,max);
    }
    if(maxval){
        maxval=Number(maxval);
        if(el.value>maxval){  //最大值
            el.value = maxval;
        }
    }
}
function isPhone(phone) {
    if (null == phone || "" == phone || undefined == phone) return false;
    var isMob=/^((\+?86)|(\(\+86\)))?(13[0123456789][0-9]{8}|15[0123456789][0-9]{8}|17[0123456789][0-9]{8}|18[0123456789][0-9]{8}|147[0-9]{8}|1349[0-9]{7}|19[0123456789][0-9]{8}|16[0123456789][0-9]{8})$/;
    return isMob.test(phone);
}

Handlebars.registerHelper('getpicurl', function(v1, options) {

    if(v1 && v1.substr(0,7).toLowerCase()=="http://"){
        return v1;
    }else{
        return targetUrl+v1;
    }
});

Handlebars.registerHelper('getprice', function(v1, options) {
    if(!v1){
        return 0;
    }
    return formatPriceFixed2(v1)
});
//加法
Handlebars.registerHelper('jiacount', function(v1,v2, options) {
    return parseFloat(v1)+parseFloat(v2);
});
//等于
Handlebars.registerHelper('equal', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
Handlebars.registerHelper('litingisuse', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
//不等于
Handlebars.registerHelper('budeng', function(v1,v2, options) {
    if(v1 != v2) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
//大于等于
Handlebars.registerHelper('GreaterthanorEqualto', function(v1,v2, options) {
    if(v1  >= v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});
//小于
Handlebars.registerHelper('Lessthan', function(v1,v2, options) {
    if(v1  < v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('getstatusname', function(value, options) {
    var statusname=["草稿","待审核","拒绝","上架","下架",'pc产品无状态']
    return statusname[value]
});
//判断是否在数组
Handlebars.registerHelper('isArr', function(v1,v2,options) {
    if(v2){
        v2=v2.split(",")
        for(var i=0;i<v2.length;i++){
            if(v1==v2[i]){
                return options.fn(this);
            }
        }
    }
});
//rank用户类型,
// 1-普通用户;2市场人员，3市场经理，4顾问，
// 5店长，6护士，7护士长，8产后服务技师，
// 9技师主管，10厨师，11厨师长，12，大区经理。
// 14销售主管，91-超级管理员。

Handlebars.registerHelper('torank', function(val) {
    if(val == 1){
        return "普通用户";
    }else if(val == 2){
        return "市场人员";
    }else if(val == 3){
        return "市场经理";
    }else if(val == 4){
        return "顾问";
    }else if(val == 5){
        return "店长";
    }else if(val == 6){
        return "护士";
    }else if(val == 7){
        return "护士长";
    }else if(val == 8){
        return "产后服务技师";
    }else if(val == 9){
        return "技师主管";
    }else if(val == 10){
        return "厨师";
    }else if(val == 11){
        return "厨师长";
    }else if(val == 12){
        return "大区经理";
    }else if(val == 14){
        return "销售主管";
    }else if(val == 91){
        return "超级管理员";
    }
});
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

String.prototype.endWith=function(s){
    if(s==null||s==""||this.length==0||s.length>this.length)
        return false;
    if(this.substring(this.length-s.length)==s)
        return true;
    else
        return false;
    return true;
}
String.prototype.startWith=function(s){
    if(s==null||s==""||this.length==0||s.length>this.length)
        return false;
    if(this.substr(0,s.length)==s)
        return true;
    else
        return false;
    return true;
}
//字符去空格
String.prototype.trim=function() {
    return this.replace(/(^\s*)|(\s*$)/g,'');
}
Handlebars.registerHelper("addOne",function(index,options){
    return parseInt(index)+1;
});

Handlebars.registerHelper('isThisNum', function(v1,v2,options) {
    if(v1 != 0&&v1!=null&&v2 ==1&&v2!=null) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
Handlebars.registerHelper('isReject', function(v1,options) {
    if(v1 ==2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('isoldaddress', function(v1,options) {
    if(v1 == 1) {
        return options.fn(this);
    }
});
//价格转换
Handlebars.registerHelper('formatPrice', function(price, options) {
    if(price>=10000){
        return parseInt(price/100);
    }else{
        return parseFloat(price/100).toFixed(2);
    }
});
//价格转换
Handlebars.registerHelper('setPrice', function(price, options) {
    return parseFloat(price/100).toFixed(2);
});

// var orderBuyTypeName = ["团购","秒杀","普通购买","试用"];
var orderBuyTypeName = ['普通购买','团购','秒杀','拼团','试用','积分兑换'];

Handlebars.registerHelper('orderBuyType', function(v1,options) {
    console.log(v1)
    return orderBuyTypeName[v1]
});
Handlebars.registerHelper('setstatus', function(v1) {
    if(v1 == 0){
        return "待付款";
    }else if(v1 == 1){
        return "待接单";
    }else if(v1 == 2){
        return "制作中";
    }else if(v1 == 3){
        return "待取单";
    }else if(v1 == 4){
        return "待派送";
    }else if(v1 == 5){
        return "待评价";
    }else if(v1 == 6){
        return "交易完成";
    }else if(v1 == 7){
        return "交易取消";
    }else if(v1 == 8) {
        return "待退款";
    }else if(v1 == 9){
        return "已退款";
    }else if(v1 == 10){
        return "退款失败";
    }
});
Handlebars.registerHelper('forCategory', function(val) {
    switch (val){
        case 1:
            return "引流";
        case 2:
            return "回访";
        case 3:
            return "到店咨询并签约";
        case 4:
            return "接待";
        default:
            return '未知'

    }
});
Handlebars.registerHelper('forPurposeLevel', function(val) {
    switch (val){
        case 1:
            return "一般";
        case 2:
            return "有意向";
        case 3:
            return "无意向";
        default:
            return '未知'

    }
});
//判断是否为空
Handlebars.registerHelper('ifnotnull', function(v1, options) {
    if(v1!=null&&v1!=''&&v1!=0) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
//订单导出
function exportData() {
    var arr = [];
    var data = $("#userSearchForm").form2json();
    var searchcontent = $("#searchVal").val();
    if(searchcontent){
        var searchVal = searchcontent;
        data.searchVal = searchVal;
        if(searchVal.length > 0){
            arr.push(data.searchVal);
        }
    }
    for(var key in data){
        if(!key.endWith("_exp")){
            // searchVal.push(data[key]);
            // delete data[key];
        }else{
            if(key.endWith("_start_exp")){
                data[key.replace('_start_exp','')] = ">=," + data[key].replace('+',' ');
                delete data[key];
            }else if(key.endWith("_end_exp")){
                var tk = key.replace('_end_exp','');
                if(data[tk]){
                    data[tk] += ",<," + data[key].replace('+',' ');
                }else{
                    data[tk] += "<," + data[key].replace('+',' ');
                }
                delete data[key];
            }else{
                data[key.replace('_exp','')] = data[key];
                delete data[key];
            }
        }
    }
    if(data['order_number'] || data['sub_order_number'] || data['name'] || data['recv_name']){
        data.search=1;
    }
    if(data['status']){
        data.status = '=,' + data['status'];
        arr.push(data.status);
    }

    if(data['ticket_id']){
        var tp = data['ticket_id'] == 0? '=,0':'>,0';
        data.ticket_id = tp;
        arr.push(data.ticket_id);
    }
    if(data['vip_id_json']){
        var tp = data['vip_id_json'] == 0? '=,0':'>,0';
        data.card_pay_price = tp;
        arr.push(data.card_pay_price);
        delete data['vip_id_json'];
    }

    if(data['is_balance']){
        data.is_balance = '=,'+data['is_balance'];
        arr.push(data.is_balance);
    }
    data.consumption_category = '<>,'+5;
    if(data.activity_category){
        if(data.activity_category=="0_2"){
            //普通
            data.activity_category =0;
            data.consumption_category=2;
            arr.push(data.activity_category);
        }else if(data.activity_category=="1_2") {
            //团购
            data.activity_category =1;
            data.consumption_category=2;
            arr.push(data.activity_category);
        }else if(data.activity_category=="2_2"){
            //秒杀
            data.activity_category =2;
            data.consumption_category=2;
            arr.push(data.activity_category);
        }else if(data.activity_category=="0_3"){
            //试用
            data.activity_category =4;
            data.consumption_category=3;
            arr.push(data.activity_category);
        }else{
            //为form2Json自动取到的值，不做特殊处理
        }
    }
    if(data.sub_status){
        //退款状态检索
        if(data.sub_status==1){
            data.ins = ["sub_status",1,2,3,4];
            arr.push(data.ins);
            delete data.sub_status;
        }else if(data.sub_status==2){
            data.sub_status = 10;
            arr.push(data.sub_status);
        }else if(data.sub_status ==3){
            data.sub_status=9 ;
            data.apply_status=2;
            arr.push(data.apply_status);
        }else {
            //不做处理
        }

    }
    if(data.tran_price){
        //是否有运费
        if(data.tran_price>0){
            data.tran_price =">,0";
        }else {
            //无运费，数据为0，不用做处理
        }
    }
    if(data.pay_time){
        //如果支付时间检索，过滤待支付和失效
        if(!data.status){
            data.status="<>,0,<>,8"
        }
    }

    data.searchVal = searchVal;
    data.order='create_time desc';
    data.search=1;
    data.download = 1;
    var compid = getCookie("compid");
    data.comp_id=compid;
    if(!data.create_time&&!data.pay_time){
        alert("【下单开始时间、结束时间】与【支付开始时间、结束时间】至少有一组必须填写")
        return;
    }
    $.showActionLoading();
    zhget("/rs/v_order_main_search",data).then(function (res) {
        $.hideActionLoading();
        if(res.code==200&&res.path){
            window.location.href = targetUrl + res.path;
        }else{
            if(res.code == 602){
                showError("查无结果");
            }else{
                showError("订单导出失败");
            }

        }
    })
}

//订单导出
function exportunfilledData() {
    var data = {};
    var pay_time = getQueryString('pay_time');
    var before_0 = new Date(new Date().getTime()).Format('yyyy-MM-dd hh:mm:ss');
    var before_24 = new Date(new Date().getTime() - 24 * 60 *60 * 1000).Format('yyyy-MM-dd hh:mm:ss');
    var before_48 = new Date(new Date().getTime() - 48 * 60 *60 * 1000).Format('yyyy-MM-dd hh:mm:ss');
    var before_72 = new Date(new Date().getTime() - 72 * 60 *60 * 1000).Format('yyyy-MM-dd hh:mm:ss');
    var before_99 = new Date(1970,1,1).Format('yyyy-MM-dd hh:mm:ss');
    if(pay_time == 1){
        data.pay_time = '>,'+ before_24 +',<,'+ before_0;
    }else if(pay_time == 2){
        data.pay_time = '>,'+ before_48 +',<,'+ before_24;
    }else if(pay_time == 3){
        data.pay_time = '>,'+ before_72 +',<,'+ before_48;
    }else if(pay_time == 4){
        data.pay_time = '>,'+ before_99 +',<,'+ before_72;
    }
    data.sub_status = 1;
    // var data = $("#userSearchForm").form2json();
    // var searchcontent = $("#searchVal").val();
    // if(searchcontent){
    //     var searchVal = searchcontent;
    //     data.searchVal = searchVal;
    //     if(searchVal.length > 0){
    //         arr.push(data.searchVal);
    //     }
    // }
    // for(var key in data){
    //     if(!key.endWith("_exp")){
    //         // searchVal.push(data[key]);
    //         // delete data[key];
    //     }else{
    //         if(key.endWith("_start_exp")){
    //             data[key.replace('_start_exp','')] = ">=," + data[key].replace('+',' ');
    //             delete data[key];
    //         }else if(key.endWith("_end_exp")){
    //             var tk = key.replace('_end_exp','');
    //             if(data[tk]){
    //                 data[tk] += ",<," + data[key].replace('+',' ');
    //             }else{
    //                 data[tk] += "<," + data[key].replace('+',' ');
    //             }
    //             delete data[key];
    //         }else{
    //             data[key.replace('_exp','')] = data[key];
    //             delete data[key];
    //         }
    //     }
    // }
    // if(data['order_number'] || data['sub_order_number'] || data['name'] || data['recv_name']){
    //     data.search=1;
    // }
    // if(data['status']){
    //     data.status = '=,' + data['status'];
    //     arr.push(data.status);
    // }
    //
    // if(data['ticket_id']){
    //     var tp = data['ticket_id'] == 0? '=,0':'>,0';
    //     data.ticket_id = tp;
    //     arr.push(data.ticket_id);
    // }
    // if(data['vip_id_json']){
    //     var tp = data['vip_id_json'] == 0? '=,0':'>,0';
    //     data.card_pay_price = tp;
    //     arr.push(data.card_pay_price);
    //     delete data['vip_id_json'];
    // }
    //
    // if(data['is_balance']){
    //     data.is_balance = '=,'+data['is_balance'];
    //     arr.push(data.is_balance);
    // }
    data.consumption_category = '<>,'+5;
    // if(data.activity_category){
    //     if(data.activity_category=="0_2"){
    //         //普通
    //         data.activity_category =0;
    //         data.consumption_category=2;
    //         arr.push(data.activity_category);
    //     }else if(data.activity_category=="1_2") {
    //         //团购
    //         data.activity_category =1;
    //         data.consumption_category=2;
    //         arr.push(data.activity_category);
    //     }else if(data.activity_category=="2_2"){
    //         //秒杀
    //         data.activity_category =2;
    //         data.consumption_category=2;
    //         arr.push(data.activity_category);
    //     }else if(data.activity_category=="0_3"){
    //         //试用
    //         data.activity_category =4;
    //         data.consumption_category=3;
    //         arr.push(data.activity_category);
    //     }else{
    //         //为form2Json自动取到的值，不做特殊处理
    //     }
    // }
    // if(data.sub_status){
    //     //退款状态检索
    //     if(data.sub_status==1){
    //         data.ins = ["sub_status",1,2,3,4];
    //         arr.push(data.ins);
    //         delete data.sub_status;
    //     }else if(data.sub_status==2){
    //         data.sub_status = 10;
    //         arr.push(data.sub_status);
    //     }else if(data.sub_status ==3){
    //         data.sub_status=9 ;
    //         data.apply_status=2;
    //         arr.push(data.apply_status);
    //     }else {
    //         //不做处理
    //     }
    //
    // }
    // if(data.tran_price){
    //     //是否有运费
    //     if(data.tran_price>0){
    //         data.tran_price =">,0";
    //     }else {
    //         //无运费，数据为0，不用做处理
    //     }
    // }
    // if(data.pay_time){
    //     //如果支付时间检索，过滤待支付和失效
    //     if(!data.status){
    //         data.status="<>,0,<>,8"
    //     }
    // }
    //
    // data.searchVal = searchVal;
    data.order='create_time desc';
    data.download = 1;
    var compid = getCookie("compid");
    data.comp_id=compid;
    $.showActionLoading();
    zhget("/rs/v_order_main_search",data).then(function (res) {
        $.hideActionLoading();
        if(res.code==200&&res.path){
            window.location.href = targetUrl + res.path;
        }else{
            if(res.code == 602){
                showError("查无结果");
            }else{
                showError("订单导出失败");
            }

        }
    })
}
/**
 * 判断对象是否为{}
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject( obj ) {
    var name;
    for ( name in obj ) {
        return false;
    }
    return true;
}
function getNewOrder(){
    "use strict";
    zhpost('/rs/sh_unread_order').then(function (result) {
        if(result.code==200){
            var s_count=result.s_count;
            var y_count=result.y_count;
            var m_count=result.m_count;
            if((s_count&&s_count>0)||(y_count&&y_count>0)||(m_count&&m_count>0)){
                $("#admin_order_count").text("您有（"+(parseFloat(s_count)+parseFloat(y_count))+"）个新的订单,（"+parseFloat(m_count)+"）个新的认证");
                //需要根据类型判断显示哪个
                if(s_count&&s_count>0){
                    $("#message_order_list").show();
                }else{
                    $("#message_order_list").hide();
                }
                if(y_count&&y_count>0){
                    $("#message_bookingManagement").show();
                }else{
                    $("#message_bookingManagement").hide();
                }
                if(m_count&&m_count>0){
                    $("#message_auth").show();
                }else{
                    $("#message_auth").hide();
                }
                $("#message").animate({//显示有新用户下单
                    bottom : '5px',
                }, "slow");
            }
        }
    })
}
function closemessage(){
    "use strict";
    $("#message").animate({
        bottom : '-180',
    }, "slow");
}
/**********************获取历史定位start****/
/**
 * 返回历史定位
 * 注意1. 搜索表单中每一项需要有name属性，建议跟数据库字段设为一致
 *    2. HTML页面添加 <input id="pageIndex" type="hidden">
 *    3. 任何需要跳转的页面，需添加Math.random(),否则window.onbeforeunload监听不到,例如：
 *       location.href="admin.html?_t="+Math.random()+"#pages/goods/addGoods.html"
 *    4. 页面点击查询按钮时调用 saveSearchFormData(formId)方法，formId为当前页搜索项form的id
 *    5. 页面调用 locationHistory(formId)方法
 *    6. 页面加载完成调用backInitHistory()方法
 *    7. 是否为查询请使用isSearch=true或false;
 * **/
var isSearch=false; //是否查询
var searchForm; //查询条件JSON
var pageRecord;
//获取当前页面url
var currPageName  = (window.location.hash).replace('#','');
/**
 * 监听页面跳转
 * **/
function locationHistory(formId){
//当前页面跳转、刷新之前保存页码和表单数据，需要在页面跳转时添加Math.random(),否则监听不到
    window.onbeforeunload=function(){
        saveSearchFormData(formId);
    };
}
function saveSearchFormData(formId){
    searchForm = $("#"+formId).form2json();
    setlocalStorageCookie(currPageName,JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
}
/**
 * 页面返回后设置查询数据
 * **/
function backInitHistory(){
    getpageRecord();
    searchForm = getlocalStorageCookie(currPageName);
    searchForm = JSON.parse(searchForm);
    if(searchForm && searchForm != '{}'){
        dellocalStorageCookie(currPageName);
        isSearch=true;
        for(var key in searchForm){
            $("input[name='"+key+"']").val(searchForm[key]);
            $("select[name='"+key+"']").val(searchForm[key]);
        }
    }
}
/**
 * 获取跳转前当前页面页码
 *
 * **/
function getpageRecord(){
    pageRecord =parseInt(getlocalStorageCookie("pageRecord")) ;
    if(pageRecord && pageRecord > 0){
        dellocalStorageCookie("pageRecord");
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
    }
}
/**********************获取历史定位end***/