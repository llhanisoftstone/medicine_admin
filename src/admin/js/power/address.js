var base_url_acceptanceReport = '/rs/company';
var city_zone = '/rs/city_zone';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
var postoff=false;
$(function() {
    $.initSystemFileUpload($("#userAddForm"), onUploadDetailPic);
    queryList();
    getprovince()
    updateMenuLocationInfo();
});
// 图片上传
function onUploadDetailPic(formObject, fileComp, list){
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
function queryList() {
    var data = {
        page: currentPageNo,
        size: pageRows,
        status:'<,9',
        order:'sequence desc,create_time desc'
    }
    if(isSearch){
        var acceptanceReport=$("#acceptanceReport").val();
        var linkphone=$("#linkphone").val();
        var linkname=$("#linkname").val();
        var province=$("#province").val();
        var city=$("#city").val();
        var zone=$("#zone").val();
        var status=$("#status").val();
        if(acceptanceReport!=''){
            data.name=acceptanceReport;
        }
        if(linkphone!=''){
            data.phone=linkphone;
        }
        if(linkname!=''){
            data.address=linkname;
        }
        if(province!='-1'){
            data.province_id=province;
        }
        if(city!='-1'){
            data.city_id=city;
        }
        if(zone!='-1'){
            data.zone_id=zone;
        }
        if(status!='-1'){
            data.status=status;
        }
        data.search=1;
    }
    $("#event-placeholder").html('');
    $("#paginator").html('');
    zhget(base_url_acceptanceReport,data).then( function(result) {
        console.log(result)
        if(checkData(result,'get','queryList','table-menu')) {
            menu = result;
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                indexCode.picpath=targetUrl+indexCode.picpath;
            }
            buildTable(result, 'style-template', 'style-placeholder');
        }
    });
}

function onAddClick() {
    cleanForm();
    operation = "add";
    $(".reasonSearch").css("display","none")
    $(".addModelscompany", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function onSearchClick() {
    $(".addModelscompany").css("display","none")
    $(".reasonSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

function onUpdateClick(id) {
    fillForm(id);
    operation = "modify";
    $(".reasonSearch").css("display","none")
    $(".addModelscompany", $("#wrapper")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}

function onDeleteClick(el,id) {
    if(confirm("确认要删除？")) {
                zhput(base_url_acceptanceReport + "/" + id,{status:9}).then(function (result) {
                    if (result && result.info) {
                        var page=jQuery("#paginator li.active a").html();
                        var lists=jQuery("#style-placeholder tr");
                        if(lists.length==1){
                            currentPageNo=(page-1);
                            $("#pageIndex").val(currentPageNo);
                            queryList();
                        }else{
                            queryList();
                        }
                        showSuccess('删除成功！');
                    } else {
                        showError('删除失败！');
                    }
                });
    }
}
jQuery("#linkphone").on("input",function(){
    validatePhoneAnd400($(this).val())
    // num_limit(this,{max:11,dec:false});
});
function onSaveClick() {
    var data = {};
    data.name=$("#name").val();
    data.picpath=$("#title_pic2").val();
    data.tag=$("#tag").val();
    var linkphone=$("#phone").val();
    if(linkphone&&linkphone!=""){
        if(validatePhoneAnd400(linkphone)){
            data.phone=linkphone;
        }else{
            showError("请输入正确联系电话");
            return;
        }
    }
    var sequence=$("#sequence").val().trim();
    data.contacts=$("#contacts").val();
    data.address=$("#address").val();
    var province=$("#provinceid").val();
    if(province!="-1"){
        data.province_id=province;
    }else{
        showError("请选择省");
        return;
    }
    var city=$("#cityid").val();
    if(city!="-1"){
        data.city_id=city;
    }else{
        showError("请选择市");
        return;
    }
    var zone=$("#zoneid").val();
    if(zone!="-1"){
        data.zone_id=zone;
    }else{
        showError("请选择区");
        return;
    }
    if(sequence=='') {
        return showError("请输入顺序");
    }else{
        data.sequence=sequence;
    }

    if(postoff){
        return;
    }
    postoff=true;
    var id=$("#companyid").val();
    if (operation == "add") {
        data.auto_id=1;
        zhpost(base_url_acceptanceReport, data, saveResult);
    } else {
        zhput(base_url_acceptanceReport + "/" + id, data, saveResult);
    }
}

function backclick(){
    $("#acceptanceReport").removeAttr("datatype")
    $('#user_buttonid').hide();
    $("#searchDataBtn").show();
    $("#resetSearchBtn").show();
    $("#backbtn").hide();
    $("#addbtn").show();
    $("#acceptanceReport").val("");
}

function saveResult(result) {
    if (result.err) {
        showError('保存失败！');
        setTimeout(function(){
            postoff=false;
        },1000);
    } else {
        $(".reasonSearch", $("#wrapper")).animate({
            height : 'toggle',
            opacity : 'toggle'
        }, "slow");
        $(".reasonSearch").css("display","none")
        $(".addModelscompany").css("display","none")
        queryList();
        $('#userAddForm')[0].reset();
        showSuccess('保存成功！');
        setTimeout(function(){
            postoff=false;
        },1000);
    }
}

function fillForm(id) {
    zhget(base_url_acceptanceReport+"/"+id).then( function(result) {
        if(result.code==200){
            $("#companyid").val(result.rows[0].id);
            $("#name").val(result.rows[0].name);
            $("#title_pic2").val(result.rows[0].picpath);
            $("#phone").val(result.rows[0].phone);
            $("#contacts").val(result.rows[0].contacts);
            $("#address").val(result.rows[0].address);
            $("#sequence").val(result.rows[0].sequence);
            $("#provinceid").val(result.rows[0].province_id);
            $("#tag").val(result.rows[0].tag);
            getcity(result.rows[0].province_id,result.rows[0].city_id,result.rows[0].zone_id)
            return;
        }
    })
}

function cleanForm() {
    $("#reasonSearchForm")[0].reset();
}

var isSearch=false;
function searchData(){
    isSearch=true;
    currentPageNo=1;
    queryList();

}
function resetData(){
    isSearch=false;
    cleanForm()
    queryList();
}
function num_limit(el,obj){
    var minus=obj.minus||false;
    var dec=obj.dec||false;
    var max=obj.max;
    var maxval=obj.maxval;
    if(minus&&dec){//负数和小数
        el.value = el.value.replace(/[^\d.\-]/g,""); //清除"数字"和".""和"-"以外的字符
    }else if(minus){//负数
        el.value = el.value.replace(/[^\d\-]/g,""); //清除"数字"和"-"以外的字符
    }else if(dec){//小数
        el.value = el.value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
    }else{//正整数
        el.value = el.value.replace(/[^\d]/g,""); //清除"数字"和"."以外的字符
    }
    el.value = el.value.replace(/^\./g,""); //验证第一个字符是数字
    el.value = el.value.replace(/\.{2,}/g,"."); //只保留第一个., 清除多余的
    el.value = el.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
    el.value = el.value.replace(/\-{2,}/g,"-"); //只保留第一个字符-, 清除多余的
    el.value = el.value.replace(/^\-/g,"$#$").replace(/\-/g,"").replace("$#$","-");
    if(dec){
        var reg=new RegExp("^(\\-)*(\\d+)\\.(\\d{0,"+dec+"}).*$","i");
        el.value = el.value.replace(reg,'$1$2.$3'); //只能输入两个小数
    }
    if(el.value.length>max){  //最大位数
        el.value = el.value.substring(0,max);
    }
    if(maxval){
        maxval=Number(maxval);
        if(el.value>maxval){  //最大值
            el.value = maxval;
        }
    }
}
function getprovince(){
    zhget(city_zone,{deep:1}).then(function (result) {
        if(result.code==200){
            let h='<option value="-1">请选择</option>'
            for(var i=0;i<result.rows.length;i++){
                h+=`<option value="${result.rows[i].id}">${result.rows[i].name}</option>`
            }
            $("#provinceid").html(h)
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
            $("#cityid").html(h)
            $("#city").html(h)
            if(city!='-1'){
                $("#cityid").val(city);
                $("#city").html(city)
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
            $("#zoneid").html(h)
            $("#zone").html(h)
            if(zone!='-1'){
                $("#zoneid").val(zone);
                $("#zone").html(zone)
            }
        }
    })
}
$("#provinceid").change(function(){
    $("#cityid").html("<option value='-1'>请选择</option>")
    $("#zoneid").html("<option value='-1'>请选择</option>")
    getcity($(this).val())
})
$("#cityid").change(function(){
    $("#zoneid").html("<option value='-1'>请选择</option>")
    getzone($(this).val())
})
$("#province").change(function(){
    $("#city").html("<option value='-1'>请选择</option>")
    $("#zone").html("<option value='-1'>请选择</option>")
    getcity($(this).val())
})
$("#city").change(function(){
    $("#zone").html("<option value='-1'>请选择</option>")
    getzone($(this).val())
})
function phone(phonenum) {
    if (null == phonenum || "" == phonenum || undefined == phonenum) return false;
    var isMob=/^((\+?86)|(\(\+86\)))?(13[0123456789][0-9]{8}|15[0123456789][0-9]{8}|17[0123456789][0-9]{8}|18[0123456789][0-9]{8}|147[0-9]{8}|1349[0-9]{7}|19[0123456789][0-9]{8}|16[0123456789][0-9]{8})$/;
    return isMob.test(phonenum);
};
function validatePhoneAnd400(phonenum){
    if (null == phonenum || "" == phonenum || undefined == phonenum) return false;
    var isMob=/^((\+?86)|(\(\+86\)))?(13[0123456789][0-9]{8}|15[0123456789][0-9]{8}|16[0123456789][0-9]{8}|17[0123456789][0-9]{8}|18[0123456789][0-9]{8}|18[0123456789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
    var fixMobil = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
    var mobil400 = /^400-([0-9]){1}([0-9-]{6})([0-9]){1}$/;
    return isMob.test(phonenum) || fixMobil.test(phonenum)|| mobil400.test(phonenum) ;
}
function companyForbid(id) {
    if(confirm("确认要禁用吗？")) {
        zhput(base_url_acceptanceReport+"/"+id,{status:0}).then(function(result){
            if(result.code == 200){
                showSuccess('禁用成功！');
                queryList();
            }else{
                showError("操作失败");
            }
        })
    }
}
function companyStart(id) {
    if(confirm("确认要启用吗？")) {
        zhput(base_url_acceptanceReport+"/"+id,{status:1}).then(function(result){
            if(result.code == 200){
                showSuccess('启用成功！');
                queryList();
            }else{
                showError("操作失败");
            }
        })
    }
}

