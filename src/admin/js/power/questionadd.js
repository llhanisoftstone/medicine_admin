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
$(function() {
    getorg();
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
        queryList();
    })
}
function getorg(){
    $("#shopname").html("");
    $("#shopnames").html("");
    zhget('/rs/organiz').then(function(result){
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
// function rightKey(arr){
//     for(var i=0;i<arr.length;i++){
//         if(arr[i].right == true){
//             return arr[i].answer
//         }
//     }
// }
function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var comp_id=getCookie('compid');
    var data={
        id: getQueryString("id"),
    }
    zhget(base_url_goodsCategory,data).then(function (result) {
        if(checkData(result,'get','queryList','table-goodsCategory','paginator')) {
            $("#querylistnull").remove();
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                $("#name").val(result.rows[0].name)
                $("#videonames").val(result.rows[0].category_id)
                $("#shopnames").val(result.rows[0].organiz_id)
                $("#rank").val(result.rows[0].rank)
                var indexCode = integrals[i];
            }
            buildTable(result, 'goodsCategory1-template', 'answer');
        }
    })
}

function backquestion(){
    window.location.href="/admin/admin.html#pages/question.html";
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