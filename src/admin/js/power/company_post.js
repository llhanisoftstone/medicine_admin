/**
 * Created by Administrator on 2018/11/29.
 */

var base_url_goodsCategory='/rs/enter_post';
var enter_id; //企业id
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var user_status; //企业审核状态：0-待审核；1-审核通过;3-审核拒绝 ; 9-草稿
$(function() {
    enter_id=getCookie('enterprise_id') || sessionStorage.getItem("enterprise_id");
    user_status=getCookie('user_status') || sessionStorage.getItem("user_status");
    if(user_status!=1){
        $('#page-content').hide();
        $('#right-item-box').hide();
        $('#checking').show();
        return;
    }
    queryList();
    querySearchDepart();//查询部门信息
    querySaveDepart()
    $("#searchDataBtn", $(".reasonRefund")).bind("click", function(){
        issearchModel=true;
        queryList();
    });
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        $("#guanlian").attr('pkuid','').val('');
        $("#reasonSearchForm")[0].reset();
        issearchModel=false;
        queryList();
    });
});

function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var data={
        page: currentPageNo,
        size: pageRows,
        status:1,
        order:'create_time desc',
        enterp_id:enter_id
    }
    if(issearchModel){
        data.search=1;
        var dep_id=$("#guanlian").attr('pkuid');
        if(dep_id!=''){
            data.department_id=dep_id;
        }
        var name=$.trim($("#name").val());
        if(name!=''){
            data.name=name;
        }
    }
    zhget(base_url_goodsCategory,data).then(function (result) {
        if(checkData(result,'get','queryList','table-goodsCategory','paginator')) {
            $("#querylistnull").remove();
            $("#pid").attr("_pid",0);
            $("#pid").attr("_deep",1);
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'goodsCategory1-template', 'goodsModel-placeholder');
        }
    })
}

function searchGoodsModels(){
    $(".addModels").hide();
    $(".searchDataDiv", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

function showSearchPage() {
    $("#guanlian").attr("_id","");
    $("#guanlian").val('');
    $("#name").val('');
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function addGoodsModels(dom){
    $("#guanlian_add").attr("_id","");
    $("#guanlian_add").val('');
    $("#name_add").val('');
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $("#userAddForm", $(".reasonRefund"))[0].reset();
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}

function onUpdateClick(id,dep_name,dep_id,name) {
    $("#guanlian_add").attr("_id",id);
    $("#guanlian_add").val(dep_name);
    $("#guanlian_add").attr('pkuid',dep_id);
    $("#name_add").val(name)
    $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    $(".addModels", $(".reasonRefund")).animate({
        height : 'show',
        opacity : 'show'
    }, "slow");
}
function addbtn(){
    var department_id=$("#guanlian_add").attr('pkuid');
    if(department_id.trim()==''){
        return showError('请选择部门');
    }
    var name=$('#name_add').val()
    if($.trim(name)==''){
        return showError('请输入岗位名称');
    }
    var data={
        department_id:department_id,
        name:name
    };
    var modelid=$("#guanlian_add").attr("_id");
    if(modelid==""||modelid=="undefined"){
        zhpost(base_url_goodsCategory,data).then(function(result){
            if(checkData(result,'post')){
                resetinput();
                $(".addModels").hide();
                queryList()
            }
        })
    }else{
        zhput(base_url_goodsCategory+"/"+modelid,data).then(function(result){
            if(checkData(result,'put')){
                $(".addModels").hide();
                $("#guanlian_add").removeAttr("_id");
                resetinput();
                queryList()
            }
        })
    }
}
function onDeleteModel(el,id){
    zhget('/rs/enter_staff',{post_id:id}).then(function(result){
        if(result.records>0){
            showError('该岗位下有员工，不能删除');
            return;
        }else{
            layer.confirm('确定要删除该岗位吗？', {
                title:'删除确认',
                btn: ['确定','取消'], //按钮
                resize:false,
                move: false
            }, function(index){
                layer.close(index);
                zhput(base_url_goodsCategory+"/"+id,{status:9}).then(function(rest){
                    if(checkData(rest,'delete')){
                        issearchModel=false;
                        if(jQuery(el).parents("tbody").find("tr").length==1){
                            if(currentPageNo>1){
                                currentPageNo--;
                            }
                            jQuery("#goToPagePaginator").val(currentPageNo);
                            jQuery("#goToPagePaginator").next().click();
                        }else{
                            queryList();
                        }
                    }
                })
            });
        }
    })
}

//重置
function resetinput(){
    $("#userAddForm", $(".reasonRefund"))[0].reset();
}

//搜索
function searchbtn(){
    var modelval=$("#addNew").attr("_modelId");
    if(modelval==undefined){
        issearchModel=true;
        queryList();
    }else{
        issearchValue=true;
        //onModelNameClick(modelval);
    }
}
/*function searchResult(){
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'id desc'
    }
    data.search=1;
    var name=$.trim($("#name").val());
    data.name = name;
    zhget(base_url_goodsCategory,data).then(function (result) {
        if(checkData(result,'get','queryList','table-goodsCategory','paginator')) {
            $("#querylistnull").remove();
            $("#pid").attr("_pid",0);
            $("#pid").attr("_deep",1);
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'goodsCategory1-template', 'goodsModel-placeholder');
        }
    })
}*/
function querySearchDepart(){
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
    zhget('/rs/department',data).then(function(result){
        if(result.code==200){
            if(result.records==0){
                $('#guanlian').val('暂无数据');
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
                $.fn.zTree.init($("#selectTree"), setting, zNodes);
                showMenu();
            }
        }
        else{
            //processError(result);
        }
    });
    $("#guanlian").focus(function(){
        showMenu();
    });
    // $("#guanlian").bind('blur',showMenu);
    function beforeClick(treeId, treeNode) {
        // var check = (treeNode && !treeNode.isParent);
        // if (!check) alert("只能选择...");
        // return check;
    }
    function onselClick(e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("selectTree"),
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
        var gl = $("#guanlian");
        gl.val(v);
        gl.attr("pkuid",cataid);
        hideMenu();
    }
    function showMenu() {
        $("#menuContent").show().slideDown("fast");
        $("#selectTree").show();
        $("body").bind("mousedown", onBodyDown);
    }
    function hideMenu() {
        $("#menuContent").fadeOut("fast");
        $("body").unbind("mousedown", onBodyDown);
    }
    function onBodyDown(event) {
        var targetClass=event.target.className;
        if (!((targetClass.indexOf('button') != -1) || event.target.id == "guanlian" || event.target.id == "menuBtn" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
            hideMenu();
        }
    }
}
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
    zhget('/rs/department',data).then(function(result){
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
        gl.val(v);
        gl.attr("pkuid",cataid);
        hideMenu();
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
        var targetClass=event.target.className;
        if (!( (targetClass.indexOf('button') != -1) || event.target.id == "guanlian_add" || event.target.id == "menuBtn" || event.target.id == "menuContent_add" || $(event.target).parents("#menuContent_add").length>0)) {
            hideMenu();
        }
    }
}
Handlebars.registerHelper("getindex", function (v1, options) {
    return v1+1;
});