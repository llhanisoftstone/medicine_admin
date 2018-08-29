/**
 * Created by Administrator on 2018/4/25.
 */
var base_url_member='/rs/company';
var compid;
$(function() {
    compid = getQueryString("id");
    // $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
    var id=getUrlParamsValue("id");
    getmemberInfo(id);
});
function backAlumniGrand(){
    window.location.href="admin.html#pages/company.html"
}

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
                var order_code=i+1;
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                html+='<td> <input value="'+order_code+'" type="text" style="margin-top: 35px;" class="form-control"  datatype="require"> </td>';
                html+='<td><button  style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
                html+="</tr>";
                $("#banner").append(html);
            }
        }
    }else if (fileComp.attr("id")=='picfile1') {
        if (list.length > 0 && list[0].code == 200) {
            for (var i = 0; i < list.length; i++) {
                $("#picpath").attr("src", targetUrl + list[i].url);
                $("#picpath").attr("_url", list[i].url);
            }
        }
    }else if(fileComp.attr("id")=='picfile2'){
        if(list.length > 0 && list[0].code == 200){
            for(var i =0;i<list.length;i++){
                var order_code=i+1;
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                html+="</tr>";
                $("#aptitude").append(html);
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
            if(result.rows[0].icon_path){
                $("#picpath").attr("src",targetUrl+result.rows[0].icon_path);
            }else {
                $("#picpath").attr("src",'./img/header.png');
            }
            $("#username").val(result.rows[0].username);
            $("#name").val(result.rows[0].name);
            $("#special").val(result.rows[0].special);
            $("#phone").val(result.rows[0].phone);
            $("#address").val(result.rows[0].address);
            if(result.rows[0].send_interval){
                $("#startTimeStart").val(result.rows[0].send_interval.split('-')[0]+":00");
                $("#startTimeEnd").val(result.rows[0].send_interval.split('-')[1]+":00");
            }
            $("#send_price").val(result.rows[0].send_price/100);
            $("#send_tran").val(result.rows[0].send_tran/100);
            $("#summary").val(result.rows[0].summary);
            var ptype=result.rows[0].purchase_type;
            if(ptype==1){
                $('#purchase_type').val('自取');
            }else if(ptype==2){
                $('#purchase_type').val('代买');
            }else{
                $('#purchase_type').val('自取');
            }
            createBanner(result);//加载banner图和详情图
        }
    })
}
// 加载banner图和详情图
function createBanner(result){
    //加载banner图
    var banner=result.rows[0].pic_json;
    // console.log(result.rows[0].banner_json);
    if(banner!=null&&banner.length>0){
        for(var i =0;i<banner.length;i++){
            var bannerhtml="<tr>";
            bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+banner[i].url+'></td>';
            bannerhtml+='<td> <input disabled type="number" style="margin-top: 35px;" value="'+banner[i].seqence+'" class="form-control"> </td>';
            // <button class="btn-link" style="margin-top: 35px;" onclick="">修改</button>
            bannerhtml+="</tr>";
            $("#banner").append(bannerhtml);
        }
    }
    //加载banner图
    var aptitude=result.rows[0].qualifications_path.split(",");
    // console.log(result.rows[0].banner_json);
    if(aptitude!=null&&aptitude.length>0){
        for(var i =0;i<aptitude.length;i++){
            var aptitudehtml="<tr>";
            aptitudehtml+='<td><img style="height: 90px;background-size: 90px" src='+targetUrl+aptitude[i]+'></td>';
            // <button class="btn-link" style="margin-top: 35px;" onclick="">修改</button>
            aptitudehtml+="</tr>";
            $("#aptitude").append(aptitudehtml);
        }
    }
}

function saveData(){
    var data = {};
    var url = $("#picpath").attr("_url");
    if (url){
        data.icon_path = url;
    }
    var name = $("#name").val().trim();
    if (!name){
        return showError("请输入店铺名称");
    }else{
        data.name = name;
    }
    var special = $("#special").val().trim();
    if (!special){
        return showError("请输入特色");
    }else{
        data.special = special;
    }
    var phone = $("#phone").val().trim();
    if (!phone){
        return showError("请输入联系电话");
    }else{
        data.phone = phone;
    }
    var address = $("#address").val().trim();
    if (!address){
        return showError("请输入联系地址");
    }else{
        data.address = address;
    }
    var address = $("#address").val().trim();
    if (!address){
        return showError("请输入联系地址");
    }else{
        data.address = address;
    }
    var dtStartTimeStart=$("#startTimeStart").val();
    var dtStartTimeEnd=$("#startTimeEnd").val();
    if (!dtStartTimeStart){
        return showError("请选择配送开始时间");
    }
    if (!dtStartTimeEnd){
        return showError("请选择配送结束时间");
    }
    data.send_interval = dtStartTimeStart+","+dtStartTimeEnd;
    var send_price = $("#send_price").val()*100;
    if (!send_price){
        return showError("请输入起送价");
    }else{
        data.send_price = send_price;
    }
    var send_tran = $("#send_tran").val()*100;
    if (!send_tran){
        return showError("请输入配送费");
    }else{
        data.send_tran = send_tran;
    }
    var summary = $("#summary").val().trim();
    if (!summary){
        return showError("请输入简介");
    }else{
        data.summary = summary;
    }
    var bannerdoms=$("#banner").find("tr");
    var banner_json=[];
    for(var i=0;i<bannerdoms.length;i++){
        banner_json[i]={};
        banner_json[i].url=$(bannerdoms[i]).children().eq(0).children().attr("src");
        banner_json[i].url=banner_json[i].url.replace(targetUrl,'');
        banner_json[i].seqence=$(bannerdoms[i]).children().eq(1).children("input").val();
    }
    if (banner_json.length > 0){
        data.pic_json = banner_json;
    }
    zhput(base_url_member+"/"+compid,data).then(function (result) {
        if(result.code==200){
            window.location.href="/admin/admin.html#pages/shops/shopinfo.html";
            $.hideActionLoading();
            showSuccess('修改成功')
            $(this).attr("disabled",false);
        }else{
            $.hideActionLoading();
            showSuccess('修改失败');
            $(this).attr("disabled",false);
        }
    })
}