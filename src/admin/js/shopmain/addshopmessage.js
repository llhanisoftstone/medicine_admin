/**
 * Created by Administrator on 2018/4/25.
 */
var base_url_member='/rs/store_classify';
var city_zone = '/rs/city_zone';
var compid;
var id;
$(function() {
    compid = getCookie('storeid');
    id=getQueryString("pid");
    UE.getEditor('userProtocolAddUE',{
        initialFrameWidth :'100%',//设置编辑器宽度
        initialFrameHeight:'600',//设置编辑器高度
        scaleEnabled:true//设置不自动调整高度
    });
    $.initSystemFileUpload($("#titleForm"), onUploadHeaderPic);
    $("#savebtn").unbind("click");
    $("#savebtn").bind("click",saveData);
    if(id){
        getmemberInfo();
    }
});
// 图片上传
function onUploadHeaderPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
function getmemberInfo(){
    zhget(base_url_member+"/"+id).then(function (result) {
        if(result.code==200){
            $("#name").val(result.rows[0].name);
            $("#category").val(result.rows[0].category);
            $("#title_pic1").val(result.rows[0].picpath);
            setTimeout(function() {
                var aimurl = targetUrl + "/upload";
                if (result.rows[0].details) {
                    result.rows[0].details = result.rows[0].details.replace(/\/upload|http:\/\/ht.lifeonway.com\/upload/g, aimurl);
                    UE.getEditor('userProtocolAddUE').setContent(result.rows[0].details);
                }
            },500);
        }
    })
}

function saveData(){
    var data = {};
    data.store_id=compid;
    var category=$("#category").val();
    if(category&&category!="-1"){
        data.category=category;
    }else{
        showError('请选择分类');
        return;
    }
    var name=$("#name").val().trim();
    if(name){
        data.name=name;
    }else{
        showError('请输入名称');
        return;
    }
    var picpath=$("#title_pic1").val();
    if(picpath){
        data.picpath=picpath;
    }else{
        showError('请上传图片');
        return;
    }
    var details=UE.getEditor('userProtocolAddUE').getContent();
    if(details){
        data.details=details;
    }else{
        showError('请输入内容');
        return;
    }
    $("#savebtn").attr("disabled","disabled");
    if(id){
        zhput(base_url_member+"/"+id,data).then(function (result) {
            if(result.code==200){
                $.hideActionLoading();
                showSuccess('修改成功')
                window.location.href="/admin/admin.html#pages/shopmain/shoplist.html";
                $("#savebtn").attr("disabled",false);
            }else{
                $.hideActionLoading();
                showError('修改失败');
                window.location.href="/admin/admin.html#pages/shopmain/shoplist.html";
                $("#savebtn").attr("disabled",false);
            }
        })
    }else{
        zhpost(base_url_member,data).then(function (result) {
            if(result.code==200){
                $.hideActionLoading();
                showSuccess('添加成功')
                window.location.href="/admin/admin.html#pages/shopmain/shoplist.html";
                $("#savebtn").attr("disabled",false);
            }else{
                $.hideActionLoading();
                showError('添加失败');
                window.location.href="/admin/admin.html#pages/shopmain/shoplist.html";
                $("#savebtn").attr("disabled",false);
            }
        })
    }

}
function backAlumniGrand(){
    window.location.href="/admin/admin.html#pages/shopmain/shoplist.html";
}
//删除banner
function onDeleteClick1(dom){
//baner非必须，直接移除
    $(dom).parent("td").parent("tr").remove();
}