/**
 * Created by Administrator on 2018/4/26.
 */
var base_url_table='/rs/bad_record';
var list = [];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var userlevel;
var compid;
var u_id;
$(function() {
    compid = sessionStorage.getItem('compid');
    u_id = sessionStorage.getItem('uid');
    userlevel = sessionStorage.getItem('userlevel');
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
        progress: 3,
        order:'filling_time desc',
        alarm: 2,
        type: 0
    }
    if(isSearch){
        var realname=$("#realname").val();
        if(realname!=''){
            data.realname=realname;
            data.search=1;
        }
        var common_name=$("#common_name").val();
        if(common_name!=''){
            data.common_name=common_name;
            data.search=1;
        }
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<=endTime){
                    data.filling_time='>,'+startTime+',<,'+endTime
                }else{
                    showError("结束时间不能小于开始时间");
                    return
                }
            }else{
                if(startTime){
                    data.filling_time='>,'+startTime
                }
                if(endTime){
                    data.filling_time='<,'+endTime
                }
            }
        }
    }
    if(userlevel == 80){
        data.comp_id = compid;
        base_url_table = '/rs/v_bad_record_comp'
    }
    if(userlevel == 81){
        data.userid = u_id;
        base_url_table = '/rs/v_bad_record_user'
    }
    $("#event-placeholder").html('');
    zhget(base_url_table, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
            var integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.typetext = switchType(indexCode.type)
                indexCode.resulttext = switchResult(indexCode.result)
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTableByke(result,'event-template','event-placeholder','paginator',queryList,pageRows);
        }
    });
}

function downloadData(){
    var data = {
        progress: 3,
        type: 0,
        order:'filling_time desc'
    }
    if(isSearch){
        var realname=$("#realname").val();
        if(realname!=''){
            data.realname=realname;
            data.search=1;
        }
        var common_name=$("#common_name").val();
        if(common_name!=''){
            data.common_name=common_name;
            data.search=1;
        }
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<=endTime){
                    data.filling_time='>,'+startTime+',<,'+endTime
                }else{
                    showError("结束时间不能小于开始时间");
                    return
                }
            }else{
                if(startTime){
                    data.filling_time='>,'+startTime
                }
                if(endTime){
                    data.filling_time='<,'+endTime
                }
            }
        }
    }
    zhget('/rs/drugs_download', data).then( function(result) {
        if(result.code==200&&result.path){
            location.href=targetUrl+result.path;
        }else if(result.code==602){
            showError("暂无数据")
        }else{
            showError("导出失败")
        }
    });
}

function switchResult(result){
    switch (result) {
        case 1:
            return '痊愈'
        case 2:
            return '好转'
        case 3:
            return '未好转'
    }
}

function switchType(type){
    switch (type) {
        case 0:
            return '未处理'
        case 1:
            return '初次'
        case 2:
            return '一般'
        case 3:
            return '严重'
    }
}

function lookdata(id){
    location.href="admin.html#pages/bads_record/bads_record_details.html?id="+id
}