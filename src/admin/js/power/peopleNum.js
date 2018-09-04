/**
 * Created by pc on 2018/9/3.
 */
var base_url='/rs/statistics_user_sale';
var currentPageNo = 1;
var pageRows = 10;
$(function(){
    var page = getUrlParamsValue("page");
    if(page&&page != "undefined"){
        currentPageNo = page;
    }
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    queryList();
    initselect("select")

})
function showSearchPage() {
    $(".reasonSearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".reasonSearch").is(":visible")) {
        isSearch = false;
    }
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
var isSearch = false;
function searchData(){
    isSearch = true;
    currentPageNo = 1;
    queryList();

}
function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
    };
    if(isSearch){
        var select=$("#select").val();
        var startTime = $("#getTimeStart").val();
        var endTime = $("#getTimeEnd").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(parseFloat(new Date(startTime))<parseFloat(new Date(endTime))){
                    data.start_time='>=,'+startTime;
                    data.end_time='<=,'+endTime;
                }else{
                    showError("结束时间不能小于开始时间");
                    return
                }
            }else{
                if(startTime){
                    data.start_time='>=,'+startTime
                }
                if(endTime){
                    data.end_time='<=,'+endTime
                }
            }
        }
        data.search = 1;
    }

    $("#event-placeholder").html("");
    zhget(base_url,data).then( function(result) {
        debugger
        integrals = result.rows;
        for (var i = 0; i < integrals.length; i++) {
            var indexCode = integrals[i];
            indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
        }
        buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
        if(onequerylist){
            onequerylist = false;
            jQuery("#goToPagePaginator").val(currentPageNo);
            jQuery("#gotoPage").click();
        }

    });
}
