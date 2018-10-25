/**
 * Created by pc on 2018/9/25.
 */
var base_url='/rs/main_column_item';
var operation = "add";
var targetid=0;
var target_type;
var comp_id;
$(function(){
    comp_id=getCookie('compid') || sessionStorage.getItem('compid');
    //绑定上传图片详情控件change事件
    $.initSystemFileUpload($("#user_form"), onUploadDetailPic);
    var id=getQueryString("pid");
   target_type=getQueryString("target_type");
    targetid=getQueryString("targetid");
    var show_css=getQueryString("show_css");
    if(target_type==1){
        $(".selectmechanism").hide();
        $(".selectanswer").show();
        getQuestioncategory();
    }else if(target_type==2){
        $(".selectmechanism").show();
        $(".selectanswer").hide();
        getOrganiztion();
    }
    if(show_css==1){
        $("#title_pic2").attr("placeholder","请上传图标(92*92)")
    }else if(show_css==2){
        $("#title_pic2").attr("placeholder","请上传图标(249*165)")
    }

    if(targetid==''||targetid==null){
        operation="add";
    }else{
        //    修改
        operation="modify";
        zhget(base_url+"/"+targetid).then(function (result){
            if(checkData(result,'get')){
                var data=result.rows[0];
                if(data.target_type==1){
                    $("#titlebanner").val(data.name);
                    $("#title_pic2").val(data.icon_path);
                    $("#sequence").val(data.sequence);
                    setTimeout(function(){
                        $('#questioncategory').selectpicker('val',data.target_id);
                    },300)
                }else{
                    $("#sequence").val(data.sequence);
                    setTimeout(function(){
                        $('#selectcompany').selectpicker('val',data.target_id);
                    },300)

                }

            }
        })

    }
})
// 图片上传
function onUploadDetailPic(formObject, fileComp, list){
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
function getQuestioncategory(){
    var data={order:'create_time desc'};
    if(comp_id&&comp_id!="0"){
        data.comp_id=comp_id;
    }
    zhget('/rs/questions_category',data).then( function(result) {
        buildTableNoPage(result,'questioncategory-template','questioncategory');
        initselect("questioncategory")
        $(".bs-searchbox input").attr("maxlength","10");
    })
}
function getOrganiztion(){
    zhget('/rs/company',{status:1}).then( function(result) {
        buildTableNoPage(result,'selectcompany-template','selectcompany');
        initselect("selectcompany")
    })
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 8,
        width:'100%',
        noneSelectedText:"请选择"
    });
}
function back(){
    var id=getQueryString("pid");
    var target_type=getQueryString("target_type");
    var show_css=getQueryString("show_css");
    location.href="admin.html#pages/homeconfigmessage.html?pid="+id+"&target_type="+target_type+"&show_css="+show_css;
}
function onSaveClick() {
    if(target_type==1){
        var name=$("#titlebanner").val().trim();
        var icon_path=$("#title_pic2").val().trim();
        var sequence=$("#sequence").val().trim();
        if(name==""||name==null){
            return showError("请输入标题")
        }
        if(sequence==""||sequence==null){
            return showError("请输入显示顺序")
        }
        if(icon_path==""||icon_path==null){
            return showError("请选择图标")
        }
        var data={
            name:name,
            icon_path:icon_path,
            sequence:sequence,
            target_type:target_type,
            column_id:getQueryString("pid")
        }
        var questioncategory=$("#questioncategory").val();
        if(questioncategory){
            data.target_id=questioncategory
        }else{
            return showError("请选择题目分类")
        }

    }else if(target_type==2){
        var sequence=$("#sequence").val();
        var data={
            sequence:sequence,
            target_type:target_type,
            column_id:getQueryString("pid")
        }
        var selectcompany=$("#selectcompany").val();
        if(selectcompany){
            data.target_id=selectcompany
        }else{
            return showError("请选择机构")
        }
    }
    $("#saveCarouselData").attr("disabled","disabled");
    if(operation=='add'){
        $.showActionLoading();
        zhpost(base_url,data).then(function (result){
            $.hideActionLoading();
            if(result.code==206){
               showError("已添加该企业，不能重复添加")
                $("#saveCarouselData").attr("disabled",false);
                return
            }else{
                if(checkData(result,'post')){
                    back();
                    $("#saveCarouselData").attr("disabled",false);
                }
            }

        })
    }else{
        zhput(base_url+'/'+targetid,data).then(function (result){
            if(result.code==206){
                showError("已添加该企业，不能重复添加")
                $("#saveCarouselData").attr("disabled",false);
                return

            }else{
                if(checkData(result,'put')){
                    back();
                    $("#saveCarouselData").attr("disabled",false);
                }
            }

        })
    }
}
