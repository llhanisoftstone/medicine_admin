/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/ticket';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
$(function(){
    compid = getCookie('storeid');
    id=getQueryString("pid");
    UE.getEditor('userProtocolAddUE',{
        initialFrameWidth :'100%',//设置编辑器宽度
        initialFrameHeight:'600',//设置编辑器高度
        scaleEnabled:true//设置不自动调整高度
    });
    if(id==''||id==null){
        operation = "add";
    }else{
        operation = "modify";
        getGoodsById(id);
    }

    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);

});
function back(){
    history.go(-1);
}
function onUploadDetailPic(formObject, fileComp, list) {
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
//根据id查询产品数据
function getGoodsById(id){

    $.showActionLoading();
    zhget(base_url_goods+"/"+id,{}).then(function(result) {
        $.hideActionLoading();
        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#title_pic").val(result.rows[0].picurl);
        $("#sale_price").val(formatPriceFixed2(result.rows[0].price));
        var aimurl = targetUrl+"/upload";
        setTimeout(function(){
            if(result.rows[0].details){
                var details = result.rows[0].details.replace(/\/upload|http:\/\/ht.lifeonway.com\/upload/g, aimurl);
                UE.getEditor('userProtocolAddUE').setContent(details);
            }
        },500)

    });

}

function  saveData(){
    //获取产品基本信息
    var name=$.trim($("#name").val());
    if(!name||name.trim()==""){
        showError("请输入产品名称");
        return;
    }
    var title_pic=$.trim($("#title_pic").val());
    if(!title_pic||title_pic.trim()==""){
        showError("请上传图片");
        return;
    }
    var price_leaguer=$.trim($("#sale_price").val());
    if(!price_leaguer||price_leaguer==""||price_leaguer<=0){
        showError("请输入价格！");
        return;
    }
    //获取详情列表数据
    var details=UE.getEditor('userProtocolAddUE').getContent();
    if(!details||details==""){
        showError('请输入详情');
        return;
    }
    var url="/rs/ticket";
    var urldata={
        name:name,
        picurl:title_pic,
        price:price_leaguer*100,
        details:details,
        store_id:compid
    };
    saveData=null;
    if (operation == "add") {
        urldata.auto_id="1";
        $.showActionLoading();
        zhpost(url,urldata).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                location.href="admin.html#pages/goods/goodslist.html";
            }
        });
    } else {
        var id = $("#id").val();
        console.log('修改操作>>>>>>>>>>>');
        zhput(url + "/" + id, urldata).then(function(result) {
            if(checkData(result,'put')) {
                location.href="admin.html#pages/goods/goodslist.html";
            }
        });
    }
}



