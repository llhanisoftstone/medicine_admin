/**
 * Created by Administrator on 2018/2/10.
 */
var base_url_infomation='/rs/infomation';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
function back(){
    history.go(-1);
}

$(function(){
    UE.getEditor('userProtocolAddUE');
    $('#goods_buttonid1').bind("click", onSaveClick1);
    var id=getQueryByName("id");
    var read=getQueryByName("read");
    var copy=getQueryByName("copy");
    if(read=='read'){
        $(".text-center").hide();
        $("#user_form input").attr("disabled","disabled");
        $("#user_form select").attr("disabled","disabled");
        $("#user_form button").attr("disabled","disabled");
    }
    if(copy=='copy'){
        $(".text-center").hide();
        $(".copyGoods").show();
    }
    if(id==''||id==null){
        operation = "add";
        status()
    }else{
        operation = "modify";
        getGoodsById(id);
    }
    $.initSystemFileUploadnotLRZ($("#titleForm"), onUploadDetailPic);

});

function compare(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}
function onUploadDetailPic(formObject, fileComp, list) {
    var attrs = fileComp.attr("refattr");
    if(list.length>1){
        for(var i =0;i<list.length;i++){
            list[i].filename=list[i].filename.split('.')[0];
        }
        list.sort(compare('filename'));
    }
    if(attrs){
        if(list.length > 0 && list[0].code == 200){
            var sAttachUrl = list[0].url;
            $("#"+attrs, formObject).val(sAttachUrl);
        }
    }else if(fileComp.attr("id")=='picfile'){
        if(list.length > 0 && list[0].code == 200){
            for(var i =0;i<list.length;i++){
                var order_code=i+1;
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                html+='<td> <input value="'+order_code+'" type="text" style="margin-top: 35px;" class="form-control"  datatype="require"> </td>';
                html+='<td><button  style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
                html+="</tr>";
                $("#banner").append(html);
            }
        }
    }else{
        if(list.length > 0 && list[0].code == 200){
            fileComp.parents(".input-group-addon").prev().val(list[0].url)
        }
    }
}

//根据id查询产品数据
function getGoodsById(id){
    $.showActionLoading();
    zhget("/rs/infomation/"+id).then(function(result) {
        $.hideActionLoading();
        if(result.code == 200){
            $("#id").val(result.rows[0].id);
            $("#title").val(result.rows[0].title);
            $("#pic_abbr").val(result.rows[0].pic_abbr);
            $("#remark").val(result.rows[0].remark);
            $("#unique_code").val(result.rows[0].unique_code);
            setTimeout(function(){
                UE.getEditor('userProtocolAddUE').setContent(result.rows[0].details);
            },300);
        }
    });

}
//上架下架
function status(selected){
    var status = $("#status");
    status.val(selected);

}

function onSaveClick1(){
    saveData()
}
function  saveData(){
    var title=$.trim($("#title").val());
    if(title==""){
        return showError("请输入标题");
    }else if(title.length<=2){
        return showError("标题名称长度至少为3个字");
    }
    var pic_abbr = $("#pic_abbr").val();
    var remark=$.trim($("#remark").val());
    var unique_code = $("#unique_code").val();
    var data={
        title:title,
        pic_abbr:pic_abbr,
        remark:remark,
        unique_code:unique_code,
    };
    var details = UE.getEditor('userProtocolAddUE').getContent();
    if(details==""){
        return showError("请输入详情");
    }else{
        data.details=details;
    }
    $.showActionLoading();
    $(this).attr("disabled","disabled");
    var id = $("#id").val();
    if (!id) {
        zhpost(base_url_infomation,data).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                location.href="admin.html#pages/policy/policyList.html"
            }
        });
    } else {
        zhput(base_url_infomation + "/" + id, data).then(function(result) {
            if(checkData(result,'put')) {
                location.href="admin.html#pages/policy/policyList.html"
            }
        });
    }
}



