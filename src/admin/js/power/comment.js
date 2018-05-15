var base_url_style = '/rs/community_comment';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var curId = curMenuId;
var id;
$(function() {
    id=getQueryString("id");
    queryList();
    updateMenuLocationInfo();

});
function backclick(){
    window.location.href="admin.html#pages/articleList.html";
}
function queryList() {
    var data = {
        order:'speak_time desc',
        page: currentPageNo,
        size: pageRows
    }
    if(isSearch){
        var title=$("#style").val();
        var startTime=$("#startTime").val()
        var endTime=$("#endTime").val()
        if(title!=''){
            data.speak_details=title;
        }
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<endTime){
                    data.speak_time='>,'+startTime+',<,'+endTime
                }else{
                    alert("结束时间大于开始时间")
                    return
                }
            }else{
                if(startTime){
                    data.speak_time='>,'+startTime
                }
                if(endTime){
                    data.speak_time='<,'+endTime
                }
            }
        }
        data.search=1;
    }
    $("#style-placeholder").html('');
    //standard_build
    data.c_id=id
    data.status='<,9'
    zhget(base_url_style+"/",data).then( function(result) {
        if(checkData(result,'get','queryList','table-menu')) {
            menu = result;
            console.log(menu)
            buildTable(result, 'style-template', 'style-placeholder');
            isSearch=false
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


function onDeleteClick(id,flag=false) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_style + "/" + id).then(function (result) {
            console.log(result);
            if (result && result.info) {
                if(flag){
                    var idArr=id.split("_")
                    if($("#style-placeholder tr").length==idArr.length){
                        if(currentPageNo>1){
                            currentPageNo--;
                        }
                    }
                }else{
                    if($("#style-placeholder tr").length==1){
                        if(currentPageNo>1){
                            currentPageNo--;
                        }
                    }
                }
                $("#allCheck").prop("checked", false);
                $("#goToPagePaginator").val(currentPageNo)
                $("#goToPagePaginator+div").click()
                $("#goToPagePaginator").val("")
                // queryList();
                showSuccess('删除成功！');
            } else {
                showError('删除失败！');
            }
        });
    }
}

function onSaveClick() {
    var id = $("#id").val();
    var data = {
        name: $("#style").val(),
    };
    console.log(data)
    if (operation == "add") {
        zhpost(base_url_style, data, saveResult);
    } else {
        zhput(base_url_style + "/" + id, data, saveResult);
    }
}


function saveResult(result) {
    if (result.err) {
        showError('保存失败！');
    } else {
        $('#user_buttonid').hide();
        $("#searchDataBtn").show();
        $("#resetSearchBtn").show();
        queryList();
        cleanForm()
        showSuccess('保存成功！');
    }
}

function fillForm(id) {
    var index = 0;
    for (index in menu.rows) {
        var item = menu.rows[index];
        console.log(item.id)
        if (item.id == id) {
            $("#id").val(item.id);
            $("#style").val(item.name);
            return;
        }
    }
}

function cleanForm() {
    $("#style").val("");
    $("#startTime").val("");
    $("#endTime").val("");
    queryList();
}

function returnUpDeep(){
    if(MenuDeep>0)
        onMenu_ManageClick(MenuDeeps[MenuDeep-1],MenuDeep-1)
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();
}
//多选
$("#allCheck").click(function(){
    if($(this).prop("checked")){
        $("input[type='checkbox']").each(function() {
            $(this).prop("checked", true);
        });
    }else{
        $("input[type='checkbox']").each(function() {
            $(this).prop("checked", false);
        });
    }
})
//批量删除
function allCheck(){
    var html=''
    $("#style-placeholder input[type='checkbox']").each(function(i){
        if($(this).prop("checked")){
            if(i==0){
                html+=$(this).val()
            }else{
                html+='_'+$(this).val()
            }
        }
    })
    if(html==''){
        alert("请选择内容")
        return
    }
    onDeleteClick(html,true)
}