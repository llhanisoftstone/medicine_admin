/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/game_config';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
$(function(){
    getstorename();
    compid = getCookie('storeid');
    id=getQueryString("pid");
    if(id==''||id==null){
        operation = "add";
    }else{
        operation = "modify";
        getGoodsById(id);
    }
    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
    $('#ticketname').on('click',function(){
        var store=$('#storename').val()
        if(!store || store=='-1'){
            return showError('请先选择店铺');
        }
    })

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

function getstorename(){
    $("#storename").html("");
    var data={
        status:'1'
    };
    zhget('/rs/store',data).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#storename").append(html);
        }
        //getticketinfo();
    })
}
function getTickets(){
    var id=$('#storename').val();
    if(id =='-1'){
        $("#ticketname").html("");
    }else{
        getticketinfo(id);
    }
}
function getticketinfo(storeid){
    $("#ticketname").html("");
    var data={
        status:'<>,99'
    };
    if(storeid){
        data.store_id=storeid;
    }
    zhget('/rs/ticket',data).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#ticketname").append(html);
        }
    })
}

//根据id查询产品数据
function getGoodsById(id){
    $.showActionLoading();
    zhget(base_url_goods+"/"+id,{}).then(function(result) {
        $.hideActionLoading();
        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#title_pic").val(result.rows[0].picpath);
        $("#sale_price").val(result.rows[0].price);
        buildTableNoPage(result, 'answer-template', 'answer');
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

    var url="/rs/ticket";
    var urldata={
        name:name,
        picurl:title_pic,
        price:price_leaguer*100,
        // details:details,
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



