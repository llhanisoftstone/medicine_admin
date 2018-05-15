var base_url_user = '/rs/op_log';
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;

$(function () {
    queryList();
    $("#btnUserQuery").click(function() {
        currentPageNo = 1;
        queryList();
    });
});

function queryList() {
    var data = {
        search:1,
        page: currentPageNo,
        size: pageRows
    }
    if($('#tisname').val().length > 1)
        data["type"] = $('#tisname').val();
    zhget(base_url_user, data ).then( function (result) {
        if(checkData(result,'get','queryList','table-user')) {
            for (var i = 0; i < result.rows.length; i++) {
                var rs = Object.keys(result.rows[i]);
                for (var j = 0; j < rs.length; j++) {
                    if (rs[j].indexOf('_json') === rs[j].length - 5) {
                        result.rows[i][rs[j]] = JSON.stringify(result.rows[i][rs[j]])
                    }
                }
            }
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

function onUserAddClick() {
    cleanForm();
    operation = "add";
    $("#username").focus();
    $("#userid").attr("readonly", "readonly");
    $("#userpwd").removeAttr("readonly");
    $("#userpwd").val("123456");
    $("#userstate").val("1");
    $("#category").val("5");
    $('#userModal').modal('show');


}

function onUserUpdateClick(userid) {
    fillForm(userid);
    operation = "modify";
    $("#userid").attr("readonly", "readonly");
    $("#userpwd").attr("readonly", "readonly");
    $('#userModal').modal('show');
}

function onUserDeleteClick(userid) {
    if (confirm("确认要删除？")) {
        zhdelete(base_url_user + "/" + userid, {
            //AUTHNAME:authName
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
    var userid = $("#userid").val();
    var data = {
        // AUTHNAME: authName,
        username: $("#username").val(),
        // shop_name: $("#shop_name").val(),
        password: $("#userpwd").val(),
        // mobile: $("#mobile").val(),
        // email: $("#useremail").val(),
        rank: $("#category").val(),
        status: $("#userstate").val()
    };
    if (operation == "add") {
        zhpost(base_url_user, data, saveResult);
    } else {
        zhput(base_url_user + "/" + userid, data, saveResult);
    }
}

function saveResult(result) {
        if (result.err) {
            showError(result.err);
        } else{
            $('#userModal').modal('hide');
            queryList();
            showSuccess('保存成功！');
        }
}

function fillForm(userid) {
    var index = 0;
    for (index in users) {
        var item = users[index];
        if (item.id == userid) {
            $("#userid").val(item.id);
            $("#username").val(item.username);
            $("#category").val(item.rank);
            $("#userstate").val(item.status);
            return;
        }
    }
}

function cleanForm() {
    $("#userid").val("");
    $("#username").val("");
    $("#category").val("");
    $("#mobile").val("");
    $("#userstate").val("");
}
