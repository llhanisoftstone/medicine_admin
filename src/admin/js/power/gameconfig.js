/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/game_config';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
var leveljson=[];//关卡json数据
$(function(){
    getstorename();
    compid = getCookie('storeid');
    id=getQueryString("pid");
    if(id==''||id==null){
        operation = "add";
    }else{
        operation = "modify";
        getGoodsById(id);
    }
    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
    $('#ticketname').on('click',function(){
        var store=$('#storename').val()
        if(!store || store=='-1'){
            return showError('请先选择店铺');
        }
    })
    //关卡重置
    $('#resetSaveBtn').on('click',function(){
        $("#gamesAddForm")[0].reset();
        resetAddForms();
    })

});
function back(){
    history.go(-1);
}
function onUploadDetailPic(formObject, fileComp, list) {
    var attrs = fileComp.attr("refattr");
    if(list.length > 0 && list[0].code == 200){
        var sAttachUrl = list[0].url;
        $("#"+attrs, formObject).val(sAttachUrl);
    }
}
//获取店铺
function getstorename(store_id){
    $("#storename").html("");
    var data={
        status:'1'
    };
    zhget('/rs/store',data).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                if(store_id==result.rows[i].id){
                    html+="<option value='"+result.rows[i].id+"' selected='selected'>"+result.rows[i].name+"</option>"
                }else{
                    html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
                }
            }
            $("#storename").append(html);
        }
        //getticketinfo();
    })
}
function getTickets(){
    var id=$('#storename').val();
    if(id =='-1'){
        $("#ticketname").html("");
    }else{
        getticketinfo(id);
    }
}
function getticketinfo(storeid,tid){
    $("#ticketname").html("");
    var data={
        status:'<>,99'
    };
    if(storeid){
        data.store_id=storeid;
    }
    zhget('/rs/ticket',data).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                if(tid==result.rows[i].id){
                    html+="<option value='"+result.rows[i].id+"' data-name='"+result.rows[i].name+"' selected='selected'>"+result.rows[i].name+"</option>"
                }else{
                    html+="<option value='"+result.rows[i].id+"' data-name='"+result.rows[i].name+"'>"+result.rows[i].name+"</option>"
                }
            }
            $("#ticketname").append(html);
        }
    })
}
//是否显示优惠券
function showTickets(){
    var status=$('#isTicket').val();
    if(status==1){
        $('.isTicketShow').hide();
    }else{
        $('.isTicketShow').show();
    }
}
//重置添加表单
function resetAddForms(){
    var level=$('#level');
    level.val('');
    var len=leveljson.length;
    if(len==0){
        level.val('第1关');
        level.attr('data-level',1);
    }else{
        len+=1;
        level.val('第'+len+'关');
        level.attr('data-level',len);
    }
    var status=$('#isTicket').val();
    if(status==1){
        $('.isTicketShow').hide();
    }else{
        $('.isTicketShow').show();
    }
}
//显示添加礼物表单
function addgames(){
    resetAddForms();
    $('#gamesAddForm').animate({
        height : 'toggle',
        opacity : 'show'
    }, "slow");
}
//保存单个关卡
var tempresult={
    rows:[{
        level_json:[]
    }]
};
function levelsAdd(){
    var levelobj={};//单个关卡json数据
    var max_step=$.trim($("#max_step").val());
    if(!max_step||max_step.trim()==""){
        $("#max_step").focus();
        return showError("请输入答题数量");
    }
    var level=$('#level').attr('data-level');
    levelobj.level=level;
    levelobj.max_step=max_step;
    var status=$('#isTicket').val();//是否有礼物/券
    if(status==2){
        var storename=$('#storename').val();
        var ticket_id=$('#ticketname').val();
        var name=$('#ticketname option:selected').attr('data-name');
        if(!storename || storename=='-1'){
            return showError('请选择店铺');
        }
        if(!ticket_id || ticket_id=='-1'){
            return showError('请选择优惠券');
        }
        var reward=[];
        reward.push(
            {
                category: "ticket",
                name:name,
                id: ticket_id,
                store_id: storename
            }
        );
        levelobj.reward=reward;
    }
    if(leveledit){
        for(var key in leveljson){
            if(leveljson[key].level==level){
                leveljson[key]=levelobj;
            }
        }
    }else{
        leveljson.push(levelobj);
    }
    tempresult.rows[0].level_json=leveljson;
    setDeleteStatus(leveljson)
    buildTableNoPage(tempresult, 'answer-template', 'answer');
    $('#gamesAddForm').animate({
        height : 'toggle',
        opacity : 'show'
    }, "slow");
    $("#gamesAddForm")[0].reset();
}
var leveledit=false;//子关卡是否为编辑
function onLevelUpdate(level,max_step,reward){
    leveledit=true;
    $("#max_step").val(max_step);
    $('#level').val('第'+level+'关')
        .attr('data-level',level);
    if(reward){
        $('#isTicket').val(2);
        for(var key in leveljson){
            if(leveljson[key].level==level){
                reward=leveljson[key].reward;
            }
        }
        var storeid=reward[0].store_id;
        var ticketid=reward[0].id;
        $('#storename').val(storeid);
        getticketinfo(storeid,ticketid);//设定ticket
        $('.isTicketShow').show();
    }else{
        $('#isTicket').val(1);
        $('.isTicketShow').hide();
    }
    $('#gamesAddForm').animate({
        height : '100%',
        opacity : 'show'
    }, "slow");
}
function setDeleteStatus(leveljson){
    if(leveljson){
        for(var key in leveljson){
            var len=leveljson.length-1;
            leveljson[len].deleteStatus=true;
        }
    }
}
function onLevelDelete(id,level){
    if(confirm('您确定要删除该关卡吗？')){
        for(var key in leveljson){
            if(leveljson[key].level==level){
                leveljson.splice(key,1)
            }
        }
        tempresult.rows[0].level_json=leveljson;
        setDeleteStatus(leveljson)
        buildTableNoPage(tempresult, 'answer-template', 'answer');
    }
}
//获取对象个数
function getObjLength(_obj){
    return Object.getOwnPropertyNames(_obj).length;
}
//根据id查询产品数据
function getGoodsById(id){
    $.showActionLoading();
    zhget(base_url_goods+"/"+id,{}).then(function(result) {
        $.hideActionLoading();
        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#title_pic").val(result.rows[0].picpath);
        $("#sale_price").val(result.rows[0].price);
        leveljson=result.rows[0].level_json;
        $("#order_code").val(result.rows[0].order_code);
        setDeleteStatus(leveljson)
        buildTableNoPage(result, 'answer-template', 'answer');
    });
}
function saveData(){
    var name=$.trim($("#name").val());
    if(!name||name.trim()==""){
        showError("请输入关卡名称");
        return;
    }
    var title_pic=$.trim($("#title_pic").val());
    if(!title_pic||title_pic.trim()==""){
        showError("请上传图片");
        return;
    }
    var price_leaguer=$.trim($("#sale_price").val());
    if(price_leaguer == "" || price_leaguer<0){
        showError("请输入价格！");
        return;
    }
    if(leveljson.length==0 || isEmptyObject(leveljson)){
        showError("请配置关卡信息");
        return;
    }
    var order_code=$.trim($("#order_code").val());
    if(!order_code||order_code.trim()==""){
        showError("请输入排序序号");
        return;
    }
    var urldata={
        name:name,
        picpath:title_pic,
        price:price_leaguer,
        level_json:leveljson,
        order_code:order_code
    };
    saveData=null;
    if (operation == "add") {
        urldata.auto_id="1";
        $.showActionLoading();
        zhpost(base_url_goods,urldata).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                location.href="admin.html#pages/gamelist.html";
            }
        });
    } else {
        var id = $("#id").val();
        console.log('修改操作>>>>>>>>>>>');
        zhput(base_url_goods + "/" + id, urldata).then(function(result) {
            if(checkData(result,'put')) {
                location.href="admin.html#pages/gamelist.html";
            }
        });
    }
}



