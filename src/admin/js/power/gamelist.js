
var base_url_goodsCategory='/rs/game_config';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
$(function() {
    getstorename()//获取店铺列表
    queryList();
    $("#searchDataBtn", $(".reasonRefund")).bind("click", searchbtn);
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    $("#resetSaveBtn", $(".reasonRefund")).bind("click", function(){
        $("#userAddForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    $("#userAddcategory", $(".reasonRefund")).unbind("click");
    $("#userAddcategory", $(".reasonRefund")).bind("click", onSavecategoryData);

});

function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'status asc, create_time desc',
        status:'<>,99'
    }
    if(issearchModel){
        data.search=1;
        var name=$("#searchstorename").val();
        var ticket_id=$('#searchticketname').val();
        if(name && name !='-1'){
            data.store_id=name;
        }
        if(ticket_id && ticket_id !='-1'){
            data.ticket_id=ticket_id;
        }
        var startTime=$("#startTimesearch").val();
        var endTime=$("#endTimesearch").val();
        if(startTime!=''||endTime!==''){
            if(startTime!=''&&endTime!==''){
                if(startTime<endTime){
                    data.strat_time='>=,'+startTime;
                    data.end_time='<=,'+endTime
                }else{
                    showError("结束时间不能大于开始时间")
                    return
                }
            }else{
                if(startTime){
                    data.strat_time='>=,'+startTime
                }
                if(endTime){
                    data.end_time='<=,'+endTime
                }
            }
        }
        var status=$('#status').val();
        if(status && status !='-1'){
            data.status=status;
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
function onSavecategoryData(){
    var name=$("#storename").val();
    var modelid=$("#storename").attr("_id");
    var order=$('#order_code').val().trim();
    var ticket_id=$('#ticketname').val();
    if(!name || name=='-1'){
        showError('请选择店铺');
        return;
    }
    if(!ticket_id || ticket_id=='-1'){
        showError('请选择优惠券');
        return;
    }
    if(!order){
        showError('请输入顺序');
        return;
    }
    var startTime=$("#startTime").val();
    var endTime=$("#endTime").val();
        if(startTime!=''&& endTime!==''){
            if(startTime>endTime){
                showError("结束时间不能早于开始时间")
                return
            }
        }else{
            showError('请选择有效期');
            return;
        }

    if(modelid=="" || modelid==null || modelid==undefined){
        var add_data={
            ticket_id:ticket_id,
            // auto_id:1
        };
        if(order){
            add_data.order_code=order;
        }
        if(startTime){
            add_data.strat_time=startTime;
        }
        if(endTime){
            add_data.end_time=endTime;
        }
        zhpost(base_url_goodsCategory,add_data).then(function(result){
            if(checkData(result,'post')){
                resetinput();
                $(".addModels").hide();
                queryList()
            }
        })
    }else{
        var editdata={
            ticket_id:ticket_id,
        };
        if(order){
            editdata.order_code=order;
        }
        if(startTime){
            add_data.strat_time=startTime;
        }
        if(endTime){
            add_data.end_time=endTime;
        }
        zhput(base_url_goodsCategory+"/"+modelid,editdata).then(function(result){
            if(checkData(result,'put')){
                $(".addModels").hide();
                $("#storename").removeAttr("_id");
                resetinput();
                queryList()
            }
        })
    }
}

function getstorename(){
    $("#storename").html("");
    $("#searchstorename").html("");
    var data={
        status:'1'
    };
    zhget('/rs/store',data).then(function(result){
        var html="";
        if(result.code==200){
            html+="<option value='-1'>请选择</option>";
            for(var i=0;i<result.rows.length;i++){
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#storename").append(html);
            $("#searchstorename").append(html);
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
function getticketinfo(storeid){
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
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#ticketname").append(html);
        }
    })
}
//查询项
function getsearchTickets(){
    var id=$('#searchstorename').val();
    if(id =='-1'){
        $("#searchticketname").html("");
    }else{
        getsearchticketinfo(id);
    }
}
//查询项
function getsearchticketinfo(storeid){
    $("#searchticketname").html("");
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
                html+="<option value='"+result.rows[i].id+"'>"+result.rows[i].name+"</option>"
            }
            $("#searchticketname").append(html);
        }
    })
}

function showSearchPage() {
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function addGoodsModels(dom){
    location.href="admin.html#pages/gameconfig.html";
    // $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    // $("#userAddForm", $(".reasonRefund"))[0].reset();
    // $(".addModels", $(".reasonRefund")).animate({
    //     height : 'show',
    //     opacity : 'show'
    // }, "slow");
    // $("#storename").attr("_id","");
}

function onUpdateClick(id,read) {
    if(read=='read'){
        location.href="admin.html#pages/gameconfig.html?pid="+id+'&read=read';
    }else{
        location.href="admin.html#pages/gameconfig.html?pid="+id;
    }

    // getticketinfo(store_id);
    // $("#storename").attr("_id",id);
    // $("#storename").val(store_id);
    // $("#order_code").val(order);
    // $("#startTime").val(strat_time);
    // $("#endTime").val(end_time);
    // setTimeout(function(){
    //     $("#ticketname").val(ticket_id);
    // },300)
    // $(".reasonSearch", $(".reasonRefund")).css("display", "none");
    // $(".addModels", $(".reasonRefund")).animate({
    //     height : 'show',
    //     opacity : 'show'
    // }, "slow");
}

function enableClick(id) {
    if (confirm("确定要启用该优惠券吗？")) {
        zhput(base_url_goodsCategory + "/" + id,{status:1}).then(function (result) {
            checkData(result, 'put');
            if($("#goodsModel-placeholder").find("tr").length == 1){
                currentPageNo = currentPageNo>1?currentPageNo-1:1
            }
            queryList()
        })
    }
}
function disableClick(id) {
    if (confirm("确定要禁用该优惠券吗？")) {
        zhput(base_url_goodsCategory + "/" + id,{status:2}).then(function (result) {
            checkData(result, 'put');
            if($("#goodsModel-placeholder").find("tr").length == 1){
                currentPageNo = currentPageNo>1?currentPageNo-1:1
            }
            queryList()
        })
    }
}
//重置
function resetinput(){
    $("#userAddForm", $(".reasonRefund"))[0].reset();
}

//搜索
function searchbtn(){
    currentPageNo=1;
    issearchModel=true;
    queryList();
}


Handlebars.registerHelper("getindex", function (v1, options) {
    return v1+1;
});
Handlebars.registerHelper('priceformat', function(v1, options) {
    if(!v1){
        return 0;
    }
    if(v1<10000){
        return v1;
    }else{
        return parseFloat(parseInt(v1)/10000).toFixed(2)+'万';
    }
});
