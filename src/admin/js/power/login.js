/**
 * Created by zhoutk on 16-7-26.
 */

var base_url_navs = '/rs/navs';
var base_url_links = '/rs/links';
var base_url_verify = '/op/verify';
var base_url_login = '/op/login';

var operation = "add";
var currentPageNo = 1;

function init() {
    getVerifyCode();
    $("#username").keydown(function (event) {
        if ( event.keyCode == 13) {
            if(check()){
                checkfrm();
            }else{
                alert('输入不正确')
            }
        };
    });
    $("#password").keydown(function (event) {
        if ( event.keyCode == 13) {
            if(check()){
                checkfrm();
            }else{
                alert('输入不正确')
            }
        };
    });
    $("#yanzheng").keydown(function (event) {
        if ( event.keyCode == 13) {
            if(check()){
                checkfrm();
            }else{
                alert('输入不正确')
            }
        };
    });
}

function getVerifyCode() {
    zhpost(base_url_verify, {} ).then(function (result) {
        $("#imgVerify").attr("src",JSON.parse(result).imgSrc);
    });
}

function queryLinksList() {
    zhget(base_url_links, {
        sort: 'orderid'
    }, function (result) {
        buildFirstPage(result, 'links-template', 'links-placeholder');
    });
}

function queryNavList() {
    zhget(base_url_navs, {}).then(function (result) {
        buildTable(result, 'navlinks-template', 'navlinks-placeholder');
    });
}

function check(){
    var name =$("#username").val();
    var password =$("#password").val();
    var yanzheng =$("#yanzheng").val();
    var boo=false;
    if(name!=''&&password!=''&&yanzheng!=''&&yanzheng.length>3&&yanzheng.length<5){
        boo = true;
    }
    return boo
}

function checkfrm() {
    var username = $('#username').val();
    var pwd = $('#password').val();
    var yanzheng = $('#yanzheng').val();
    if (username == "") {
        alert('请输入用户名！');
        $('#username').focus();
    }
    else if (pwd == "") {
        alert('请输入密码！');
        $('#password').focus();
    }else {
        if ($(".remUser").is(":checked")) {
            setCookie("adUsername", username);
        } else {
            delCookie("adUsername")
        }
        if ($(".remPad").is(":checked")) {
            setCookie("adPassword", pwd);
        } else {
            delCookie("adPassword");
        }
        zhpost(base_url_login, {
            username: username,
            yanzheng: yanzheng,
            password: pwd,
            power:1
        }).then( function (result) {
            var rs = result;
            if (rs.err) {
                 if(rs.code==605){
                     alert("您输入的密码有误")
                 }else if(rs.code==606){
                     alert("您输入的用户不存在")
                 }else if(rs.code==303){
                     alert("该账号被禁用，请联系管理员");
                 }else{
                     alert(rs.err);
                 }
                $('#username').focus();
            }
            else {
                sessionStorage.setItem('menu',JSON.stringify(rs.menu));
                setCookie('sid', rs.sid);
                setCookie('compid', rs.compid);
                setCookie('organiz_id', rs.organiz_id);
                setCookie('uid', rs.userid);
                setCookie('userrank', rs.userrank);
                setCookie('storeid', rs.store_id);
                sessionStorage.setItem("compid",rs.compid);
                sessionStorage.setItem("organiz_id",rs.organiz_id);
                sessionStorage.setItem("uid",rs.userid);
                sessionStorage.setItem("userrank",rs.userrank);
                window.location = 'admin.html';
            }
        });
    }
}
$(function () {
    var username = getCookie("adUsername")
    var pwd = getCookie("adPassword");
    if(username){
        $('#username').val(username);
        $(".remUser").attr("checked",true)
    }else{
        $('#username').val("");
        $(".remUser").attr("checked",false)
    }
    if(pwd){
        $('#password').val(pwd);
        $(".remPad").attr("checked",true)
    }else {
        $('#password').val("");
        $(".remPad").attr("checked",false)
    }
})