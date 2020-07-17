var base_url_drugs='/rs/drugs';
var operation = "add";
var id=0;
jQuery(function(){
    UE.getEditor('userProtocolAddUE1',{
        initialFrameWidth :'100%',//设置编辑器宽度
        initialFrameHeight:'400',//设置编辑器高度
        scaleEnabled:false//设置不自动调整高度
    });
})
$(function(){
    company();
    $.initSystemFileUpload($("#addBannerForm"), onUploadDetailPic);
    id=getIdByUrl();
    if(id){
        operation="modify";
        zhget(base_url_drugs+"/"+id).then(function (result){
            if(checkData(result,'get')){
                var data=result.rows[0];
                $("#title").val(data.title);
                $("#common_name").val(data.common_name);
                $("#approval_number").val(data.approval_number)
                $("#comp_id").val(data.comp_id);
                $("#address").val(data.address);
                createBanner(result);
                setTimeout(function(){
                    UE.getEditor('userProtocolAddUE1').setContent(data.details)
                },500)
            }
        })
    }
})

function createBanner(result){
    var banner=(result.rows[0].picpath).split(",");
    if(banner!=null&&banner.length>0){
        for(var i =0;i<banner.length;i++){
            var bannerhtml="<tr>";
            if(banner[i].indexOf("http://")>-1){
                bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+banner[i]+'></td>';
            }else{
                bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+banner[i]+'></td>';
            }
            bannerhtml+='<td>  <button style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
            bannerhtml+="</tr>";
            $("#banner").append(bannerhtml);
        }
    }
}

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
    jQuery("#picfilelist").val("");
    jQuery("#upimg").val("");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
    if(fileComp.attr("id")=='picfile'){
        if(list.length > 0 && list[0].code == 200){
            jQuery("#picfilelist").val("");
            for(var i =0;i<list.length;i++){
                if ($("#banner tr").length >= 3 && fileComp.attr("id") == 'picfile'){
                    return showError("最多只能上传3张;");
                }
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                html+='<td><button  style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
                html+="</tr>";
                $("#banner").append(html);
            }
        }
    }
}

//删除图片
function onDeleteClick1(dom){
    $(dom).parent("td").parent("tr").remove();
}

function back(){
    location.href="admin.html#pages/drugs.html";
}
function onSaveClick() {
    var title=$("#title").val();
    var common_name=$("#common_name").val();
    var approval_number=$("#approval_number").val();
    var address=$("#address").val();
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

    var details=UE.getEditor('userProtocolAddUE1').getContent();
    if(!details){
        showError('请输入内容');
        return;
    }
    var data={
        title:title,
        common_name:common_name,
        approval_number: approval_number,
        address:address,
        comp_id:comp_id,
        details:details,
    }
    var bannerdoms=$("#banner").find("tr");
    var banner_json='';
    for(var i=0;i<bannerdoms.length;i++){
        if(i<bannerdoms.length-1){
            banner_json+=($(bannerdoms[i]).children().eq(0).children().attr("src")).replace(targetUrl,'')+",";
        }else{
            banner_json+=($(bannerdoms[i]).children().eq(0).children().attr("src")).replace(targetUrl,'');
        }
    }
    if(banner_json){
        data.picpath = banner_json;
    }else{
        return showError("请上传药品图片");
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
