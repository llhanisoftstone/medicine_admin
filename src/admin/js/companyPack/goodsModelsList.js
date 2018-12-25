/**
 * Created by Administrator on 2017/11/10.
 */
var base_url_goodsModels='/rs/store_goods_model';
var base_url_goodsModels_get='/rs/goods_model_comp';
var base_url_goodsModelsValue='/rs/store_goods_model_value';
var base_url_goods_brand='/rs/company_store';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var jin=false;
var postoff=false;
var model_id="";
//返回定位必须-start
// var isSearch=false;
var searchForm; //查询条件JSON
//获取當前頁面url
var currPageName  = (window.location.hash).replace('#','');
//当前页面跳转、刷新之前保存页码和表单数据，需要在页面跳转时添加Math.random(),否则监听不到
// window.onbeforeunload=function(){
//     var pageRecord = $("#paginator li.active a").text();
//     setlocalStorageCookie("pageRecord",pageRecord);
//     saveFormData("userSearchForm");//此处改为当前form页的id
//     // saveFormData("userAddForm");
// };
// function saveFormData(formId){
//     searchForm = $("#"+formId).form2json();
//     setlocalStorageCookie(currPageName,JSON.stringify(searchForm));
//     var pageRecord = $("#paginator li.active a").text();
//     console.log(pageRecord);
//     setlocalStorageCookie("pageRecord",pageRecord);
// }
$(function() {
    // searchForm = getlocalStorageCookie(currPageName);
    // searchForm = JSON.parse(searchForm);
    // console.log(searchForm)
    // if(searchForm && searchForm != '{}'){
    //     dellocalStorageCookie(currPageName);
    //     issearchModel=true;
    //     for(var key in searchForm){
    //         $("input[name='"+key+"']").val(searchForm[key]);
    //         $("select[name='"+key+"']").val(searchForm[key]);
    //     }
    // }
    // getpageRecord();
    queryList();
    getCompany();
});

function queryList(){
    if(model_id){
        onModelNameClick(model_id,"value");
        return;
    }
    $("#ModelValueList").remove();
    // _modelId属于第二层
    $("#addNew").removeAttr("_modelId");
    // var pageRecord = getlocalStorageCookie("pageRecord");
    // if(pageRecord&&pageRecord>0){
    //     dellocalStorageCookie("pageRecord");
    //     $("#pageIndex").val(pageRecord);
    //     currentPageNo = pageRecord;
    // }
    var data={
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows,
        status:'<>,99',
        comp_id:getCookie('compid')
    };
    if(sessionStorage.getItem("compid")!=''){
        data.comp_id=sessionStorage.getItem("compid")
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        var comp=$.trim($("#comp").val());
        if(name!=''){
            data.name=name;
        }
        if(comp && comp!='-1'){
            data.comp_id=comp;
        }else{
            delete data.comp_id;
        }
    }
    zhget(base_url_goodsModels_get,data).then(function (result) {
        $.hideActionLoading();
        console.log(result)
        if(checkData(result,'get','queryList','table-goodsModel')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            $("#querylistnull").remove();
            buildTable(result, 'goodsModel-template', 'goodsModel-placeholder');
            $("tr th:nth-child(2)").show();
        }
    })
}

function searchGoodsModels(){
    if(jin){
        return;
    }
    jin=true;
    setTimeout(function(){
        jin=false;
    },500);
    if($("#addNew").attr("_modelId")!=undefined){
        $("#searchmodel").text("规格值");
        $("#specname").text("规格值");
        $("#name").attr("placeholder","规格值");
        $("#compDiv").hide();
        $('#compDiv1').show();
    }else{
        $("#searchmodel").text("规格名称");
        $("#specname").text("规格名称");
        $("#name").attr("placeholder","规格名称");
        $("#compDiv").show();
        $("#compDiv1").hide();
    }

    $(".addModels").hide();
    $(".searchModels", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");

}
function addGoodsModels(dom){
    if(jin){
        return;
    }
    jin=true;
    setTimeout(function(){
        jin=false;
    },500);
    $("#addName").removeAttr("_id");
    $("#addName").val("");
    $("#comp1").selectpicker("val",'');
    if($(dom).attr("_modelId")!=undefined){
        $("#model").text("规格值");
        $("#specname").text("规格值");
        $("#addName").attr("placeholder","规格值");
        $("#compDiv").hide();
        $("#compDiv1").hide();
        // var pageRecord = $("#paginator li.active a").text();
        // setlocalStorageCookie("pageRecord1",pageRecord);
    }else{
        $("#model").text("规格名称");
        $("#specname").text("规格名称");
        $("#addName").attr("placeholder","规格名称");
        $("#compDiv").show();
        $("#compDiv1").show();
        // var pageRecord = $("#paginator li.active a").text();
        // setlocalStorageCookie("pageRecord",pageRecord);
        // console.log(pageRecord)
    }

    $(".searchModels").hide();
    $(".addModels").show();

    // $(".addModels", $(".reasonRefund")).animate({
    //     height : 'toggle',
    //     opacity : 'toggle'
    // }, "slow");
}

function onUpdateClick(id,name,comp_id) {

    if($("#addNew").attr("_modelId")!=undefined){
        $("#model").text("规格值");
        $("#specname").text("规格值");
        $("#addName").attr("placeholder","规格值");
        $("#compDiv").hide();
        $("#compDiv1").hide();
        // var pageRecord = $("#paginator li.active a").text();
        // setlocalStorageCookie("pageRecord1",pageRecord);
        // console.log(pageRecord)
    }else{
        $("#model").text("规格名称");
        $("#specname").text("规格名称");
        $("#addName").attr("placeholder","规格名称");
        $("#compDiv").show();
        $("#compDiv1").show();
        // var pageRecord = $("#paginator li.active a").text();
        // setlocalStorageCookie("pageRecord",pageRecord);
        // console.log(pageRecord)
    }
    // category(comp_id);
    console.log(comp_id)
    // var pageRecord = $("#paginator li.active a").text();
    // if(comp_id){
    //     setlocalStorageCookie("pageRecord",pageRecord);
    //
    // }else {
    //     setlocalStorageCookie("pageRecord1",pageRecord);
    // }
    $("#comp1").selectpicker("val",comp_id);
    $("#addName").attr("_id",id);
    $("#addName").val(name);
    $(".searchModels").hide();
    $(".addModels").show();
    // $(".addModels", $(".reasonRefund")).animate({
    //     height : 'toggle',
    //     opacity : 'toggle'
    // }, "slow");
    // location.href="admin.html#pages/goods/goodsModelsDetails.html?id="+id;
}

// function category(selected){
//     console.log(selected);
//     var comp = $("#compk");
//     comp.html(' <select id="comp1" class="form-control " data-live-search ="true" ></select>')
//     getCompany(selected)
//     // comp.find("button").removeClass("bs-placeholder")
//     // comp.find(".filter-option").html("")
// }

function addbtn(){
    var name=$("#addName").val();
    if(name.trim()==''){
        showError('请填写正确的信息');
        return;
    }
    var modelval=$("#addNew").attr("_modelId");
    if(modelval==undefined){
        var modelid=$("#addName").attr("_id");
        if(modelid==undefined){
            // $.showActionLoading();
            var data = {name:name,status:1};
            // var compid = getCookie("compid");
            var compid=$("#comp1").val();
            if(compid=='-1' ||compid==undefined ||compid==''){
                showError('请选择所属店铺');
                return;
            }
            data.store_id = compid;
            if(postoff){
                return;
            }
            postoff=true;
            zhpost(base_url_goodsModels,data).then(function(result){
                // $.hideActionLoading();
                console.log(result);
                if(checkData(result,'post')){
                    queryList();
                    $("#userAddForm", $(".reasonRefund"))[0].reset();
                    $("#userSearchForm", $(".reasonRefund"))[0].reset();

                    $(".addModels").hide();
                }
                setTimeout(function(){
                    postoff=false;
                },1000);
            })
        }else{
            var data = {name:name,status:1};
            var id=$("#addName").attr("_id");
            var compid=$("#comp1").val();
            if(compid=='-1' ||compid==undefined ||compid==''){
                showError('请选择所属店铺');
                return;
            }
            data.store_id = compid;
            zhput(base_url_goodsModels+'/'+id,{name:name,status:1,store_id:compid}).then(function(result){
                console.log(result)
                if(checkData(result,'put')){
                    queryList();
                    $(".addModels").hide();
                    $("#addName").removeAttr("_id");
                    $("#userAddForm", $(".reasonRefund"))[0].reset();
                    $("#userSearchForm", $(".reasonRefund"))[0].reset();
                }
            })
        }

    }else{
        var modelid=$("#addName").attr("_id");
        if(modelid==undefined){
            $.showActionLoading();
            var compid=$("#comp1").val();
            var modelid0=$("#addNew").attr("_modelId");
            if(postoff){
                return;
            }
            postoff=true;
            zhpost(base_url_goodsModelsValue,{name:name,model_id:modelid0,status:1}).then(function(result){
                $.hideActionLoading();
                if(checkData(result,'post')){
                    onModelNameClick(modelval);
                    $("#userAddForm", $(".reasonRefund"))[0].reset();
                    $("#userSearchForm", $(".reasonRefund"))[0].reset();
                    $(".addModels").hide();
                }
                setTimeout(function(){
                    postoff=false;
                },1000);
            })
        }else{
            var modelid=$("#addNew").attr("_modelId");
            var id = $("#addName").attr("_id");
            zhput(base_url_goodsModelsValue+"/"+id,{name:name,model_id:modelid,status:1}).then(function(result){
                if(checkData(result,'put')){
                    onModelNameClick(modelval);
                    $(".addModels").hide();
                    $("#addName").removeAttr("_id");
                    $("#userAddForm", $(".reasonRefund"))[0].reset();
                    $("#userSearchForm", $(".reasonRefund"))[0].reset();
                }
            })
        }
    }
}

//一级删除按钮
function onDeleteModel(id){
    if(confirm("确定要删除该规格吗？")) {
        zhdelete(base_url_goodsModels+"/"+id+"?app=02").done(function(result){
            if(result.code == 200){
                issearchModel=false;
                queryList();
            }else{
                alert("删除失败");
            }
        })
    }
}

function onDeleteClick(id) {
    if(confirm("确定要删除该规格值吗？")) {
        var modelval=$("#addNew").attr("_modelId");
        zhdelete(base_url_goodsModelsValue+"/"+id+"?app=02").done(function(result){
            checkData(result,'delete');
            onModelNameClick(modelval);
        })
    }
}


//店铺信息
function getCompany(comp1){
    var data={
        status:'1',
    }
    if(sessionStorage.getItem("compid")&&sessionStorage.getItem("compid")!=''){
        data.id=sessionStorage.getItem("compid")
    }
    zhget(base_url_goods_brand,data).then(function(result) {
        if(result.code==200) {
            buildTableNoPage(result, 'brand-template', 'comp1');
            buildTableNoPage(result, 'brand-template', 'comp');
            initselect('comp1');
            initselect('comp');
            $.hideActionLoading();
        }else{
            buildTableNoPage(result, 'brand-template', 'comp1');
            buildTableNoPage(result, 'brand-template', 'comp');
            initselect('comp1');
            initselect('comp');
            $.hideActionLoading();
        }
    });
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
function tabcomp(){
    $(".selectCategory").val("");
    $(".selectCategoryId").val("");
}
//查看
function modify(id) {
    location.href="admin.html#pages/goods/goodsModelsDetails.html?id="+id;
}

//重置
function resetinput(){
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    $("#userSearchForm", $(".reasonRefund"))[0].reset();
    $("#comp1").selectpicker("val",'');
    $("#comp").selectpicker("val",'');
    // isSearch=false;
    // dellocalStorageCookie(currPageName);
    currentPageNo = 1;
    pageRows = 10;
    // model_id='';
    queryList();
}

//搜索
function searchbtn(){
    var modelval=$("#addNew").attr("_modelId");
    $('#comp1').selectpicker('refresh');
    if(modelval==undefined){
        issearchModel=true;
        currentPageNo=1;
        queryList();
    }else{
        issearchValue=true;
        onModelNameClick(modelval);
    }
}

function showModel(){
    $("#addName").attr("maxlength","5");
    $("#specname").text("规格名称");
    $(".searchModels").hide();
    $(".addModels").hide();
    $("#back").hide();
    issearchValue=false;
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    $("#userSearchForm", $(".reasonRefund"))[0].reset();
    // searchForm = getlocalStorageCookie(currPageName);
    // searchForm = JSON.parse(searchForm);
    // console.log(searchForm)
    // if(searchForm && searchForm != '{}'){
    //     dellocalStorageCookie(currPageName);
    //     issearchModel=true;
    //     for(var key in searchForm){
    //         $("input[name='"+key+"']").val(searchForm[key]);
    //         $("select[name='"+key+"']").val(searchForm[key]);
    //     }
    // }
    // getpageRecord();
    model_id="";
    // currentPageNo=1;
    queryList();
}
function onModelNameClick(id,type){
    $("#addName").attr("maxlength","20");
    $("#specname").text("规格值");
    $("#compDiv1").hide();
    if(!issearchValue && !type){
        $(".searchModels").hide();
    }else{
        $(".addModels").hide();
    }
    if(!type){
        currentPageNo=1;
    }
    var data={
        size:pageRows,
        page:currentPageNo,
        model_id:id,
        order:'create_time desc'
    };
    model_id=id;
    if(issearchValue){
        data.search=1;
        var name=$("#name").val();
        if(name!=''){
            data.name=name;
        }
    }
    // resetinput();
    zhget(base_url_goodsModelsValue,data).then(function(result){
        $("tr th:nth-child(2)").hide();
        if(checkData(result,'get','queryList','table-goodsModel')){
            $("#querylistnull").remove();
            buildTable(result, 'goodsModelValue-template', 'goodsModel-placeholder');
        }
        $("#back").css("display","");
        // $("#table-goodsModel").next("div").hide();
        $(".breadcrumb").html('<li> <a>产品管理</a> </li> <li onclick="showModel()"><a>产品规格列表</a></li><li id="ModelValueList">产品规格值列表</li>');
        $("#addNew").attr("_modelId",id);
        $("#addName").removeAttr("_id");
        $("#addName").val("")
    })
}

Handlebars.registerHelper("getindex", function (v1, options) {
    return v1+1;
});