/**
 * Created by Administrator on 2018/11/30.
 */
var base_url_activity = '/rs/v_activity_up';
var currentPageNo = 1;
var pageRows = 10;
$(function () {
    queryList()
});
function queryList() {
    var pid = getUrlParamsValue("id");
    zhget(base_url_activity, {
        page: currentPageNo,
        size: pageRows,
        id:pid
    }).then(function(result) {
        role = result;
        buildTable(result, 'details-template', 'details-placeholder');
    });
}
function faceRecognition(id) {
    layer.photos({
        resize:false,
        move: false,
        anim: 5,
        photos: {
            "title": "营业执照示例照片", //相册标题
            "data": [   //相册包含的图片，数组格式
                {
                    "alt": "营业执照示例照片",
                    "src": "img/company/zhizhao_example.jpg", //原图地址
                    "thumb": "img/company/zhizhao_example.jpg" //缩略图地址
                }
            ]
        }
    });
}
function onPhoto(id) {
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
        area:["605px","330px"],
        content:$('#RefusedTo')
    });
}
$('.photo li').on('click',function(){
    layer.photos({
        resize:false,
        move: false,
        anim: 5,
        photos: {
            "title": "营业执照示例照片", //相册标题
            "data": [   //相册包含的图片，数组格式
                {
                    "alt": "营业执照示例照片",
                    "src": "img/company/zhizhao_example.jpg", //原图地址
                    "thumb": "img/company/zhizhao_example.jpg" //缩略图地址
                },
                {
                    "alt": "营业执照示例照片",
                    "src": "img/company/zhizhao_example.jpg", //原图地址
                    "thumb": "img/company/zhizhao_example.jpg" //缩略图地址
                },
                {
                    "alt": "营业执照示例照片",
                    "src": "img/company/zhizhao_example.jpg", //原图地址
                    "thumb": "img/company/zhizhao_example.jpg" //缩略图地址
                }
            ]
        }

    });
})
function returnUpDeep() {
    window.history.go(-1);
};
Handlebars.registerHelper('statenone', function(v1, options) {
    if(v1 == 11){
        return 'labelhide';
    }
});