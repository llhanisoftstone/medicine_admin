var base_url_login = '/op/login';

var operation = "add";
var currentPageNo = 1;
$(function() {
    $(".addNewDiv").load('dome1.html',function(){

    });
    $("#username").blur(function(){
        $(".hidetsusername").hide();
    })
    $("#password").blur(function(){
        $(".hidetsmodefined").hide();
    })
});

$("#username").keydown(function (event) {
    if ( event.keyCode == 13) {
        if(check()){
            checkfrm();
        }else{
            showError('输入不正确')
        }
    };
});
$("#username").blur(function(){
    $(".hidetsusername").hide();
})
$("#password").blur(function(){
    $(".hidetsmodefined").hide();
})
$("#password").keydown(function (event) {
    if ( event.keyCode == 13) {
        if(check()){
            checkfrm();
        }else{
            showError('输入不正确')
        }
    };
});

function check(){
    var name =$("#username").val();
    var password =$("#password").val();
    var boo=false;
    if(name!=''&&password!=''){
        boo = true;
    }
    return boo
}

function checkfrm() {
    var username = $('#username').val();
    var pwd = $('#password').val();
    if (username == "") {
        $(".hidetsusername").html('用户名不能为空，请输入');
        $(".hidetsusername").show();
    }else if (pwd == "") {
        $(".hidetsmodefined").html('密码不能为空，请输入');
        $(".hidetsmodefined").show();
    }else if(pwd.length<6||pwd.length>20){
        $(".hidetsmodefined").html('请输入6-20位密码');
        $(".hidetsmodefined").show();
    }else{
        $(".hidetsmodefined").html('');
        $(".hidetsmodefined").hide();
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
            password: pwd,
            power:1
        }).then( function (result) {
            var rs = result;
            if (rs.err) {
                if(rs.code==605){
                    $(".hidetsmodefined").html('您输入的密码有误，请重新输入');
                    $(".hidetsmodefined").show();
                }else if(rs.code==606){
                    $(".hidetsusername").html('您输入的用户不存在，请重新输入');
                    $(".hidetsusername").show();
                }else if(rs.code==303){
                    $(".hidetsusername").html('该账号被禁用，请联系管理员');
                    $(".hidetsusername").show();
                }else if(rs.code==304){
                    $(".hidetsusername").html('该账号被禁用，请联系管理员');
                    $(".hidetsusername").show();
                }else if(rs.code==604){
                    $(".hidetsusername").html('该账号没有登陆权限');
                    $(".hidetsusername").show();
                }else{
                    showError(rs.err);
                }
                $('#username').focus();
            }
            else {
                showSuccess('登录成功')
                sessionStorage.setItem('menu',JSON.stringify(rs.menu));
                setCookie('sid', rs.sid);
                setCookie('compid', rs.compid);
                setCookie('organiz_id', rs.orgid);
                setCookie('uid', rs.userid);
                setCookie('userrank', rs.userrank);
                setCookie('storeid', rs.store_id);
                setCookie('username', rs.username);
                sessionStorage.setItem("username",rs.username);
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