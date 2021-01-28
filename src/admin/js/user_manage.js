var user_list_url = '/rs/train_user_manage'
var company_list_url = '/rs/company'
var add_user_url = '/rs/train_user_manage'
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var type="add";

$(function () {
    $("#resetSearchBtn").bind("click", function(){
        $("#userSearchForm")[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    company()
    queryList()
})

function queryList(){
    var data = {
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows,
        status: 1
    }
    if(isSearch){
        var searchVal = $('#searchVal').val().trim();
        if(searchVal){
            data.name = searchVal;
            data.search = 1;
        }
    }
    zhget(user_list_url, data).then(res => {
        if (checkData(res,'get','queryList','table-member')){
            var integrals = res.rows;
            for(var i=0;i<res.rows.length;i++){
                var indexCode = res.rows[i];
                indexCode.rowNum = i + 1;
            }
            buildTableByke(res, 'user-template', 'user-placeholder','paginator',queryList,pageRows);
        }
    })
}

function addUserFn(){
    clearFormVal()
    $('#addUser').modal('show')
}

function searchFn() {
    $(".userSearch").animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow")
    if($(".userSearch").is(":visible")) {
        isSearch=false;
    }
}

// 模糊查询
function searchData(){
    isSearch = true
    currentPageNo = 1
    queryList()
}

// 获取企业列表
function company() {
    let params = {status: 1}
    zhget(company_list_url,params).then( function(result) {
        let data = result.rows;
        let html = '<option value="-1">请选择</option>';
        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].title+"</option>"
            }
        }
        $("#company").html(html);
    });
}

// 清空表格的值
function clearFormVal(){
    $('#userName').val('')
    $('#phone').val('')
    $('#company').val('-1')
}

// 添加用户
function confirmAdd() {
    let userName = $('#userName').val().trim()
    let phone = $('#phone').val()
    let companyId = $('#company').val()

    if(!userName){
        showError('请输入姓名');
        return;
    }
    if(!phone){
        showError('请输入电话');
        return;
    }
    if(!companyId || companyId == -1){
        showError('请选择所属企业');
        return;
    }

    let params = {
        name: userName,
        phone: phone,
        comp_id: companyId
    }
    if(type == 'update'){
        var id = $("#id").val();
        zhput(add_user_url+"/"+id,params).then( res => {
            if(res.code == 200){
                showSuccess('修改成功！');
                $('#addUser').modal('hide');
                queryList()
            }
        })
    }else{
        zhpost(add_user_url,params).then( res => {
            if(res.code == 200) {
                showSuccess('添加成功！');
                $('#addUser').modal('hide');
                queryList()
            }
        })
    }
}

// 修改
function updateClick(id, name, phone, comp_id){
    type = 'update';
    $('#addUser').modal('show');
    $("#id").val(id);
    $("#userName").val(name);
    $("#phone").val(phone);
    $("#company").val(comp_id);
}

// 删除
function delclick(id) {
    if(confirm('确认要删除？')){
        zhput(user_list_url+'/'+id,{status: 9}).then(res => {
            if(res.code == 200){
                showSuccess('删除成功！');
                queryList();
            }else{
                showError("删除失败");
            }
        })
    }
}
