
var base_url_goodsCategory='/rs/questions';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
var categoryArr=[]
var organizArr=[]
locationHistory('reasonSearchForm');
$(function() {
    getorg();
    backInitHistory();
    $("#searchDataBtn", $(".reasonRefund")).bind("click", searchbtn);
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        $('#videonames').selectpicker('refresh');
        queryList();
    });
});
function getcategory(){
    $("#videonames").html("");
    zhget('/rs/questions_category').then(function(result){
        buildTableNoPage(result, 'brand-template', 'videonames');
        initselect('videonames');
        $(".bs-searchbox input").attr("maxlength","20");
        queryList();
    })
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
function getorg(){
    $("#shopname").html("");
    $("#shopnames").html("");
    zhget('/rs/company',{status:1}).then(function(result){
        var html="";
        if(result.code==200){
            organizArr=result.rows
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#shopnames").append(html);
        }
        getcategory();
    })
}
function rightKey(arr){
    for(var i=0;i<arr.length;i++){
        if(arr[i].right == true){
            return arr[i].answer
        }
    }
}
function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var comp_id=getCookie('compid');
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'status asc,create_time desc',
        status:'>,0,<,99'
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        if(name!=''){
            data.name=name;
        }
        var comp_id=$("#shopnames").val();
        if(comp_id&&comp_id!="-1"){
            data.organiz_id=comp_id;
        }
        var category_id=$("#videonames").val();
        if(category_id&&category_id!="-1"){
            data.category_id=category_id;
        }
        var status=$("#status").val();
        if(status && status!="-1"){
            delete data.ins;
            data.status=status;
        }
        var rank_id=$("#rank").val();
        if(rank_id&&rank_id!="-1"){
            data.rank=rank_id;
        }
        var type=$("#suery_type").val()
        if(type>=0){
            data.type=type;
        }
    }
    zhget(base_url_goodsCategory,data).then(function (result) {
        if(checkData(result,'get','queryList','table-goodsCategory','paginator')) {
            $("#querylistnull").remove();
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                for(var j=0;j<categoryArr.length;j++){
                    if(integrals[i].category_id == categoryArr[j].id){
                        integrals[i].category_name = categoryArr[j].name
                    }
                }
                for(var j=0;j<organizArr.length;j++){
                    if(integrals[i].comp_id == organizArr[j].id){
                        integrals[i].organiz_name = organizArr[j].name
                    }
                }
                integrals[i].answers = rightKey(integrals[i].answer_json)
            }
            buildTable(result, 'goodsCategory1-template', 'goodsModel-placeholder');
        }
    })
}
function showSearchPage() {
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function viewDetail(id) {
    window.location.href="/admin/admin.html?_t="+Math.random()+"#pages/questiondetail.html?id="+id;
}
/*
function delClick(id) {
    if (confirm("确定要删除该题目吗？")) {
        zhdelete(base_url_goodsCategory + "/" + id).then(function (result) {
            checkData(result, 'delete');
            if($("#goodsModel-placeholder").find("tr").length == 1){
                currentPageNo = currentPageNo>1?currentPageNo-1:1
            }
            queryList()
        })
    }
}*/
//状态：0-草稿；1-待审核；2-通过；3-拒绝；4-下架；99-删除；
//下架
function questiondown(id,type,category_id){
    if(confirm("确定要下架该题目吗？")) {
        zhput(base_url_goodsCategory + "/" + id, {status: 4,type:type,category_id:category_id}).then(function (result) {
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
function questionup(id,type,category_id){
    if(confirm("确定要上架该题目吗？")) {
        zhput(base_url_goodsCategory + "/" + id, {status: 2,type:type,category_id:category_id}).then(function (result) {
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
function rejectClick(id,type,category_id){
    if(confirm("确定要拒绝该题目吗？")) {
        zhput(base_url_goodsCategory + "/" + id, {status: 3,type:type,category_id:category_id}).then(function (result) {
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
function agreeClick(id,type,category_id){
    if(confirm("确定要通过该题目吗？")) {
        zhput(base_url_goodsCategory + "/" + id, {status: 2,type:type,category_id:category_id}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("通过成功");
            } else {
                showError("通过失败")
            }
        })
    }
}

//重置
function resetinput(){
    $("#userAddForm", $(".reasonRefund"))[0].reset();
}

//搜索
function searchbtn(){
    issearchModel=true;
    currentPageNo=1;
    queryList();
}
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
}*/
Handlebars.registerHelper('equal', function(v1,v2, options) {
    if(v1 ==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('ifequal', function(v1,v2, options) {
    if(v1 ==v2) {
        return options.fn(this);
    }else {
        return options.inverse(this);
    }
});