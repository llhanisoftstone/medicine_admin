/**
 * Created by Administrator on 2018/11/30.
 */
var base_url_activity = '/rs/activity_record';
var base_url_pic = '/rs/activity_scence_pic';
var currentPageNo = 1;
var pageRows = 10;
var phonepic;
$(function () {
    queryList();
});
function queryList() {
    var pid = getUrlParamsValue("id");
    zhget(base_url_activity, {
        page: currentPageNo,
        size: pageRows,
        act_id:pid
    }).then(function(result) {
        if(result.code == 200){
            for(var i=0;i<result.rows.length;i++){
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'details-template', 'details-placeholder');
        }else {
            $("#details-placeholder").html("<tr><td colspan='10' style='text-align: center'>暂无数据</td></tr>");
        }
    });
}
function faceRecognition(member_pic) {
    layer.photos({
        resize:false,
        move: false,
        anim: 5,
        photos: {
            "data": [
                {
                    "alt": "人脸识别照片",
                    "src": targetUrl+member_pic, //原图地址
                    "thumb": targetUrl+member_pic //缩略图地址
                }
            ]
        }
    });
}
function onPhoto(id,u_id,act_id) {
    layer.open({
        title:'现场照片',
        resize:false,
        move: false,
        type: 1,
        btn:['取消'],
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 1, //不显示关闭按钮
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        offset: ['200px', '35%'],
        area:["720px","370px"],
        content:$('#RefusedTo')
    });
    var data={
        u_id:u_id,
        act_id:act_id,
    }
    zhget(base_url_pic,data).then(function(result) {
        if(result.code == 200){
            phonepic = result.rows
            buildTable(result, 'pic-template', 'pic-placeholder');
            layer.photos({
                photos: '#pic-placeholder',
                resize:false,
                move: false,
                anim: 5
            });
        }
    })
}
function invalidButton(id){
    var data={
        status:0
    }
    layer.confirm('确定要将该条记录设置为无效吗？', {
        title:'操作确认',
        btn: ['确定','取消'] //按钮
    }, function(index){
        layer.close(index);
        zhput(base_url_activity+"/"+id,data).then(function(result) {
            if(result.code == 200){
                queryList();
                showSuccess('设置成功')
            }else{
                showError(result.message)
            }
        });
    });
}
function returnUpDeep() {
    window.history.go(-1);
};

// 查看被设置为无效原因
function viewReason(reason) {
    layer.open({
        title:'设置为无效原因',
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

    $("#reject_Reason").html(reason);
}
//判断是否为空
Handlebars.registerHelper('ifnotnull', function(v1, options) {
    if(v1!=null&&v1!=''&&v1!=0) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});