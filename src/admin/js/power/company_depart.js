/**
 * Created by Administrator on 2018/11/29.
 */
var baseurl_menu="/rs/department";
var enter_id; //企业id
var user_status; //企业审核状态：0-待审核；1-审核通过;3-审核拒绝 ; 9-草稿
$(document).ready(function(){
    enter_id=getCookie('enterprise_id') || sessionStorage.getItem("enterprise_id");
    user_status=getCookie('user_status') || sessionStorage.getItem("user_status");
    if(user_status!=1){
        $('#page-content').hide();
        $('#checking').show();
        return;
    }
    renderleftMenu();

});

//zTree
//渲染左侧树形列表的方法
function renderleftMenu(){
    var setting={
        view: {
            addHoverDom: addHoverDom,//鼠标悬浮时的处理事件
            removeHoverDom: removeHoverDom,
            selectedMulti: false,
            fontCss: getFontCss,
            txtSelectedEnable: true
        },
        edit: {
            enable: true,
            editNameSelectAll: true,
            removeTitle: "删除部门",
            renameTitle: "编辑部门"
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            beforeDrag: beforeDrag,
            beforeEditName: beforeEditName,
            beforeRemove: beforeRemove,
            beforeRename: beforeRename,
            onRemove: onRemove,
            onRename: onRename,
            beforeClick: beforeClick,
            onClick: onClick
            // onNodeCreated: onNodeCreated //节点创建后
        }
    };
    var treedata={
        status:1,
        enterp_id:enter_id
    };
    zhget(baseurl_menu, treedata).then(function(result){
        var zNodes=[{ id:0, pId:0, name:"组织架构", open:true}];
        if(result.code==200){
            // console.log(result);
            // 先手动添加总的父目录：全部
            var idArray=[];
            for(var i=0,len=result.rows.length;i<len;i++){
                var obj=result.rows[i];
                var name=obj.name,
                    id=obj.id,
                    pid=obj.pid;
                var jsondata={id:id, pId:pid, name:name};
                zNodes.push(jsondata);
                idArray.push(id);
            }
            //获取已有目录中最大的id值
            currentId=Math.max.apply(null, idArray);
            //渲染树形列表
            $.fn.zTree.init($("#menuTree"), setting, zNodes);
            sessionStorage.removeItem("parentName");
            // sessionStorage.removeItem("catagory_id");
        }else if(result.code==602){
            $.fn.zTree.init($("#menuTree"), setting, zNodes);
        }
        else{
            //processError(result);
        }
    });
}
//左侧树形节点
var className = "dark";
function beforeDrag(treeId, treeNodes) {
    return false;
}
function beforeEditName(treeId, treeNode) {
    className = (className === "dark" ? "":"dark");
    var zTree = $.fn.zTree.getZTreeObj("menuTree");
    zTree.selectNode(treeNode);
    setTimeout(function() {
        layer.confirm("您确定要修改 " + treeNode.name + " 的名称吗？",
            {
                title:'修改确认',
                btn: ['确定','取消']
            }, function(index){
            layer.close(index);
            zTree.editName(treeNode);
            return true;
        },function(index){
            layer.close(index);
            return false;
        });
    }, 0);
    return false;
}
function beforeRemove(treeId, treeNode) {
    className = (className === "dark" ? "":"dark");
    var zTree = $.fn.zTree.getZTreeObj("menuTree");
    zTree.selectNode(treeNode);
    // setTimeout(function(){
    //     layer.confirm("您确定要删除 " + treeNode.name + " 吗？",
    //         {
    //             title:'删除确认',
    //             btn: ['确定','取消']
    //         }, function(index){
    //             layer.close(index);
    //             return true;
    //         },function(index){
    //             layer.close(index);
    //             return false;
    //         });

    // layer.open({
    //     content: "您确定要删除 " + treeNode.name + " 吗？",
    //     title:'删除确认',
    //     btn: ['确定','取消'],
    //     yes: function(index){
    //         //do something
    //         layer.close(index);
    //         return true;
    //     },
    //     cancel:function(index){
    //         layer.close(index);
    //         return false;
    //     }
    // });


    // },0)
    // return false;
    return confirm("您确定要删除 -- " + treeNode.name + " 吗？");
}
function onRemove(e, treeId, treeNode) {
    // console.log(treeNode.id)
    zhput(baseurl_menu+"/"+treeNode.id,{status:9}).then(function(result){
        if(result.code==200){
            showSuccess("删除成功！");
        }else{
            //processError(result);
        }
    });
}
function beforeRename(treeId, treeNode, newName, isCancel) {
    className = (className === "dark" ? "":"dark");
    var zTree = $.fn.zTree.getZTreeObj("menuTree");
    if (newName.length == 0) {
        setTimeout(function() {
            zTree.cancelEditName();
            showError("名称不能为空");
        }, 0);
        return false;
    }else if(newName.length > 10){
        showError("名称不能超过10个字");
        return false;
    }
    return true;
}
function onRename(e, treeId, treeNode, isCancel) {
    // console.log(treeNode.name);
    sessionStorage.setItem("parentName",treeNode.name);
    var jsondata={pId:treeNode.pId,name:treeNode.name};
    //发送请求添加节点,只有判断为添加节点的操作时才执行
    // requestAddNode(addNodename,jsondata);
    // console.log(addNodename);
    zhput(baseurl_menu+"/"+treeNode.id,{enterp_id:enter_id,name:treeNode.name}).then(function(result){
        if(result.code==200){
            showSuccess("操作成功！");
        }else{
            //processError(result);
        }
    });
}
function showRemoveBtn(treeId, treeNode) {
    return !treeNode.isFirstNode;
}
function showRenameBtn(treeId, treeNode) {
    return !treeNode.isLastNode;
}
var newCount = 1;
var currentId;
function addHoverDom(treeId, treeNode) {
    // 如果点击的是全部，就不显示删除按钮
    if(treeNode.id==0){
        $("#"+treeNode.tId+"_remove").unbind().remove();
        $("#"+treeNode.tId+"_edit").unbind().remove();
    }
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
    var addStr = "<span  class='button add' id='addBtn_" + treeNode.tId
        + "' title='添加部门' onfocus='this.blur();'></span>";
    sObj.after(addStr);
    var addbtn = $("#addBtn_"+treeNode.tId);
    // var editbtn=$("#"+treeNode.tId+"_edit");
    if (addbtn) addbtn.on("click", function(){
        //添加节点判断改为真
        addNodename=true;
        var zTree = $.fn.zTree.getZTreeObj("menuTree");
        var addData={
            pId:treeNode.id,
            enterp_id:enter_id
        };
        // 获取id
        zhpost(baseurl_menu,addData).then(function(result){
            if(result.code===200){
                zTree.addNodes(treeNode, {id:result.id, pId:treeNode.id, name:"新节点" + (newCount++)});
                //添加节点之后直接使该节点处于编辑状态
                //console.log(treeNode);
                zTree.editName(treeNode.children[treeNode.children.length-1]);
            }else{
                //processError(result);
            }
        });
        currentId+=1;
        return false;
    });
    // if(editbtn) editbtn.bind("click",showRemoveModal);
    //  console.log(editbtn);
};
// // 添加节点的请求
// function requestAddNode(addNodename,jsondata){
//     //只有判断为添加节点的操作时，才执行
//     if(addNodename){
//         zhpost(baseurl_menu,jsondata).then(function(result){
//             if(result.code==200){
//                 showSuccess("添加成功！");
//             }else{
//                 processError(result);
//             }
//         });
//     }
// };
function removeHoverDom(treeId, treeNode) {
    $("#addBtn_"+treeNode.tId).unbind().remove();
    $("#"+treeNode.tId+"_edit").unbind().remove();
    $("#"+treeNode.tId+"_remove").unbind().remove();
};
function beforeClick(treeId, treeNode, clickFlag) {
    className = (className === "dark" ? "":"dark");
    return (treeNode.click != false);
}
// 选中某个库之后发送请求
function onClick(event, treeId, treeNode, clickFlag) {
    //console.log(treeNode);
    //如果被选中，就不显示增加、修改、删除按钮
    isSearch=false;
    currentPageNo=1;
    $("#addBtn_"+treeNode.tId).unbind().remove();
    $("#"+treeNode.tId+"_edit").unbind().remove();
    $("#"+treeNode.tId+"_remove").unbind().remove();
    // 如果点击的是全部，就查询所有
    // if(treeNode.id==0){
    //     // queryList();
    //     sessionStorage.setItem("parentName","全部");
    // }else{
    catagory_id=treeNode.id;
    console.log(catagory_id);
    // 发送请求渲染右侧列表
    //queryList(catagory_id);
    //获取当前点击的库的名字，并保存到sessionStorage，用于弹出框调用时显示上级库
    var parName=$("#"+treeNode.tId+"_span").text();
    sessionStorage.setItem("parentName",parName);
    sessionStorage.setItem("catagory_id",catagory_id);
    // }
}
//左侧树形节点的搜索功能
var lastValue = "", nodeList = [],fontCss = {},key;
$(document).ready(function(){
    key = $("#key");
    key.bind("focus", focusKey)
        .bind("blur", blurKey)
        .bind("propertychange", searchNode)
        .bind("input", searchNode)
        .bind("change", inputchange)
        .bind("click",searchNode);
});
function focusKey(e) {
    if (key.hasClass("empty")) {
        key.removeClass("empty");
    }
}
function blurKey(e) {
    if (key.get(0).value === "") {
        key.addClass("empty");
    }
}
function inputchange(e) {
    lastValue = "";
    searchNode(e);
}
function filter(node) {
    return !node.isParent && node.isFirstNode;
}
function searchNode(e){
    var zTree = $.fn.zTree.getZTreeObj("menuTree");
    var value = $.trim(key.get(0).value);
    console.log("val:"+value);
    var keyType = "name";
    if (lastValue === value) return;
    lastValue = value;
    console.log("last:"+lastValue);
    if (value === "") {
        updateNodes(false,false);
        return;
    }
    nodeList = zTree.getNodesByParamFuzzy(keyType, value);
    updateNodes(true,true);
}
function updateNodes(highlight,nodeStatus) {
    var zTree = $.fn.zTree.getZTreeObj("menuTree");
    for( var i=0, l=nodeList.length; i<l; i++) {
        nodeList[i].highlight = highlight;
        zTree.updateNode(nodeList[i]);
        var nodeOpen=zTree.expandNode(nodeList[i],nodeStatus,true);
        if(nodeOpen==null){//如果当前节点不是父节点，就展开父节点
            zTree.expandNode(nodeList[i].getParentNode(),nodeStatus);
        }
    }
}
function getFontCss(treeId, treeNode) {
    return (!!treeNode.highlight) ? {color:"#A60000", "font-weight":"bold"} : {color:"#333", "font-weight":"normal",'font-size':"14px"};
}