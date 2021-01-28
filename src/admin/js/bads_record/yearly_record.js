var base_url_company = '/rs/company';
var base_url_yearly = '/rs/annual_report';
var companyList = [];
var sAttachUrl = '';
var sAttachName = '';
var currentPageNo = 1;
var pageRows = 10;
var types = 'add';
var isSearch=false;
var dataCopy = {};

$(function () {
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        $('#companySelect').selectpicker('val','-1');
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });

    datepickerFn('yearSelect');

    datepickerFn('year');

    $.initSystemFileUploadnotLRZ($("#reportInfo"), onUploadFile);

    getmodaldata('companySelect');
    queryList();
});

function datepickerFn(id) {
    $('#'+id).datepicker({
        format: 'yyyy',
        language: 'zh-CN',
        autoclose: true,
        startView: 2,
        maxViewMode: 2,
        minViewMode: 2
    });
}

function queryList() {
    var data = {
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows,
        status: 1
    };
    if (isSearch){
        if($('#companySelect').val() != '-1'){
            data.comp_id = $('#companySelect').val();
            dataCopy.comp_id = $('#companySelect').val();
            data.search = 1;
        }
        if($('#yearSelect').val()) {
            data.specific_year = $('#yearSelect').val();
            dataCopy.specific_year = $('#yearSelect').val();
            data.search = 1;
        }
    }
    $("#event-placeholder").html('');
    zhget(base_url_yearly,data).then(res => {
        if (checkData(res,'get','queryList','table-member')){
            for(var i=0;i<res.rows.length;i++){
                var indexCode = res.rows[i];
                indexCode.rowNum = i+1;
            }
            buildTableByke(res, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
        }
    })
}

// 文件上传
function onUploadFile(formObject, fileComp, list) {
    var attrs = fileComp.attr("refattr");
    jQuery("#upimg").val("");
    if(list.length > 0 && list[0].code == 200){
        let fileName = list[0].filename;
        sAttachUrl = list[0].url;
        sAttachName = fileName.substr(0,fileName.lastIndexOf('.'));
        $('#filename').text(sAttachName)
    }
}


function searchBtn() {
    $(".yearlySearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".yearlySearch").is(":visible")) {
        isSearch=false;
    }
    $("#reasonSearchForm", $(".report"))[0].reset();
}

function searchData() {
    isSearch = true;
    currentPageNo = 1;
    queryList();
}

function exportData() {
    let data = {
        comp_id: "",
        specific_year: ""
    };
    let name = '年度报告';
    if (isSearch){
        $.extend(data,dataCopy);
        name = '年度报告搜索';
    }
    downloadFile(data,`${name}.xlsx`,'/down/exportAnnual');
}

function getmodaldata(id,comp_id) {
    $('#'+id).selectpicker({
        noneSelectedText: '请选择'
    });
    zhget(base_url_company,{status: 1}).then((res) => {
        if(res.code == 200){
            $('#'+id).empty();
            companyList = res.rows;
            let company = $('#'+id).append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                company.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
            }
            if(comp_id){
                $('#'+id).selectpicker('val',comp_id);
            }
            $('#'+id).selectpicker('refresh');
        }
    });
}

function addData() {
    cleanFormData();
    getmodaldata('company');
    types = 'add';
    $('#addYearlyReport').modal('show');
}


function check(url) {
    $("#lookforword").empty();
    $("<iframe src='"+ targetUrl+url +"' width='100%' height='362px' frameborder='1'>").appendTo($("#lookforword"));
}

function downloadFn(id,url,title) {
    let data = {
        id: id,
        upType: 'document',
        report_title: title,
        report_file: url
    };
    let name = title+url.substr(url.lastIndexOf('.'));
    downloadFile(data,name,'/op/downloadFile')
}

function updateData(id,comp_id,report_title,report_file,specific_year) {
    types = 'update';
    $('#id').val(id);
    getmodaldata('company',comp_id);
    $('#year').val(specific_year);
    $('#filename').text(report_title);
    $('#fileUrl').val(report_file);
    $('#addYearlyReport').modal('show');
}

function deleteData(id) {
    if(confirm('确认要删除该报告吗？')){
        zhput(base_url_yearly+'/'+id,{status: 9}).then(res => {
            if(res.code == 200){
                showSuccess('删除成功！');
                queryList();
            }else{
                showError("删除失败");
            }
        })
    }
}


function confirmAdd() {
    if(!$('#company').val()){
        showError('请选择企业名称');
        return;
    }
    let data = {
        comp_id: $('#company').val(),
        report_file: sAttachUrl,
        report_title: sAttachName,
        specific_year: $('#year').val(),
    }
    if(types == 'update'){
        var id = $("#id").val();
        data.report_file = $('#fileUrl').val();
        data.report_title = $('#filename').val();
        zhput(base_url_yearly+"/"+id,data).then(res => {
            if (res.code == 200){
                showSuccess('修改成功！');
                $('#addYearlyReport').modal('hide');
                queryList();
            }
        })
    }else {
        zhpost(base_url_yearly,data).then(res => {
            if (res.code == 200){
                showSuccess('添加成功！');
                $('#addYearlyReport').modal('hide');
                queryList();
            }
        })
    }
}

function cleanFormData() {
    $('#company').selectpicker('val','');
    $('#year').val('');
    $('#filename').text('');
    $('#fileUrl').val('');
}