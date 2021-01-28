var base_url_company = '/rs/company';
var base_url_drugs = '/rs/drugs';
var base_url_report = '/rs/psur_report';
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
    $.initSystemFileUploadnotLRZ($("#medicineInfo"), onUploadFile);

    $('#reportTime').datepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        autoclose: true
    });

    queryList();
});

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
        if($('#common_name').val()) {
            data.common_name = $('#common_name').val();
            dataCopy.common_name = $('#common_name').val();
            data.search = 1;
        }
    }
    $("#event-placeholder").html('');
    zhget(base_url_report,data).then(res => {
        if (checkData(res,'get','queryList','table-member')){
            var integrals = res.rows;
            for(var i=0;i<res.rows.length;i++){
                var indexCode = res.rows[i];
                indexCode.rowNum = i + 1;
                indexCode.typestr = indexCode.type == 1 ? '国产' : '进口';
                indexCode.start_time = indexCode.start_time.substr(0,10);
                indexCode.end_time= indexCode.end_time.substr(0,10);
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
    $(".medicineSearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".medicineSearch").is(":visible")) {
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
        common_name: ""
    };
    let name = 'PSUR报告';
    if (isSearch){
        $.extend(data,dataCopy);
        name = 'PSUR报告搜索';
    }
    downloadFile(data,`${name}.xlsx`,'/down/exportPsur');
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
    $('#filename').text('');
    types = 'add';
    $('#addPSURReport').modal('show');
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

function updateData(id,comp_id,d_id,ingredient,start_time,end_time,type,report_title,report_file) {
    types = 'update';
    $('#id').val(id);
    getmodaldata(comp_id,d_id);
    $('#contain').val(ingredient);
    $('#datestart').val(start_time);
    $('#dateend').val(end_time);
    $('.medicineType').eq(type-1).prop('checked',true);
    $('#filename').text(report_title);
    $('#fileUrl').val(report_file);
    $('#addPSURReport').modal('show');
}

function deleteData(id) {
    if(confirm('确认要删除该报告吗？')){
        zhput(base_url_report+'/'+id,{status: 9}).then(res => {
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
        d_id: $('#medicine').val(),
        type: $('.medicineType:checked').val(),
        comp_id: $('#company').val(),
        report_file: sAttachUrl,
        ingredient: $('#contain').val(),
        report_title: sAttachName,
        start_time: $('#datestart').val(),
        end_time: $('#dateend').val()
    }
    if(types == 'update'){
        var id = $("#id").val();
        data.report_file = $('#fileUrl').val();
        data.report_title = $('#filename').val()
        zhput(base_url_report+"/"+id,data).then(res => {
            if (res.code == 200){
                showSuccess('修改成功！');
                $('#addPSURReport').modal('hide');
                queryList();
            }
        })
    }else {
        zhpost(base_url_report,data).then(res => {
            if (res.code == 200){
                showSuccess('添加成功！');
                $('#addPSURReport').modal('hide');
                queryList();
            }
        })
    }
}

function cleanFormData() {
    $('#company').selectpicker('val','');
    $('#medicine').selectpicker('val','');
    $('#contain').val('');
    $('#datestart').val('');
    $('#dateend').val('');
    $('#filename').text('');
    $('.medicineType:first').prop('checked',true);
}