var currentPageNo = 1;
var pageRows = 10;
var isSearch = false;
var dataCopy = {};
const base_url_list = '/op/queryReport';
const base_url_del = '/op/delReport';

$(function () {
    $('#badHappen').datepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });

    queryList();
});

function queryList() {
    let data = {
        page: currentPageNo,
        size: pageRows,
    };

    if (isSearch){
        if($('#badName').val()){
            data.bad_term = $('#badName').val();
            dataCopy.babad_term = $('#badName').val();
        }
        if($('#badResult').val() != -1){
            data.result = $('#badResult').val();
            dataCopy.result = $('#badResult').val();
        }
        if($('#commonName').val()){
            data.med_name_norm = $('#commonName').val();
            dataCopy.med_name_norm = $('#commonName').val();
        }
        if($('#badHappen').val()){
            data.start_time = $('#badHappen').val();
            dataCopy.start_time = $('#badHappen').val();
        }
        if($('#reportType').val() != -1){
            data.report_type = $('#reportType').val();
            dataCopy.report_type = $('#reportType').val();
        }
        if($('#evaluate').val() != -1){
            data.med_owner_eva = $('#evaluate').val();
            dataCopy.med_owner_eva = $('#evaluate').val();
        }
    }

    $("#case-placeholder").html('');
    zhpost(base_url_list,data).then(res => {
        if (checkData(res,'get','queryList','table-member')){
            var integrals = res.data;
            for(var i=0;i<res.data.length;i++){
                var indexCode = res.data[i];
                indexCode.rowNum = i + 1;
                indexCode.base.report_type = formateType(indexCode.base.report_type);
            }
            buildTableByke(res, 'case-template', 'case-placeholder','paginator',queryList,pageRows);
        }
    })
}

function searchBtn() {
    $(".reasonSearch").animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    $("#reasonSearchForm")[0].reset();
}

function searchData() {
    isSearch = true;
    currentPageNo = 1;
    queryList();
}

function resetFn() {
    $('#reasonSearchForm')[0].reset();
    isSearch = false;
    queryList();
}

function addData() {
    location.href="admin.html#pages/bads_record/add_case_record.html";
}

function check(id) {
    location.href="admin.html#pages/bads_record/add_case_record.html?id="+id+"&check=1";
}

function updateData(id) {
    location.href="admin.html#pages/bads_record/add_case_record.html?id="+id;
}

function delData(id) {
    if (confirm('确认要删除该报告吗？')){
        zhpost(base_url_del,{id: id}).then(res => {
            if(res.code == 200){
                showSuccess('删除成功！');
                queryList();
            }else{
                showError("删除失败");
            }
        })
    }
}

function exportData() {
    let data = {
        bad_term: "",
        result: "",
        start_time: "",
        report_type: "",
        med_name_norm: "",
        med_owner_eva: ""
    };
    let name = '个例报告';
    if (isSearch){
        $.extend(data,dataCopy);
        name = '个例报告搜索'
    }
    downloadFile(data,`${name}.xlsx`,'/down/exportExcel');
}

function exportReport(id,name) {
    let data = {id: id};
    downloadFile(data,`${name}_个例报告.docx`,'/down/exportWord')
}

function formateType(type) {
    switch (type) {
        case 0:
            return '快速报告';
            break;
        case 1:
            return '境外报告';
            break;
        case 2:
            return '严重报告';
            break;
        case 3:
            return '首次报告';
            break;
    }
}