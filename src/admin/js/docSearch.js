const base_url_zhiWang = '/op/zhiWang';
const base_url_wanFang = '/op/wanFang';
const base_url_weiPu = '/op/cqvip';
const base_url_sub = '/op/storeDb';
var currentPageNo = 1;
var pageRows = 20;
$(function () {
    $('#resource').change(function () {
        cleanVal();
        currentPageNo = 1;
        if($(this).val() == '1' || $(this).val() == '-1') {
            $('.years').hide();
            $('.year').show();
        }else {
            $('.year').hide();
            $('.years').show();
        }
    });

    $('#doc-menu').append('<li style="font-size: medium;text-align: center;">暂无内容</li>');

    datepickerFn('years');
    datepickerFn('year');
});

function queryList() {
    if($('#resource').val() === '-1'){
        showError('请选择目标网站');
        return;
    }
    if(!$('#keywords').val()){
        showError('请输入关键字');
        return;
    }
    var data = {
        keys: $('#keywords').val(),
        page: currentPageNo,
        size: pageRows
    };
    if($('#resource').val() == '1') {
        if(!$('#year').val()){
            showError('请选择年份');
            return;
        }
        data.years = $('#year').val();
        getArticleList(base_url_zhiWang,data);
    }else if($('#resource').val() == '2') {
        if (!$('#start').val() || !$('#end').val()){
            showError('请选择起始或结束年份');
            return;
        }
        data.years = $('#start').val() +'-'+ $('#end').val();
        getArticleList(base_url_wanFang,data);
    }else if($('#resource').val() == '3') {
        if (!$('#start').val() || !$('#end').val()){
            showError('请选择起始或结束年份');
            return;
        }
        data.begin_time = $('#start').val();
        data.end_time = $('#end').val();
        getArticleList(base_url_weiPu,data);
    }
}


function getArticleList(url,data) {
    zhpost(url, data).then(res => {
        if (checkData(res,'get','queryList','doc-member')){
            $('#doc-menu').empty();
            for (let i=0;i<res.rows.length;i++){
                if(res.rows[i].type.indexOf('[') == -1){
                    res.rows[i].type = '['+res.rows[i].type+']';
                }
                if(typeof res.rows[i].citaNumber == 'number'){
                    res.rows[i].citaNumber = '被引：' + res.rows[i].citaNumber
                }
                if(typeof res.rows[i].downNumber == 'number'){
                    res.rows[i].downNumber = '下载：' + res.rows[i].downNumber
                }
            }
            buildTable(res, 'doc-template', 'doc-menu','content');
        }
    })
}

function subscribe(sort_id) {
    zhpost(base_url_sub,{sortId: sort_id}).then((res) => {
        if(res.code == 200) {
            showSuccess('订阅成功！');
        }
    })
}

function datepickerFn(id) {
    $('#'+id).datepicker({
        format: 'yyyy',
        language: 'zh-CN',
        autoclose: true,
        startView: 2,
        maxViewMode: 2,
        minViewMode: 2
    })
}

function cleanVal() {
    $('#keywords').val('');
    $('#year').val('');
    $('#start').val('');
    $('#end').val('');
}