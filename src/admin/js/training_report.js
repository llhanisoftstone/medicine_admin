/**
 * Created by Administrator on 2018/11/30.
 */
var base_url_activity = '/rs/v_activity_up';
var base_url_report = '/rs/activity';
var currentPageNo = 1;
var pageRows = 10;
var resultdata = [];
var check_val=[];
var user_status; //企业审核状态：0-待审核；1-审核通过;3-审核拒绝 ; 9-草稿
var enter_id; //企业id
var issearch;
$(function () {
    user_status=getCookie('user_status') || sessionStorage.getItem("user_status");
    enter_id=getCookie('compid') || sessionStorage.getItem("compid");
    // 待放开
    // if(user_status!=1){
    //     $('#page-content').hide();
    //     $('#right-item-box').hide();
    //     $('#checking').show();
    //     return;
    // }
    queryList();
    $("#GiftCardSearchCancel").bind("click", function(){
        $("#GiftCardSearchForm")[0].reset();
        queryList();
    });
    $("#GiftCardSearch").unbind("click");
    $("#GiftCardSearch").bind("click",searchNotification);
});
//查询
function searchNotification(){
    issearch=true;
    currentPageNo=1;
    queryList();
}
$('#checkboxAll').click(function () {
    var a = $('#checkboxAll').is(':checked');
    if(a == true) {
        $('.pack').prop('checked',a);
    }else{
        $('.pack').prop('checked',a);
    }
})
function queryList() {
    var loadIndex = layer.load(2, {time: 10*1000}); //最长等待10秒
    $('#checkboxAll').prop('checked',false);
    var data={
        page: currentPageNo,
        size: pageRows,
        enter_id:enter_id,
        ins:['status','2','3','10','11','12','13']
    };
    if(issearch){
        var activityTitle=$("#activityTitle").val().trim();
        if(activityTitle!=""||activityTitle!=null){
            data.name=activityTitle;
        }
        var status=$("#status").val();
        if(status!=-1){
            data.status='=,'+status;
        }
        data.search=1;
    }
    zhget(base_url_activity,data).then(function(result) {
        layer.close(loadIndex);
        if(result.code == 200){
            var reportdata = result.rows;
            for(var i=0;i<result.rows.length;i++){
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            for(var i=0;i<reportdata.length;i++){
                if(reportdata[i].status != "12" && reportdata[i].status != "11"){
                    resultdata.push(reportdata[i].status);
                }
            }
            var  resultdatalength = resultdata.length;
            buildTable(result, 'training-template', 'training-placeholder');
            $('.pack').each(function () {
                var _this = $(this);
                _this.click(function () {
                    var m = $("input[name='checkbox']:checked").length;
                    var thischecked =  _this.is(':checked');
                    if( thischecked == false){
                        $('#checkboxAll').prop('checked',false);
                    }else if(m == resultdatalength){
                        $('#checkboxAll').prop('checked',true);
                    }
                })
            })
        }else {
            $("#training-placeholder").html("<tr><td colspan='10' style='text-align: center'>暂无数据</td></tr>");
        }
    });
}

// 选中的值
function selected(){
    var obj = document.getElementsByName("checkbox");
    for(var k in obj){
        if(obj[k].checked){
            if(obj[k].value != "12"){
                check_val.push(obj[k].id);
            }
        }
    }
}
//批量处理
function onUserAddClick() {
    selected();
    var m = $("input[name='checkbox']:checked").length;
    if($('#checkboxAll').is(':checked') == true && m<1){
        layer.msg('没有可上报活动~', {icon:3});
        return;
    }else if(m<1){
        layer.msg('请选择上报活动~', {icon:3});
        return;
    }
    layer.confirm('确认上报吗？', {
        resize:false,
        move: false,
        btn: ['确定','取消'] //按钮
    }, function(index){
        layer.close(index);
        var data={
            values : 1,
            ids:check_val,
            field:{status:11}
        }
        zhput(base_url_report+"/"+1,data).then(function(result) {
            if(result.code == 200){
                layer.msg('上报成功！', {icon:1});
                queryList();
            }else {
                layer.msg('上报失败！', {icon:2});
            }
        });
    });
}

// 拒绝原因
function refusedTo(id) {
    layer.open({
        title:'拒绝原因',
        type: 1,
        resize:false,
        move: false,
        btn:['取消'],
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 1, //不显示关闭按钮
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        offset: ['200px', '35%'],
        area:["550px","230px"],
        content:$('#RefusedTo')
    });
    zhget(base_url_activity+'/'+id).then(function(result) {
        if(result.code == 200){
            if(result.rows[0].refuse_reason==""||result.rows[0].refuse_reason==undefined||result.rows[0].refuse_reason==null){
                result.rows[0].refuse_reason="无";
            }else {
                $("#why_text").val(result.rows[0].refuse_reason);
            }
        }
    })
}
/*高级搜索*/
function onSearchClick() {
    $(".brandSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
//状态
Handlebars.registerHelper('stateDate', function(v1, options) {
    switch(v1)
    {
        case 0:
            return ""
            break;
        case 1:
            return "待审核"
            break;
        case 2:
            return "进行中"
            break;
        case 3:
            return "已经结束"
            break;
        case 4:
            return "审核拒绝"
            break;
        case 10:
            return "未上报"
            break;
        case 11:
            return "待处理"
            break;
        case 12:
            return "已通过"
            break;
        case 13:
            return "已拒绝"
            break;
    }
});
//拒绝显示
// Handlebars.registerHelper('stateRefused', function(v1, options) {
//     if(v1 != 13){
//         return 'refusedHide';
//     }
// });
//通过隐藏
// Handlebars.registerHelper('statenone', function(v1, options) {
//     if(v1 == 12 || v1 == 11){
//         return 'labelhide';
//     }
// });
//年.月.日
Handlebars.registerHelper('getspotDate', function(v1, options) {
    if(v1 ==''||v1== undefined || v1 == null){
        return '';
    }
    var data=Date.parse(v1);
    data=new Date(data);
    return data.getFullYear()+"."+parseInt(data.getMonth()+1)+"."+data.getDate();
});