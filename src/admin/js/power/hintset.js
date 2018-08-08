/**
 * Created by Administrator on 2018/4/27.
 */
/**
 * Created by kechen on 2016/10/13.
 */
var base_url_goodsCategory='/rs/hint_set';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
$(function() {
    queryList();
    $("#searchDataBtn", $(".reasonRefund")).bind("click", searchbtn);
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    $("#userAddcategory", $(".reasonRefund")).unbind("click");
    $("#userAddcategory", $(".reasonRefund")).bind("click", onSavecategoryData);
});

function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'create_time desc'
    }
    if(issearchModel){
        data.search=1;
        var name=$("#name").val();
        var details=$.trim($("#details").val());
        if(name){
            data.category=name;
        }
        if(details){
            data.details=details;
        }
    }
    zhget(base_url_goodsCategory,data).then(function (result) {
        if(checkData(result,'get','queryList','table-goodsCategory','paginator')) {
            $("#querylistnull").remove();
            $("#pid").attr("_pid",0);
            $("#pid").attr("_deep",1);
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'goodsCategory1-template', 'goodsModel-placeholder');
        }
    })
}
function showSearchPage() {
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function addGoodsModels(dom){
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
    $("#addName").attr("_id","");
}

function onUpdateClick(id,category,details) {
    $("#addName").attr("_id",id);
    $("#addName").val(category);
    $("#adddetails").val(details);
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function delClick(id) {
    if (confirm("确定要删除该提示语吗？")) {
        zhdelete(base_url_goodsCategory + "/" + id).then(function (result) {
            checkData(result, 'delete');
            if($("#goodsModel-placeholder").find("tr").length == 1){
                currentPageNo = currentPageNo>1?currentPageNo-1:1
            }
            queryList()
        })
    }
}

function onSavecategoryData(){
    var category=$("#addName").val();
    var details=$("#adddetails").val().trim();
    if(!category&&category!="-1"){
        showError("请选择分类")
        return;
    }
    if(!details){
        showError("请输入提示语")
        return;
    }
    var modelid=$("#addName").attr("_id");
    if(modelid==""||modelid==null||modelid==undefined){
        zhpost(base_url_goodsCategory,{category:category,details:details,order_id:1}).then(function(result){
            if(checkData(result,'post')){
                resetinput();
                $(".addModels").hide();
                queryList()
            }
        })
    }else{
        zhput(base_url_goodsCategory+"/"+modelid,{category:category,details:details}).then(function(result){
            if(checkData(result,'put')){
                $(".addModels").hide();
                $("#addName").removeAttr("_id");
                resetinput();
                queryList()
            }
        })
    }
}
//重置
function resetinput(){
    $("#userAddForm", $(".reasonRefund"))[0].reset();
}

//搜索
function searchbtn(){
    currentPageNo=1;
    issearchModel=true;
    queryList();
}


Handlebars.registerHelper("getindex", function (v1, options) {
    return v1+1;
});