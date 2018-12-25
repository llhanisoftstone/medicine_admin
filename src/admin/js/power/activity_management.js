/**
 * Created by Administrator on 2017/9/1.
 */
var base_url_notification="/rs/activity";
var currentPageNo = 1;
var pageRows1 = 10;
var issearch=false;
var univ_id=sessionStorage.getItem('university_id');
var searchForm; //查询条件JSON
var enter_id; //企业id
var user_status; //企业审核状态：0-待审核；1-审核通过;3-审核拒绝 ; 9-草稿
//获取當前頁面url
var currPageName  = (window.location.hash).replace('#','');
//当前页面跳转、刷新之前保存页码和表单数据，需要在页面跳转时添加Math.random(),否则监听不到
window.onbeforeunload=function(){
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    saveFormData("reasonSearchForm");   //此处改为当前form页的id
};
function saveFormData(formId){
    searchForm = $("#"+formId).form2json();
    setlocalStorageCookie(currPageName,JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
}
$(document).ready(function(){
    enter_id=getCookie('compid') || sessionStorage.getItem("compid");
    user_status=getCookie('user_status') || sessionStorage.getItem("user_status");
    // 待放开
    // if(user_status!=1){
    //     $('#page-content').hide();
    //     $('#right-item-box').hide();
    //     $('#checking').show();
    //     return;
    // }
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
        // category=searchForm.category;
    }
    $("#resetNotifiSearchBtn").bind("click", function(){
        $("#notificationSearchForm")[0].reset();
        queryList();
    });
    queryList();
    $("#searchNotifiData").unbind("click");
    $("#searchNotifiData").bind("click",searchNotification);
})
function getpageRecord(){
    pageRecord =parseInt(getlocalStorageCookie("pageRecord")) ;
    if(pageRecord && pageRecord > 0){
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
        dellocalStorageCookie("pageRecord");
    }
}
function newAddNotification(){
    window.location.href="admin.html#pages/activity_add.html";
}
function searchNotification(){
    issearch=true;
    currentPageNo=1;
    queryList();
}
function queryList(){
    var loadIndex = layer.load(2, {time: 10*1000}); //最长等待10秒
    var data={
        page: currentPageNo,
        size: pageRows1,
        order:"status, create_time desc",
        status:'<>,99',
        enter_id:enter_id
    }
    if(issearch){
        var title=$("#notifiTitle").val().trim();
        if(title!=""||title!=null){
            data.name=title;
        }
        var status=$("#status").val();
        if(status!=-1){
            data.status='=,'+status;
        }

        /*
        var startTime=$("#startTime").val()
        var endTime=$("#endTime").val()
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<endTime){
                    data.create_time='>,'+startTime+',<,'+endTime
                }else{
                    alert("结束时间不能大于开始时间")
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
        }*/

        data.search=1;
    }
    zhget(base_url_notification,data).then(function(result){
        layer.close(loadIndex);
        if (checkData(result, 'get', 'queryList', 'table-notification')) {
            departmentContact=result;
            for(var i=0;i<result.rows.length;i++){
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows1 + i + 1;
                result.rows[i].start_time = result.rows[i].start_time.slice(0,16);
                result.rows[i].end_time = result.rows[i].end_time.slice(0,16);
            }
            buildTableByke(result, 'notification-template', 'notification-placeholder', "paginator", queryList, 10);
        }
    })
}

function typeCategory(i){
    switch(i){
        case 1:
        {
            return "系统消息";
        }
        case 2:
        {
            return "优惠消息";
        }
        case 3:
        {
            return "推送消息"
        }
    }
    return "";
}
function onSearchClick() {
    $(".reasonSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
// 编辑
function toModifyNotifiData(id){
    window.location.href="admin.html?_t="+Math.random()+"#pages/activity_add.html?id="+id;
}
function viewDetail(id){
    window.location.href="admin.html?_t="+Math.random()+"#pages/activity_details.html?id="+id;
}
//提交审核
function submitCheck(id){
    layer.confirm('确定要直接提交审核该培训吗？', {
        title:'提交确认',
        btn: ['确定','取消'] //按钮
    }, function(index){
        layer.close(index);
        zhput(base_url_notification + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                queryList();
                layer.msg('提交成功！', {icon: 1});
            } else {
                layer.msg('提交失败！', {icon: 2});
            }
        })
    });
}
//删除
function delClick(id) {
    layer.confirm('确定要删除该培训吗？', {
        title:'删除确认',
        btn: ['确定','取消'] //按钮
    }, function(index){
        layer.close(index);
        zhput(base_url_notification + "/" + id, {status: 99}).then(function (result) {
            if (result.code == 200) {
                if($("#goodsModel-placeholder").find("tr").length == 1){
                    currentPageNo = currentPageNo>1?currentPageNo-1:1
                }
                queryList();
                layer.msg('删除成功！', {icon: 1});
            } else {
                layer.msg('删除失败！', {icon: 2});
            }
        })

    });
}
// //查看拒绝原因
// function viewReason(id){
//     $('#user_buttonids').hide();
//     $('#viewthereason').show();
//     var data={
//         id:id
//     }
//     zhget(base_url_notification,data).then(function(result){
//         if(result.code==200){
//             var remarks=result.rows[0].check_refuse_reason;
//             $('#reject_Reasons')
//                 .attr('readonly',true)
//                 .val(remarks);
//             $('#rejectModal').modal('show');
//         }else{
//
//         }
//     })
// }
// 查看培训审核拒绝原因
function viewReason(id) {
    layer.open({
        title:'审核拒绝原因',
        type: 1,
        resize:false,
        move: false,
        btn:['关闭'],
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 1, //关闭按钮
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        offset: ['200px', '35%'],
        area:["550px","230px"],
        content:$('#rejectModal')
    });
    zhget(base_url_notification+'/'+id).then(function(result) {
        if(result.code == 200){
            var remarks=result.rows[0].check_refuse_reason;
            if(remarks==""||remarks==undefined||remarks==null){
                remarks="暂无内容";
            }
            $("#reject_Reason").html(remarks);
        }else{
            $("#reject_Reason").html('暂无内容');
        }
    })
}


// 查看上报拒绝原因
function refusedTo(id) {
    layer.open({
        title:'上报拒绝原因',
        type: 1,
        resize:false,
        move: false,
        btn:['关闭'],
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 1, //关闭按钮
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        offset: ['200px', '35%'],
        area:["550px","230px"],
        content:$('#RefusedTo')
    });
    zhget(base_url_notification+'/'+id).then(function(result) {
        if(result.code == 200){
            if(result.rows[0].refuse_reason==""||result.rows[0].refuse_reason==undefined||result.rows[0].refuse_reason==null){
                result.rows[0].refuse_reason="无";
            }else {
                $("#why_text").html(result.rows[0].refuse_reason);
            }
        }
    })
}