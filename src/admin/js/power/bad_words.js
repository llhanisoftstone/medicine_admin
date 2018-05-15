var base_url_words = '/rs/bad_words';
var words = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;

$(function () {
    queryList();
    $("#btnUserQuery").click(function () {
        currentPageNo = 1;
        queryList();
    });
});
function queryList() {
    var data = {
        search: 1,
        page: currentPageNo,
        size: pageRows
    }
    if ($('#tisname').val().length > 1)
        data["username"] = $('#tisname').val();
    zhget(base_url_words, data).then( function (result) {
        if(checkData(result,'get','queryList','table-user')){
            users = result.rows;
            buildTable(result, 'user-template', 'user-placeholder');
        }
    });
}

//焦点
// function initPopover() {
//
//     $('#new').webuiPopover('destroy').webuiPopover($.extend({})).on("shown.webui.popover",
//         function() {
//             var _this = this;
//             $('.modal-dialog').prependTo($(_this).closest(".modal"));
//             $("#username").focus();
//         });
//     initPopover();
// }

function onUserAddClick(id) {
    cleanForm();
    operation = "add";
    $("#name").focus();
    $("#rank").val("0");
    $('#userModal').modal('show');
}

function onUserUpdateClick(id) {
    fillForm(id);
    operation = "modify";
    $('#userModal').modal('show');
}

function onUserDeleteClick(id) {
    if (confirm("确认要删除？")) {
        zhdelete(base_url_words + "/" + id, {
        }).then( function (result) {
            if (result.err) {
                showError(result.err);
            } else {
                queryList();
                showSuccess('删除成功！');
            }
        });
    }
}

function onUserSaveClick() {
    var id = $("#id").val();
    var data = {
        name: $("#name").val(),
        rank: $("#rank").val(),
    };
    if (operation == "add") {
        zhpost(base_url_words, data, saveResult);
    } else {
        var id = $("#id").html();
        zhput(base_url_words + "/" + id, data, saveResult);
    }
}


function fillForm(id) {
    var index = 0;
    for (index in words) {
        var item = words[index];
        if (item.id == id) {
            $("#id").val(item.id);
            $("#name").val(item.name);
            $("#rank").val(item.rank);
            return;
        }
    }
}

function cleanForm() {
    $("#id").val("");
    $("#name").val("");
    $("#rank").val("");
}
function saveResult(result) {
    if (result.err) {
        showError('保存失败！');
    } else {
        $('#userModal').modal('hide');
        queryList();
        showSuccess('保存成功！');
    }
}