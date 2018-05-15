var base_url_style = '/rs/community';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var curId = curMenuId;
$(function() {
    queryList();
    updateMenuLocationInfo();

});

//改
function queryList() {
    var data = {
        page: currentPageNo,
        size: pageRows,
        order: "plate_sub desc,status desc,create_time desc,category",
        status:"<,9"
    }
    if(isSearch){
        var title=$("#style").val();
        var speak_name=$("#author").val();
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
        var notifi_type=$("#notifi_type").val();
        var category=$("#category").val();
        var notifi=$("#notifi").val();
        var plate=$("#category1").val();
        if(title!=''){
            data.title=title;
        }
        if(speak_name!=''){
            data.lks = [speak_name,'nickname','realname',];
        }
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<endTime){
                    data.create_time='>,'+startTime+',<,'+endTime
                }else{
                    alert("结束时间大于开始时间")
                    return
                }
            }else{
                if(startTime){
                    data.create_time='>,'+startTime
                }
                if(endTime){
                    data.create_time='<,'+endTime
                }
            }
        }
        if(notifi_type>=0){
            data.status=notifi_type
        }
        if(category>=0){
            data.category=category
        }
        if(plate>=0){
            data.plate=plate
        }
        if(notifi>=0){
            data.plate_sub=notifi
        }
        data.search=1;
    }
    $("#style-placeholder").html('');
    $("#paginator").html('');
    //standard_build
    zhget(base_url_style,data).then( function(result) {
        // console.log(result);
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

//添加精华帖
function onPlateClick(id,data,status){
    if(status == 1){
        zhput("/rs/community_recommend/"+id,data).then(function (result) {
            if (result && result.info) {
                queryList();
                showSuccess('成功！');
            } else {
                showError('失败！');
            }
        });
    }else{
        showError('下架的帖子不能再添加推荐');
    }

}
function onSearchClick() {
    $(".brandSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
//上架
function onDelelteClick(id,data){
    $("#reason").val("")
    if(data.status===0){
    //    下架模态框
        $('#myModal').modal("show");
        $("#enter").click(function(){
            if($("#reason").val()){
                data.reject_reason=$("#reason").val()
            }else{
                showError('请输入下架原因');
                return
            }
            zhput(base_url_style+"/"+id,data).then(function (result) {
                console.log(result);
                if (result && result.info) {
                    queryList();
                    showSuccess('成功！');
                    $('#myModal').modal('hide')
                    $("#reason").val("")
                } else {
                    showError('失败！');
                }
            });
        })
    }else{
    //    上架
        data.reject_reason='';
        zhput(base_url_style+"/"+id,data).then(function (result) {
            console.log(result);
            if (result && result.info) {
                currentPageNo = 1;
                queryList();
                showSuccess('成功！');
                $("#reason").val("")
            } else {
                showError('失败！');
            }
        });

    }
}
// 编辑
function toModifyNotifiData(id){
    window.location.href="admin.html#pages/comment.html?id="+id;
}

function onDeleteClick(id) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_style + "/" + id+"?app=02", null).then(function (result) {
            console.log(result);
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
    $("#author").val("");
    $("#startTime").val("");
    $("#endTime").val("");
    $("#notifi_type").val("-1");
    $("#category").val("-1");
    $("#category1").val("-1");
    $("#notifi").val("-1");
    queryList();
}
function onResionClick(id){
    zhget(base_url_style).then( function(result) {
        if(checkData(result,'get','queryList','table-menu')) {
            menu = result;
            for(var i=0;i<result.rows.length;i++){
                if(id==result.rows[i].id){
                    $("#reason").val(result.rows[i].reject_reason)
                    $('#myModal').modal('show')
                }
            }
            console.log(menu)
        }
    });
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

//贴子加精接口：【PUT】/rs/community_recommend[/{id}]，要求登录，参数：plate_sub(0-普通；1-精华)。