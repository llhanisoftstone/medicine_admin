var base_url_member='/rs/v_member';

var list = [];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var onequerylist = true;
$(function() {
    var page = getUrlParamsValue("page");
    if(page&&page != "undefined"){
        currentPageNo = page;
    }
    queryList();
});

function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
        level:"1",
        order:'create_time desc'
    };
    $("#event-placeholder").html("");
    zhget(base_url_member, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
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
        }
    });
}