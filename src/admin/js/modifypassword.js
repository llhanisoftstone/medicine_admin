/**
 * Created by Administrator on 2016/12/1.
 */

$(document).ready(function(){
    $(".pinput").find("input[name='sOldPassword']").val("");
    $(".pinput").find("input[name='sPassword']").val("");
    $("#UserModifySubmit").bind("click",modifyPassword);
})

function modifyPassword(){
    var oldPwd = $(".pinput").find("input[name='sOldPassword']").val();
    var password = $(".pinput").find("input[name='sPassword']").val();
    var data = {
        oldPwd:oldPwd,
        password:password
    };
    zhpost('/op/modiPwd',data).then(function(result){
        if(result.err){
            showError(result.message);
        }else{
            alert("修改成功，确定后请重新登录");
            window.location = 'adminLogin.html';
        }
    })
}