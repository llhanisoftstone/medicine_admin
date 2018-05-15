var base_url_user = '/rs/member';
var base_url_role = '/rs/role';
var reset_psd = "/rs/super_reset_password";
var base_url_comp = "/rs/company";
var users = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var searchData={};

$(function () {
    queryList();
    $.initSystemFileUpload($("#user_form"));
    $("#GiftCardSearch").bind("click",memberSearch);
    $("#GiftCardSearchCancel").bind("click",memberSearchCancel);
    getrole();
    getcomp();
});

function getrole() {
    $("#rank").html("");
    $("#ranks").html("");
    zhget(base_url_role).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#rank").append(html);
            $("#ranks").append(html);
        }
    })
}

function queryList() {
    $("#paginator").show();
    var data = {
        page: currentPageNo,
        size: pageRows,
    }
    data.rank = '>,1';
    if(!isEmptyObject(searchData)){
        data = searchData;
        data.search =1;
        data.page = currentPageNo;
        data.size = pageRows;
        var rank  = $('#ranks').val();
        if(rank!==''){
            data.rank ='=,'+rank;
        }else {
            data.rank = '>,1';
        }
    }
    data.order="create_time desc";
    data.status='<,99'
    zhget(base_url_user, data).then( function (result) {
        if(checkData(result,'get','queryList','table-responsive')) {
            users = result.rows;
            var obj={};
            for(var i=0;i<result.rows.length;i++){
                result.rows[i].power_id=''
                if(result.rows[i].power_json){
                    for(var j=0;j<result.rows[i].power_json.length;j++){
                        if(j==0){
                            result.rows[i].power_id+=result.rows[i].power_json[j]
                        }else{
                            result.rows[i].power_id+=','+result.rows[i].power_json[j]
                        }
                    }
                }
            }
            zhget(base_url_role,{}).then(function(res){
                for(var i=0;i<res.rows.length;i++){
                    obj[res.rows[i]["id"]]=res.rows[i]["name"]
                }
                for(var i =0 ; i<users.length;i++){
                    //登录号判断开始
                    if(users[i].nickname==""||users[i].nickname==null){
                        users[i].nickname= '匿名人士';
                    }
                    // 给数据加上权限名
                    users[i].powername=obj[users[i]["power_json"]];
                }
                buildTable(result, 'user-template', 'user-placeholder');
            });
        }
    });
}

function getcomp(){
    // var pid = $("#comp").val();
    zhget('/rs/company',{status:'1'}).then(function(result){
        $("#comp").empty();
        $("#comp").append('<option value="-1">无</option>');
        $("#comps").empty();
        $("#comps").append('<option value="">全部</option>');
        if(result.code == 200){
            var data = result.rows;
            for(var i=0; i<data.length; i++){
                $("#comp").append('<option value="'+data[i].id+'">'+data[i].name+'</option>');
                $("#comps").append('<option value="'+data[i].id+'">'+data[i].name+'</option>');
            }
        }
    })
}
// function hideuserModal() {
//     $('#userModal').modal('hide');
// }
function onUserAddClick() {
     cleanForm();
    operation = "add";
    $("#username").removeAttr("readonly");
    $("#userpwd").removeAttr("readonly");
    $('#userModal').modal('show');
}
function cleanForm() {
    $("#userid").val("");
    $("#userrank").val("");
    $("#username").val("");
    $("#realname").val("");
    // $("#comp option[value='0']").attr("selected",true).siblings().attr("selected",false);
    $("#userpwd").val("");
    $("#picfile").val("");
    $("#picShow").attr("src","");
    $("#picPath").val("");
    $("#rank").val("-1");
    $("#comp").val("-1");
    $('#jointimes').val('');
}
function onSearchClick() {
    // $("#name").val('');
    // $("#updateBrandId").val('');
    cleanForm();
    // $(".brandadd").css("display","none");
    $(".brandSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function onUpdateClick(userid) {
    fillForm(userid);
    operation = "modify";
    $("#username").attr("readonly", "readonly");
    $("#picPath").attr("readonly", "readonly");
    $('#userModal').modal('show');
    $("#userpwd").val("");
}
function fillForm(id) {
    zhget(base_url_user+"/"+id,{}).then(function (res) {
        if(res.code==200){
            $("#userid").val(id);
            $("#rank").val(res.rows[0].rank);
            $("#username").val(res.rows[0].username);
            $("#realname").val(res.rows[0].realname);
            $("#comp").val(res.rows[0].comp_id);
            $("#jointimes").val(res.rows[0].join_time.split(' ')[0]);
            // $("#userpwd").val(res.rows[0].password);
            // $("#picPath").val(res.rows[0].picpath);
            // $("#picShow").attr("src",targetUrl+res.rows[0].picpath);
        }else {
            if(res.code==601){
                showError("登陆超时！");
                window.location.href = "adminLogin.html";
            }else {
                showError(res.err);
            }
        }
    })
}
function delClick(el,userid,username){
    if(!confirm("确认要删除此账号吗？")){
        return;
    }
    zhput(base_url_user + "/" + userid, {status:99,username:username+userid}).then(function (res) {
        if(res.code==200){
            showSuccess("删除成功!")
            if(jQuery(el).parents("tbody").find("tr").length==1){
                if(currentPageNo>1){
                    currentPageNo--;
                }
                jQuery("#goToPagePaginator").val(currentPageNo);
                jQuery("#goToPagePaginator").next().click();
            }else{
                queryList();
            }
        }else {
            showError("删除失败!")
        }
    })
}
function onUserSaveClick() {
    var userid = $("#userid").val();
    // var rank = $("#userrank").val();
    // if(rank==""){
    //     rank = 7;
    // }
    var username = $("#username").val().trim();
    if(username==null||username==""){
        showError("账号不能为空！")
        return;
    }
    var realname = $("#realname").val().trim();
    if(realname==null||realname==""){
        showError("用户姓名不能为空！");
        return;
    }

    var password = $("#userpwd").val();
    var comp_id= $("#comp").val();
    var data = {
        username: username,
        phone: username,
        realname: realname,
        status:1
    };
    if(comp_id&&comp_id!='-1'){
        data.comp_id=comp_id;
    }else{
        showError("请选择店铺！");
        return;
    }
    var rank= $("#rank").val();
    if(rank&&rank!='-1'){
        data.rank=rank;
    }else{
        showError("请选择角色名称！");
        return;
    }
    // if(rank==5||rank==7){
    //
    // }
    console.log(data)

    if (operation == "add") {
        zhget(base_url_user, {username:username}).then( function (result) {
            if(result.code==200){
                showError("用户已存在")
                return;
            }else if(result.code==602){
                if(rank==2||rank==3){
                    zhget(base_url_user, {comp_id:comp_id,rank:rank,status:"<,99"}).then( function (result) {
                        if(result.code==200){
                            if(rank==2){
                                showError("该业务员账号已存在")
                                return;
                            }else if(rank==3){
                                showError("该店铺账号已存在")
                                return;
                            }
                        }else if(result.code==602){
                            if(password.length>=6){
                                data.password = password;
                                zhpost(base_url_user, data).then(saveResult);
                            }else{
                                showError("请输入6-20位密码");
                            }
                        }
                    })
                }else{
                    if(password.length>=6){
                        data.password = password;
                        zhpost(base_url_user, data).then(saveResult);
                    }else{
                        showError("请输入6-20位密码");
                    }
                }
            }
        })

    } else {
        if(rank==2||rank==3){
            zhget(base_url_user, {comp_id:comp_id,rank:rank,status:"<,99"}).then( function (result) {
                if(result.code==200){
                    if(rank==2){
                        if(userid!=result.rows[0].id){
                            showError("该业务员账号已存在")
                            return;
                        }
                    }else if(rank==3){
                        if(userid!=result.rows[0].id){
                            showError("该店铺账号已存在")
                            return;
                        }
                    }
                }
                if(password!==""){
                    zhput(base_url_user + "/" + userid, data).then(
                        function(result){
                            if(result.info){
                                if(password!==""){
                                    if(password.length>=6){
                                        zhput(reset_psd + "/" + userid,{password:password,app:"02"}).then(saveResult);
                                    }else{
                                        showError("请输入6-20位密码")
                                    }
                                }else {
                                    saveResult(result)
                                }
                            }
                        }
                    );
                }else {
                    zhput(base_url_user + "/" + userid, data).then( function(result){
                        saveResult(result);
                    })
                }
            })
        }else{
            if(password!==""){
                zhput(base_url_user + "/" + userid, data).then(
                    function(result){
                        if(result.info){
                            if(password!==""){
                                if(password.length>=6){
                                    zhput(reset_psd + "/" + userid,{password:password,app:"02"}).then(saveResult);
                                }else{
                                    showError("请输入6-20位密码")
                                }
                            }else {
                                saveResult(result)
                            }
                        }
                    }
                );
            }else {
                zhput(base_url_user + "/" + userid, data).then( function(result){
                    saveResult(result);
                })
            }
        }

    }
}
function saveResult(result) {
    if (result.err) {
        showError('保存失败！');
    } else {
        $('#userModal').modal('hide');
        queryList();
        showSuccess('保存成功！');
    }
}

// function onUploadDetailPic()
// {
//     var attrs = fileComp.attr("refattr");
//     if(list.length > 0 && list[0].code == 200){
//         var sAttachUrl = list[0].url;
//         $("#"+attrs, formObject).val(sAttachUrl);
//     }
// }

// function sendAdminPic(formObject, fileComp, list) {
//     var sAttachUrl = list[0].url;
//     $("#picShow").attr("src",targetUrl+sAttachUrl);
//     $("#picPath").val(sAttachUrl);
//     showSuccess("上传成功!");
// }

function memberSearch() {
    var username = $("input[name='username']").val();
    var realname = $("input[name='realname']").val();
    var create_time_start = $("#dtBindTimeStart").val();
    var create_time_end = $("#dtBindTimeEnd").val();
    var create_time_end1 = create_time_end +" 23-59-59";
    var comp_id = $('#comps').val();
    if(username!=""){
        searchData.username = username;
    }else {
        searchData.username = undefined
    }
    if(realname!=""){
        searchData.realname = realname;
    }else {
        searchData.realname = undefined;
    }
    searchData.comp_id = comp_id;
    if(create_time_start!=""&&create_time_end!=""){
        searchData.create_time='>=,'+create_time_start+',<=,'+create_time_end1;
    }else if(create_time_start!=""&&create_time_end==""){
        searchData.create_time='>=,'+create_time_start;
    }else if(create_time_start==""&&create_time_end!=""){
        searchData.create_time='<=,'+create_time_end1;
    }else {
        searchData.create_time = undefined;
    }
    currentPageNo =1;
    queryList();
}
function memberSearchCancel() {
    $("input[name='username']").val("");
    $("input[name='realname']").val("");
     $("#dtBindTimeStart").val("");
    $("#dtBindTimeEnd").val("");
    $('#ranks').val('');
    $('#comps').val('');
    memberSearch();
}
function initSelect() {
    // zhget(base_url_role ,{}).then(function(res) {
    //     for(var j = 0;j<res.rows.length;j++){
    //         var html = '<p style="display: none;" power="'+res.rows[j].id+'">'+res.rows[j].name+'</p>';
    //         $(".roleManage"+obj).append(html);
    //         if(json!=null&&json!=""){
    //             for (var i = 0; i < json.length; i++) {
    //                 $(".roleManage"+obj+" p[power="+json[i]+"]").show();
    //             }
    //         }
    //     }
    // })
}
function getCompany() {
    $("#comp").html("");
    zhget("/rs/sh_company").then(function (result) {
        if(result.code==200){
            var html = '<option value="-1">无</option>';
            for(var i = 0; i<result.rows.length;i++){
                html+='<option value="'+result.rows[i].id+'">'+result.rows[i].name+'</option>'
            }
            $("#comp").append(html);
        }else {
            showError("获取店铺失败，请刷新再次尝试")
        }
    })
}

Handlebars.registerHelper('is_judge', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});