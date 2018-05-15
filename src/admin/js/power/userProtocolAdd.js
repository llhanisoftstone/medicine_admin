




/**
 * Created by Administrator on 2017/9/1.
 */
var base_url_notification="/rs/user_protocol";
var postoff=false;
$(document).ready(function(){
    $("#saveNotifiData").unbind("click");
    $("#saveNotifiData").bind("click",saveNotificationData);
    // organizationList();
    setTimeout(function(){
        modifyNotificationData();
    },200)
})
function backNotification(){
    window.location.href="admin.html#pages/userProtocol.html";
}

function saveNotificationData(){

    var title=$("#notititle").val();
    //var organization=$("#notifiname").val();
    //var picpath=$("#title_pic1").val();
    //var notiDeatils=$("#notiDeatils").val();
    var  details=editor.getData();
    if(title==""||title==null){
        return showError("请输入标题");
    }
    if(details==""||details==null){
        return showError("请输入内容");
    }

    var data={
        name:title,
        context:details
        // organization:organization
    }


    var id=getQueryString("id");
    if(postoff){
        return;
    }
    postoff=true;
    if(id==""||id==null){
        zhpost(base_url_notification,data).then(function(result){
            if(result.code==200){
                backNotification();
                setTimeout(function(){
                    postoff=false;
                },1000);
                showSuccess("添加成功");
            }else{
                setTimeout(function(){
                    postoff=false;
                },1000);
                showError("添加失败");
            }
        })
    }else{
        zhput(base_url_notification+"/"+id,data).then(function(result){
            if(result.code==200){
                backNotification();
                setTimeout(function(){
                    postoff=false;
                },1000);
                showSuccess("修改成功");
            }else{
                setTimeout(function(){
                    postoff=false;
                },1000);
                showError("修改失败");
            }
        })
    }
}
function modifyNotificationData(){
    var id=getQueryString("id");
    CKEDITOR.instances.myContent.setData(' ');
    zhget(base_url_notification + "/" + id).then(function (result) {
        if (result.code == 200) {
            console.log(result+"aaaaaaaaaa")
            var notifiData = result.rows[0];
                $("#notiId").val(notifiData.id);
                $("#notititle").val(notifiData.name)
                editor.setData(notifiData.context);
        }
    })

}