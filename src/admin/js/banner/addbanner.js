/**
 * Created by Administrator on 2017/9/5.
 */
/**
 * Created by Administrator on 2017/9/5.
 */

var base_url_banner='/rs/banner';
var base_url_category='/rs/banner_category';
var operation = "add";
var id=0;
$(function(){
    //绑定上传图片详情控件change事件
    $.initSystemFileUpload($("#user_form"), onUploadDetailPic);
    // $('#saveCarouselData').bind("click");
    // $('#saveCarouselData').bind("click", onSaveClick);
    id=getIdByUrl();
    if(id==''){
        //    新增
        zhget(base_url_category).then(function (rs) {
            if (rs.code == 200) {
                var html = '<option value="" selected="selected">全部</option>';
                rs.rows.forEach(function (it, i) {
                    html += '<option value="' + it.id + '">' + it.name + '</option>';
                })
                $('#category').html(html);
            }
        })
    }else{
        //    修改
        operation="modify";
        $('#wrapper .panel-heading span').html("修改Banner图");

        zhget(base_url_category).then(function (rs) {
            if (rs.code == 200) {
                var html = '<option value="" selected="selected">全部</option>';
                rs.rows.forEach(function (it, i) {
                    html += '<option value="' + it.id + '">' + it.name + '</option>';
                })
                $('#category').html(html);

                zhget(base_url_banner+"/"+id).then(function (result){
                    if(checkData(result,'get')){
                        var data=result.rows[0];
                        $("#category").val(data.category);
                        $("#status").val(data.status);
                        $("#titlebanner").val(data.title);
                        $("#title_pic2").val(data.picpath);
                        $("#pic_link").val(data.urlpath);
                    }
                })

            }
        })
    }
})
// 图片上传
function onUploadDetailPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
function back(){
    location.href="admin.html#pages/banner/indexBanner.html";
}
function onSaveClick() {
    var category=$("#category option:selected").val();
    if(category==0){
        showError('请选择类型');
        return;
    }
    var status=$("#status option:selected").val();
    if(status==-1){
        showError('请选择状态');
        return;
    }
    var title=$("#titlebanner").val().trim();
    if(title==""){
        showError('请输入标题');
        return;
    }
    var picpath=$("#title_pic2").val();
    if(picpath==""){
        showError('请上传图片');
        return;
    }
    var urlpath=$("#pic_link").val();
    var data={
        category:category,
        status:status,
        title:title,
        picpath:picpath,
        urlpath:urlpath
    }
    if(urlpath.trim()==''){
        data.urlnull=1
    }
    if(operation=='add'){
        $.showActionLoading();
        zhpost(base_url_banner,data).then(function (result){
            $.hideActionLoading();
            if(checkData(result,'post')){
                back();
            }
        })
    }else{
        zhput(base_url_banner+'/'+id,data).then(function (result){
            if(checkData(result,'put')){
                back();
            }
        })
    }


}
