const base_url_article = '/op/getAutoTest';
const base_url_company = '/rs/company';
const base_url_keywords = '/op/getKeys';
const base_url_set = '/op/autoRetrieve';
var companyInfo = [];
var isSearch = false;
var currentPageNo = 1;
var pageRows = 20;

$(function () {
    queryList();
    getcompanydata();

    $('#resource').change(function () {
        $('#keywords').val('');
        $('#start').val('');
        $('#end').val('');
    });

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
    let data = {
        page: currentPageNo,
        size: pageRows
    };
    if(isSearch){
        if($('#resource').val() != -1){
            data.sitetype = $('#resource').val();
        }
        if($('#company').val() != -1){
            data.oid = $('#company').val();
        }
        if($('#keywords').val() != -1 && $('#keywords').val() != null){
            data.keys = $('#keywords').val();
        }
        if($('#start').val() && $('#end').val()){
            data.begin_time = $('#start').val();
            data.end_time = $('#end').val();
        }
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
            buildTable(res, 'auto-template', 'doc-menu','content');
        }
    })
}

function searchFn() {
    isSearch = true;
    currentPageNo = 1;
    queryList();
}

function resetFn() {
    cleanVal();
    isSearch = false;
    queryList();
}

function getcompanydata() {
    $('#company').selectpicker({
        noneSelectedText: '请选择'
    });
    $('#keywords').selectpicker({
        noneSelectedText: '请选择'
    });
    zhget(base_url_company,{status: 1}).then((res) => {
        if(res.code == 200){
            companyInfo = res.rows
            $('#company').empty();
            let company = $('#company').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                company.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
            }
            $('#company').selectpicker('refresh');
        }
    });
}

$('#company').unbind('changed.bs.select').on('changed.bs.select',(event,clickedIndex) => {
    if(clickedIndex == 0){
        return;
    }
    zhpost(base_url_keywords,{id: companyInfo[clickedIndex - 1].id}).then(res => {
        if(res.code == 200) {
            $('#keywords').empty();
            let keywords = $('#keywords').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                keywords.append(`<option value='${res.rows[i].keyword}'>${res.rows[i].keyword}</option>`)
            }
            $('#keywords').selectpicker('refresh');
        }
    });
});

function searchBtn(){
    $(".docSearch").animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".docSearch").is(":visible")) {
        isSearch=false;
    }
    cleanVal();
}

function beginBtn() {
    if ($('#searchDate').val()){
        zhpost(base_url_set,{cycle: $('#searchDate').val()}).then(res => {
            if(res.code == 200){
                showSuccess('设置成功！');
                $('#searchDate').val('');
            }
        })
    }
}

function cleanVal() {
    $("#reasonSearchForm")[0].reset();
    $('#company').selectpicker('val','');
    $('#company').selectpicker('refresh');
    $('#keywords').selectpicker('val','');
    $('#keywords').selectpicker('refresh');
}