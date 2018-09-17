/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/game_config';
var base_url_getconfig='/rs/v_game_config';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
var leveljson=[];//关卡json数据
var rule_id; //配置规则表id
var edit='';
$(function(){
    getstorename();
    compid = getCookie('storeid');
    id=getQueryString("pid");
    edit=getQueryByName("edit");
    console.log(edit)
    if(edit==1){
        $('#storename').attr("disabled","disabled");
        $('#ticketname').attr("disabled","disabled");
    }else{
        $('#storename').removeAttr("disabled");
        $('#ticketname').removeAttr("disabled");
    }
    if(!id || id==''||id==null){
        operation = "add";
    }else{
        operation = "modify";
        getGoodsById(id);
    }
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
            $("#storename").append(html)
                .selectpicker({
                    size: 10,
                    width:'100%'
                });
        }
    })
}
function getTickets(){
    var tid=$('#storename').val();
    if(tid =='-1'){
        $("#ticketname").html("<option value='-1'>请选择</option>");
    }else{
        getticketinfo(tid);
    }
}
function getticketinfo(storeid,tid){
    $("#ticketname").html("");
    var data={
        // status:2, //审核通过的
        // type:2,
        // ticket_status:'<>,99'
        order: 'ticket_id desc'
    };
    if(storeid){
        data.store_id=storeid;
    }
    zhget('/rs/v_ticket_send_detail_group_by',data).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                if(tid==result.rows[i].ticket_id){
                    html+="<option value='"+result.rows[i].ticket_id+"' data-name='"+result.rows[i].name+"' data-amount='"+result.rows[i].amount+"' sale_amount='"+result.rows[i].sale_amount+"' send_amount='"+result.rows[i].send_amount+"'  data-type='"+result.rows[i].type+"' selected='selected'>"+result.rows[i].name+"</option>"
                }else{
                    html+="<option value='"+result.rows[i].ticket_id+"' data-name='"+result.rows[i].name+"' data-amount='"+result.rows[i].amount+"' sale_amount='"+result.rows[i].sale_amount+"' send_amount='"+result.rows[i].send_amount+"' data-type='"+result.rows[i].type+"'>"+result.rows[i].name+"</option>"
                }
            }
        }else if(result.code==602){
            html+="<option value='-1'>请选择</option>";
        }
        $("#ticketname").append(html);
        setAmount();
    })
}
//获取到优惠券信息后，设置库存数量，并检查该优惠券之前是否被设置过
function afterGetTicket(){
    clearInfo();
    setAmount()
    var ticktetid=$('#ticketname option:selected').val();
    if(ticktetid!=-1){
        getOldTicketInfo(ticktetid)
    }
}
function setAmount(){
    var ticktetid=$('#ticketname option:selected').val();
    if(ticktetid!=-1){
        var amount=$('#ticketname option:selected').attr('data-amount');
        var sale_amount=$('#ticketname option:selected').attr('sale_amount');
        var send_amount=$('#ticketname option:selected').attr('send_amount');
        amount=parseInt(amount);
        sale_amount=parseInt(sale_amount);
        send_amount=parseInt(send_amount);
        var countNum;
        if(amount!=0){
            countNum=amount-send_amount;
            $('#count').val(countNum);
        }else{
            countNum=sale_amount-send_amount;
            $('#count').val(countNum);
        }
    }
}
function clearInfo(){
    $('#tips').html('').hide();
        operation = "add";
        $('#count').val('');
        $('#order_code').val('');
        $('#startTime').val('');
        $('#endTime').val('');
        $('#max_step').val('');
        leveljson=[];
}
//检查该优惠券之前是否被设置过
function getOldTicketInfo(tid){
    var data={};
    if(!tid || tid==-1){
        return;
    }else{
        data.ticket_id=tid;
    }
    zhget(base_url_getconfig,data).then(function(result){
        if(result.code==200){
            $('#tips').html('该优惠券/产品已设置过，将直接修改该关卡配置').show();
            operation = "modify";
            id=result.rows[0].id;
            $("#id").val(id)
            $('#order_code').val(result.rows[0].order_code);
            $('#startTime').val(result.rows[0].strat_time);
            $('#endTime').val(result.rows[0].end_time);
            leveljson=result.rows[0].level_json;
            $('#max_step').val(leveljson[0].max_step);
        }else if(result.code==602){
            if(edit==1){
                operation = "modify";
            }else{
                operation = "add";
            }
        }
        console.log(operation)
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
    zhget(base_url_getconfig+"/"+id,{}).then(function(result) {
        $.hideActionLoading();
        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#max_step").val(result.rows[0].level_json[0].max_step);
        $("#order_code").val(result.rows[0].order_code);
        $("#startTime").val(result.rows[0].strat_time);
        $("#endTime").val(result.rows[0].end_time);
        //$("#title_pic").val(result.rows[0].picpath);
        $("#sale_price").val(result.rows[0].price);
        setTimeout(function () {
            $("#storename").selectpicker('val',result.rows[0].store_id);
            getticketinfo(result.rows[0].store_id,result.rows[0].ticket_id);
        },500)
        leveljson=result.rows[0].level_json;
    });
}
function saveGameData(){
    // var name=$.trim($("#name").val());
    // if(!name){
    //     showError("请输入关卡名称");
    //     return;
    // }
    var storename=$('#storename').val();
    var ticket_id=$('#ticketname').val();
    var type=$('#ticketname option:selected').attr('data-type');
    if(!storename || storename=='-1'){
        return showError('请选择店铺');
    }
    if(!ticket_id || ticket_id=='-1'){
        return showError('请选择优惠券');
    }
    var max_step=$.trim($("#max_step").val());
    if(!max_step){
        return showError("请输入答题数量");
    }
    var order_code=$.trim($("#order_code").val());
    if(!order_code &&order_code!=0){
        return showError("请输入顺序");
    }
    var startTime=$("#startTime").val();
    var endTime=$("#endTime").val();
    if(startTime!=''&& endTime!==''){
        if(startTime>endTime){
            return showError("结束时间不能早于开始时间")
        }
    }else if(startTime!='' && endTime==''){
        return showError('请选择结束时间');
    }else if(endTime!='' && startTime==''){
        return showError('请选择开始时间');
    }
    // var price_leaguer=$.trim($("#sale_price").val());
    // if(price_leaguer == "" || price_leaguer<0){
    //     showError("请输入价格");
    //     return;
    // }

    var levelobj={};//单个关卡json数据
    var reward=[];
    var category='';
    if(type==2){
        category='ticket';//数据库要求优惠券存ticket
    }else if(type==3){
        category='goods';//实物存goods
    }
    reward.push(
        {
            id: ticket_id,
            category:category,
        }
    );
    levelobj.reward=reward;
    levelobj.level='1';//优惠券写死只有一关
    levelobj.max_step=max_step;
    if(operation == "modify"){
        for(var key in leveljson){
            if(leveljson[key].level==1){
                leveljson[key]=levelobj;
            }
        }
    }else{
        leveljson.push(levelobj);
    }
    var urldata={
        ticket_id:ticket_id,
        strat_time:startTime,
        end_time:endTime,
        order_code:order_code,
        level_json:leveljson
    };
    if(startTime==''&& endTime=='' && operation == "modify"){
        urldata.deltime=1;
    }
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



