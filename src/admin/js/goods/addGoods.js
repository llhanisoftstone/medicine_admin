/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/ticket';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
var u_id;
$(function(){
    compid = getCookie('storeid');
    id=getQueryString("pid");
    getmember();
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
function showname(){
    var type=$("#type").val();
    if(type&&type==2){
        $(".titlename").html("优惠券名称：");
        $("#name").attr("placeholder","优惠券名称")
    }else if(type&&type==3){
        $(".titlename").html("产品名称：");
        $("#name").attr("placeholder","产品名称")
    }
}
function getmember(){
    zhget('/rs/member',{store_id:compid,rank:20}).then(function(result){
        if(result.code==200){
            u_id=result.rows[0].id;
        }
    })
}
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
        $("#type").val(result.rows[0].type);
        $("#effect_hour").val(result.rows[0].effect_hour);
        var types=result.rows[0].type;
        if(types&&types==2){
            $(".titlename").html("优惠券名称：");
            $("#name").attr("placeholder","优惠券名称")
        }else if(types&&types==3){
            $(".titlename").html("产品名称：");
            $("#name").attr("placeholder","产品名称")
        }
        $("#name").val(result.rows[0].name);
        $("#title_pic").val(result.rows[0].picurl);
        $("#sale_price").val(formatPriceFixed2(result.rows[0].price));
        var aimurl = 'src="'+targetUrl+"/upload/";
        setTimeout(function(){
            if(result.rows[0].details){
                var details = result.rows[0].details.replace(/src=\"\/upload\//g, aimurl);
                UE.getEditor('userProtocolAddUE').setContent(details);
            }
        },500)

    });

}

function  saveData(){
    //获取产品基本信息
    var type=$("#type").val();
    if(!type||type=="-1"){
        showError("请选择类型");
        $("#type").focus();
        return;
    }
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
        showError("请输入价格");
        return;
    }
    var effect_hour=$("#effect_hour").val().trim();
    if(effect_hour==""||effect_hour==null){
        showError("请输入有效期")
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
        type:type,
        effect_hour:effect_hour,
        picurl:title_pic,
        price:price_leaguer*100,
        details:details,
        store_id:compid,
        u_id:u_id,
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



