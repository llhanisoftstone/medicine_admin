/**
 * Created by Administrator on 2018/4/26.
 */
var base_url_member='/rs/store';

var list = [];
var server_list=[];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
var univ_id=sessionStorage.getItem('university_id');
$(function() {
    $.initSystemFileUpload($("#uploadImg"), onUploadDetailPic);
    var page=getUrlParamsValue("page");
    if(page&&page!="undefined"){
        currentPageNo=page;
    }
    $("#resetSearchBtn", $(".report")).bind("click", function(){
        $("#reasonSearchForm", $(".report"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".report")).unbind("click");
    $("#searchBtn", $(".report")).bind("click", showSearchPage);
    queryList();
});
// 图片上传
function onUploadDetailPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}

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
        status:'<>,9'
    }
    if(isSearch){
        var realname=$("#nickname").val();
        if(realname!=''){
            data.name=realname;
        }
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
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
        data.search=1;
    }

    $("#event-placeholder").html('');
    zhget(base_url_member, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTableByke(result,'event-template','event-placeholder','paginator',queryList,pageRows);
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
function delClick(id){
    if(confirm("确认要删除该店铺吗？")){
        zhput('/rs/store/'+id,{status:9}).then(function(res){
            var page=jQuery("#paginator li.active a").html();
            if(res.code==200){
                var lists=jQuery("#event-placeholder tr");
                if(lists.length==1){
                    currentPageNo=(page-1);
                    $("#pageIndex").val(currentPageNo);
                    queryList();
                }else{
                    queryList();
                }
                showSuccess("删除成功");
            }else{
                showError("删除失败")
            }
        })
    }
}
//新建 修改
var index1;
function addcompany(id){
    if(id){
        zhget(base_url_member,{id:id}).then(function(res){
            if(res.code == 200){
                $("#addModal").modal("show")
                $("#cid").val(id)
                $("#comp_name").val(res.rows[0].name)


            }
        })

    }else{
        $("#addModal").modal("show")
        $("#cid").val('')
        $("#addusername").val('');
        $("#comp_name").val('');
        $("#password").val('');
        $("#order").val('');
        $("#bank").val('');
        $("#dndArea").removeClass("element-invisible");
        $(".filelist").html('');
        $("#addusername").removeAttr("disabled")
    }
    $('#newCircleModal').modal('show');
}
function clearinput(){
    $("#uploadImg").show();
    $("#pic").show();
    $("#newCircleModal input").val('');
}
function addcompanyuser(){
    var id=$("#cid").val()
    var name = $("#comp_name").val().trim();
    if(!name){
        return showError("请输入店铺名称")
    }
    $("#submitstore").attr("disabled","disabled");
    var data={
        name:name,
    }
    if(id){
        zhput('/rs/store/'+id,data).then(function(res){
            if(res.code==200){
                showSuccess("修改成功");
                $("#addModal").modal("hide")
                $("#submitstore").attr("disabled",false);
                $("#addModal input").val("")
                cleardiv()
                queryList()
            }else{
                showError("修改失败")
                $("#submitstore").attr("disabled",false);
            }
        })
    }else{
            zhpost('/rs/store',data).then(function(res){
                if(res.code==200){
                    showSuccess("新增成功");
                    $("#addModal").modal("hide")
                    $("#addModal input").val("")
                    $("#submitstore").attr("disabled",false);
                    cleardiv()
                    queryList()
                }else{
                    showError("新增失败")
                    $("#submitstore").attr("disabled",false);
                }
            })
    }
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