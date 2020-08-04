var base_url_banner='/rs/about_us';
var operation = "add";
var id=1;
var code;
jQuery(function(){
    Data();
})
$(".text-center").on("click","#saveCarouselData",function(){
    onSaveClick()
})
var waitCKEditorReady = function(res,i) {
    if(i>10){
        return;
    }
    if(addaboutAseditors.status == 'ready') {
        var details=res.rows[0].details;
        addaboutAseditors.setData(details)
    } else {
        setTimeout(function() {
            waitCKEditorReady(res,i+1);
        }, 20);
    }
}
function Data(){
    zhget(base_url_banner+"/"+id).then(function (res){
        if(res.code==200){
            code = 200;
            waitCKEditorReady(res,0)
        }else{
            code = 602;
        }
    })
}
function onSaveClick() {
    var details=addaboutAseditors.getData();
        $.trim(details);
    if(details==""){
        showError('请输入内容！');
        return;
    }
    var data={
        details:details,
    }
    if(code == 602){
        data.id = 1;
        zhpost(base_url_banner,data).then(function(result){
            if(result.code==200){
                Data();
                showSuccess("保存成功！")
            }
        })
    }else{
        zhput(base_url_banner+"/"+id,data).then(function (result){
            if(result.code==200){
                Data();
                showSuccess("保存成功！")
            }

        })
    }

}
