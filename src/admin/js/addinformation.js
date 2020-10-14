var base_url_information='/rs/information';
var operation = "add";
var id=0;
jQuery(function(){
    UE.getEditor('userProtocolAddUE1',{
        initialFrameWidth :'100%',//设置编辑器宽度
        initialFrameHeight:'400',//设置编辑器高度
        scaleEnabled:false//设置不自动调整高度
    });
    $.initSystemFileUpload($("#addBannerForm"), onUploadDetailPic);
})
$(function(){
    getinfoType();
    id=getIdByUrl();
    if(id){
        operation="modify";
        zhget(base_url_information+"/"+id).then(function (result){
            if(checkData(result,'get')){
                var data=result.rows[0];
                $("#title").val(data.title);
                $("#infotype").val(data.type_id);
                $("#picpath").val(data.picpath);
                $("#author").val(data.author);
                setTimeout(function(){
                    UE.getEditor('userProtocolAddUE1').setContent(data.details)
                },500)
            }
        })
    }
})

function getinfoType(){
    $("#infotype").html('');
    zhget('/rs/information_type', {status: 1}).then( function(result) {
        var data = result.rows;
        var html = '<option value="-1">请选择</option>';
        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].name+"</option>"
            }
        }
        $("#infotype").html(html);
    });
}

// 图片上传
function onUploadDetailPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}

function back(){
    location.href="admin.html#pages/informationList.html";
}
function onSaveClick() {
    var title=$("#title").val();//标题
    var author=$("#author").val();//作者
    if(!title){
        showError('请输入文章标题');
        return;
    }
    var infotype=$("#infotype").val();//分类
    if(infotype == '-1'){
        showError('请选择文章分类');
        return;
    }
    var picpath=$("#picpath").val();//列表图
    if(!picpath){
        showError('请上传列表图');
        return;
    }

    if(!author){
        showError('请输入作者');
        return;
    }


    var details=UE.getEditor('userProtocolAddUE1').getContent();
    if(!details){
        showError('请输入内容');
        return;
    }
    var data={
        title:title,
        type_id: infotype,
        picpath: picpath,
        author:author,
        details:details
    }
    if(operation=='add'){
        $.showActionLoading();
        zhpost(base_url_information,data).then(function (result){
            $.hideActionLoading();
            if(checkData(result,'post')){
                back();
            }
        })
    }else{
        zhput(base_url_information+'/'+id,data).then(function (result){
            if(checkData(result,'put')){
                back();
            }
        })
    }
}
