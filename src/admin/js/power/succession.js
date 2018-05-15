/**
 * Created by Administrator on 2017/11/10.
 */
// var CookieTools = require('Cookies_Core');
var base_url_goodsModels='/rs/pass_work_records';
var base_url_goodsModels_get='/rs/pass_work_records';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var jin=false;
var postoff=false;
$(function() {
    queryList();
    // getGoodsTag();
    getCompany();
});

function queryList(){
    $("#ModelValueList").remove();
    // _modelId属于第二层
    $("#addNew").removeAttr("_modelId");
    var pageRecord = getlocalStorageCookie("pageRecord");
    if(pageRecord&&pageRecord>0){
        dellocalStorageCookie("pageRecord");
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
    }
    var type = getUrlParamsValue('type');
    var data={
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows,
        status:'<,9',
        // type:type
    }
    if(issearchModel){
        data.search=1;
        var times_id=$("#times_id4").val();
        var status=$.trim($("#status").val());
        var pid=$("#times_id3").val();
        var comp = $("#comp").val()
        var ordertimestart=$("#orderTimeStart").val();
        var ordertimeend=$("#orderTimeEnd").val();
        var zhiTimeStart=$("#zhiTimeStart").val();
        var zhiTimeEnd=$("#zhiTimeEnd").val();
        var realname = $("#realname").val()
        var to_realname = $('#to_realname').val()
        if(comp!='-1'){
            data.comp_id=comp;
        }
        if(times_id!='-1'){
            data.times_id=times_id;
        }
        if(status!='-1'){
            data.status=status;
        }
        if(pid!='-1'){
            data.pid=pid;
        }
        if(realname!=''){
            data.realname=realname;
        }
        if(to_realname!=''){
            data.to_realname=to_realname;
        }
        var ordertimeend1 = ordertimeend +" 23-59-59";
        if(ordertimestart!=""&&ordertimeend!=""){
            data.create_time='>=,'+ordertimestart+',<=,'+ordertimeend1;
        }else if(ordertimestart!=""&&ordertimeend==""){
            data.create_time='>=,'+ordertimestart;
        }else if(ordertimestart==""&&ordertimeend!=""){
            data.create_time='<=,'+ordertimeend1;
        }else {
            data.create_time = undefined;
        }

        var zhiTimeEnd1 = zhiTimeEnd +" 23-59-59";
        if(zhiTimeStart!=""&&zhiTimeEnd!=""){
            data.recv_time='>=,'+zhiTimeStart+',<=,'+zhiTimeEnd1;
        }else if(zhiTimeStart!=""&&zhiTimeEnd==""){
            data.recv_time='>=,'+zhiTimeStart;
        }else if(zhiTimeStart==""&&zhiTimeEnd!=""){
            data.recv_time='<=,'+zhiTimeEnd1;
        }else {
            data.recv_time = undefined;
        }
    }
    zhget(base_url_goodsModels_get,data).then(function (res) {
        // console.log(res)
        // zhget("/rs/service_code_type",{status:'<,9'}).then(function(res){
        //     if(res.code==200){
        if(checkData(res,'get','queryList','table-goodsModel')) {
            integrals = res.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                for (var j = 0; j < res.rows.length; j++) {
                    if (integrals[i].code_type_id === res.rows[j].id) {
                        integrals[i].codename = res.rows[j].name
                    }
                }
                // zhget('/rs/member',{id:res.rows[0].to_u_id}).then(function (result) {
                //     res.rows[0].to_name=result.rows[0].realname;
                // })
                // zhget('/rs/member',{id:res.rows[0].u_id}).then(function (result) {
                //     res.rows[0].u_name=result.rows[0].realname;
                // })
                // zhget('/rs/company',{id:res.rows[0].comp_id}).then(function (result) {
                //     res.rows[0].comp=result.rows[0].name;
                // })
            }
            $("#querylistnull").remove();
             console.log(res)
            buildTable(res, 'goodsModel-template', 'goodsModel-placeholder');
            $("tr th:nth-child(2)").show();
        }
        // }else {
        //
        // }
        // })
    })
}
function getCompany(){
    zhget('/rs/company',{status:1},function(res){
        $("#comp").empty();
        $("#comp").append('<option value="-1">请选择</option>');
        if(res.code == 200){
            var data = res.rows;
            for(var i=0; i<data.length; i++){
                $("#comp").append('<option value="'+data[i].id+'">'+data[i].name+'</option>');
            }
        }
    })
}
function searchGoodsModels(){
    if(jin){
        return;
    }
    jin=true;
    setTimeout(function(){
        jin=false;
    },500);
    $(".addModels").hide();
    $(".searchModels", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");

}



//一级删除按钮
function onDeleteModel(id){
    if(confirm("确定要删除该规格吗？")) {
        zhput(base_url_goodsModels+"/"+id,{status:9}).done(function(result){
            console.log(result)
            if(result[0].code == 200){
                issearchModel=false;
                showSuccess("删除成功")
                queryList();
            }else{
                showError("删除失败");
            }
        })
    }
}
//
//重置
function resetinput(){
    $("#userSearchForm", $(".reasonRefund"))[0].reset();
    queryList();
}
//搜索
function searchbtn(){
    issearchModel=true;
    currentPageNo=1;
    queryList();
}
function showModel(){
    $(".searchModels").hide();
    $(".addModels").hide();
    $("#back").hide();
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    $("#userSearchForm", $(".reasonRefund"))[0].reset();
    queryList();
}
Handlebars.registerHelper("getindex", function (v1, options) {
    return v1+1;
});
Handlebars.registerHelper("ifss", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});