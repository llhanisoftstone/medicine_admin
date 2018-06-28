/**
 * Created by Administrator on 2018/4/26.
 */
/**
 * Created by kechen on 2016/10/19.
 */
var base_url_member='/rs/cooperator';

var list = [];
var server_list=[];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var onequerylist=true;
$(function() {
    var page=getUrlParamsValue("page");
    if(page&&page!="undefined"){
        currentPageNo=page;
    }
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
        order:'status asc,create_time desc'
    }
    if(isSearch){
        var phone=$("#phone").val();
        var name=$("#name").val();
        var contacts=$("#contacts").val();
        if(contacts!=''){
            data.contacts=contacts;
        }
        if(name!=''){
            data.name=name;
        }
        if(phone!=''){
            data.phone=phone;
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
            buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
            if(onequerylist){
                onequerylist=false;
                jQuery("#goToPagePaginator").val(currentPageNo);
                jQuery("#gotoPage").click();
            }
        }
    });
}
function rejectClick(id){
    $('#rejectModal').modal('show');
    $("#reject_Reasons").val("");
    $("#rejectId").val(id);
}
function onSaveRejectClick(){
    var id=$("#rejectId").val();
    var reject_reason=$("#reject_Reasons").val().trim();
    var data={
        status:"2"
    };
    if(reject_reason==null||reject_reason==""){
        return showError("请输入拒绝原因")
    }else{
        data.remark=reject_reason;
    }
    $('#rejectModal').modal('hide');
    zhput("/rs/cooperator"+"/"+id,data).then(function(result){
        if(result.code==200){
            queryList();
            showSuccess("拒绝成功");
        }else{
            showError("拒绝失败")
        }
    })
}
function forbid(id,u_id){
    if(confirm("确定要禁用该合作商功能吗？")) {
        zhput("/rs/cooperator" + "/" + id, {status: 3}).then(function (result) {
            if (result.code == 200) {
                zhput("/rs/member/" + u_id,{rank:1}).then(function(result){
                    queryList();
                    showSuccess("禁用成功");
                })
            } else {
                showError("禁用失败")
            }
        })
    }
}
function openstart(id,u_id){
    if(confirm("确定要启用该合作商功能吗？")) {
        zhput("/rs/cooperator" + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                zhput("/rs/member/" + u_id,{rank:20}).then(function(result){
                    queryList();
                    showSuccess("启用成功");
                })
            } else {
                showError("启用失败")
            }
        })
    }
}
function agreeClick(id,u_id){
    if(confirm("确定要通过吗？")) {
        zhput("/rs/cooperator" + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                zhput("/rs/member/" + u_id,{rank:20}).then(function(result){
                    queryList();
                    showSuccess("审核通过");
                })

            } else {
                showError("审核失败")
            }
        })
    }
}
Handlebars.registerHelper('equal', function(v1,v2, options) {
    if(v1 ==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('gettimes', function(v1, options) {
    if(v1) {
            var time=(v1.slice(1,(v1.length-1))).split(",");
            var html=""
            for(var i=0;i<time.length;i++){
                html+=time[i].replace(/-/g, ":00-");
                html+=":00,";
            }
        return html.slice(0,html.length-1);

    }
});
Handlebars.registerHelper('is_judge', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});