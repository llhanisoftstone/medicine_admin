/**
 * Created by kechen on 2016/9/1.
 */
var base_url_goods = '/rs/ticket';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
var isSearch=false;
var compid;
$(function() {
    compid = getCookie('storeid');
    var searchForm = getlocalStorageCookie("searchForm");
    if(searchForm&&searchForm != '{}'){
        searchForm = JSON.parse(searchForm);
        onSearchClick();
        searchData();

    }else{
        queryList();
    }
    updateMenuLocationInfo();
});

var statusname=["草稿","待审核","拒绝","上架","下架",'pc产品无状态']
Handlebars.registerHelper('getstatusname', function(value, options) {
        return statusname[value]
});

Handlebars.registerHelper("superif", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});

Handlebars.registerHelper("notsuperif", function (v1,v2, options) {
    if (v1 != v2) {
        return options.fn(this);
    }
});

var goodsStatus=["单品","团购","秒杀"];
Handlebars.registerHelper('getGoodsStatus', function(v1, options) {
    return goodsStatus[v1];
});
function resetinput() {
    isSearch=false;
    $("#TalentTryoutSearchForm", $(".reasonRefund"))[0].reset();
    queryList();
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    $("#table-goodsList").next("div").children("span").remove();
    $("#paginator").html('');
    queryList();
}

function queryList() {
    var pageRecord = getlocalStorageCookie("pageRecord");
    if(pageRecord&&pageRecord>0){
        dellocalStorageCookie("pageRecord");
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
    }
    var data={
        order:'status,create_time desc',
        page: currentPageNo,
        size: pageRows,
        status:1,
        store_id:compid,
    }
    if(isSearch){
        var searchForm = getlocalStorageCookie("searchForm");
        searchForm = JSON.parse(searchForm);
        if(searchForm){
            dellocalStorageCookie("searchForm");
            for(var key in searchForm){
                $("input[name='"+key+"']").val(searchForm[key]);
                $("select[name='"+key+"']").val(searchForm[key]);
            }
        }
        var id=$("#goodsId").val();
        if(id!=''){
            data.id=id;
        }
        var name=$("#name").val();
        if(name!=''){
         data.name=name;
        }
        data.search=1;
    }
    zhget(base_url_goods, data).then( function(result) {
        if(checkData(result,'get','queryList','table-goodsList')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
        }
    });
}

function onAddClick() {
    location.href="admin.html#pages/goods/addGoods.html"
}

function onUpdateClick(id,copy) {
    var thispage  = window.location.hash;
    thispage = thispage.replace('#','');
    setlocalStorageCookie("thispage",thispage);
    var searchForm = $("#TalentTryoutSearchForm").form2json();
    console.log(searchForm);
    setlocalStorageCookie("searchForm",JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    if(copy=='copy'){
        location.href="admin.html#pages/goods/addGoods.html?pid="+id+'&copy=copy';
    }else{
        location.href="admin.html#pages/goods/addGoods.html?pid="+id;
    }
}
function onSearchClick() {
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

function delClickup(id){
    if(confirm("确认要删除该产品吗？")){
        zhput(base_url_goods+"/"+id,{status:99}).then(function(res){
            var page=jQuery("#paginator li.active a").html();
            if(res.code==200){
                var lists=jQuery("#menu-placeholder tr");
                if(lists.length==1){
                    currentPageNo=(page-1);
                    $("#pageIndex").val(currentPageNo);
                    queryList();
                }else{
                    queryList();
                }
                showSuccess("删除成功");
            }else{
                showError("删除失败")
            }
        })
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
