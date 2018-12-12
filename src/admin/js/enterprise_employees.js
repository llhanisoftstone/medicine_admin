/**
 * Created by Administrator on 2018/11/29.
 */
var base_url_department = '/rs/department'; //部门
var base_url_jobs = '/rs/enter_post';  // 岗位
var base_url_staff = '/rs/enter_staff';  // 员工
var currentPageNo = 1;
var pageRows = 10;
var employees = [];
var department_id;
var jobs_id;
var operation = "add";
var userid;
var user_status; //企业审核状态：0-待审核；1-审核通过;3-审核拒绝 ; 9-草稿
var enter_id; //企业id
var issearch;
$(function () {
    user_status=getCookie('user_status') || sessionStorage.getItem("user_status");
    enter_id=getCookie('compid') || sessionStorage.getItem("compid");
    // 待放开
    // if(user_status!=1){
    //     $('#page-content').hide();
    //     $('#right-item-box').hide();
    //     $('#checking').show();
    //     return;
    // }
    querySaveDepart();
    queryList();
    $("#GiftCardSearchCancel").bind("click", function(){
        $("#GiftCardSearchForm")[0].reset();
        queryList();
    });
    $("#GiftCardSearch").unbind("click");
    $("#GiftCardSearch").bind("click",searchNotification);
});
$("#jobs").click(function () {
    if($("#jobs").val()=="-1"){
        layer.msg('请先选择企业部门',{icon: 3});
    }
})
// 岗位
function jobslist(department_id) {
    var data ={
        department_id:department_id
    }
    zhget(base_url_jobs,data).then(function(result){
        if(result.code == 200){
            buildTable(result, 'jobs-template', 'jobs');
        }
    });
}
//查询
function searchNotification(){
    issearch=true;
    currentPageNo=1;
    queryList();
}
// 员工列表
function queryList() {
    var loadIndex = layer.load(2, {time: 10*1000}); //最长等待10秒
    var data={
        page: currentPageNo,
        size: pageRows,
        enterp_id:enter_id
    };
    if(issearch){
        var employeesName=$("#employeesName").val().trim();
        if(employeesName!=""||employeesName!=null){
            data.name=employeesName;
        }
        var dtBindTimeEntry=$("#dtBindTimeEntry").val().trim();
        if(dtBindTimeEntry!=""||dtBindTimeEntry!=null){
            data.join_time=dtBindTimeEntry;
        }
        data.search=1;
    }
    zhget(base_url_staff,data).then(function(result){
        layer.close(loadIndex);
        if(result.code == 200){
            employees = result;
            for(var i=0;i<result.rows.length;i++){
                result.rows[i].rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'user-template', 'user-placeholder');
        }else {
            $("#user-placeholder").html("<tr><td colspan='10' style='text-align: center'>暂无数据</td></tr>");
        }
    });
}
// 新建
function onUserSaveClick(id) {
    var username = $("#username").val();
    var ipone = $("#ipone").val();
    var age = $("#age").val();
    var gender = $("#gender").val();
    var department = $("#guanlian_add").val();
    var jobs = $("#jobs").val();
    var idNumber = $("#idNumber").val();
    var dtBindTimeStart = $("#dtBindTimeStart").val();
    if(username ==''){
        layer.msg('姓名不能为空',{icon: 3});
        return;
    }
    if(ipone ==''){
        layer.msg('手机号不能为空',{icon: 3});
        return;
    }else  if(!isPhone(ipone)){
        layer.msg('手机号码不正确',{icon: 3});
        return;
    }
    if(age ==''){
        layer.msg('年龄不能为空',{icon: 3});
        return;
    }
    if(gender == '-1'){
        layer.msg('请选择性别',{icon: 3});
        return;
    }
    if(department ==''){
        layer.msg('请选择部门',{icon: 3});
        return;
    }
    if(jobs == '-1'){
        layer.msg('请先选择部门',{icon: 3});
        return;
    }
    if(idNumber == ''){
        layer.msg('请输入证件号码',{icon: 3});
        return;
    }
    if(dtBindTimeStart == ''){
        layer.msg('请选择入职时间',{icon: 3});
        return;
    }
    department_id = $("#guanlian_add").attr('pkuid');
    jobs_id = $('#jobs option:selected').attr('jobstid');
    var data={
        name:username,
        phone:ipone,
        age:age,
        department_id:department_id,
        post_id:jobs_id,
        card_num:idNumber,
        join_time:dtBindTimeStart
    };
    if(gender == '1'){
        data.gender = 1;
    }else if(gender == '2'){
        data.gender = 2;
    }
    if(operation == 'add'){
        zhpost(base_url_staff,data).then(function(result){
            if(result.code == 200){
                layer.msg('添加成功',{icon: 1});
                queryList();
                $('#userModal').modal('hide');
            }else {
                layer.msg('添加失败',{icon: 2});
            }
        });
    }else {
        zhput(base_url_staff+"/"+userid,data).then(function(result){
            if(result.code == 200){
                layer.msg('修改成功',{icon: 1});
                queryList();
                $('#userModal').modal('hide');
            }else {
                layer.msg('修改失败',{icon: 2});
            }
        })
    }

}


function delClick(el,userid){
    layer.confirm('确认要删除吗？', {
        btn: ['确定','取消'] //按钮
    }, function(index){
        layer.close(index);
        zhdelete(base_url_staff+ "/" + userid).then(function (result) {
            if(result.code == 200){
                layer.msg('删除成功！', {icon: 1});
                queryList();
                if(jQuery(el).parents("tbody").find("tr").length==1){
                    if(currentPageNo>1){
                        currentPageNo--;
                    }
                }else{
                    employeesLsit();
                }
            }else {
                layer.msg('删除失败！', {icon: 2});
            }
        })
    });
}
function fillForm(id) {
    var index = 0;
    for (index in employees.rows) {
        var item = employees.rows[index];
        if (item.id == id) {
            $("#username").val(item.name);
            $("#ipone").val(item.phone);
            $("#age").val(item.age);
            $('#gender').val(item.gender);
            $("#guanlian_add").val(item.dep_name);
            $('#jobs option:selected').val(item.post_name);
            $('#jobs option:selected').text(item.post_name);
            $("#idNumber").val(item.card_num);
            $("#dtBindTimeStart").val(item.create_time);
            return;
        }
    }
}
/*新建*/
function onUserAddClick() {
    cleanForm();
    $(".modal-title").html("新增企业员工");
    $('#userModal').modal('show');
}
// 编辑
function onUpdateClick(id) {
    userid=id;
    fillForm(id);
    operation = "modify";
    $(".modal-title").html("账号编辑")
    $('#userModal').modal('show');
}
// 导出
function onExportClick() {
    layer.msg('导出')
}
// 导入
function onImportClick() {
    layer.msg('导入')
}
/*高级搜索*/
function onSearchClick() {
    $(".brandSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function cleanForm() {
    $("#username").val("");
    $("#ipone").val("");
    $("#age").val("");
    $("#gender").val("-1");
    $('#jobs').html('<option value="-1">请先选择部门</option>');
    $("#guanlian_add").val("");
    $("#idNumber").val("");
    $("#dtBindTimeStart").val("");
}
//部门
function querySaveDepart(){
    var setting = {
        view: {
            dblClickExpand: false
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            beforeClick: beforeClick,
            onClick: onselClick
        }
    };
    var data={
        status:1,
        enterp_id:enter_id
    };
    zhget(base_url_department,data).then(function(result){
        if(result.code==200){
            if(result.records==0){
                $('#guanlian_add').val('暂无数据');
            }else{
                var zNodes=[];
                for(var i=0;i<result.rows.length;i++){
                    var obj=result.rows[i];
                    var name=obj.name,
                        id=obj.id,
                        pid=obj.pid;
                    var jsondata={id:id, pId:pid, name:name};
                    zNodes.push(jsondata);
                }
                //渲染树形列表
                $.fn.zTree.init($("#selectTree_add"), setting, zNodes);
                showMenu();
            }
        }
        else{
            //processError(result);
        }
    });
    $("#guanlian_add").focus(function(){
        showMenu();
    });
    // $("#guanlian").bind('blur',showMenu);
    function beforeClick(treeId, treeNode) {
        // var check = (treeNode && !treeNode.isParent);
        // if (!check) alert("只能选择...");
        // return check;
    }
    function onselClick(e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("selectTree_add"),
            nodes = zTree.getSelectedNodes(),
            v = "",
            cataid;
        // console.log(nodes);
        nodes.sort(function compare(a,b){return a.id-b.id;});
        for (var i=0, l=nodes.length; i<l; i++) {
            v += nodes[i].name + ",";
            cataid=nodes[i].id;
        }
        if (v.length > 0 ) v = v.substring(0, v.length-1);
        var gl = $("#guanlian_add");
        gl.attr("value", v);
        gl.attr("pkuid",cataid);
        gl.val(v);
        hideMenu();
        department_id = $("#guanlian_add").attr('pkuid');
        jobslist(department_id);
    }
    function showMenu() {
        $("#menuContent_add").show().slideDown("fast");
        $("#selectTree_add").show();
        $("body").bind("mousedown", onBodyDown);
    }
    function hideMenu() {
        $("#menuContent_add").fadeOut("fast");
        $("body").unbind("mousedown", onBodyDown);
    }
    function onBodyDown(event) {
        if (!(event.target.id == "guanlian" || event.target.id == "menuBtn" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
            hideMenu();
        }
    }
}

Handlebars.registerHelper('is_judge', function(v1,v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});
//年.月.日
Handlebars.registerHelper('getspotDate', function(v1, options) {
    if(v1 ==''||v1== undefined || v1 == null){
        return '';
    }
    var data=Date.parse(v1);
    data=new Date(data);
    return data.getFullYear()+"."+parseInt(data.getMonth()+1)+"."+data.getDate();
});
// 男 女
Handlebars.registerHelper('genderdata', function(v1, options) {
    if(v1 == '1') {
        return '男';
    }else if(v1 == '2'){
        return '女';
    }else {
        return '未知';
    }
});