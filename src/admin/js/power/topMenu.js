var base_url='/rs/main_column';
var currentPageNo = 1;
var pageRows = 10;
var isSearch=false;
var comp_id;
$(function() {
    comp_id=getCookie('compid') || sessionStorage.getItem('compid');
    $.initSystemFileUploadnotLRZ($("#userAddForm"), onUploadDetailPic);
    $("#resetSearchBtn", $(".bannerreport")).bind("click", function(){
        $("#reasonSearchForm", $(".bannerreport"))[0].reset();
        currentPageNo = 1;
        pageRows = 10;
        queryList();
    });
    $("#searchBtn", $(".bannerreport")).unbind("click");
    $("#searchBtn", $(".bannerreport")).bind("click", showSearchPage);
    queryList()
    if(comp_id){
      $(".targetselect").hide()
    }else{
        $(".targetselect").show()
    }

});
// 图片上传
function onUploadDetailPic(formObject, fileComp, list){
    var attrs = fileComp.attr("refattr");
    debugger
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
}

// 点击新建按钮
function onAddClick() {
    $(".reasonSearch").css("display","none");
    $("#configid").val("");
    $("#title").val("");
    $("#title_pic2").val("");
    $("#sequence").val("");
    $("#type").val("-1");
    $("#typestyle").val("-1");
   $("#titlebanner").val("");
    $("#status").val("-1");
    isSearch=false;
    queryList();
    $(".addModels", $("#wrapper")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function onUpdateClick(id) {
    $(".reasonSearch").css("display","none");
    $(".addModels", $("#wrapper")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
    zhget(base_url+"/"+id).then(function (result){
        if(result.code==200){
            var datalist=result.rows[0];
            $("#configid").val(datalist.id);
            $("#title").val(datalist.name);
           $("#title_pic2").val(datalist.icon_path);
           $("#sequence").val(datalist.sequence);
            $("#type").val(datalist.target_type);
            if(datalist.target_type==1){
                $("#typestyle").val(datalist.show_css);
                $(".styleselect").show();
            }else{
                $(".styleselect").hide();
            }
        }
    })
}
function onSearchClick() {
    $(".addModels").css("display","none");
    $(".reasonSearch", $("#wrapper")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function showselect(obj){
    var category=obj.value;
    if(category==1){
        $(".styleselect").show();
    }else if(category==2){
        $(".styleselect").hide();
    }
}
function viewDetail(id,target_type,show_css,enter){
    location.href="admin.html#pages/homeconfigmessage.html?pid="+id+"&target_type="+target_type+"&show_css="+show_css+"&enter=1";
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();
}

// 页面渲染
function queryList() {
    var data = {
        order:'status desc,sequence desc,create_time desc',
        page: currentPageNo,
        size: pageRows,
    }
    if(comp_id){
        data.comp_id=comp_id;
    }else{
        data.comp_id=0;
    }
    if(isSearch){
        var title=$("#titlebanner").val();
        var status=$("#status").val();
        if(title!=''&&title!=0){
            data.name=title;
            data.search=1;
        }
        if(status!=''&&status!=-1){
            data.status=status;
        }
    }
    $("#banner-placeholder").html('');
    zhget(base_url,data).then(function (result){
            if(checkData(result,'get','queryList','table-member')) {
                integrals = result.rows;
                for (var i = 0; i < integrals.length; i++) {
                    var indexCode = integrals[i];
                    indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                    indexCode.icon_path=targetUrl+indexCode.icon_path;
                }
                buildTableByke(result, 'banner-template', 'banner-placeholder','paginator',queryList,pageRows);
            }

    })
}
// 点击查看弹出模态框
function openstart(id){
    if(confirm("确定要启用吗？")) {
        zhput(base_url + "/" + id, {status: 1}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("启用成功");
            } else {
                showError("启用失败")
            }
        })
    }
}
function forbid(id){
    if(confirm("确定要禁用吗？")) {
        zhput(base_url+"/"+ id, {status: 0}).then(function (result) {
            if (result.code == 200) {
                queryList();
                showSuccess("禁用成功");
            } else {
                showError("禁用失败")
            }
        })
    }
}
function savedatamain(){
    var name=$("#title").val()
    var icon_path=$("#title_pic2").val();
    var sequence=$("#sequence").val();
    if(name==""||name==null){
        return showError("请输入标题")
    }
    if(sequence==""||sequence==null){
        return showError("请输入顺序")
    }
    var data={
        name:name,
        icon_path:icon_path,
        sequence:sequence
    }
    if(comp_id){
        data.comp_id=comp_id;
        data.target_type=1;
        data.show_css=1;
    }else{
        data.comp_id=0;
        var target_type=$("#type").val();
        if(target_type&&target_type!="-1"){
            data.target_type=target_type;
        }else{
            return showError("请选择二级页面类型")
        }
        var show_css=$("#typestyle").val();
        if(target_type==1){
            if(show_css&&show_css!="-1"){
                data.show_css=show_css
            }else{
                return showError("请选择样式类型")
            }
        }else if(target_type==2){
            data.show_css=3;
        }
    }

    var id=$("#configid").val();
    if(id){
        zhput("/rs/main_column/"+id,data).then(function(result){
            if (result.code == 200) {
                showSuccess("修改成功");
                queryList();
                $(".addModels").css("display","none");
                $(".reasonSearch").css("display","none");
            } else {
                showError("修改失败")
            }
        })
    }else{
        zhpost("/rs/main_column",data).then(function(result){
            if (result.code == 200) {
                showSuccess("添加成功");
                queryList();
                $(".addModels").css("display","none");
                $(".reasonSearch").css("display","none");
            } else {
                showError("添加失败")
            }
        })
    }

}

