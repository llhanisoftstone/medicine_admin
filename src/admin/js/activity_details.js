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
        }
    })
}
function picClick(scene_pic) {
    layer.photos({
        resize:false,
        move: false,
        anim: 5,
        photos: {
            "data": [
                {
                    "alt": "现场照片",
                    "src": targetUrl+scene_pic,
                    "src": targetUrl+scene_pic,
                }
            ]
        }
    });
}
function returnUpDeep() {
    window.history.go(-1);
};
Handlebars.registerHelper('statenone', function(v1, options) {
    if(v1 == 11){
        return 'labelhide';
    }
});