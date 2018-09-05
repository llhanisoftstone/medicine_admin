/**
 * Created by Administrator on 2018/2/10.
 */
var base_url_course = '/rs/infomation';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var organizid=sessionStorage.getItem('organiz_id') ? sessionStorage.getItem('organiz_id') : getCookie('organiz_id');
$(function() {
    var searchForm = getlocalStorageCookie("searchForm");
    if(searchForm&&searchForm != '{}'){
        searchForm = JSON.parse(searchForm);
        onSearchClick();
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
        order:'is_hot desc,create_time desc',
        page: currentPageNo,
        size: pageRows,
        organiz_id:organizid,
        status:'<,99',//状态：0-草稿；1-待审核，2-上架，3-拒绝，4-下架；
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
        var title = $("#title").val();
        if(title!=''){
            data.title = title;
            data.search=1;
        }
        var unique_code=$("#unique_code").val();
        if(unique_code!='全部'){
            data.unique_code=unique_code;
        }
        var is_hot=$("#is_hot").val();
        if(is_hot!='全部'){
            data.is_hot=is_hot;
        }
        var status=$("#status").val();
        if(status && status!="-1"){
            data.status=status;
        }
    }
    $.showActionLoading();
    zhget(base_url_course, data).then( function(result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-goodsList')) {
            for (var i = 0; i < result.rows.length; i++) {
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
                if(result.rows[i].unique_code == 'zcbl'){
                    result.rows[i].unique_code = "办理类";
                }else{
                    result.rows[i].unique_code = "政策类";
                }
                result.rows[i].pic_abbr = targetUrl + result.rows[i].pic_abbr;
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
        }
    });
}

function onAddClick() {
    location.href="admin.html#pages/policy/addpolicy.html"
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
        location.href="admin.html#pages/policy/addpolicy.html?id="+id+'&copy=copy';
    }else{
        location.href="admin.html#pages/policy/addpolicy.html?id="+id;
    }
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
function onSearchClick() {
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}