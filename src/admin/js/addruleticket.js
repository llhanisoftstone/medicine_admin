/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/ticket_send_rule';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
var u_id;
$(function(){
    compid = getCookie('storeid');
    shopselect();
    getmember();
    id=getQueryString("pid");
    if(id==''||id==null){
        operation = "add";
    }else{
        operation = "modify";
        getGoodsById(id);
    }

});
function back(){
    history.go(-1);
}
function getmember(){
    zhget('/rs/member',{store_id:compid,rank:20}).then(function(result){
        if(result.code==200){
            u_id=result.rows[0].id;
        }
    })
}
function shopselect(goodscompid){
    var data={};
    data.status="1";
    data.store_id=compid;
    zhget('/rs/ticket',data).then(function(result){
        if(result.code==200) {
            buildTableNoPage(result, 'brand-template', 'goodscompid');
            initselect('goodscompid');
            $.hideActionLoading();
        }else{
            buildTableNoPage(result, 'brand-template', 'goodscompid');
            initselect('goodscompid');
            $.hideActionLoading();
        }
    })
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
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
    });

}

function  saveData(){
    var urldata={
        u_id:u_id
    };
    //获取产品基本信息
    var title=$("#goodscompid").val();
    if(title&&title!="-1"){
        urldata.ticket_id=title;
    }else{
        showError("请选择产品");
        return;
    }
    var type=$("#type").val()
    if(type&&type!="-1"){
        urldata.type=type;
    }else{
        showError("请选择类型");
        return;
    }
    var total_amount=$("#total_num").val().trim();
    if(total_amount){
        urldata.total_amount=total_amount;
    }else{
        showError("请输入数量");
        return;
    }
    var dtStartTime=$("#dtStartTime").val().trim();
    if(dtStartTime){
        urldata.start_time=dtStartTime;
    }else{
        showError("请选择开始时间");
        return;
    }
    var dtEndTime=$("#dtEndTime").val().trim();
    if(dtEndTime){
        var date1 = new Date(dtStartTime);
        var date2= new Date(dtEndTime);
        if(date2.getTime() < date1.getTime()){
            return showError("结束时间不能晚于开始时间");
        }else{
            urldata.end_time=dtEndTime;
        }
    }else{
        showError("请选择结束时间");
        return;
    }
    $("#savebtn").attr("disabled","disabled");
    if (operation == "add") {
        urldata.auto_id=1;
        $.showActionLoading();
        zhpost(base_url_goods,urldata).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                location.href="admin.html#pages/ruleticket.html";
                $('#goodscompid').selectpicker('refresh');
                $("#savebtn").attr("disabled",false);
            }
        });
    } else {
        var id = $("#id").val();
        zhput(base_url_goods + "/" + id, urldata).then(function(result) {
            if(checkData(result,'put')) {
                location.href="admin.html#pages/ruleticket.html";
                $('#goodscompid').selectpicker('refresh');
                $("#savebtn").attr("disabled",false);
            }
        });
    }
}



