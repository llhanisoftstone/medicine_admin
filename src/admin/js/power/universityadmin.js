/**
 * Created by Administrator on 2018/4/26.
 */
var base_url_member='/rs/v_member';

var list = [];
var server_list=[];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
$(function() {
    var page=getUrlParamsValue("page");
    if(page&&page!="undefined"){
        currentPageNo=page;
    }
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        $("#compsearch").selectpicker('val','');
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    queryList();
    getUniversity();
});

function showSearchPage() {
    $(".reasonSearch", $(".report")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    if($(".reasonSearch").is(":visible")) {
        isSearch=false;
    }
}
// 用户信息页面渲染
var isSearch=false;
function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();
}
function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
        order:'status desc,create_time desc',
        rank:31,      //31-店铺管理员，91-超级管理员。
        status:'<>,99'
    }
    if(isSearch){
        var username=$("#username").val();
        var status=$("#status").val();
        var comp=$("#compsearch").selectpicker('val');
        if(username!='' && $.trim(username)!=''){
            data.username=username;
        }
        if( comp && comp != ''){
            data.store_id=comp;
        }
        if( status && status != -1){
            data.status=status;
        }
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<endTime){
                    data.create_time='>,'+startTime+',<,'+endTime
                }else{
                    alert("结束时间大于开始时间")
                    return;
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
        data.search=1;
    }
    // $("#event-placeholder").html('');
    zhget(base_url_member, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTableByke(result, 'event-template', 'event-placeholder','paginator',queryList,pageRows);
        }
    });
}

function cleardiv(){
    $("#addusername").val('');
    $("#comp_name").val('');
    $("#password").val('');
    $("#order").val('');
    $("#bank").val('');
    $("#uploader .filelist").each(function(){
        $(this).find(".cancel").click();
    })
}

//新建 修改
var index1;
function addcompany(id){
        $("#comp").selectpicker('val','');
        $("#cid").val('')
        $("#addusername").val('');
        $("#password").val('');
        $("#addusername").removeAttr("disabled")
        $("#addModal").modal("show")

    // }

    index1 = 1;
    $('#defaultModal').modal('show');
    $('#defaultModal').on('shown.bs.modal', function () {

    });
    $('#newCircleModal').modal('show');
}

function clearinput(){
    // cleardiv();
    // $("#uploadImg").show();
    // $("#pic").show();
    $("#newCircleModal input").val('');
}

function adduniversityuser(){
    var id=$("#cid").val()
    var username = $("#addusername").val().trim()
    // var name = $("#comp_name").val().trim();
    var comp=$("#comp").selectpicker('val');
    var password = $("#password").val().trim()
    if( !comp || comp == ''){
        $("#comp").focus();
        return showError("请选择店铺名称")
    }
    if( !username || username == ''){
        $("#addusername").focus();
        return showError("请输入账号");
    }
    if(username.length<6){
        $("#addusername").focus();
        return showError("请输入6位以上的账号")
    }
    if(!id){
        if(password.length<6){
            $("#password").focus();
            return showError("请输入6位以上的密码")
        }
    }
    $('#adduniversitybtn').attr("disabled","disabled");
    var data={
        username:username,
        name:name,
        password:password,
        rank:31,
        store_id:comp
    };
    if(id){
        data.u_id=$("#uid").val()
        zhput('/rs/member/'+id,data).then(function(res){
            if(res.code==200){
                showSuccess("修改成功");
                $("#addModal").modal("hide")
                $("#addModal input").val("")
                cleardiv();
                $('#adduniversitybtn').attr("disabled",false);
                queryList()
            }else if (res.code == 606){
                showError("该账号已存在")
                $('#adduniversitybtn').attr("disabled",false);
            }else if(res.code == 804){
                showError("该店铺已有管理员账号")
                $('#adduniversitybtn').attr("disabled",false);
            }else{
                showError("修改失败")
                $('#adduniversitybtn').attr("disabled",false);
            }
        })
    }else{
        data.auto_id=1;
        zhpost('/rs/member',data).then(function(res){
            if(res.code==200){
                showSuccess("新增成功");
                $("#addModal").modal("hide")
                $("#addModal input").val("")
                $('#adduniversitybtn').attr("disabled",false);
                cleardiv()
                queryList()
            }else if (res.code == 606){
                showError("该账号已存在")
                $('#adduniversitybtn').attr("disabled",false);
            }else if(res.code == 803){
                showError("该手机号已经注册过了")
                $('#adduniversitybtn').attr("disabled",false);
            }else if(res.code == 804){
                showError("该店铺已有管理员账号")
                $('#adduniversitybtn').attr("disabled",false);
            }else{
                showError("修改失败")
                $('#adduniversitybtn').attr("disabled",false);
            }
        })
    }
}

//查看禁用原因
function RejectClick(id){
    zhget(base_url_member,{id:id}).then(function (result) {
        if (result.code == 200) {
            $('#rejectModal').modal('show');
            $('#rejectModal .modal-footer').hide()
            $("#reject_Reasons").val(result.rows[0].refuse_reason).attr("disabled",true)
        } else {
            // processError(result)
        }
    })
}
//禁用填写原因
function rejectClick(id){
    if(!confirm("确认要禁用该店铺管理员账号吗？")){
        return;
    }
    $('#rejectModal').modal('show');
    $('#rejectModal .modal-footer').show()
    $("#reject_Reasons").val("").removeAttr("disabled");
    $("#rejectId").val(id);

}
//保存原因
function onSaveRejectClick(){
    var id=$("#rejectId").val();
    $("#rejectId").val('')
    var reject_reason=$("#reject_Reasons").val().trim();
    if(reject_reason==null||reject_reason==""){
        $("#reject_Reasons").focus();
        return showError("请输入禁用原因")
    }
    $('#rejectModal').modal('hide');
    forbid(id)
}
//禁用
function forbid(id){
    if(!confirm("确认要禁用该店铺管理员账号吗？")){
        return;
    }
    var refuse_reason=$("#reject_Reasons").val()
    // if(confirm("确定要禁用该店铺吗？")) {
    var fdata={
        status: 0
        // refuse_reason:refuse_reason
    };
        zhput("/rs/member/" + id, fdata).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("禁用成功");
            } else {
                showError("禁用失败")
            }
        })
    // }
}
//启用
function openstart(id,unid){
    if(confirm("确定要启用该店铺管理员账号吗？")) {
        zhput("/rs/member/" + id, {status:1}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("启用成功");
            }else if(result.code == 209){
                showError("无法启用，该店铺已有管理员账号")
            }else {
                showError("启用失败")
            }
        })

    }
}

//店铺信息
function getUniversity(){
    var data={
        status:1    //0-禁；1-有效；9删除
    }
    zhget('/rs/store',data).then(function(result) {
        if(result.code==200) {
            buildTableNoPage(result, 'brand-template', 'comp');
            buildTableNoPage(result, 'brand-template', 'compsearch');
            initselect('comp');
            initselect('compsearch');
            $.hideActionLoading();
        }else{
            buildTableNoPage(result, 'brand-template', 'comp');
            buildTableNoPage(result, 'brand-template', 'compsearch');
            initselect('comp');
            initselect('compsearch');
            $.hideActionLoading();
        }
    });
}
function delClick(el,userid,usernames){
    if(!confirm("确认要删除该店铺管理员账号吗？")){
        return;
    }
    zhput('/rs/member/'+ userid, {status:99,username:userid+usernames}).then(function (res) {
        if(res.code==200){
            showSuccess("删除成功!")
            if(jQuery(el).parents("tbody").find("tr").length==1){
                if(currentPageNo>1){
                    currentPageNo--;
                }
                jQuery("#goToPagePaginator").val(currentPageNo);
                jQuery("#goToPagePaginator").next().click();
            }else{
                queryList();
            }
        }else {
            showError("删除失败!")
        }
    })
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
Handlebars.registerHelper('equal', function(v1,v2, options) {
    if(v1 ==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('gettimes', function(v1, options) {
    if(v1) {
        return v1.slice(1,v1.length-1);
    }
});
Handlebars.registerHelper('is_judge', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});