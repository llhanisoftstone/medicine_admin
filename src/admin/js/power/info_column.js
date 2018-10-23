var base_url_goodsCategory='/rs/info_column';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
var issubmit=false;
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
        order:'order_code desc,create_time desc',
        status:'<>,99',
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        if($.trim(name)!= ''){
            data.name=name;
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

function onUpdateClick(id,name,order_code) {
    $("#addName").attr("_id",id);
    $("#addName").val(name);
    $("#order_code").val(order_code);
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function delClick(id) {
    if (confirm("确定要删除该分类吗？")) {
        zhput(base_url_goodsCategory + "/" + id,{status:99}).then(function (result) {
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
    if(!name){
        return showError('请输入名称')
    }
    var order_code=$("#order_code").val().trim();
    if(!order_code){
        return showError('请输入顺序')
    }
    var modelid=$("#addName").attr("_id");
    if(issubmit){
        return;
    }
    issubmit=true;
    if(modelid==""||modelid==null||modelid==undefined){
        zhpost(base_url_goodsCategory,{name:name,order_code:order_code,auto_id:1}).then(function(result){
            if(checkData(result,'post')){
                resetinput();
                $(".addModels").hide();
                queryList()
            }
            issubmit=false;
        })
    }else{
        zhput(base_url_goodsCategory+"/"+modelid,{name:name,order_code:order_code,}).then(function(result){
            if(checkData(result,'put')){
                $(".addModels").hide();
                $("#addName").removeAttr("_id");
                resetinput();
                queryList()
            }
            issubmit=false;
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