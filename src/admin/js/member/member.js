/**
 * Created by kechen on 2016/10/19.
 */
var base_url_member='/rs/v_member';

var list = [];
var server_list = [];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var onequerylist = true;
$(function() {
    var page = getUrlParamsValue("page");
    if(page&&page != "undefined"){
        currentPageNo = page;
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
        isSearch = false;
    }
}

// 用户信息页面渲染
var isSearch = false;
function searchData(){
    isSearch = true;
    currentPageNo = 1;
    queryList();

}

function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
        rank:"<,30",
        order:'create_time desc'
    };
    if(isSearch){
        var username = $("#username").val();
        var startTime = $("#getTimeStart").val();
        var endTime = $("#getTimeEnd").val();
        var status = $("#status").val();
        var nickname = $("#nickname").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(parseFloat(new Date(startTime))<parseFloat(new Date(endTime))){
                    data.create_time='>=,'+startTime+',<=,'+endTime
                }else{
                    alert("结束时间不能小于开始时间")
                    return
                }
            }else{
                if(startTime){
                    data.create_time='>=,'+startTime
                }
                if(endTime){
                    data.create_time='<=,'+endTime
                }
            }
        }
        if(username != ''){
            data.phone = username;
        }
        if(status != ""){
            data.gender = status;
        }
        if(nickname != ''){
            data.nickname = nickname;
        }
        data.search = 1;
    }

    $("#event-placeholder").html("");
    zhget(base_url_member, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
            // buildTable(result, 'event-template', 'event-placeholder');
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
            if(onequerylist){
                onequerylist = false;
                jQuery("#goToPagePaginator").val(currentPageNo);
                jQuery("#gotoPage").click();
            }
        }
    });
}
// 用户状态禁用
function forbid(id,status){
    // if(status==9){
    //     status = 1
    // }else {
    //     status = 0
    // }
    if(status==9){
        status = 1
    }else if(status==1){
        status = 0
    }else if(status==0){
        status = 1
    }

    zhput("/rs/member/"+id,{status:status}).then(function (result) {
        if(result.code==200){
            if(status==0)
                showSuccess("禁用成功");
            else{
                showSuccess("启用成功")
            }
            queryList();
        }else {
            showError("操作失败")
        }
    })
}
// 查看用户详情
function showFansDetailInfo(id){
    location.href="admin.html#pages/member/memberDetailInfo.html?id="+id+"&page="+$("#paginator .active a").html();
}
Handlebars.registerHelper('getuserStatus', function(v1, options) {
    if(v1 ==0) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
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
Handlebars.registerHelper('equal_nv', function(v1, options) {
    if(v1 =="1") {
        return "男";
    }
    else if(v1=="2") {
        return "女";
    }else{
        return "";
    }
});