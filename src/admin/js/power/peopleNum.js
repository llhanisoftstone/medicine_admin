/**
 * Created by pc on 2018/9/3.
 */
var base_url='/rs/statistics_user';
var currentPageNo = 1;
var pageRows = 10;
var onequerylist = true;
$(function(){
    getOrganiztion();
    var page = getUrlParamsValue("page");
    if(page&&page != "undefined"){
        currentPageNo = page;
    }
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        // $("#reasonSearchForm", $(".report"))[0].reset();
        jQuery("#select").selectpicker("val","");
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    queryList();

})
function getOrganiztion(){
    zhget('/rs/company').then( function(result) {
        buildTableNoPage(result,'select-template','select');
        initselect("select")
        $(".bs-searchbox input").attr("maxlength","20");
    })
}
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
        size: 8,
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
        var comp_id=$("#select").val();
        data.comp_id=comp_id;
        data.search = 1;
    }

    $("#event-placeholder").html("");
    zhget(base_url,data).then( function(res) {
        var rows= res.comp_list;
        for (var i = 0; i < rows.length; i++) {
            var indexCode = rows[i];
            indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
        }
        var datas={};
        datas.rows=rows;
        datas.count=rows.length;
        datas.records=datas.count;
        jQuery("#user").html(res.user);
        jQuery("#comp_user").html(res.comp_user);
        buildTableByke(datas, 'event-template', 'event','paginator',queryList,pageRows);
        if(onequerylist){
            onequerylist = false;
            jQuery("#goToPagePaginator").val(currentPageNo);
            jQuery("#gotoPage").click();
        }

    });
}
