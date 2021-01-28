var base_url_company = '/rs/company';
var base_url_drugs = '/rs/drugs';
var base_url_single = '/rs/drugs_report';
var companyList = [];
var sAttachUrl = '';
var sAttachName = '';
var currentPageNo = 1;
var pageRows = 10;
var types = 'add';
var isSearch=false;
var dataCopy = {};

$(function () {
    zhget(base_url_company,{status: 1}).then((res) => {
        if(res.code == 200){
            $('#companySelect').empty();
            let companySelect = $('#companySelect').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                companySelect.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
            }
            $('#companySelect').selectpicker('refresh');
        }
    });

    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        $('#companySelect').selectpicker('val','-1');
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $.initSystemFileUploadnotLRZ($("#reportInfo"), onUploadFile);

    datepickerFn('year');
    datepickerFn('yearSelect');
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
        if($('#common_name').val()){
            data.common_name = $('#common_name').val();
            dataCopy.common_name = $('#common_name').val();
            data.search = 1;
        }
        if($('#yearSelect').val()) {
            data.specific_year = $('#yearSelect').val();
            dataCopy.specific_year = $('#yearSelect').val();
            data.search = 1;
        }
    }
    $("#event-placeholder").html('');
    zhget(base_url_single,data).then(res => {
        if (checkData(res,'get','queryList','table-member')){
            var integrals = res.rows;
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
        // $("#"+attrs, formObject).val(sAttachUrl);
        $('#filename').text(sAttachName)
    }
}


function searchBtn() {
    $(".singleSearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".singleSearch").is(":visible")) {
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
        common_name: "",
        specific_year: ''
    };
    let name = '单药品报告';
    if (isSearch){
        $.extend(data,dataCopy);
        name = '单药品报告搜索';
    }
    downloadFile(data,`${name}.xlsx`,'/down/exportDrugs');
}

function getmodaldata(comp_id,d_id) {
    $('#company').selectpicker({
        noneSelectedText: '请选择'
    });
    $('#medicine').selectpicker({
        noneSelectedText: '请选择'
    });
    zhget(base_url_company,{status: 1}).then((res) => {
        if(res.code == 200){
            $('#company').empty();
            companyList = res.rows;
            let company = $('#company').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                company.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
            }
            if(comp_id){
                $('#company').selectpicker('val',comp_id);
                zhget(base_url_drugs,{comp_id: comp_id,status: 1,order: 'create_time desc'}).then(res => {
                    if(res.code == 200) {
                        let medicine = $('#medicine').append(`<option value='-1'>请选择</option>`);
                        for(let i=0;i<res.rows.length;i++){
                            medicine.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
                        }
                        $('#medicine').selectpicker('val',d_id);
                        $('#medicine').selectpicker('refresh');
                    }
                });
            }
            $('#company').selectpicker('refresh');
        }
    });

    $('#medicine').empty();
    $('#medicine').selectpicker('refresh');

    $('#company').unbind('changed.bs.select').on('changed.bs.select',(event,clickedIndex) => {
        $('#medicine').empty();
        $('#medicine').selectpicker('refresh');
        if(clickedIndex == 0){
            return;
        }
        zhget(base_url_drugs,{comp_id: companyList[clickedIndex - 1].id,status: 1,order: 'create_time desc'}).then(res => {
            if(res.code == 200) {
                let medicine = $('#medicine').append(`<option value='-1'>请选择</option>`);
                for(let i=0;i<res.rows.length;i++){
                    medicine.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
                }
                $('#medicine').selectpicker('refresh');
            }
        });
    });
}

function addData() {
    cleanFormData();
    getmodaldata();
    types = 'add';
    $('#addSingleReport').modal('show');
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

function updateData(id,comp_id,d_id,report_title,report_file,specific_year) {
    types = 'update';
    $('#id').val(id);
    getmodaldata(comp_id,d_id);
    $('#year').val(specific_year);
    $('#filename').text(report_title);
    $('#fileUrl').val(report_file);
    $('#addSingleReport').modal('show');
}

function deleteData(id) {
    if(confirm('确认要删除该报告吗？')){
        zhput(base_url_single+'/'+id,{status: 9}).then(res => {
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
    if(!$('#medicine').val()){
        showError('请选择药品名称');
        return;
    }
    let data = {
        comp_id: $('#company').val(),
        d_id: $('#medicine').val(),
        report_file: sAttachUrl,
        report_title: sAttachName,
        specific_year: $('#year').val()
    }
    if(types == 'update'){
        var id = $("#id").val();
        data.report_file = $('#fileUrl').val();
        data.report_title = $('#filename').val();
        zhput(base_url_single+"/"+id,data).then(res => {
            if (res.code == 200){
                showSuccess('修改成功！');
                $('#addSingleReport').modal('hide');
                queryList();
            }
        })
    }else {
        zhpost(base_url_single,data).then(res => {
            if (res.code == 200){
                showSuccess('添加成功！');
                $('#addSingleReport').modal('hide');
                queryList();
            }
        })
    }
}

function cleanFormData() {
    $('#company').selectpicker('val','');
    $('#medicine').selectpicker('val','');
    $('#year').val('');
    $('#fileUrl').val('');
    $('#filename').text('');
}