var base_use_information='/rs/information';
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;

//返回定位必须-start
var searchForm; //查询条件JSON
//获取當前頁面url
var currPageName  = (window.location.hash).replace('#','');
//当前页面跳转、刷新之前保存页码和表单数据，需要在页面跳转时添加Math.random(),否则监听不到
window.onbeforeunload=function(){
    saveFormData("reasonSearchForm");//此处改为当前form页的id
};
function saveFormData(formId){
    searchForm = $("#"+formId).form2json();
    setlocalStorageCookie(currPageName,JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
}
//返回定位必须-end

$(function() {
    getpageRecord();
    setTimeout(function(){
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
    },100);
    //返回定位必须-end

    $("#resetSearchBtn", $(".bannerreport")).bind("click", function(){
        $("#reasonSearchForm", $(".bannerreport"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".bannerreport")).unbind("click");
    $("#searchBtn", $(".bannerreport")).bind("click", showSearchPage);

    queryList();
});
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
function onAddClick() {
    location.href="admin.html#pages/addinformation.html"
}
function onUpdateClick(id) {
    location.href="admin.html?_t="+Math.random()+"#pages/addinformation.html?id="+id;
}
function onSearchClick() {
    $(".reasonSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();
}

// 页面渲染
function queryList() {
    var data = {
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows,
        status: '<>,99'
    }
    if(isSearch){
        var title=$("#title").val();
        if(title){
            data.title=title;
            data.search=1;
        }
    }
    $("#banner-placeholder").html('');
    zhget(base_use_information,data).then(function (result){
        if(checkData(result,'get','queryList','table-member')) {
            var integrals = result.rows;
            for(var i=0;i<result.rows.length;i++){
                var indexCode = result.rows[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                if(result.rows[i].picpath==null){
                    result.rows[i].picpath = ''
                }else{
                    result.rows[i].picpath = targetUrl + result.rows[i].picpath
                }
            }
            buildTableByke(result, 'banner-template', 'banner-placeholder','paginator',queryList,pageRows);
        }
    })
}

function onDeleteClick(el,id){
    if(confirm("确认要删除？")) {
        zhput(base_use_information+"/"+id,{status:99}).done(function(result){
            if(result.code == 200){
                showSuccess('删除成功！');
                if(jQuery(el).parents("tbody").find("tr").length==1){
                    if(currentPageNo>1){
                        currentPageNo--;
                    }
                    jQuery("#goToPagePaginator").val(currentPageNo);
                    jQuery("#goToPagePaginator").next().click();
                }else{
                    queryList();
                }
            }else{
                showError("删除失败");
            }
        })
    }
}