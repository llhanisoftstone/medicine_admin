var base_url_user = '/rs/member';
var base_url_company = '/rs/company';
var base_url_role = '/rs/role';
var reset_psd = "/rs/super_reset_password";
var users = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var searchData={};
var isselect=false;

$(function () {
    company();
    queryList();
    $.initSystemFileUpload($("#user_form"));
    $("#GiftCardSearch").bind("click",memberSearch);
    $("#GiftCardSearchCancel").bind("click",memberSearchCancel);
});

function company(){
    zhget('/rs/company').then( function(result) {
        var data = result.rows;
        var html = '';
        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].title+"</option>"
            }
        }
        $("#comp_id").html(html);
    });
}

function showSelect(){
    var rank=$("#rqanakmember").val();
    if(rank&&rank==31){
        $(".organizmember").hide();
    }else if(rank&&rank==80){
        $(".organizmember").show();
    }
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
        var rank=$("#rqanak").val();
        if(rank&&rank!="-1"){
            data.rank =rank;
        }else{
            data.rank = '>,30';
        }
        data.search =1;
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
    $(".modal-title").html("账号新增")
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
    $(".organizmember").hide();
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
    $(".modal-title").html("账号编辑")
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
            $("#rqanakmember").val(res.rows[0].rank)
            if(res.rows[0].rank==80){
                $(".organizmember").show();
                $('#comp_id').val(res.rows[0].comp_id);
            }
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
    zhput(base_url_user + "/" + userid, {status:99,username:username+"_"+userid}).then(function (res) {
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
    var rank=$("#rqanakmember").val();
    var userid = $("#userid").val();
    var username = $("#username").val().trim();
    if(rank==""||rank=="-1"){
        showError("请选择所属角色")
        return;
    }
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
    var comp_id= $("#comp_id").val();
    var data = {
        username: username,
        phone: username,
        nickname: nickname,
        rank:rank,
        status:1
    };
    if(rank==80){
        if(comp_id&&comp_id!='-1'){
            data.comp_id=comp_id;
            data.rank=80;
        }else{
            showError("请选择企业");
            return;
        }
    }

    if (operation == "add") {
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
            zhput(base_url_user + "/" + userid, data).then(
                function(result){
                    if(result.info){
                        if(password!==""){
                            if(password.length>=6){
                                zhput(reset_psd + "/" + userid,{password:password}).then(saveResult);
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
    $('#comp_id').val('');
    $('#rqanak').val('-1');
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