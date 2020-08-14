var base_url_information='/rs/information';
var operation = "add";
var id=0;
jQuery(function(){
    UE.getEditor('userProtocolAddUE1',{
        initialFrameWidth :'100%',//设置编辑器宽度
        initialFrameHeight:'400',//设置编辑器高度
        scaleEnabled:false//设置不自动调整高度
    });
})
$(function(){
    id=getIdByUrl();
    if(id){
        operation="modify";
        zhget(base_url_information+"/"+id).then(function (result){
            if(checkData(result,'get')){
                var data=result.rows[0];
                $("#title").val(data.title);
                $("#author").val(data.author);
                setTimeout(function(){
                    UE.getEditor('userProtocolAddUE1').setContent(data.details)
                },500)
            }
        })
    }
})

function back(){
    location.href="admin.html#pages/informationList.html";
}
function onSaveClick() {
    var title=$("#title").val();//标题
    var author=$("#author").val();//作者
    if(!title){
        showError('请输入文章标题');
        return;
    }

    if(!author){
        showError('请输入作者');
        return;
    }


    var details=UE.getEditor('userProtocolAddUE1').getContent();
    if(!details){
        showError('请输入内容');
        return;
    }
    var data={
        title:title,
        author:author,
        details:details,//富文本内容
    }
    if(operation=='add'){
        $.showActionLoading();
        zhpost(base_url_information,data).then(function (result){
            $.hideActionLoading();
            if(checkData(result,'post')){
                back();
            }
        })
    }else{
        zhput(base_url_information+'/'+id,data).then(function (result){
            if(checkData(result,'put')){
                back();
            }
        })
    }
}
