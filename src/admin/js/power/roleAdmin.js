var base_url_user = '/rs/member';
var base_url_organiz = '/rs/organiz';
var base_url_role = '/rs/role';
var reset_psd = "/rs/super_reset_password";
var users = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var searchData={};
var isselect=false;

$(function () {
    queryList();
    $.initSystemFileUpload($("#user_form"));
    $("#GiftCardSearch").bind("click",memberSearch);
    $("#GiftCardSearchCancel").bind("click",memberSearchCancel);
    getOrganiz();
});

function getOrganiz() {
    $("#organiz").html("");
    zhget(base_url_organiz).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#organiz").append(html);
        }
    })
}

function queryList() {
    $("#paginator").show();
    var data = {
        page: currentPageNo,
        size: pageRows,
    }
    data.rank = '>,30';
    if(isselect){
        data = searchData;
        data.search =1;
        data.rank = '>,30';
    }
    data.order="create_time desc";
    data.status='<,99';
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
    $("#nickname").val("");
    $("#userpwd").val("");
    $("#picfile").val("");
    $("#picShow").attr("src","");
    $("#picPath").val("");
    $("#organiz").val("-1");
}
function onSearchClick() {
    cleanForm();
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
            $("#username").val(res.rows[0].username);
            $("#nickname").val(res.rows[0].nickname);
            $("#organiz").val(res.rows[0].organiz_id);
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
function delClick(el,userid){
    if(!confirm("确认要删除此账号吗？")){
        return;
    }
    zhput(base_url_user + "/" + userid, {status:99}).then(function (res) {
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
    var username = $("#username").val().trim();
    if(username==null||username==""){
        showError("账号不能为空！")
        return;
    }
    var nickname = $("#nickname").val().trim();
    if(nickname==null||nickname==""){
        showError("用户昵称不能为空！");
        return;
    }
    var password = $("#userpwd").val();
    var organiz= $("#organiz").val();
    var data = {
        username: username,
        phone: username,
        nickname: nickname,
        rank: 90,
        status:1
    };
    if(organiz&&organiz!='-1'){
        data.organiz_id=organiz;
    }else{
        showError("请选择机关！");
        return;
    }
    if (operation == "add") {
        data.auto_id=1;
        zhget(base_url_user, {username:username}).then( function (result) {
            if(result.code==200){
                showError("用户已存在")
                return;
            }else if(result.code==602){
                if(password.length>=6){
                    data.password = password;
                    zhpost(base_url_user, data).then(saveResult);
                }else{
                    showError("请输入6-20位密码");
                }
            }
        })

    } else {
        if(password!==""){
            data.password = password;
            zhput(base_url_user + "/" + userid, data).then(
                function(result){
                    if(result.info){
                        saveResult(result)
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
function saveResult(result) {
    if (result.err) {
        showError('保存失败！');
    } else {
        $('#userModal').modal('hide');
        queryList();
        showSuccess('保存成功！');
    }
}

function memberSearch() {
    var username = $("input[name='username']").val();
    var nickname = $("input[name='nickname']").val();
    var create_time_start = $("#dtBindTimeStart").val();
    var create_time_end = $("#dtBindTimeEnd").val();
    var create_time_end1 = create_time_end +" 23-59-59";
    if(username!=""){
        searchData.username = username;
    }else {
        searchData.username = ""
    }
    if(nickname!=""){
        searchData.nickname = nickname;
    }else {
        searchData.nickname = "";
    }
    if(create_time_start!=""&&create_time_end!=""){
        searchData.create_time='>=,'+create_time_start+',<=,'+create_time_end1;
    }else if(create_time_start!=""&&create_time_end==""){
        searchData.create_time='>=,'+create_time_start;
    }else if(create_time_start==""&&create_time_end!=""){
        searchData.create_time='<=,'+create_time_end1;
    }else {
        searchData.create_time = "";
    }
    currentPageNo =1;
    isselect=true;
    queryList();
}
function memberSearchCancel() {
    $("input[name='username']").val("");
    $("input[name='nickname']").val("");
     $("#dtBindTimeStart").val("");
    $("#dtBindTimeEnd").val("");
    $('#organiz').val('');
    memberSearch();
}

Handlebars.registerHelper('is_judge', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});