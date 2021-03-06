var base_url_menu = '/rs/menu';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
$(function() {
    $.initSystemFileUpload($("#form_modal"), onUploadHeaderPic);
    queryList();
    updateMenuLocationInfo();
});

// 图片上传
function onUploadHeaderPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    jQuery("#upimg").val("");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}

function queryList() {
    zhget(base_url_menu, {
        pid:curId,
        page: currentPageNo,
        size: pageRows,
        order:'order_code'
    }).then( function(result) {

        //debugger
        if(checkData(result,'get','queryList','table-menu')) {
            menu = result;
            console.log(result);
            //debugger
            var integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                if(indexCode.pic_icon){
                    indexCode.picpath = targetUrl + indexCode.pic_icon;
                }
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
        }
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
        zhget(base_url_menu,{pid:id}).then(function (rs) {
            if (rs.code == 200){
                showError('该菜单下有子菜单，不能删除！');
                return
            }else if (rs.code == 602){
                zhdelete(base_url_menu + "/" + id).then(function (result) {
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
            }else{
                showError('删除失败！');
            }
        })
    }
}

function onSaveClick() {
    var id = $("#id").val();
    var data = {
        name: $("#name").val().trim(),
        pid:MenuDeeps[MenuDeep],
        deep:Number(MenuDeep)+1,
        title: $("#title").val(),
        pic_icon: $("#picpath").val(),
        url:$("#url").val(),
        order_code:$('#order_code').val()
    };
    if($("#name").val().trim()){
        if (operation == "add") {
            data.auto_id = 1;
            zhpost(base_url_menu, data, saveResult);
        } else {
            zhput(base_url_menu + "/" + id, data, saveResult);
        }
    }else {
        showError('请输入内容！');
    }

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

function fillForm(id) {
    var index = 0;

    for (index in menu.rows) {
        var item = menu.rows[index];
        if (item.id == id) {
            $("#id").val(item.id);
            $("#name").val(item.name);
            $("#url").val(item.url);
            $("#pid").val(item.pid);
            $("#picpath").val(item.pic_icon);
            $("#deep").val(item.deep);
            $("#order_code").val(item.order_code);
            return;
        }
    }
}

function cleanForm() {
    $("#id").val("");
    $("#name").val("");
    $("#pid").val("");
    $("#url").val("");
    $("#picpath").val("");
    $("#deep").val("");
    $('#order_code').val('')
}

function returnUpDeep(){
    if(MenuDeep>0)
        onMenu_ManageClick(MenuDeeps[MenuDeep-1],MenuDeep-1)
}

