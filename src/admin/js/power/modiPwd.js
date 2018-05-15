/**
 * Created by kechen on 2015-6-25.
 */
var base_url_login = '/op/modiPwd';

function modifrm() {
    var username = $('#username').val();
    var oldPwd = $('#oldPwd').val();
    var newPwd = $('#password').val();
    if (oldPwd == "") {
        alert('原密码不正确!');
        $('#oldPwd').focus();
    }
    if (newPwd == "") {
        alert('请输入密码!');
        $('#password').focus();
    }
    else {
        zhpost(base_url_login, {
            username: getCookie('username'),
            oldPwd: oldPwd,
            password: newPwd
        }).then( function (result) {
            var rs = JSON.parse(result);
            if (rs.outcome == 0) {
                alert(rs.error);
                $('#username').focus();
            }
            else {
                alert("新密码修改成功!");
                $('#oldPwd').val('');
                $('#password').val('');
            }
        });
    }
}
