var base_url='/rs/main_column_item';
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var searchForm; //查询条件JSON
//获取當前頁面url
var currPageName  = (window.location.hash).replace('#','');
//当前页面跳转、刷新之前保存页码和表单数据，需要在页面跳转时添加Math.random(),否则监听不到
window.onbeforeunload=function(){
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    saveFormData("reasonSearchForm");//此处改为当前form页的id
};
function saveFormData(formId){
    searchForm = $("#"+formId).form2json();
    setlocalStorageCookie(currPageName,JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);

}
$(function() {
    getpageRecord();
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
    $("#resetSearchBtn", $(".bannerreport")).bind("click", function(){
        $("#reasonSearchForm", $(".bannerreport"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".bannerreport")).unbind("click");
    $("#searchBtn", $(".bannerreport")).bind("click", showSearchPage);
    var enter=getQueryString("enter");
    if(enter){
        currentPageNo = 1;
        pageRows = 10;
        isSearch=false;
        $("#reasonSearchForm", $(".bannerreport"))[0].reset();
    }
    queryList()

});
function getpageRecord(){
    pageRecord =parseInt(getlocalStorageCookie("pageRecord")) ;
    if(pageRecord && pageRecord > 0){
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
        dellocalStorageCookie("pageRecord");
    }
}
function showSearchPage() {
    $(".reasonSearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".reasonSearch").is(":visible")) {
        isSearch=false;
    }
}

// 点击新建按钮
function onAddClickmessage() {
    var id=getQueryString("pid");
    var target_type=getQueryString("target_type");
    var show_css=getQueryString("show_css");
    $("#reasonSearchForm", $(".bannerreport"))[0].reset();
    setlocalStorageCookie(currPageName,"{}");
    location.href="admin.html#pages/addhomemessage.html?pid="+id+"&target_type="+target_type+"&show_css="+show_css;
}
function onUpdateClick(targetid) {
    var id=getQueryString("pid");
    var target_type=getQueryString("target_type");
    var show_css=getQueryString("show_css");
    location.href="admin.html#pages/addhomemessage.html?pid="+id+"&target_type="+target_type+"&show_css="+show_css+"&targetid="+targetid;
}
function onSearchClickmessage() {
    $(".addModels").css("display","none");
    $(".reasonSearch", $("#wrapper")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function viewDetail(){
    location.href="admin.html#pages/homeconfigmessage.html"
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    $("#paginator").html('');
    saveFormData("reasonSearchForm");
    queryList();
}

// 页面渲染
function queryList() {
    var data = {
        order:'sequence desc',
        page: currentPageNo,
        size: pageRows,
        column_id:getQueryString("pid"),
    }
    if(isSearch){
        var title=$("#titlebanner").val();
        var status=$("#status").val();
        if(title!=''&&title!=0){
            data.name=title;
            data.search=1;
        }
        if(status!=''&&status!=-1){
            data.status=status;
        }
    }
    $("#banner-placeholder").html('');
    zhget('/rs/v_main_column_item',data).then(function (result){
            if(checkData(result,'get','queryList','table-member')) {
                integrals = result.rows;
                for (var i = 0; i < integrals.length; i++) {
                    var indexCode = integrals[i];
                    indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                    if(indexCode.rowNum.show_css==3){
                        indexCode.name=indexCode.cp_name
                    }
                    if(indexCode.rowNum.show_css==3){
                        indexCode.icon_path=indexCode.cp_picpath
                    }
                    indexCode.icon_path=targetUrl+indexCode.icon_path;
                }
                buildTableByke(result, 'bannerhome-template', 'bannerhome-placeholder','paginator',queryList,pageRows);
            }

    })
}
// 点击查看弹出模态框
function onDeleteClick(id){
    if(confirm("确定要删除吗？")) {
        zhput(base_url + "/" + id, {status: 99}).then(function (result) {
            var page=jQuery("#paginator li.active a").html();
            if (result.code == 200) {
                var lists=jQuery("#bannerhome-placeholder tr");
                if(lists.length==1){
                    currentPageNo=(page-1);
                    $("#pageIndex").val(currentPageNo);
                    queryList();
                }else{
                    queryList();
                }
                showSuccess("删除成功");
            } else {
                showError("删除失败")
            }
        })
    }
}
function backgo(){
    location.href="admin.html#pages/homeconfig.html";
}

