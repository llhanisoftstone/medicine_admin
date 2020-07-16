var base_url_drugs='/rs/drugs';
var operation = "add";
var id=0;
jQuery(function(){
    company();
    UE.getEditor('userProtocolAddUE1',{
        initialFrameWidth :'100%',//设置编辑器宽度
        initialFrameHeight:'400',//设置编辑器高度
        scaleEnabled:false//设置不自动调整高度
    });
})
$(function(){
    $.initSystemFileUpload($("#addBannerForm"), onUploadDetailPic);
    id=getIdByUrl();
    if(id){
        operation="modify";
        zhget(base_url_drugs+"/"+id).then(function (result){
            if(checkData(result,'get')){
                var data=result.rows[0];
                $("#common_name").val(data.common_name);
                $("#approval_number").val(data.approval_number)
                $("#comp_id").val(data.comp_id);
                $("#address").val(data.address);
                setTimeout(function(){
                    UE.getEditor('userProtocolAddUE1').setContent(data.details)
                },500)
            }
        })
    }
})

function company(){
    zhget('/rs/company').then( function(result) {
        var data = result.rows;
        var html = '';
        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].title+"</option>"
            }
        }
        $("#comp_id").html(html);
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
    location.href="admin.html#pages/drugs.html";
}
function onSaveClick() {
    var common_name=$("#common_name").val();
    var approval_number=$("#approval_number").val();
    var address=$("#address").val();
    var picpath=$('#picpath').val();
    var comp_id=$("#comp_id").val();

    if(!common_name){
        showError('请输入药品名称');
        return;
    }

    if(!approval_number){
        showError('请输入批准文号');
        return;
    }

    if(!address){
        showError('请输入药品生产地址');
        return;
    }

    if(!picpath){
        showError('请上传列表图');
        return;
    }

    var details=UE.getEditor('userProtocolAddUE1').getContent();
    if(!details){
        showError('请输入内容');
        return;
    }
    var data={
        common_name:common_name,
        approval_number: approval_number,
        address:address,
        comp_id:comp_id,
        picpath:picpath,
        details:details,
    }
    if(operation=='add'){
        $.showActionLoading();
        zhpost(base_url_drugs,data).then(function (result){
            $.hideActionLoading();
            if(checkData(result,'post')){
                back();
            }
        })
    }else{
        zhput(base_url_drugs+'/'+id,data).then(function (result){
            if(checkData(result,'put')){
                back();
            }
        })
    }
}
