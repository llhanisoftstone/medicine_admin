/**
 * Created by Administrator on 2018/4/25.
 */
var base_url_member='/rs/store';
var city_zone = '/rs/city_zone';
var compid;
$(function() {
    // compid = getCookie('storeid');
    compid="2";
    getprovince();
    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
    $("#savebtn").bind("click",saveData);
    var id=getUrlParamsValue("id");
    getmemberInfo(id);
});

function onUploadDetailPic(formObject, fileComp, list) {
    var attrs = fileComp.attr("refattr");
    if(list.length>1){
        for(var i =0;i<list.length;i++){
            list[i].filename=list[i].filename.split('.')[0];
        }
        list.sort(compare('filename'));
    }
    if(fileComp.attr("id")=='picfile'){
        if(list.length > 0 && list[0].code == 200){
            for(var i =0;i<list.length;i++){
                if ($("#banner tr").length >= 10 && fileComp.attr("id") == 'picfile'){
                    return showError("最多只能上传10张;");
                }
                var order_code=i+1;
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                html+='<td><button  style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
                html+="</tr>";
                $("#banner").append(html);
            }
        }
    }else if (fileComp.attr("id")=='picfile1'){
        if(list.length > 0 && list[0].code == 200){
            for(var i =0;i<list.length;i++){
                $("#picpath").attr("src",targetUrl+list[i].url);
                $("#picpath").attr("_url",list[i].url);
            }
        }
    }else{
        if(list.length > 0 && list[0].code == 200){
            fileComp.parents(".input-group-addon").prev().val(list[0].url)
        }
    }
}

function getmemberInfo(){
    zhget(base_url_member+"/"+compid).then(function (result) {
        if(result.code==200){
            if(result.rows[0].picpath){
                $("#picpath").attr("src",targetUrl+result.rows[0].picpath);
            }else {
                $("#picpath").attr("src",'./img/bg_shop.jpg');
            }
            $("#name").val(result.rows[0].name);
            $("#province").val(result.rows[0].province_id);
            getcity(result.rows[0].province_id,result.rows[0].city_id,result.rows[0].area_id);
            $("#address").val(result.rows[0].address);
            $("#summary").val(result.rows[0].details)
            createBanner(result);//加载banner图和详情图
        }
    })
}
function getprovince(){
    zhget(city_zone,{deep:1}).then(function (result) {
        if(result.code==200){
            let h='<option value="-1">请选择</option>'
            for(var i=0;i<result.rows.length;i++){
                h+=`<option value="${result.rows[i].id}">${result.rows[i].name}</option>`
            }
            $("#province").html(h)
        }
    })
}
function getcity(id,city='-1',zone='-1'){
    zhget(city_zone,{deep:2,pid:id}).then(function (result) {
        if(result.code==200){
            let h='<option value="-1">请选择</option>'
            for(var i=0;i<result.rows.length;i++){
                h+=`<option value="${result.rows[i].id}">${result.rows[i].name}</option>`
            }
            $("#city").html(h)
            if(city!='-1'){
                $("#city").val(city);
                getzone(city,zone)
            }
        }
    })
}
function getzone(id,zone='-1'){
    zhget(city_zone,{deep:3,pid:id}).then(function (result) {
        if(result.code==200){
            let h='<option value="-1">请选择</option>'
            for(var i=0;i<result.rows.length;i++){
                h+=`<option value="${result.rows[i].id}">${result.rows[i].name}</option>`
            }
            $("#zone").html(h)
            if(zone!='-1'){
                $("#zone").val(zone);
            }
        }
    })
}
$("#province").change(function(){
    $("#city").html("<option value='-1'>请选择</option>")
    $("#zone").html("<option value='-1'>请选择</option>")
    getcity($(this).val())
})
$("#city").change(function(){
    $("#zone").html("<option value='-1'>请选择</option>")
    getzone($(this).val())
})
// 加载banner图和详情图
function createBanner(result){
    //加载banner图
    var banner=(result.rows[0].bannerpath).split(",");
    if(banner!=null&&banner.length>0){
        for(var i =0;i<banner.length;i++){
            var bannerhtml="<tr>";
            if(banner[i].indexOf("http://")>-1){
                bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+banner[i]+'></td>';
            }else{
                bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+banner[i]+'></td>';
            }
            bannerhtml+='<td>  <button style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
            bannerhtml+="</tr>";
            $("#banner").append(bannerhtml);
        }
    }
}

function compare(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

function saveData(){
    var data = {};
    var url = $("#picpath").attr("_url");
    if (url){
        data.picpath = url;
    }
    var name = $("#name").val().trim();
    if (!name){
        return showError("请输入店铺名称");
    }else{
        name = name.substring(0,15);
        data.name = name;
    }
    var province=$("#province").val();
    var city=$("#city").val();
    var zone=$("#zone").val();
    if(province!="-1"){
        data.province_id=province;
    }else{
        showError("请选择省");
        return;
    }
    if(city!="-1"){
        data.city_id=city;
    }else{
        showError("请选择市");
        return;
    }if(zone!="-1"){
        data.area_id=zone;
    }else{
        showError("请选择区");
        return;
    }
    var address = $("#address").val().trim();
    if (!address){
        return showError("请输入店铺详细地址");
    }else{
        data.address = address;
    }
    var summary = $("#summary").val().trim();
    if (!summary){
        return showError("请输入简介");
    }else{
        data.details = summary;
    }
    var bannerdoms=$("#banner").find("tr");
    var banner_json='';
    for(var i=0;i<bannerdoms.length;i++){
        if(i<bannerdoms.length-1){
            banner_json+=($(bannerdoms[i]).children().eq(0).children().attr("src")).replace(targetUrl,'')+",";
        }else{
            banner_json+=($(bannerdoms[i]).children().eq(0).children().attr("src")).replace(targetUrl,'');
        }
    }
    if(banner_json){
        data.bannerpath = banner_json;
    }else{
        return showError("请上传banner图");
    }
    zhput(base_url_member+"/"+compid,data).then(function (result) {
        if(result.code==200){
            $.hideActionLoading();
            showSuccess('修改成功')
            $(this).attr("disabled",false);
        }else{
            $.hideActionLoading();
            showError('修改失败');
            $(this).attr("disabled",false);
        }
    })
}

//删除banner
function onDeleteClick1(dom){
//baner非必须，直接移除
    $(dom).parent("td").parent("tr").remove();
}