var base_url_role = '/rs/role';

var role = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var updatepower_json={};

$(function() {
    queryList();
});

function queryList() {
    zhget(base_url_role, {
        page: currentPageNo,
        size: pageRows
    }).then(function(result) {
        role = result;
        buildTable(result, 'role-template', 'role-placeholder');
    });
}

function onAddClick() {
    cleanForm();
    operation = "add";
    $('#userModal').modal('show');
}

function onUpdateClick(id) {
    fillForm(id);
    operation = "modify";
    $('#userModal').modal('show');
}

function onDeleteClick(el,id) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_role + "/" + id).then(function (result) {
            if (result.code==200) {
                showSuccess('删除成功！');
                if(jQuery(el).parents("tbody").find("tr").length==1){
                    if(currentPageNo>1){
                        currentPageNo--;
                    }
                    jQuery("#goToPagePaginator").val(currentPageNo);
                    jQuery("#goToPagePaginator").next().click();
                }else{
                    queryList();
                }

            } else {
                showError('删除失败！');
            }
        });
    }
}

function onSaveClick() {
    var id = $("#id").val();
    var name=$("#name").val().trim();
    if(!name||name==""){
        showError("请输入角色权限");
        return;
    }
    var data = {
        name:name ,
        remark: $("#remark").val().trim(),
    };
    if (operation == "add") {
        data.power_json='{}';
        zhpost(base_url_role, data, saveResult);
    } else {
        data.power_json=updatepower_json;
        zhput(base_url_role + "/" + id, data).then(saveResult);
    }
}

function saveResult(result) {
    if (result.info) {
            $('#userModal').modal('hide');
            queryList();
            showSuccess('保存成功！');
        // }
    } else {
        showError('保存失败！');
    }
}

function fillForm(id) {
    var index = 0;
    for (index in role.rows) {
        var item = role.rows[index];
        if (item.id == id) {
            $("#id").val(item.id);
            $("#name").val(item.name);
            $("#remark").val(item.remark);
            updatepower_json=item.power_json;
            return;
        }
    }
}

function cleanForm() {
    $("#id").val("");
    $("#name").val("");
    $("#remark").val("");
}

