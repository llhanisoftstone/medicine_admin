/**
 * Created by Administrator on 2018/4/27.
 */
/**
 * Created by kechen on 2016/10/13.
 */
var base_url_goodsCategory='/rs/questions_category';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
var compid=sessionStorage.getItem('compid') || getCookie('compid');
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
    if(!compid){
        compid=sessionStorage.getItem('compid') || getCookie('compid');
    }
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'create_time desc',
        comp_id:compid
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        if(name!=''){
            data.name=name;
        }
    }
    zhget(base_url_goodsCategory,data).then(function (result) {
        if(checkData(result,'get','queryList','table-questionCategory','paginator')) {
            $("#querylistnull").remove();
            $("#pid").attr("_pid",0);
            $("#pid").attr("_deep",1);
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'questionCategory-template', 'questionModel-placeholder');
        }
    })
}
function showSearchPage() {
    $('#addName').focus().blur();
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $('#name').val('')
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "fast");
}
function addGoodsModels(dom){
    $('#name').val('')
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "fast");
    $("#addName").attr("_id","");
}

function onUpdateClick(id,name) {;
    $("#addName").attr("_id",id);
    $("#addName").val(name);
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function delClick(id) {
    zhget("/rs/questions", {category_id:id,status:'<,99'}).then(function (result) {
        if (result.code == 200) {
            showError("该分类下挂有题目，不能删除");
        } else {
            if (confirm("确定要删除该分类吗？")) {
                zhdelete(base_url_goodsCategory + "/" + id).then(function (result) {
                    checkData(result, 'delete');
                    if($("#questionModel-placeholder").find("tr").length == 1){
                        currentPageNo = currentPageNo>1?currentPageNo-1:1
                    }
                    queryList()
                })
            }

        }
    })
}
var btnClicked=false;
function onSavecategoryData(){
    if(btnClicked){return;}
    btnClicked=true;
    var name=$("#addName").val().trim();
    var modelid=$("#addName").attr("_id");
    if(modelid==""||modelid==null||modelid==undefined){
        var sdata={
            name:name,
            auto_id:1
        }
        if(compid){
            sdata.comp_id=compid;
        }
        zhpost(base_url_goodsCategory,sdata).then(function(result){
            if(checkData(result,'post')){
                btnClicked=false;
                resetinput();
                $(".addModels").hide();
                queryList()
            }
        })
    }else{
        var putdata={
            name:name,
        }
        if(compid){
            putdata.comp_id=compid;
        }
        zhput(base_url_goodsCategory+"/"+modelid,putdata).then(function(result){
            if(checkData(result,'put')){
                btnClicked=false;
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