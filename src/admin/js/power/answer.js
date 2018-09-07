/**
 * Created by pc on 2018/9/3.
 */
var base_url='/rs/statistics_answer';
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
        $("#reasonSearchForm", $(".report"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        setTimeout(function(){
            queryList();
        },300)
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    setTimeout(function(){
        queryList();
    },300)

})
function getOrganiztion(){
    zhget('/rs/organiz').then( function(result) {
        buildTableNoPage(result, 'select-template','select');
        initselect("select")
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
    var organiz_id=$("#select").val();
    var data = {
        page: currentPageNo,
        size: pageRows,
        organiz_id:organiz_id
    };
    if(isSearch){
        var startTime = $("#getTimeStart").val();
        var endTime = $("#getTimeEnd").val();
        if(startTime!=""||endTime!=""){
            if(startTime!=""&&endTime!==""){
                if(new Date(startTime)<new Date(endTime)){
                    data.start_time=startTime;
                    data.end_time=endTime;
                }else{
                    showError("结束时间不能小于开始时间");
                    return
                }
            }
            if(startTime==""){
                showError("请选择开始时间");
                return;
            }
            if(endTime==""){
                showError("请选择结束时间");
                return;
            }
        }
        data.search = 1;
    }

    $("#event-placeholder").html("");
    zhget(base_url,data).then( function(result) {
        console.log(result)
        var list= result.questions_list;
        for (var i = 0; i < list.rows.length; i++) {
            var indexCode = list.rows[i];
            indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
        }
        jQuery("#count").html(result.questions_count);
        jQuery("#type_count").html(result.type_count);
        if(result.type_list.length > 0){
            for(var i=0; i<result.type_list.length; i++){
                if(result.type_list[i].is_right && result.type_list[i].count){
                    var is_right = result.type_list[i].is_right.split(",");
                    var count = result.type_list[i].count.split(",");
                    if(is_right[0] == 0){
                        result.type_list[i].yes_sum = count[1] || 0;
                        result.type_list[i].wrong_sum = count[0] || 0;
                    }
                    if(is_right[0] == 1){
                        result.type_list[i].yes_sum = count[0] || 0;
                        result.type_list[i].wrong_sum = count[1] || 0;
                    }
                }
            }
        }
        result.type_list.rows = result.type_list;
        buildTableNoPage(result.type_list,'kind-template','kind')
        if(list.rows.length > 0){
            for(var i=0; i<list.rows.length; i++){
                if(list.rows[i].is_right && list.rows[i].count){
                    var is_right = list.rows[i].is_right.split(",");
                    var count = list.rows[i].count.split(",");
                    if(is_right[0] == 0){
                        list.rows[i].yes_sum = count[1] || 0;
                        list.rows[i].wrong_sum = count[0] || 0;
                    }
                    if(is_right[0] == 1){
                        list.rows[i].yes_sum = count[0] || 0;
                        list.rows[i].wrong_sum = count[1] || 0;
                    }
                }
            }
        }
        buildTableByke(result.questions_list, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
        if(onequerylist){
            onequerylist = false;
            jQuery("#goToPagePaginator").val(currentPageNo);
            jQuery("#gotoPage").click();
        }

    });
}