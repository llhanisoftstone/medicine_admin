/**
 * Created by Administrator on 2018/4/27.
 */
/**
 * Created by Administrator on 2018/4/27.
 */
/**
 * Created by Administrator on 2018/4/27.
 */
/**
 * Created by kechen on 2016/10/13.
 */
var base_url_goodsCategory='/rs/questions';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
var categoryArr=[]
var organizArr=[]
var organizid=sessionStorage.getItem('organiz_id') ? sessionStorage.getItem('organiz_id') : getCookie('organiz_id');
locationHistory('reasonSearchForm');
$(function() {
    getorg();
    backInitHistory();
    $("#searchDataBtn", $(".reasonRefund")).bind("click", searchbtn);
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        currentPageNo = 1;
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    setTimeout(queryList,500)
});
function getcategory(){
    $("#videonames").html("");
    zhget('/rs/questions_category').then(function(result){
        var html="";
        if(result.code==200){
            categoryArr=result.rows
            html+="<option value='-1'>全部</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#videonames").append(html);
        }
    })
}
function getorg(){
    $("#shopname").html("");
    $("#shopnames").html("");
    var data={
        id:organizid,
    }
    zhget('/rs/organiz',data).then(function(result){
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
        status:'<,99',
        organiz_id:organizid,
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
                    if(integrals[i].organiz_id == organizArr[j].id){
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

function onUpdateClick(id) {
    window.location.href="/admin/admin.html?_t="+Math.random()+"#pages/questionadd.html?id="+id;
}
function delClick(id) {
    if (confirm("确定要删除该题目吗？")) {
        zhput(base_url_goodsCategory + "/" + id,{status:99}).then(function (result) {
            checkData(result, 'delete');
            if($("#goodsModel-placeholder").find("tr").length == 1){
                currentPageNo = currentPageNo>1?currentPageNo-1:1
            }
            queryList()
        })
    }
}
//提交审核
function submitcheck(id){
    if(confirm("确定要直接提交审核该题目吗？")) {
        zhput(base_url_goodsCategory + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("提交成功");
            } else {
                showError("提交失败")
            }
        })
    }
}
function addvideolist(){
    window.location.href="/admin/admin.html?_t="+Math.random()+"#pages/questionadd.html";
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
//查看详情
function viewDetail(id) {
window.location.href="/admin/admin.html?_t="+Math.random()+"#pages/questiondetail.html?id="+id;
}
Handlebars.registerHelper('ifequal', function(v1,v2,v3, options) {
    if(v1 == v2||v1 == v3) {
        return options.fn(this);
    }else {
        return options.inverse(this);
    }
});