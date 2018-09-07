/**
 * Created by kechen on 2016/9/1.
 */
var base_url_goods = '/rs/ticket_send_rule';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
var isSearch=false;
var compid;
var u_id;
$(function() {
    compid = getCookie('storeid');

    var searchForm = getlocalStorageCookie("searchForm");
    if(searchForm&&searchForm != '{}'){
        searchForm = JSON.parse(searchForm);
        onSearchClick();
        searchData();
    }else{
        getmember();
    }
    updateMenuLocationInfo();
});
function getmember(){
    zhget('/rs/member',{store_id:compid,rank:20}).then(function(result){
        if(result.code==200){
            u_id=result.rows[0].id;
            queryList();
        }
    })
}
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
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows,
        u_id:u_id,
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
        var dtStartTimeStart=$("#dtStartTimeStart").val();
        var dtStartTimeEnd=$("#dtStartTimeEnd").val();
        var dtEndTimeStart=$("#dtEndTimeStart").val();
        var dtEndTimeEnd=$("#dtEndTimeEnd").val();
        var end_time = new Date(dtStartTimeEnd);
        end_time = new Date((end_time/1000+86400)*1000).Format("yyyy-MM-dd");//结束时间加一天
        if(dtStartTimeStart!=''&&dtStartTimeEnd!=''){
            data.start_time='>,'+dtStartTimeStart+",<,"+end_time;
        }
        var end_time1 = new Date(dtEndTimeEnd);
        end_time1 = new Date((end_time1/1000+86400)*1000).Format("yyyy-MM-dd");//结束时间加一天
        if(dtEndTimeStart!=''&&dtEndTimeEnd!=''){
            data.end_time='>,'+dtEndTimeStart+",<,"+end_time1;
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

function onAddruleClick() {
    location.href="admin.html#pages/addruleticket.html"
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
        location.href="admin.html#pages/addruleticket.html?pid="+id+'&copy=copy';
    }else{
        location.href="admin.html#pages/addruleticket.html?pid="+id;
    }
}
function onSearchruleClick() {
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
