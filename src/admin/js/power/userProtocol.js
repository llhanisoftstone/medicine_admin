/**
 * Created by Administrator on 2017/9/1.
 */
var base_url_notification="/rs/user_protocol";
var currentPageNo = 1;
var pageRows1 = 10;
var issearch=false;
$(document).ready(function(){
    $("#resetNotifiSearchBtn").bind("click", function(){
        $("#notificationSearchForm")[0].reset();
        queryList();
    });
    queryList();
    $("#searchNotifiData").unbind("click");
    $("#searchNotifiData").bind("click",searchNotification);
})
function newAddNotification(){
    window.location.href="admin.html#pages/userProtocolAdd.html";
}
function searchNotification(){
    issearch=true;
    currentPageNo=1;
    queryList();
}
function queryList(){
    var data={
        page: currentPageNo,
        size: pageRows1,
        order:"create_time desc",
        status:"<,9"
    }
    if(issearch){
        var title=$("#notifiTitle").val();
        if(title!=""||title!=null){
            data.name=title;
        }
        data.search=1;
    }
    zhget(base_url_notification,data).then(function(result){
        if (checkData(result, 'get', 'queryList', 'table-notification')) {
            departmentContact=result;
            for(var i=0;i<result.rows.length;i++){
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows1 + i + 1;
            }
            buildTableByke(result, 'notification-template', 'notification-placeholder', "paginator", queryList, 10);
        }
    })
}

// 编辑
function toModifyNotifiData(id){
    window.location.href="admin.html#pages/userProtocolAdd.html?id="+id;
}
//删除
function deleteData(id){
    zhput(base_url_notification+"/"+id,{status:9}).then(function(result) {
        if (result.code==200) {
            queryList();
            showSuccess('删除成功！');
        } else {
            showError('删除失败！');
        }
    })
}