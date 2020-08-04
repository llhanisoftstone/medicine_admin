var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var integrals;
$(function() {
    queryList();
    $("#searchDataBtn", $(".reasonRefund")).bind("click", searchbtn);
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    $("#userAdd", $(".reasonRefund")).unbind("click");
    $("#userAdd", $(".reasonRefund")).bind("click", onSavecolumnData);
});

function queryList(){
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'create_time desc',
        status:"<>,9"
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        if(name!=''){
            data.name=name;
        }
    }
    zhget("/rs/important_information",data).then(function (result) {
        if(checkData(result,'get','queryList','table-goodsCategory','paginator')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'goodsCategory1-template', 'goodsModel-placeholder');
        }
    })
}
function showprojectSearchPage() {
    $(".addprojectModels", $(".reasonRefund")).css("display", "none");
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    if($(".reasonprojectSearch").is(":hidden")){
        $(".reasonprojectSearch", $(".reasonRefund")).animate({
            height : 'toggle',
            opacity : 'toggle'
        }, "slow");
    }

}
function addprojectModels(){
    $('.tooltips_main').fadeOut("slow");
    $('.tooltips_main').remove();
    $(".reasonprojectSearch", $(".reasonRefund")).css("display", "none");
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    if($(".addprojectModels").is(":hidden")){
        $(".addprojectModels", $(".reasonRefund")).animate({
            height : 'toggle',
            opacity : 'toggle'
        }, "slow");
    }
}

function onUpdateClick(id,name) {
    $("#addName").attr("_id",id);
    $("#addName").val(name);
    $(".reasonprojectSearch", $(".reasonRefund")).css("display", "none");
    if($(".addprojectModels").is(":hidden")){
        $(".addprojectModels", $(".reasonRefund")).animate({
            height : 'toggle',
            opacity : 'toggle'
        }, "slow");
    }
}
function onDeleteClick(id) {
    if(confirm("确定要删除吗？")) {
        zhput("/rs/important_information"+"/"+id,{status:9}).then(function(result){
            checkData(result,'delete');
            if($("#goodsModel-placeholder").find("tr").length == 1){
                currentPageNo = currentPageNo-1>0?currentPageNo-1:1
            }else{
            }
            queryList()
        })
    }
}
function onSavecolumnData(){
    var name=$("#addName").val().trim();
    var modelid=$("#addName").attr("_id");
    if(modelid==""||modelid==null||modelid==undefined){
        zhpost("/rs/important_information",{name:name}).then(function(result){
            if(checkData(result,'post')){
                resetinput();
                $(".addprojectModels").hide();
                queryList()
            }
        })
    }else{
        zhput("/rs/evnet"+"/"+modelid,{name:name}).then(function(result){
            if(checkData(result,'put')){
                $(".addprojectModels").hide();
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
    queryList();
}

//搜索
function searchbtn(){
    issearchModel=true;
    currentPageNo=1;
    searchResult();
}
function searchResult(){

    var data={
        page: currentPageNo,
        size: pageRows,
        order:'id desc',
        status:"<>,9"
    }
    var name=$.trim($("#name").val());
    if(name){
        data.name = name;
        data.search=1;
    }
    zhget("/rs/evnet",data).then(function (result) {
        console.log(result)
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

Handlebars.registerHelper("getindex", function (v1, options) {
    return v1+1;
});