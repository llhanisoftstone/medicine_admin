var role_details;
var dispalay_root_id = [];

var id;

var root_id=[];
var setting = {
    check: {
        enable: true
    },
    data: {
        simpleData: {
            enable: true
        }
    }
};
var zNodes=[];
var code;
function setCheck() {
    var zTree = $.fn.zTree.getZTreeObj("treeDemo"),
        py = $("#py").attr("checked")? "p":"",
        sy = $("#sy").attr("checked")? "s":"",
        pn = $("#pn").attr("checked")? "p":"",
        sn = $("#sn").attr("checked")? "s":"",
        type = { "Y":py + sy, "N":pn + sn};
    zTree.setting.check.chkboxType = type;
    showCode('setting.check.chkboxType = { "Y" : "' + type.Y + '", "N" : "' + type.N + '" };');
}
function showCode(str) {
    if (!code) code = $("#code");
    code.empty();
    code.append("<li>"+str+"</li>");
}



$(function() {
    // var thisUrl=location.href;
    id = getQueryByName("id")
    getinfo(id);

    var tree = $.fn.zTree.getZTreeObj("treeDemo");
  /*  i = 0, node = null;
    for( ; i < dispalay_root_id.length; i ++ ) {
        tree.checkNode( tree.getNodeByParam( "root_id",dispalay_root_id[i] ), true );
    }*/
    setTimeout(function () {
        zhget("/rs/menu_list",{order:'root_id,id'}).then(function (result) {
        var k=0;
        for(var i=0;i<result.rows.length;i++)
        {
            var temp = {id:i+1, pId:0 ,name:result.rows[i].root_name,root_id:result.rows[i].root_id}
              if(($.inArray(result.rows[i].root_id, dispalay_root_id))!=-1)
              {
                  var temp = {id:i+1, pId:0 ,name:result.rows[i].root_name,root_id:result.rows[i].root_id,checked:true, open:true}
              }
            for(var j=0;j<result.rows[i].subItem.length;j++)
            {
                if(j==0) {
                    zNodes[k++] = temp;
                }
                temp1={id:10*(i+1)+j+1,pId:i+1,name:result.rows[i].subItem[j].name,root_id:result.rows[i].subItem[j].id}
                if(($.inArray(result.rows[i].subItem[j].id, dispalay_root_id))!=-1)
                {
                    temp1={id:10*(i+1)+j+1,pId:i+1,name:result.rows[i].subItem[j].name,root_id:result.rows[i].subItem[j].id,checked:true}
                }
                zNodes[k++]=temp1;
            }
        }
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        setCheck();
    })
    }, 300);

});
function onSaveClick()
{

    getRoot_id();
    console.log(root_id)
    var data = {
        "power_json":root_id
    };
    zhput('/rs/role' + "/" +id, data).then(saveResult);
}
function saveResult(result) {
    console.log(result);
    if (result.info) {
        // if (result.err) {
        //     showError('保存失败！');
        // } else{
        showSuccess('保存成功！');
        setTimeout(function () {
        onMenuClick('pages/role/role.html')
        }, 300);
        // }
    } else {
        showError('保存失败！');
    }
}

function getRoot_id()
{
    var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = treeObj.getCheckedNodes(true);
    for(var i=0;i<nodes.length;i++)
    {
        root_id[i]= nodes[i].root_id;
    }
}

function getinfo( id) {
    zhget('/rs/role', {
        id:id
    }).then(function(result) {
        role_details= result;
        dispalay_root_id=role_details.rows[0].power_json
    });
}

