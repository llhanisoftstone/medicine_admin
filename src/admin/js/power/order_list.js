/**
 * Created by pc on 2018/9/4.
 */
var base_url= '/rs/member_ticket';
var isSearch=false;
var currentPageNo = 1;
//var status_desc=['待付款','待发货','等待收货','待评论','交易成功','交易取消','退款','退货','失效','退款中','退款成功','退款失败']
var pageRows = 10;
var store_id=getCookie("store_id")
//返回定位必须-start
var searchForm; //查询条件JSON
$(document).ready(function(){
    bindDataToggleModal();
    //getCompany();
    queryList();
    $("#searchDataBtn").on("click",function(){
        currentPageNo=1;
        isSearch=true;
        queryList();
    });
    $("#exportData").on("click",function(){
        isSearch=true;
        queryList("download");
    });
    $("#resetSearchBtn").on("click",function(){
        isSearch=false;
        release();
    });
    closemessage();
});
function release(){
    $("#order_count").val("");
    $("#type").val("-1");
    $("#status").val("-1");
    $("#orderTimeStart").val("");
    $("#orderTimeEnd").val("");
    $("#zhiTimeStart").val("");
    $("#zhiTimeEnd").val("");
    $("#projectTitle").val("");
    // $('#comp').selectpicker('val',"");
    currentPageNo = 1;
    pageRows = 10;
    queryList();
}
function bindDataToggleModal(){
    $("*[data-toggle='modal']").unbind("mouseup");
    $("*[data-toggle='modal']").bind("mouseup", function(event){
        var target = $(this).attr("data-target");
        var top = event.clientY + document.body.scrollTop - document.body.clientTop;
        top = top - 200;
        if (top < 200) top = 200;
        $(target).find(".modal-dialog").css("margin-top", top);
        $("#progressDiv").css("top", top-100);
    });
}
// function addRemarks(obj,id,remark){
//     // saveFormData("buildProjectSearchForm");
//     if(remark){
//         $("#remark_admin").val(remark);
//     }else{
//         $("#remark_admin").val("");
//     }
//     $("#sureSaveaddremarkModal").unbind().bind("click",function(){
//         var remark_admin = $("#remark_admin").val();
//         if(remark_admin == ""){
//             $("#remark_admin").focus();
//             showError("请输入备注内容");
//             return;
//         }
//         var data = {
//             remark_admin:remark_admin
//         }
//         zhput(base_url+"/"+ id,data).then(function(result){
//             if(result.code == 200){
//                 $(obj).parent().parent().find(".newremark").html("备注信息:"+remark_admin);
//                 $("#closeaddremarkModal").trigger("click");
//                 getpageRecord();
//                 queryList();
//             }
//         })
//     })
// }



// 弹出发货框按钮事件----单产品发货
// function showOrderLogiModal(subOrderNumber, orderNumber, logisCode, logisNumber) {
//     // saveFormData("buildProjectSearchForm");
//     if (logisCode && logisNumber && logisCode != "null"&& logisNumber != "null") {
//         $("#iOldLogiId").val(logisCode);
//         $("#iLogiNum").val(logisNumber);
//     } else {
//         $("#iOldLogiId").val('0');
//         $("#iLogiNum").val('');
//     }
//     loadOrderLogi(orderNumber,subOrderNumber);
// }
// function refund(element, orderCode, detailId,iPrice,mainId,mainnum,activity_category){
//     if($(element).attr("data-type")==4){
//         $(".refund_price_input").hide();
//     }else{
//         $(".refund_price_input").show();
//     }
//     loadOrderReturnPriceModel(orderCode, detailId, iPrice,mainId,mainnum);
// }
function chargeoff(id,o_id){
    var data = {
        status:1,
        //order_id:o_id
    }
    if(confirm("您确定要核销该二维码吗？")){
        zhput("/rs/member_ticket/"+ id,data).then(function(result){
            if(result.code == 200){
                showSuccess('核销成功');
                queryList();
            }else{
                processError(result)
            }
        })
    }

}
// function getCompany(comp) {
//
//     var data={
//         store_id:store_id
//     }
//     zhget(base_url,data).then(function (result) {
//         console.log(result)
//         if(result.code==200) {
//             buildTableNoPage(result, 'brand-template', 'comp');
//             initselect('comp');
//             $.hideActionLoading();
//         }else{
//             buildTableNoPage(result, 'brand-template', 'comp');
//             initselect('comp');
//             $.hideActionLoading();
//         }
//         buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
//     })
// }
// function initselect(id){
//     $('#'+id).selectpicker({
//         size: 10,
//         width:'100%'
//     });
// }
function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y+M+D+h+m+s;
}
function createInfoList(result){
    var rows = result.rows;
    for (var i = 0; i < rows.length; i++) {
        var mainOrder = rows[i];
        var date=mainOrder.get_time;
        date = new Date(Date.parse(date.replace(/-/g, "/")));
        date = date.getTime();
        var toEnd=30*24 * 60 * 60 * 1000;
        var end=Number(date)+Number(toEnd);
        timestampToTime(end);
        mainOrder.end_time=timestampToTime(end);
        //result.rows.end_time=result.rows.get_time+
        // if(mainOrder.old_address){
        //     mainOrder.oldaddress = 1;
        // }
        // if(mainOrder.rq_list && (mainOrder.status == 2) ){
        //     result.rows[i].trcolpan=2+mainOrder.rq_list.length;
        // }else{
        //     result.rows[i].trcolpan=2;
        // }
        // if(mainOrder.rq_list){
        //     for(var k=0,len=mainOrder.rq_list.length;k<len;k++){
        //         mainOrder.rq_list[k].main_order_id=mainOrder.id;
        //     }
        // }
        mainOrder.rowNum = (currentPageNo - 1) * pageRows + i + 1;
    }
    buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
    // $(".refundBtn").each(function () {
    //     var status = $(this).attr("status");
    //     var amount = $(this).attr("amount");
    //     if (amount == 0 || status == 0 || status == 6 || status == 8 || status == 9) {
    //         $(this).hide();
    //     }
    // });
}
function queryList() {
    //  download=="download"  时，为导出数据
    var data={
        page:currentPageNo,
        size:pageRows,
        store_id:store_id,
        //order:'create_time desc'
    };
    // if(download=="download"){
    //     data={
    //         //order:'create_time desc',
    //         //download:1,
    //         store_id:store_id
    //     }
    //
    // }
    if(isSearch){
        var count=$("#order_count").val();
        var status=$("#status").val();
        var ordertimestart=$("#orderTimeStart").val();
        var ordertimeend=$("#orderTimeEnd").val();
        var zhiTimeStart=$("#zhiTimeStart").val();
        var zhiTimeEnd=$("#zhiTimeEnd").val();
        var title=$("#projectTitle").val();
        if(count!=''&&count){
            data.id=count;

        }
        if(status && status != '' && status!=-1  ){
            data.status='=,'+status;
        }
        if(title!=''&&title){
            data.name=title;
        }
        var ordertimeend1 = ordertimeend +" 23-59-59";
        if(ordertimestart!=""&&ordertimeend!=""){
            data.get_time='>=,'+ordertimestart+',<=,'+ordertimeend1;
        }else if(ordertimestart!=""&&ordertimeend==""){
            data.get_time='>=,'+ordertimestart;
        }else if(ordertimestart==""&&ordertimeend!=""){
            data.get_time='<=,'+ordertimeend1;
        }else {
            data.get_time = undefined;
        }
        // var zhiTimeEnd1 = zhiTimeEnd +" 23-59-59";
        // if(zhiTimeStart!=""&&zhiTimeEnd!=""){
        //     data.end_time='>=,'+zhiTimeStart+',<=,'+zhiTimeEnd1;
        // }else if(zhiTimeStart!=""&&zhiTimeEnd==""){
        //     data.end_time='>=,'+zhiTimeStart;
        // }else if(zhiTimeStart==""&&zhiTimeEnd!=""){
        //     data.end_time='<=,'+zhiTimeEnd1;
        // }else {
        //     data.end_time = undefined;
        // }
        data.search=1;
    }

    // if(download=="download"){
    //     zhpost(base_url, data).then(function (result) {
    //         debugger
    //         $.hideActionLoading();
    //         if(checkData(result,'get','queryList','table-orderlist')) {
    //
    //             if(download=="download"){
    //                 window.location.href = targetUrl + result.path;
    //             }
    //         }
    //     });
    //     return;
    // }
    zhget(base_url, data).then(function (result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-orderlist')) {
            createInfoList(result);
        }
    });
}
function tabcomp(){
    $(".selectCategory").val("");
    $(".selectCategoryId").val("");
}
Handlebars.registerHelper('ticketsetstatus', function(v1) {
    // 状态：0-待付款；1-已付款/待发货；2-已发货/待收货;
    // 4-交易成功；5-交易取消；6-已消费(卡券已核销)；8-交易失效；
    // 9-退款中；10-退款成功；11-退款失败,12，退款拒绝，票务系统使用
//     代金券购买成功后就是待使用状态，
// 待付款status=0  待使用status=4  已使用status=6    失效status=8
   if(v1==1){
        return "已核销";
    }else if(v1==2){
        return "已过期";
    }else if(v1==0){
        return "未核销";
    }
});
