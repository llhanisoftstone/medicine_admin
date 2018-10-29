/**
 * Created by Administrator on 2018/4/26.
 */
var base_url='/rs/statistics_group';
var base_url_ticket='/rs/v_game_config';
var list = [];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var onequerylist=true;
$(function() {
    var page=getUrlParamsValue("page");
    if(page&&page!="undefined"){
        currentPageNo=page;
    }
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        $('#ticket').selectpicker('refresh');
        queryList();
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    $("#exportData").bind("click", function(){
        $('#ticket').selectpicker('refresh');
        queryList(1)
    });

    queryList();
    getTicket();
});
function getTicket(){
    var data={
        status:'1'
    }
    zhget(base_url_ticket,data).then(function(result) {
        if(result.code==200) {
            buildTableNoPage(result, 'brand-template', 'ticket');
            initselect('ticket');
        }else{
            buildTableNoPage(result, 'brand-template', 'ticket');
            initselect('ticket');
        }
    });
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
function showSearchPage() {
    $(".reasonSearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".reasonSearch").is(":visible")) {
        isSearch=false;
    }
}

// 用户信息页面渲染
var isSearch=false;
function searchData(){
    isSearch=true;
    currentPageNo=1;
    $('#ticket').selectpicker('refresh');
    queryList();

}

function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
        order:'id desc'
    };
    if(isSearch){
        var ticket=$("#ticket").val();
        var startTime = $("#starttime").val();
        var endTime = $("#endtime").val();
        if(ticket&&ticket!=''){
            data.game_cfg_id = ticket;
            data.ticket=$("#ticket").find('option:selected').attr('ticket_id');
        }
        if(startTime&&endTime&&startTime>endTime){
            showError("开始时间不能大于结束时间")
            return;
        }else{
            if(startTime){
                data.start_time=startTime;
            }
            if(endTime){
                data.end_time=endTime;
            }
        }
    }
    $.showActionLoading();
    zhget(base_url, data).then( function(result) {
        $.hideActionLoading();
        if(result.sum_count){
            $(".sum_count").html(result.sum_count||0)
        }else{
            $(".sum_count").html(0)
        }
        if(result.sum){
            $(".sum").html(result.sum||0)
        }else{
            $(".sum").html(0)
        }
        if(result.sum1_count){
            $(".sum1_count").html(result.sum1_count||0)
        }else{
            $(".sum1_count").html(0)
        }
        if(result.sum1){
            $(".sum1").html(result.sum1||0)
        }else{
            $(".sum1").html(0)
        }
        if(result.sum2_count){
            $(".sum2_count").html(result.sum2_count||0)
        }else{
            $(".sum2_count").html(0)
        }
        if(result.sum2){
            $(".sum2").html(result.sum2||0)
        }else{
            $(".sum2").html(0)
        }
        if(result.sum3_count){
            $(".sum3_count").html(result.sum3_count||0)
        }else{
            $(".sum3_count").html(0)
        }
        if(result.rows){
            if(checkData(result,'get','queryList','table-member')) {
                integrals = result.rows;
                for (var i = 0; i < integrals.length; i++) {
                    var indexCode = integrals[i];
                    indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                }
                buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
                if(onequerylist){
                    onequerylist=false;
                    jQuery("#goToPagePaginator").val(currentPageNo);
                    jQuery("#gotoPage").click();
                }
            }
            jQuery("#table-member").show();
        }else{
            jQuery("#table-member").hide();
        }

    });
}

Handlebars.registerHelper('formatDate', function(v1, options) {
    if(v1) {
        return v1.slice(0,10);
    }
});
