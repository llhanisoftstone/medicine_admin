/**
 * Created by Administrator on 2018/4/26.
 */
var base_url_member='/rs/store_classify';

var list = [];
var server_list=[];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var compid;
$(function() {
    $.initSystemFileUpload($("#uploadImg"), onUploadDetailPic);
    var page=getUrlParamsValue("page");
    if(page&&page!="undefined"){
        currentPageNo=page;
    }
    compid = getCookie('storeid');
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    queryList();
});
// 图片上传
function onUploadDetailPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
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

// 用户信息页面渲染
var isSearch=false;
function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();

}

function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
        status:1,
        store_id:compid,
    }
    if(isSearch){
        var realname=$("#nickname").val();
        if(realname!=''){
            data.name=realname;
        }
        var category=$("#category").val();
        if(category&&category!="-1"){
            data.category=category;
        }
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<endTime){
                    data.create_time='>,'+startTime+',<,'+endTime
                }else{
                    alert("结束时间大于开始时间")
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
        data.search=1;
    }

    $("#event-placeholder").html('');
    zhget(base_url_member, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTableByke(result,'event-template','event-placeholder','paginator',queryList,pageRows);
        }
    });
}
function delClick(id){
    if(confirm("确认要删除该信息吗？")){
        zhput('/rs/store_classify/'+id,{status:9}).then(function(res){
            var page=jQuery("#paginator li.active a").html();
            if(res.code==200){
                var lists=jQuery("#event-placeholder tr");
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
function addcompany(id){
    if(id){
        window.location.href="/admin/admin.html#pages/shopmain/addshopmessage.html?pid="+id;
    }else{
        window.location.href="/admin/admin.html#pages/shopmain/addshopmessage.html";
    }

}