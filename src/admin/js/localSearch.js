const base_url_article = '/op/docList';
const base_url_addFile = '/op/addFiles';
let articleId = '';
var currentPageNo = 1;
var pageRows = 20;

$(function () {
    $('#years').datepicker({
        format: 'yyyy',
        language: 'zh-CN',
        autoclose: true,
        startView: 2,
        maxViewMode: 2,
        minViewMode: 2
    });

    $('#doc-menu').append('<li style="font-size: medium;text-align: center;">暂无内容</li>');
});

function queryList() {
    if ($('#resource').val() === '-1'){
        showError('请选择目标网站');
        return;
    }
    if(!$('#keywords').val()){
        showError('请输入关键词');
        return;
    }
    let data = {
        keys: $('#keywords').val(),
        site_type: $('#resource').val(),
        page: currentPageNo,
        size: pageRows
    };
    if ($('#start').val() && $('#end').val()) {
        data.begin_time = $('#start').val();
        data.end_time = $('#end').val();
    }
    if($('#author_name').val()) {
        data.author = $('#author_name').val();
    }
    if ($('#journal_name').val()) {
        data.source = $('#journal_name').val();
    }
    zhpost(base_url_article, data).then(res => {
        if (checkData(res,'get','queryList','local-member')){
            $(".docSearch").hide();
            $('#doc-menu').empty();
            for (let i=0;i<res.rows.length;i++){
                if(res.rows[i].type.indexOf('[') == -1){
                    res.rows[i].type = '['+res.rows[i].type+']';
                }
                if(res.rows[i].citaNumber == '0'){
                    res.rows[i].citaNumber = '被引：' + res.rows[i].citaNumber
                }
                if(res.rows[i].downNumber == '0'){
                    res.rows[i].downNumber = '下载：' + res.rows[i].downNumber
                }
            }
            buildTable(res, 'local-template', 'doc-menu','content');
        }
    })
}

function down(id,dir,name) {
    let params = {
        id: id,
        upType: dir
    };

    downloadFile(params,name,'/op/downloadFile');
}

function uploadFiles(id) {
    articleId = id;
    $.initSystemFileUploadnotLRZ($(".info-left"), onUploadFile);
    $('#picfile').click();
}

// 文件上传
function onUploadFile(formObject, fileComp, list) {
    if(list.length > 0 && list[0].code == 200){
        const params = {
            aid: articleId,  // 文章id
            url: list[0].url,
            filename: list[0].filename,
            date: list[0].date,
            file_dir: list[0].file_dir
        }
        zhpost(base_url_addFile,params).then(res => {
            if(res.code == 200){
                showSuccess('上传成功！');
                queryList();
            }
        })
    }
}

function searchBtn(){
    $(".docSearch").animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".docSearch").is(":visible")) {
        isSearch=false;
    }
    $("#reasonSearchForm")[0].reset();
}