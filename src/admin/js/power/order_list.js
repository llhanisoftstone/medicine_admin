/**
 * Created by pc on 2018/9/4.
 */
var base_url= '/rs/member_ticket';
var isSearch=false;
var currentPageNo = 1;
//var status_desc=['待付款','待发货','等待收货','待评论','交易成功','交易取消','退款','退货','失效','退款中','退款成功','退款失败']
var pageRows = 10;
var store_id = getCookie('storeid');
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

function chargeoff(id,name,o_id){
    var data = {
        status:1,
    }
    if(confirm("您确定要核销"+name+"吗？")){
        var use_time="";
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var day = now.getDay();
        var hour = now.getHours();
        var minu = now.getMinutes();
        var sec = now.getSeconds();
        month = month + 1;
        if (month < 10){
            month = "0" + month;
        }
        if (hour < 10){
            hour = "0" + hour;
        }
        if (minu < 10){
            minu = "0" + minu;
        }
        if (sec < 10){
            sec = "0" + sec;
        }
        use_time=year+"-"+month+"-"+day+" "+hour+":"+minu+":"+sec
        data.use_time=use_time;
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
function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = (date.getHours()< 10 ? '0'+(date.getHours()) : date.getHours())+ ':';
    var m = (date.getMinutes()< 10 ? '0'+(date.getMinutes()) : date.getMinutes())+ ':';
    var s = (date.getSeconds()< 10 ? '0'+(date.getSeconds()) : date.getSeconds());
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
        mainOrder.rowNum = (currentPageNo - 1) * pageRows + i + 1;
        if(mainOrder.status == 0 || mainOrder.status == 1){
            result.rows[i].trcolpan=3;
        }else{
            result.rows[i].trcolpan=2;
        }
    }
    buildTableByke(result, 'list-template', 'list-placeholder','paginator',queryList,pageRows);
}
function queryList() {
    var data={
        page:currentPageNo,
        size:pageRows,
        store_id:store_id,
        order:"status asc",
    };
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
            if(Date.parse(ordertimestart)-Date.parse(ordertimeend)>0){
                showError('开始时间不能大于结束时间');
                return;
            }
            data.get_time='>=,'+ordertimestart+',<=,'+ordertimeend1;
        }else if(ordertimestart!=""&&ordertimeend==""){
            data.get_time='>=,'+ordertimestart;
        }else if(ordertimestart==""&&ordertimeend!=""){
            data.get_time='<=,'+ordertimeend1;
        }else {
            data.get_time = undefined;
        }

        data.search=1;
    }

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
    if(v1==1){
        return "已核销";
    }else if(v1==2){
        return "已过期";
    }else if(v1==0){
        return "未核销";
    }
});

