/**
 * Created by Administrator on 2017/9/1.
 */
var base_url_notification="/rs/activity";
var postoff=false;
var city_zone = '/rs/city_zone';
var city="-1";
var zone="-1";
var base_url_staff = '/rs/enter_staff';  // 员工
var currentPageNo = 1;
var pageRows = 10;
var enter_id; //企业id
var cateType=0; //参与类型
var isSearch=false; //是否为查询
$(document).ready(function(){
    enter_id=getCookie('compid') || sessionStorage.getItem("compid");
    getprovince(); //获得省份信息
    $.initSystemFileUpload($("#anniverReport"), onUploadDetailPic);
    UE.getEditor('userProtocolAddUE');
     setTimeout(function(){
         modifyNotificationData();
     },200)
    if($("#l-map").length > 0){
        $("#l-map").hide();
        $("#zone").on("change", function(){
            $("#l-map").show();
            createMap($("#province").find("option:selected").text()+$("#cityname").find("option:selected").text()+$("#zone").find("option:selected").text());
        });
    };

    $("#fanBtn").bind("click",function () {
        window.history.go(-1)
    })
})
// 图片上传
function onUploadDetailPic(formObject, fileComp, list)
{
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}

function getprovince(province_id,areaData){
    zhget(city_zone,{deep:1}).then(function (result) {
        if(result.code==200) {
            var h = '<option value="-1">请选择</option>'
            for (var i = 0; i < result.rows.length; i++) {
                if(province_id==result.rows[i].id){
                    h += "<option selected='selected' value='" + result.rows[i].id + "'>" + result.rows[i].name + "</option>"
                }else{
                    h += "<option value='" + result.rows[i].id + "'>" + result.rows[i].name + "</option>"
                }
            }
            $("#province").html(h)
            if(areaData){
                getcity(province_id,areaData.city_id,areaData.zone_id)
            }
        }
    })
}
function getcity(id,city,zone){
    zhget(city_zone,{deep:2,pid:id}).then(function (result) {
        if(result.code==200) {
            var h = '<option value="-1">请选择</option>'
            for (var i = 0; i < result.rows.length; i++) {
                h += "<option value='" + result.rows[i].id + "'>" + result.rows[i].name + "</option>";
            }
            $("#cityname").html(h)
            if (city&&city != '-1') {
                $("#cityname").val(city);
                getzone(city, zone)
            }else{
                $("#cityname").val("-1")
                $("#zone").html("<option value='-1'>请选择</option>")
            }
        }
    })
}
function getzone(id,zone){
    zhget(city_zone,{deep:3,pid:id}).then(function (result) {
        if(result.code==200) {
            var h = '<option value="-1">请选择</option>';
            for (var i = 0; i < result.rows.length; i++) {
                h += "<option value='" + result.rows[i].id + "'>" + result.rows[i].name + "</option>";
            }
            $("#zone").html(h)
            if (zone&&zone != '-1') {
                $("#zone").val(zone);
                createMap($("#province").find("option:selected").text()+$("#cityname").find("option:selected").text()+$("#zone").find("option:selected").text());
                $("#l-map").show();
            }else{
                $("#zone").val("-1")
            }
        }
    })
}
$("#province").change(function(){
    $("#cityname").html("<option value='-1'>请选择</option>")
    $("#zone").html("<option value='-1'>请选择</option>")
    getcity($(this).val())
})
$("#cityname").change(function(){
    $("#zone").html("<option value='-1'>请选择</option>")
    getzone($(this).val())
})
$("#cityname").on('click',function(){
    var province=$('#province').val();
    if(province==-1){
        layer.msg('请先选择省')
    }
});
$("#zone").on('click',function(){
    var province=$('#cityname').val();
    if(province==-1){
        layer.msg('请先选择市')
    }
});

// 员工列表
function queryList() {
    var data={
        page: currentPageNo,
        size: pageRows,
        enterp_id:enter_id
    };
    if(isSearch){
        data.search=1;
        var name=$('#searchVal').val();
        name=$.trim(name);
        if(name!=''){
            data.name=name;
        }
    }
    if(cateType==2){    //员工
        zhget(base_url_staff, data).then( function(result) {
            if(checkData(result,'get','queryList','table-responsive','paginator')) {
                integrals = result.rows;
                for (var i = 0; i < integrals.length; i++) {
                    var indexCode = integrals[i];
                    indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                }
                buildTable(result, 'user-template', 'user-placeholder');
                setCheckBox()   //设置选中项
            }
        });
    }if(cateType==1){  //部门
        data.status=1;
        zhget('/rs/department', data).then( function(result) {
            if(checkData(result,'get','queryList','table-responsive','paginator')) {
                integrals = result.rows;
                for (var i = 0; i < integrals.length; i++) {
                    var indexCode = integrals[i];
                    indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
                    indexCode.dep_name=indexCode.name;
                    indexCode.toggle_hide='toggle_hide';
                }
                buildTable(result, 'user-template', 'user-placeholder');
                setCheckBox()   //设置选中项
            }
        });
    }
}
//参与人员选择模块 ***代码开始
var person={
    rows:[]
};    //参与人员
var category=0;    //参与类型,0全部，1部门，2人员

$('#user-placeholder').on('change','.checkperson',function(e){
    var $tar=$(e.target);
    var check=$tar.prop('checked');  //选中还是取消
    var obj={};
    var name=$tar.attr('data-name');
    var depname=$tar.attr('data-depname');
    var staffid=$tar.attr('data-id');
    var depid=$tar.attr('data-depid');
    if(check){
        obj={
            id:staffid,
            name:name,
        };
        person.rows.unshift(obj)
        renderSelect();
    }else{
        $("#span"+staffid).remove()
        deleteItem(staffid);
    }

});

$('#checkedgoodsList').on('click','.remove-element',function(e){
    var $tar=$(e.target);
    var name=$tar.attr('data-name');
    layer.confirm('确定要删除 <span style="font-weight: bold;">'+name+'</span> 吗？', {
        title:'删除确认',
        btn: ['确定','取消'] //按钮
    }, function(index){
        layer.close(index);
        $tar.parent('span').remove()
        var staffid=$tar.attr('data-id');
        $("#check"+staffid).attr("checked",false)
        deleteItem(staffid);
    });

})
function renderSelect(){
    if(person ){
        buildTableNoPage(person, 'checked-template', 'checkedgoodsList');
    }
}
//删除某一项
function deleteItem(id){
    var arr=person.rows;
    for(var i=0,len=arr.length;i<len;i++){
        if(arr[i].id==id){
            person.rows.splice(i,1);
            break;
        }
    }
}
//参与类型
function categoryChange(){
    var cate=$('#parttype').val();
    cateType=cate;
    $('#checkedgoodsList').html('');
    person.rows=[];
    if(cate==0){//全部
        $('#partPerson').hide();
        $('#emploee-box').hide();
    }else if(cate==1){ //部分部门
        queryList();
        $('.choseLabel').html('参与部门');
        $('#staff-name').hide();
        $('#partPerson').show();
    }else if(cate==2){ //部分人员
        queryList();
        $('.choseLabel').html('参与人员');
        $('#staff-name').show();
        $('#partPerson').show();
    }
}

//切换显示
function showUserTable(){
    $("#emploee-box").animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
    setCheckBox();
}
//设置选中项
function setCheckBox(){
    if(person &&person.rows){
        var itemArr=person.rows;
        for(var k=0,len=itemArr.length;k<len;k++){
            $("#check"+itemArr[k].id).attr("checked",true)
        }
    }
}
//参与人员选择模块 ***代码结束

//返回
function backNotification(){
    window.location.href="admin.html#pages/activity_management.html";
}

//保存数据
function saveActivityData(status){
    var json=$('#activityForm').form2json();
    delete json['picfile[]'];
    if($.trim(json.name)==''){
        layer.msg('请输入活动名称', {
            icon:2
        });
        return;
    }
    if($.trim(json.pic_path)==''){
        layer.msg('请上传列表图', {
            icon:2
        });
        return;
    }
    if(json.province_id==-1){
        layer.msg('请选择省', {
            icon:2
        });
        return;
    }
    if(json.city_id==-1){
        layer.msg('请选择市', {
            icon:2
        });
        return;
    }
    if(json.zone_id==-1){
        layer.msg('请选择区', {
            icon:2
        });
        return;
    }
    if($.trim(json.address)==''){
        layer.msg('请输入活动详细地址', {
            icon:2
        });
        return;
    }
    if($.trim(json.longitude)==''){
        layer.msg('请选择经度', {
            icon:2
        });
        return;
    }
    if($.trim(json.latitude)==''){
        layer.msg('请选择纬度', {
            icon:2
        });
        return;
    }
    if(json.scope==-1){
        layer.msg('请选择打卡范围', {
            icon:2
        });
        return;
    }
    if(json.pic_count==-1){
        layer.msg('请选择上传现场照次数', {
            icon:2
        });
        return;
    }
    var startTime=json.start_time;
    var endTime=json.end_time;

    if(startTime==""||startTime==null){
        layer.msg('请选择开始时间', {
            icon:2
        });
        return;
    }
    if(endTime==""||endTime==null){
        layer.msg('请选择结束时间', {
            icon:2
        });
        return ;
    }
    var date1 = new Date(startTime);
    var date2= new Date(endTime);
    var date3=new Date();
    if(date2.getTime() < date1.getTime()){
        layer.msg('开始时间不能晚于结束时间', {
            icon:2
        });
        return ;
    }
    if(date2.getTime()<date3.getTime()){
        layer.msg('结束时间不能晚于当前时间', {
            icon:2
        });
        return ;
    }
    if(json.category==-1){
        layer.msg('请选择参与类型', {
            icon:2
        });
        return;
    }
    if(cateType==1 && person.rows.length==0 ){//部分部门
        layer.msg('请选择参与部门', {
            icon:2
        });
        return;
    }
    if(cateType==2 && person.rows.length==0){//部分人员
        layer.msg('请选择参与人员', {
            icon:2
        });
        return;
    }
    if(cateType==1 ){
        //部门时 department_ids  逗号分隔
        var items=[];
        var item=person.rows;
        for(var k=0,len=item.length;k<len;k++){
            items.push(item[k].id)
        }
        items=items.toString();
        json.department_ids=items;
    }
    if(cateType==2){
        //员工时，staff_ids    数组对象 [{id:222}]
        var items=[];
        var item=person.rows;
        for(var j=0,len=item.length;j<len;j++){
            items.push(
                {
                    id:item[j].id
                }
            )
        }
        json.staff_ids=items;
    }

    var details = UE.getEditor('userProtocolAddUE').getContent();
    if(details.trim()==""||details==null){
        layer.msg('请输入培训简介', {
            icon:2
        });
        return;
    }
    json.details=details;
    json.status=status;
    json.enter_id=enter_id;

    var id=getIdByUrl();
    if(postoff){
        return;
    }
    postoff=true;

    var loadIndex = layer.load(2, {time: 10*1000}); //最长等待10秒
    if(id==""||id==null){
        zhpost(base_url_notification,json).then(function(result){
            layer.close(loadIndex);
            if(result.code==200){
                setTimeout(function(){
                    postoff=false;
                },1000);
                layer.msg('保存成功', {
                    icon:1,
                    time: 4000
                });
                backNotification()
            }else if(result.code >= 700){
                layer.msg(result.message, {
                    icon:2,
                    time: 4000
                });
            }else{
                setTimeout(function(){
                    postoff=false;
                },1000);
                layer.msg('保存失败', {
                    icon:2,
                    time: 4000
                });
            }
        })
    }else{
        zhput(base_url_notification+"/"+id,json).then(function(result){
            layer.close(loadIndex);
            if(result.code==200){
                backNotification();
                setTimeout(function(){
                    postoff=false;
                },1000);
                layer.msg('修改成功', {
                    icon:1,
                    time: 4000
                });
            }else if(result.code >= 700){
                layer.msg(result.message, {
                    icon:2,
                    time: 4000
                });
            }else{
                setTimeout(function(){
                    postoff=false;
                },1000);
                layer.msg('修改失败', {
                    icon:2,
                    time: 4000
                });
            }
        })
    }
}

function modifyNotificationData(){
    var id=getIdByUrl();
    if(id){
    zhget(base_url_notification + "/" + id).then(function (result) {
        if (result.code == 200) {
            var notifiData = result.rows[0];
            $("#notititle").val(notifiData.name)
            $("#title_pic3").val(notifiData.pic_path)
            var areaData={
                city_id:notifiData.city_id,
                zone_id:notifiData.zone_id
            };
            getprovince(notifiData.province_id,areaData);  //设置省 市 区
            //设置参与人员或部门 --开始
            cateType=notifiData.category;  //参与类型
            /*var res_items=result.items;
            var res_person={
                rows:[]
            };
            for(var j=0,len=res_items.length;j<len;j++){
                res_person.rows.push({
                    id:res_items[j].target_id,
                    name:res_items[j].name,
                })
            }
            person=res_person;*/

            person.rows=result.items;
            renderSelect();
            if(cateType==0){//全部
                $('#partPerson').hide();
                $('#emploee-box').hide();
            }else if(cateType==1){ //部分部门
                queryList();
                $('.choseLabel').html('参与部门');
                $('#staff-name').hide();
                $('#partPerson').show();
            }else if(cateType==2){ //部分人员
                queryList();
                $('.choseLabel').html('参与人员');
                $('#staff-name').show();
                $('#partPerson').show();
            }
            //设置参与人员或部门 --结束

            $("#address").val(notifiData.address)
            $("#latitude").val(notifiData.latitude)
            $("#longitude").val(notifiData.longitude)

            $("#category").val(notifiData.scope)
            $("#times").val(notifiData.pic_count)
            $("#startTime").val(notifiData.start_time);
            $("#endTime").val(notifiData.end_time);
            $("#parttype").val(notifiData.category);
            UE.getEditor('userProtocolAddUE').setContent(notifiData.details);

        }
    })
    }
}
$('#GiftCardSearchCancel').off('click')
$('#GiftCardSearchCancel').on('click',function(){
    $('#searchVal').val('');
    isSearch=false;
    queryList();
});
$('#GiftCardSearch').off('click')
$('#GiftCardSearch').on('click',function(){
    isSearch=true;
    queryList();
});