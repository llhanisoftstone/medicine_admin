/**
 * Created by kechen on 2016/9/21.
 */

var base_url_category='/rs/banner_category';
var base_url_banner='/rs/banner';
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var searchForm; //查询条件JSON
var urank=sessionStorage.getItem('userrank');
var compid=sessionStorage.getItem('compid');
$(function() {
    $("#resetSearchBtn", $(".bannerreport")).bind("click", function(){
        $("#reasonSearchForm", $(".bannerreport"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("body").on("input","#goToPagePaginator",function(){
        num_limit(this,{max:11,dec:false})
    })
    $("#searchBtn", $(".bannerreport")).unbind("click");
    $("#searchBtn", $(".bannerreport")).bind("click", showSearchPage);

    zhget(base_url_category).then(function (rs) {
        if (rs.code == 200) {
            var html = '<option value="" selected="selected">全部</option>';
            rs.rows.forEach(function (it, i) {
                html += '<option value="' + it.id + '">' + it.name + '</option>';
            })
            $('#category').html(html);
            // queryList();
        }
    })


});
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
    setTimeout(queryList,1000);
    updateMenuLocationInfo();
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
    location.href="admin.html?_t="+Math.random()+"#pages/banner/addBanner.html"
}
function onUpdateClick(id) {
    location.href="admin.html?_t="+Math.random()+"#pages/banner/addBanner.html?id="+id;
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
    $("#paginator").html('');
    queryList();
}

// 页面渲染
function queryList() {
            var data = {
                order:'status desc,create_time desc',
                page: currentPageNo,
                size: pageRows,
                status:'<>,9'
            }
            if(compid){
                data.comp_id=compid
            }
            if(urank==91){//平台管理员
                data.category=1;
            }else{
                data.category=2;
            }
            if(isSearch){
                var title=$("#titlebanner").val();
                var status=$("#status").val();
                if(title!=''&&title!=0){
                    data.title=title;
                    data.search=1;
                }
                if(status!=''&&status!=-1){
                    data.status=status;
                }
            }
            $("#banner-placeholder").html('');
            zhget(base_url_banner,data).then(function (result){
                if(checkData(result,'get','queryList','table-member')) {
                    integrals = result.rows;
                    for (var i = 0; i < integrals.length; i++) {
                        var indexCode = integrals[i];
                        indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                    }
                    buildTableByke(result, 'banner-template', 'banner-placeholder','paginator',queryList,pageRows);
                }
            })
}

// 删除按钮功能------写app=2
function onDeleteClick(el,id){
    if(confirm("确认要删除？")) {
        zhput(base_url_banner+"/"+id,{status:9}).done(function(result){
            // debugger
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

Handlebars.registerHelper('category', function(v1, options) {
    return category[v1];
})
Handlebars.registerHelper('superif', function(v1,v2, options) {
    if(v1==v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('bannerEndTime', function(endTime, options) {
    var end = new Date(endTime).getTime();
    var now=Date.parse(new Date());
    if(end > now) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
