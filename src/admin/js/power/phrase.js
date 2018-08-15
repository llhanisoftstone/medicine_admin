
var base_url_goodsCategory='/rs/phrase_set';
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
        order:'create_time desc',
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        if($.trim(name) != ''){
            data.details=name;
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

function onUpdateClick(id,name,order) {;
    $("#addName").attr("_id",id);
    $("#addName").val(name);
    $("#order_code").val(order);
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function delClick(id) {
    if (confirm("确定要删除该快捷语吗？")) {
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
    var name=$("#addName").val().trim();
    var modelid=$("#addName").attr("_id");
    var order=$('#order_code').val().trim();
    if(!name){
        showError('请输入快捷语');
        return;
    }
    if(modelid==""||modelid==null||modelid==undefined){
        var add_data={
            details:name,
            auto_id:1
        };
        if(order){
            add_data.order_code=order;
        }
        zhpost(base_url_goodsCategory,add_data).then(function(result){
            if(checkData(result,'post')){
                resetinput();
                $(".addModels").hide();
                queryList()
            }
        })
    }else{
        var editdata={
            details:name
        };
        if(order){
            editdata.order_code=order;
        }
        zhput(base_url_goodsCategory+"/"+modelid,editdata).then(function(result){
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