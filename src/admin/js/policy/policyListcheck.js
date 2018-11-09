/**
 * Created by Administrator on 2018/2/10.
 */
var base_url_course = '/rs/infomation';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
$(function() {
    getorganiz();
    getInfocolumn();
    var searchForm = getlocalStorageCookie("searchForm");
    if(searchForm&&searchForm != '{}'){
        searchForm = JSON.parse(searchForm);
        //onSearchClick();
        searchData();
    }else{
        queryList();
    }
});
function getInfocolumn(){
    zhget("/rs/info_column",{status:'<>,99'}).then( function(result) {
        var html="<option value=''>请选择</option>";
        for(var i=0;i<result.rows.length;i++){
            html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>";
        }
        jQuery("#column_id").html(html);
    });
}
function resetinput() {
    isSearch=false;
    $("#TalentTryoutSearchForm", $(".reasonRefund"))[0].reset();
    queryList();
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    $("#table-goodsList").next("div").children("span").remove();
    $("#paginator").html('');
    queryList();
}

function queryList() {
    var pageRecord = getlocalStorageCookie("pageRecord");
    if(pageRecord&&pageRecord>0){
        dellocalStorageCookie("pageRecord");
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
    }
    var data={
        order:'status asc, is_hot desc,create_time desc',
        page: currentPageNo,
        size: pageRows,
        status:'>,0,<,99'
    }
    if(isSearch){
        var searchForm = getlocalStorageCookie("searchForm");
        searchForm = JSON.parse(searchForm);
        if(searchForm){
            dellocalStorageCookie("searchForm");
            for(var key in searchForm){
                $("input[name='"+key+"']").val(searchForm[key]);
                $("select[name='"+key+"']").val(searchForm[key]);
            }
        }
        var title = $("#title").val();
        if(title!=''){
            data.title = title;
            data.search=1;
        }
        var organiz_id=$("#shopnames").val();
        if(organiz_id && organiz_id!='-1'){
            data.organiz_id=organiz_id;
        }
        var unique_code=$("#unique_code").val();
        if(unique_code!='全部'){
            data.unique_code=unique_code;
        }
        var is_hot=$("#is_hot").val();
        if(is_hot!='全部'){
            data.is_hot=is_hot;
        }
        var status=$("#status").val();
        if(status && status!="-1"){
            delete data.ins;
            data.status=status;
        }
        var column_id=$("#column_id").val();
        if(column_id && column_id!="-1"){
            data.column_id=column_id;
        }
    }
    $.showActionLoading();
    zhget(base_url_course, data).then( function(result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-goodsList')) {
            for (var i = 0; i < result.rows.length; i++) {
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
                if(result.rows[i].unique_code == 'zcbl'){
                    result.rows[i].unique_code = "办理类";
                }else{
                    result.rows[i].unique_code = "政策类";
                }
                result.rows[i].pic_abbr = targetUrl + result.rows[i].pic_abbr;
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
        }
    });
}
function getorganiz(){
    $("#shopname").html("");
    $("#shopnames").html("");
    zhget('/rs/organiz').then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#shopnames").append(html);
        }
    })
}
function onSetUpClick(id,ishot) {
    if(ishot == 0){
        if(confirm("确认要设置该政策为热点信息吗？")) {
            var time = new Date(new Date().getTime()).Format('yyyy-MM-dd hh:mm:ss');
            zhput(base_url_course+"/"+id,{is_hot:1,hot_time:time}).then(function (rs) {
                if(checkData(rs,'put')) {
                    queryList();
                }
            })
        }
    }else if (ishot == 1){
        if(confirm("确认要取消该政策为热点信息吗？")) {
            zhput(base_url_course+"/"+id,{is_hot:0}).then(function (rs) {
                if(checkData(rs,'put')) {
                    queryList();
                }
            })
        }
    }
}
function viewDetail(id,copy) {
    var thispage  = window.location.hash;
    thispage = thispage.replace('#','');
    setlocalStorageCookie("thispage",thispage);
    var searchForm = $("#TalentTryoutSearchForm").form2json();
    if (searchForm.unique_code == '全部'){
        delete searchForm.unique_code;
    }
    console.log(searchForm);
    setlocalStorageCookie("searchForm",JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    if(copy=='copy'){
        location.href="admin.html#pages/policy/addpolicy.html?id="+id+'&copy=copy&read=read';
    }else{
        location.href="admin.html#pages/policy/addpolicy.html?id="+id+'&read=read';
    }
}
//状态：0-草稿；1-待审核；2-通过；3-拒绝；4-下架；99-删除；
//下架
function questiondown(id){
    if(confirm("确定要下架该政策百科吗？")) {
        zhput(base_url_course + "/" + id, {status: 4}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("下架成功");
            } else {
                showError("下架失败")
            }
        })
    }
}
//上架
function questionup(id){
    if(confirm("确定要上架该政策百科吗？")) {
        zhput(base_url_course + "/" + id, {status: 2}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("上架成功");
            } else {
                showError("上架失败")
            }
        })
    }
}
//拒绝
function rejectClick(id){
    if(confirm("确定要拒绝该政策百科吗？")) {
        zhput(base_url_course + "/" + id, {status: 3}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("拒绝成功");
            } else {
                showError("拒绝失败")
            }
        })
    }
}
//通过审核
function agreeClick(id){
    if(confirm("确定要通过该政策百科吗？")) {
        zhput(base_url_course + "/" + id, {status: 2}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("通过成功");
            } else {
                showError("通过失败")
            }
        })
    }
}
/*
function onDeleteClick(id) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_course + "/" + id).then(function (result) {
            console.log(result);
            var page=jQuery("#paginator li.active a").html();
            if (result.code == 200) {
                var lists=jQuery("#menu-placeholder tr");
                if(lists.length==1){
                    currentPageNo=(page-1);
                    $("#pageIndex").val(currentPageNo);
                    queryList();
                }else{
                    queryList();
                }
                showSuccess('删除成功！');
            } else {
                showError('删除失败！');
            }
        });
    }
}
*/

/*
function rejectClick(id){
    $('#user_buttonids').show();
    $('#viewthereason').hide();
    $("#reject_Reasons").attr('readonly',false)
        .val("");
    $('#rejectModal').modal('show');
    $("#rejectId").val(id);
}
function onSaveRejectClick(){
    var id=$("#rejectId").val();
    var reject_reason=$("#reject_Reasons").val().trim();
    var data={
        status:"2"
    };
    if(reject_reason==null||reject_reason==""){
        $("#reject_Reasons").focus();
        return showError("请输入拒绝原因")
    }else{
        data.remark=reject_reason;
    }
    $('#rejectModal').modal('hide');
    zhput(base_url_course + "/" + id, {status: 3}).then(function (result) {
        if (result.code == 200) {
            queryList();
            showSuccess("拒绝成功");
        } else {
            showError("拒绝失败")
        }
    })
}

//查看拒绝原因
function viewReason(id){
    $('#user_buttonids').hide();
    $('#viewthereason').show();
    var data={
        id:id
    }
    zhget(base_url_course,data).then(function(result){
        if(result.code==200){
            var remarks=result.rows[0].remark;
            $('#reject_Reasons')
                .attr('readonly',true)
                .val(remarks);
            $('#rejectModal').modal('show');
        }else{
            processError(result)
        }
    })
}
*/
function onSearchClick() {
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

Handlebars.registerHelper("superif", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('getindex', function(v1, options) {
    return v1+1;
});