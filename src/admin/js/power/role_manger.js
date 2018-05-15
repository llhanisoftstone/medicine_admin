var base_url_role = '/rs/role';
var id
var roles = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var power = undefined;
var id = undefined;

$(function () {
    id = getQueryByName("id");
    power = getQueryByName("power")
    queryList();
    $("#btnUserQuery").click(function() {
        currentPageNo = 1;
        queryList();
    });
});

function queryList() {
    var data = {
        page: currentPageNo,
        size: pageRows
    }
        zhget(base_url_role , data).then(function(result) {
          roles= result.rows;
            buildTable(result, 'role-template', 'role-placeholder');
            if(power!="" ) {
              initCheck();
          }
        });

}


/*function onUserAddClick() {
    cleanForm();
    operation = "add";
    $("#username").focus();
    $("#userid").attr("readonly", "readonly");
    $("#userpwd").removeAttr("readonly");
    $("#userpwd").val("123456");
    $("#userstate").val("1");
    $("#category").val("5");
    $('#userModal').modal('show');


}*/

function initCheck()
{
        var powerArr=power.split(",")
     for (var i = 0; i < powerArr.length; i++) {

         $('input:radio[flag=' + powerArr[i] + ']').attr("checked",1);

         // $("#"+power+"a").html("是");
     }

}
function changeText(aa){
    if($('input:radio[flag='+aa+']:checked').is(':checked'))
    {
        $('input:radio[flag='+aa+']:checked').attr("checked",0)
    }else
    {
        $('input:radio[flag='+aa+']:checked').attr("checked",1)
    }
}
function onUserSaveClick() {
    var powerId=[];
    for(var i = 0 ; i< roles.length; i++) {
       var temp = roles[i].id;
        if($('input:radio[flag='+temp+']:checked').val() != null)
        {

          powerId.push(roles[i].id)

        }
    }

    if(powerId.length==0)
    {
        var data={
            "power_json":null
        }
    }
    else {
        var data = {
            "power_json": powerId
        }
    }
    zhput("/rs/member" + "/" + id, data).then(saveResult);
}

function saveResult(result) {
        if (result.err) {
            showError(result.err);
        } else{/*
            $('#userModal').modal('hide');
            queryList();*/
            history.go(-1)
            showSuccess('保存成功！');
        }
}
