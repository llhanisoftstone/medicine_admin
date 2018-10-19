/**
 * Created by Administrator on 2018/2/10.
 */
var base_url_course = '/rs/notify';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var urank=sessionStorage.getItem('userrank');
var compid=sessionStorage.getItem('compid');
// var organizid=sessionStorage.getItem('organiz_id') ? sessionStorage.getItem('organiz_id') : getCookie('organiz_id');
$(function() {
    var searchForm = getlocalStorageCookie("searchForm");
    if(searchForm&&searchForm != '{}'){
        searchForm = JSON.parse(searchForm);
        // onSearchClick();
        searchData();
    }else{
        queryList();
    }
});

Handlebars.registerHelper("superif", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('getindex', function(v1, options) {
    return v1+1;
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
        order:'is_main desc,sequence desc,create_time desc',
        page: currentPageNo,
        size: pageRows,
        comp_id:compid,
        status:'1'
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
        var name = $("#name").val();
        if(name!=''){
            data.name = name;
            data.search=1;
        }
        var is_main=$("#is_main").val();
        if(is_main!="-1"){
            data.is_main=is_main;
        }
    }
    $.showActionLoading();
    zhget(base_url_course, data).then( function(result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-goodsList')) {
            for (var i = 0; i < result.rows.length; i++) {
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
                result.rows[i].list_pic_path = targetUrl + result.rows[i].list_pic_path;
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
        }
    });
}

function onAddClick() {
    location.href="admin.html#pages/notice/addnotice.html"
}
function onSetUpClick(id,ishot) {
    if(ishot == 0){
        if(confirm("确认要设置该政策为热点信息吗？")) {
            var time = new Date(new Date().getTime()).Format('yyyy-MM-dd hh:mm:ss');
            zhput(base_url_course+"/"+id,{is_hot:1,hot_time:time}).then(function (rs) {
                if(checkData(rs,'put')) {
                    queryList();
                }
            })
        }
    }else if (ishot == 1){
        if(confirm("确认要取消该政策为热点信息吗？")) {
            zhput(base_url_course+"/"+id,{is_hot:0}).then(function (rs) {
                if(checkData(rs,'put')) {
                    queryList();
                }
            })
        }
    }
}
function onUpdateClick(id,copy) {
    var thispage  = window.location.hash;
    thispage = thispage.replace('#','');
    setlocalStorageCookie("thispage",thispage);
    var searchForm = $("#TalentTryoutSearchForm").form2json();
    if (searchForm.unique_code == '全部'){
        delete searchForm.unique_code;
    }
    console.log(searchForm);
    setlocalStorageCookie("searchForm",JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    if(copy=='copy'){
        location.href="admin.html#pages/notice/addnotice.html?id="+id+'&copy=copy';
    }else{
        location.href="admin.html#pages/notice/addnotice.html?id="+id;
    }
}
//提交审核
function submitcheck(id){
    if(confirm("确定要直接提交审核该题目吗？")) {
        zhput(base_url_course + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("提交成功");
            } else {
                showError("提交失败")
            }
        })
    }
}
//查看详情
function viewDetail(id) {
    location.href="admin.html#pages/notice/addnotice.html?id="+id+'&copy=copy&read=read';
}
function onDeleteClick(id) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_course + "/" + id).then(function (result) {
            console.log(result);
            var page=jQuery("#paginator li.active a").html();
            if (result.code == 200) {
                var lists=jQuery("#menu-placeholder tr");
                if(lists.length==1){
                    currentPageNo=(page-1);
                    $("#pageIndex").val(currentPageNo);
                    queryList();
                }else{
                    queryList();
                }
                showSuccess('删除成功！');
            } else {
                showError('删除失败！');
            }
        });
    }
}
//状态：0-草稿；1-待审核；2-通过；3-拒绝；4-下架；99-删除；
//下架
function questiondown(id){
    if(confirm("确定要下架该政策百科吗？")) {
        zhput(base_url_course + "/" + id, {status: 4}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("下架成功");
            } else {
                showError("下架失败")
            }
        })
    }
}
//上架   下架之后再上架就是待审核
function questionup(id){
    if(confirm("确定要上架该政策百科吗？")) {
        zhput(base_url_course + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("上架成功");
            } else {
                showError("上架失败")
            }
        })
    }
}
function onSearchClick() {
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}