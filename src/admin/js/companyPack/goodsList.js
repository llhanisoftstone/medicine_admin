
var base_url_goods = '/rs/store_goods';
var base_url_company = "/rs/company_store";
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
//返回定位必须-start
var isSearch=false;
var searchForm; //查询条件JSON
  //获取當前頁面url
var currPageName  = (window.location.hash).replace('#','');
  //当前页面跳转、刷新之前保存页码和表单数据，需要在页面跳转时添加Math.random(),否则监听不到
window.onbeforeunload=function(){
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    saveFormData("TalentTryoutSearchForm");//此处改为当前form页的id
};
function saveFormData(formId){
    searchForm = $("#"+formId).form2json();
    setlocalStorageCookie(currPageName,JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
}
//返回定位必须-end
$(function() {
    //返回定位必须-start
    searchForm = getlocalStorageCookie(currPageName);
    searchForm = JSON.parse(searchForm);
    if(searchForm && searchForm != '{}'){
        dellocalStorageCookie(currPageName);
        isSearch=true;
        for(var key in searchForm){
            $("input[name='"+key+"']").val(searchForm[key]);
            $("select[name='"+key+"']").val(searchForm[key]);
        }
    }
    getpageRecord();
    //返回定位必须-end
    getCompany();
    $.showActionLoading();
    setTimeout(queryList,1000);
    updateMenuLocationInfo();
});
var jin=false;

function searchGoodsModels(){
    if(jin){
        return;
    }
    jin=true;
    setTimeout(function(){
        jin=false;
    },500);
    if($(".searchDataDiv").attr("_show")==0){
        $(".searchDataDiv").hide().attr("_show",'1');
        $(".searchDataDiv").animate({
            height : 'toggle',
            opacity : 'toggle'
        }, "slow");
    }else{
        $(".searchDataDiv").hide().attr("_show",'0');
    }

}
//点击查询按钮时
function searchData(){
    isSearch=true;
    currentPageNo=1;
    saveFormData("TalentTryoutSearchForm");
    $('#comp').selectpicker('refresh');
    queryList();
}
//点击重置按钮
function resetinput() {
    isSearch=false;
    $("#TalentTryoutSearchForm", $(".reasonRefund"))[0].reset();
    $("select").val(-1);
    $("#comp").selectpicker('val',-1);
    dellocalStorageCookie(currPageName);
    currentPageNo = 1;
    pageRows = 10;
    queryList();
}

function queryList() {
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'status,create_time desc',
    };
    if(isSearch){
        $.showActionLoading();
            var comid = $("#comp option:selected").val();
            if(comid && comid!=-1){
                // data.comp_id = "=,"+comid;
                data.comp_id = comid;
            }else {
                delete data.comp_id;
            }
            // }
            var startTime=$("#startTime").val();
            var endTime=$("#endTime").val();
            if(startTime!=''||endTime!==''){
                if(startTime!=''&&endTime!==''){
                    if(startTime<endTime){
                        data.create_time='>,'+startTime+',<,'+endTime
                    }else{
                        showError("结束时间大于开始时间");
                        return
                    }
                }else{
                    if(startTime){
                        data.create_time='>,'+startTime
                    }
                    if(endTime){
                        data.create_time='<,'+endTime
                    }
                }
            }
            var name=$("#name").val();
            if(name!=''){
                data.name=name;
            }
            var status=$("#status option:selected").val();
            if(status && status!=''&&status!='-1'){
                data.status=status;
            }else{
                data.status != 99;
            }
        data.search=1;
    }

    zhget(base_url_goods,data).then( function(result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-goodsList')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result,'menu-template', 'menu-placeholder');
        }
    });
}


function onAddClick() {
    location.href="admin.html?_t="+Math.random()+"#pages/companyPack/addGoods.html";
}

function onUpdateClick(id,copy) {
    location.href="admin.html?_t="+Math.random()+"#pages/companyPack/addGoods.html?id="+id;
}
function updatestatus(dom,id,status){
    var boo=false;
    if(status==4){
        if(confirm("确定要下架该产品吗？")){
            boo=true;
        }
    }
    if(status==3){
        if(confirm("确定要上架该产品吗？")){
            boo=true;
        }
    }
    if(boo){
        zhput(base_url_goods+"/"+id, {status:status}).then( function(result) {
            if(checkData(result,'put')) {
                queryList();
            }
        });
    }
}
function onSearchClick() {
    // getCompany();
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

function onDeleteClick(id) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_goods + "/" + id, null).then(function (result) {
            if(checkData(result,'delete')) {
                queryList();
            }
        });
    }
}

function onSaveClick() {
    var id = $("#id").val();
    var data = {
        name: $("#name").val(),
        pid:MenuDeeps[MenuDeep],
        deep:MenuDeep+1,
        title: $("#title").val(),
        url:$("#url").val()
    };
    if (operation == "add") {
        zhpost(base_url_menu, data, saveResult);
    } else {
        zhput(base_url_menu + "/" + id, data, saveResult);
    }
}

function saveResult(result) {
    if (result.code!=200) {
        showError('保存失败！');
    } else {
        $('#userModal').modal('hide');
        queryList();
        showSuccess('保存成功！');
    }
}

function fillForm(id) {
    var index = 0;
    for (index in menu.rows) {
        var item = menu.rows[index];
        if (item.id == id) {
            $("#id").val(item.id);
            $("#name").val(item.name);
            $("#url").val(item.url);
            $("#pid").val(item.pid);
            $("#deep").val(item.deep);
            return;
        }
    }
}

function cleanForm() {
    $("#id").val("");
    $("#name").val("");
    $("#pid").val("");
    $("#url").val("");
    $("#deep").val("");
}

function returnUpDeep(){
    if(MenuDeep>0)
        onMenu_ManageClick(MenuDeeps[MenuDeep-1],MenuDeep-1)
}

function getCompany() {
    $("#comp").html("");
    var data={
        category:5
    }
    if(sessionStorage.getItem("compid")&&sessionStorage.getItem("compid")!=''){
        data.id=sessionStorage.getItem("compid")
    }
    zhget(base_url_company,data).then(function (result) {
        if(result.code==200){
            var html = '<option value="-1">请选择</option>';
            for(var i = 0; i<result.rows.length;i++){
                html+='<option value="'+result.rows[i].id+'">'+result.rows[i].name+'</option>'
            }
            $("#comp").append(html);
        }else{
            var html = '<option value="-1">请选择</option>';
            $("#comp").append(html);
        }
        initselect("comp");
        if(isSearch){
            $("#comp").selectpicker('val',searchForm["comp_id"]);
        }
    })
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
var statusname=["草稿","待审核","拒绝","上架","下架"]
Handlebars.registerHelper('getstatusname', function(value, options) {
    return statusname[value]
});
Handlebars.registerHelper('getprice', function(v1, options) {
    if(!v1){
        return 0;
    }
    return formatPriceFixed2(v1)
});
Handlebars.registerHelper("superif", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('getindex', function(v1, options) {
    return v1+1;
});
Handlebars.registerHelper("ifeq", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});
var goodsStatus=["单品","团购","秒杀"];
Handlebars.registerHelper('getGoodsStatus', function(v1, options) {
    return goodsStatus[v1];
});
