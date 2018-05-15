var base_url_acceptanceReport = '/rs/phone';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
$(function() {
    queryList();
    updateMenuLocationInfo();
});



function queryList() {
    var data = {
        page: currentPageNo,
        size: pageRows,
        status:'<,9'
    }
    if(isSearch){
        var typePhone=$("#typePhone").val();
        if(typePhone!='-1'){
            data.type=typePhone;
        }
        var phone=$("#phone").val();
        if(phone!=''){
            data.phone=phone;
        }
        data.search=1;
    }
    $("#event-placeholder").html('');
    $("#paginator").html('');
    zhget(base_url_acceptanceReport,data).then( function(result) {
        console.log(result)
        if(checkData(result,'get','queryList','table-menu')) {
            menu = result;
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'style-template', 'style-placeholder');
        }
    });
}

function onAddClick() {
    cleanForm();
    operation = "add";
    $('#user_buttonid').show();
    $("#searchDataBtn").hide();
    $("#resetSearchBtn").hide();
}

function onUpdateClick(id) {
    $(".body").show();
    fillForm(id);
    operation = "modify";
    $('#user_buttonid').show();
    $("#searchDataBtn").hide();
    $("#resetSearchBtn").hide();
}

function onDeleteClick(id) {
    if(confirm("确认要删除？")) {
        zhput(base_url_acceptanceReport + "/" + id,{status:9}).then(function (result) {
            if (result && result.info) {
                queryList();
                showSuccess('删除成功！');
            } else {
                showError('删除失败！');
            }
        });
    }
}

function onSaveClick() {
    var id = $("#id").val();
    if($("#typePhone").val()=="-1"){
        showError('请选择类型');
        return false
    }
    if($("#phone").val()==""){
        showError('请输入电话');
        return false
    }
    var data = {
        phone: $("#phone").val(),
        type: $("#typePhone").val(),
    };
    if($("#typePhone").val()==1){
        data.type_name="客服电话"
    }else if($("#typePhone").val()==2){
        data.type_name="维权电话"
    }
    if (operation == "add") {
        zhpost(base_url_acceptanceReport, data, saveResult);
    } else {
        zhput(base_url_acceptanceReport + "/" + id, data, saveResult);
    }
}



function saveResult(result) {
    if (result.err) {
        showError('保存失败！');
    } else {
        $('#user_buttonid').hide();
        $("#searchDataBtn").show();
        $("#resetSearchBtn").show();
        cleanForm()
        queryList();
        showSuccess('保存成功！');
        $(".body").hide();
    }
}

function fillForm(id) {
    var index = 0;
    for (index in menu.rows) {
        var item = menu.rows[index];
        if (item.id == id) {
            $("#id").val(item.id);
            $("#typePhone").val(item.type);
            $("#phone").val(item.phone);
            return;
        }
    }
}

function cleanForm() {
    $("#id").val("");
    $("#phone").val("");
    $("#typePhone").val("-1");
}

var isSearch=false;
function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();

}
function resetData(){
    isSearch=false;
    cleanForm()
    queryList();
}