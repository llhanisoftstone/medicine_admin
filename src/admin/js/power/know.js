/**
 * Created by Administrator on 2018/2/10.
 */
var base_url_course = '/rs/wish_to_known';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
// var categoryobj={};
var isSearch=false;
var pagetype="lj"
$(function() {
    pagetype=getQueryByName("pagetype");
    if(pagetype=="jy"){
        jQuery(".titlename").html("我要建议");
        jQuery(".lj").hide();
        jQuery(".jy").show();
        base_url_course="/rs/suggest";
        queryList();
    }else{
        jQuery(".lj").show();
        jQuery(".jy").hide();
        zhget("/rs/wish_category", {order:"create_time desc"}).then( function(result) {
            if(result.code==200) {
                var html="<option value=''>全部</option>";
                for(var i=0;i<result.rows.length;i++){
                    html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].c_name+"</option>";
                    // categoryobj[result.rows[i].id]=result.rows[i].c_name
                }
                jQuery("#unique_code").html(html);
                queryList();
            }
        });
    }
});

Handlebars.registerHelper("superif", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});
Handlebars.registerHelper('getindex', function(v1, options) {
    return v1+1;
});
function resetinput() {
    isSearch=false;
    $("#TalentTryoutSearchForm", $(".reasonRefund"))[0].reset();
    queryList();
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    $("#table-goodsList").next("div").children("span").remove();
    $("#paginator").html('');
    queryList();
}

function queryList() {
    var pageRecord = getlocalStorageCookie("pageRecord");
    if(pageRecord&&pageRecord>0){
        dellocalStorageCookie("pageRecord");
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
    }
    var data={
        order:'create_time desc',
        page: currentPageNo,
        size: pageRows
    }
    if(isSearch){
        data.search=1;
        var title = $("#title").val().trim();
        if(title){
            data.details = title;
        }
        var category = $("#unique_code").val();
        if(category){
            data.category = category;
        }
        var phone = $("#phone").val().trim();
        if(phone){
            data.phone = phone;
        }
        var username = $("#username").val().trim();
        if(username){
            data.username = username;
        }

        var ordertimestart=$("#orderTimeStart").val();
        var ordertimeend=$("#orderTimeEnd").val();

        var ordertimeend1 = ordertimeend +" 23-59-59";
        if(ordertimestart!=""&&ordertimeend!=""){
            if(ordertimestart>ordertimeend){
                showError("开始时间大于结束时间");
                return;
            }
            data.create_time='>=,'+ordertimestart+',<=,'+ordertimeend1;
        }else if(ordertimestart!=""&&ordertimeend==""){
            data.create_time='>=,'+ordertimestart;
        }else if(ordertimestart==""&&ordertimeend!=""){
            data.create_time='<=,'+ordertimeend1;
        }else {
            data.create_time = undefined;
        }
    }
    $.showActionLoading();
    zhget(base_url_course, data).then( function(result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-goodsList')) {
            for (var i = 0; i < result.rows.length; i++) {
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
                // result.rows[i].pic_abbr = targetUrl + result.rows[i].pic_abbr;
                // result.rows[i].pic_abbr = categoryobj[result.rows[i].pic_abbr];
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
            if(pagetype=="jy") {
                jQuery(".lj").hide();
                jQuery(".jy").show();
            }else{
                jQuery(".lj").show();
                jQuery(".jy").hide();
            }
        }
    });
}

function onAddClick() {
    location.href="admin.html#pages/policy/addpolicy.html"
}
function onSetUpClick(id,ishot) {
    if(ishot == 0){
        if(confirm("确认要设置该政策为热点信息吗？")) {
            var time = new Date(new Date().getTime()).Format('yyyy-MM-dd hh:mm:ss');
            zhput(base_url_course+"/"+id,{is_hot:1,hot_time:time}).then(function (rs) {
                if(checkData(rs,'put')) {
                    queryList();
                }
            })
        }
    }else if (ishot == 1){
        if(confirm("确认要取消该政策为热点信息吗？")) {
            zhput(base_url_course+"/"+id,{is_hot:0}).then(function (rs) {
                if(checkData(rs,'put')) {
                    queryList();
                }
            })
        }
    }
}
function onUpdateClick(id,copy) {
    var thispage  = window.location.hash;
    thispage = thispage.replace('#','');
    setlocalStorageCookie("thispage",thispage);
    var searchForm = $("#TalentTryoutSearchForm").form2json();
    if (searchForm.unique_code == '全部'){
        delete searchForm.unique_code;
    }
    console.log(searchForm);
    setlocalStorageCookie("searchForm",JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    if(copy=='copy'){
        location.href="admin.html#pages/policy/addpolicy.html?id="+id+'&copy=copy';
    }else{
        location.href="admin.html#pages/policy/addpolicy.html?id="+id;
    }
}
function onSearchClick() {
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
// 弹出照片模态框
function showFansDetailInfo(id){
    zhget(base_url_course+"/"+id).then(function (result) {
        // console.log(result);
        if(result.code==200){
            if(result.rows[0].skill){
                var skill=result.rows[0].skill.split(",");
                var html="";
                for(var i=0;i<skill.length;i++){
                    html+='<img style="cursor:pointer;" src="'+targetUrl+skill[i]+'" alt="">';
                }
                $("#address-placeholder").html(html);
            }else{
                $('#address-placeholder').html('无信息可展示，请稍后再试。')
            }
        }
    })
}

function showuserInfo(id,huifu){

}
function resultokbtn(){
    var result=jQuery("#result").val();
    jQuery("#resulclosebtn").trigger("click");
}
function putclick(id,status){
    if(confirm("确认采纳该建议？")){
        zhput(base_url_course+"/"+id,{status:status}).then( function(result) {
            $.hideActionLoading();
            if(checkData(result,'put','queryList','table-goodsList')) {
                showSuccess("采纳成功");
                queryList();
            }
        });
    }
}