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
var integrals;
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
    var organizId=sessionStorage.getItem('organiz_id') ? sessionStorage.getItem('organiz_id') : getCookie('organiz_id');
    $("#shopname").html("");
    $("#shopnames").html("");
    var data={};
    if(organizId){
        data.id=organizId;
    }
    zhget('/rs/organiz',data).then(function(result){
        var html="";
        if(result.code==200){
            organizArr=result.rows
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                if(result.rows[i].id==organizId){
                    html+="<option value='"+result.rows[i].id+"' selected='selected'>"+result.rows[i].name+"</option>";
                }else{
                    html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>";
                }
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
    if(!getQueryString("id")){
        return
    }
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
            var answer={rows:result.rows[0].answer_json}
            buildTableNoPage(answer, 'goodsCategory1-template', 'answer');
        }
    })
}
function addoption(){
    $('#userHelpModal').modal('show');
}
function onSaveHelpClick(){
    if(!$("#HelpId").val().trim()){
        showError("请输入选项")
        return
    }
    $('#userHelpModal').modal('hide');
    var va = $("#HelpId").val()
    $("#HelpId").val('')
    var addawser=[{answer:va}]
    if($("#answer").find("tr").length>0){
        addawser[0].right=false
    }else{
        addawser[0].right=true
    }
    buildTableByPage(addawser, 'goodsCategory1-template', 'answer',true);
}
function escmodal(){
    $('#userHelpModal').modal('hide');
    $("#HelpId").val('')
}
function onDeleteClick(that){
    $(that).parents('tr').remove()
}
function changeText(that){
    if($(that).is(':checked')) {
        $(that).parents('#answer').find(".ri").val('false')
        $(that).val("true")
    }
}

function backquestion(){
    window.location.href="/admin/admin.html#pages/question.html";
}
function savedata(_status){
    var data={}
    if(!$("#name").val().trim()){
        showError("题目不能为空")
        return
    }
    if($("#videonames").val()=='-1'){
        showError("请选择分类")
        return
    }
    if($("#shopnames").val()=='-1'){
        showError("请选择出题者")
        return
    }
    if($("#rank").val()=='-1'){
        showError("请选择难度")
        return
    }
    if($("#answer").find("tr").length<2){
        showError("选项最少为2个")
        return
    }
    if($("#answer").find("tr").length>4){
        showError("选项最多为4个")
        return
    }
    data.name=$("#name").val()
    data.category_id=$("#videonames").val()
    data.organiz_id=$("#shopnames").val()
    data.rank=$("#rank").val()
    data.answer_json=[]
    $("#answer").find("tr").each(function(i,v){
        var right
        if($(v).find(".ri").val() == 'true'){
            right=true
        }else{
            right=false
        }
        data.answer_json.push({answer:$(v).find(".co").html(),right:right})
    })
    var isright=false
    for(var i=0;i<data.answer_json.length;i++){
        if(data.answer_json[i].right){
            isright=true
        }
    }
    if(!isright){
        showError("请选择正确答案")
        return
    }
    if(_status){
        data.status=_status;
    }
    if(getQueryString("id")){
        zhput(base_url_goodsCategory+'/'+getQueryString("id"),data).then(function(result){
            if(result.code == 200){
                showSuccess("修改成功")
                window.location.href="/admin/admin.html#pages/question.html";
            }
        })
    }else{
        data.auto_id=1
        zhpost(base_url_goodsCategory,data).then(function(result){
            if(result.code == 200){
                showSuccess("保存成功")
                window.location.href="/admin/admin.html#pages/question.html";
            }
        })
    }
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