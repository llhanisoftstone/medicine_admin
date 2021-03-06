/**
 * Created by Administrator on 2018/4/26.
 */
var base_url_company='/rs/company';

var list = [];
var menu = [];
var currentPageNo = 1;
var pageRows = 10;
$(function() {
    $.initSystemFileUpload($("#form_modal"), onUploadHeaderPic);
    getUserlist();
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
function onUploadHeaderPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    jQuery("#upimg").val("");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
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

function getUserlist(){
    zhget('/rs/member', {level: 81}).then( function(result) {
        var data = result.rows;
        var html = '<option value="-1">请选择</option>';
        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].nickname+"</option>"
            }
        }
        $("#userid").html(html);
    });
}

function queryList(){
    var data = {
        page: currentPageNo,
        size: pageRows,
        status: 1,
        order:'create_time desc'
    }
    if(isSearch){
        var realname=$("#nickname").val();
        if(realname!=''){
            data.title=realname;
            data.search=1;
        }
    }
    $("#event-placeholder").html('');
    zhget(base_url_company, data).then( function(result) {
        if(checkData(result,'get','queryList','table-member')) {
            var integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                indexCode.logopic = targetUrl + indexCode.picpath;
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
    $("#userid").val('-1');
    $("#uploader .filelist").each(function(){
        $(this).find(".cancel").click();
    })
}
function delClick(id){
    if(confirm("确认要删除该企业吗？")){
        zhput('/rs/company/'+id,{status:9}).then(function(res){
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
function addcompany(id){
    if(id){
        zhget(base_url_company,{id:id}).then(function(res){
            if(res.code == 200){
                $("#addModal").modal("show")
                $("#cid").val(id)
                $("#picpath").val(res.rows[0].picpath);
                $("#comp_name").val(res.rows[0].title)
                $("#comp_tel").val(res.rows[0].phone)
                $("#comp_addr").val(res.rows[0].address)
                $("#userid").val(res.rows[0].u_id);
            }
        })
    }else{
        $("#addModal").modal("show")
        $("#cid").val('')
        $("#addusername").val('');
        $("#comp_name").val('');
        $("#password").val('');
        $("#order").val('');
        $("#picpath").val('');
        $("#bank").val('');
        $("#userid").val('-1');
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
    var tel = $("#comp_tel").val().trim();
    var addr = $("#comp_addr").val().trim();
    var picpath = $("#picpath").val();
    var u_id = $("#userid").val();
    var RegExp=/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/;
    if(!name){
        return showError("请输入企业名称")
    }
    if(!tel){
        return showError("请输入联系方式")
    }else if(!RegExp.test(tel)){
        return showError("电话号码输入错误")
    }
    if(!addr){
        return showError("请输入企业地址")
    }
    if(u_id == '-1'){
        return showError("请选择所属填报员")
    }
    $("#submitstore").attr("disabled","disabled");
    var data={
        title:name,
        phone: tel,
        picpath: picpath,
        address: addr,
        u_id: u_id
    }
    if(id){
        zhput('/rs/company/'+id,data).then(function(res){
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
        zhpost('/rs/company',data).then(function(res){
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

function onsour(id){
    zhpost('/weapp/generQr', {path:'pages/transfer/main',scene:id}).then(function(res){
        if(res.code == 200){
            var canvas = $("#qrcode").find('canvas').get(0);
            canvas.width = 200;
            canvas.height = 200;
            var context = canvas.getContext("2d");
            context.rect(0 , 0 , canvas.width , canvas.height);
            context.fillStyle = "#fff";
            context.fill();
            var myImage = new Image();
            myImage.src = res.url;
            // myImage.src = targetUrl + "/upload/community/2020-08-25_07e110485cca1a5a7587fd70d4412540.jpg";  //背景图片 你自己本地的图片或者在线图片
            myImage.crossOrigin = 'Anonymous';
            myImage.onload = function(){
                context.drawImage(myImage , 0 , 0 , 200 , 200);
                var myImage2 = new Image();
                var img = $("#logopic"+id).attr('src');
                myImage2.src = img
                myImage2.crossOrigin = 'Anonymous';
                myImage2.style.borderRadius =
                    myImage2.onload = function(){
                        context.save();
                        context.beginPath();
                        context.arc(100, 100, 50, 0, Math.PI * 2, false);
                        context.clip();
                        context.drawImage(myImage2 , 50 , 50 , 100 , 100);
                        context.restore();
                        var base64 = canvas.toDataURL("image/png");
                        var img = document.getElementById('qrcodeImg');
                        img.setAttribute('src' , base64);
                        var alink = document.createElement("a");
                        document.body.appendChild(alink);
                        alink.style.display='none';
                        alink.href = base64;
                        alink.download = new Date().getTime();
                        alink.click();
                    }
            }
        }
    })
    // $("#qrcode").empty();
    // $("#qrcodeImg").attr("src","");
    // var url = targetUrl + '/admin/transfer.html?pid='+id;
    // $('#qrcode').html('');
    // $('#qrcode').qrcode({
    //     render: "canvas",
    //     width: 200,
    //     height: 200,
    //     text: url,
    //     src: 'http://www.meihengcdr.com/admin/img/menu_icon.png'
    // });
    //
    // var canvas=$("#qrcode").find('canvas').get(0);
    // var data = canvas.toDataURL('image/jpg');
    // $('#qrcodeImg').attr('src',data) ;
    // var alink = document.createElement("a");
    // document.body.appendChild(alink);
    // alink.style.display='none';
    // alink.href = data;
    // alink.download = new Date().getTime();
    // alink.click();
    // var canvas = document.createElement("canvas");
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