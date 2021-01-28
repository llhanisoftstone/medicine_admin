var base_keywords_url = '/rs/search_key';
var base_url_company = '/rs/company';
var currentPageNo = 1;
var pageRows = 10;
var types = 'add';
var isSearch=false;

$(function () {
    $("#resetSearchBtn").bind("click", function(){
        $("#keywordsSearchForm")[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });

    queryList();
});

function queryList() {
    let data = {
        order: 'create_time desc',
        page: currentPageNo,
        size: pageRows,
        status: 1
    };
    if(isSearch){
        var searchVal = $('#searchVal').val().trim();
        if(searchVal){
            data.keyword = searchVal;
            data.search = 1;
        }
    }
    zhget(base_keywords_url,data).then(res => {
        if (checkData(res, 'get', 'queryList','table-member')){
            for (let i=0;i<res.rows.length;i++){
                var indexCode = res.rows[i];
                indexCode.rowNum = i + 1;
            }
            buildTableByke(res, 'keywords-template', 'keywords-placeholder','paginator',queryList,pageRows);
        }
    })
}


function addKeywordsFn() {
    clearFormVal();
    getCompanyData();
    types = 'add';
    $('#addKeywords').modal('show');
}

function confirmAdd() {
    if(!$('#keywords').val()){
        showError('请输入关键字');
        return;
    }
    if (!$('#company').val()){
        showError('请选择所属企业');
        return;
    }
    let data = {
        keyword: $('#keywords').val(),
        comp_id: $('#company').val()
    }

    if(types == 'update'){
        var id = $("#id").val();
        zhput(base_keywords_url+"/"+id,data).then(res => {
            if (checkData(res,'put','confirmAdd','table-member')){
                $('#addKeywords').modal('hide');
                queryList();
            }
        })
    }else {
        zhpost(base_keywords_url,data).then(res => {
            if (res.code == 200){
                showSuccess('添加成功！');
                $('#addKeywords').modal('hide');
                queryList();
            }
        })
    }
}

function getCompanyData(comp_id) {
    $('#company').selectpicker({
        noneSelectedText: '请选择',
    });
    zhget(base_url_company,{status: 1}).then((res) => {
        if(res.code == 200){
            $('#company').empty();
            let company = $('#company').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                company.append(`<option value='${res.rows[i].id}'>${res.rows[i].title}</option>`)
            }
            if(comp_id){
                $('#company').selectpicker('val',comp_id);
            }
            $('#company').selectpicker('refresh');
        }
    });
}

function searchFn() {
    $(".keywordsSearch").animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".keywordsSearch").is(":visible")) {
        isSearch=false;
    }
}

function searchData() {
    isSearch = true;
    currentPageNo = 1;
    queryList();
}

function updateClick(keyword,comp_id,id) {
    $('#keywords').val(keyword);
    getCompanyData(comp_id);
    $('#id').val(id);
    types = 'update';
    $('#addKeywords').modal('show');
}

function delclick(id) {
    if (confirm('确认删除吗？')){
        zhput(base_keywords_url+'/'+id,{status: 9}).then(res => {
            if (checkData(res,'delete','delclick','table-member')){
                queryList();
            }
        })
    }
}

function clearFormVal() {
    $('#keywords').val('');
    $('#company').selectpicker('val','');
}