
var base_url_goodsCategory='/rs/game_config';
var base_url_getconfig='/rs/v_game_config';
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
        $('#ticketname').html('');
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    $("#resetSaveBtn", $(".reasonRefund")).bind("click", function(){
        $("#userAddForm", $(".reasonRefund"))[0].reset();
        queryList();
    });

    $('#ticketname').on('click',function(){
        var store=$('#storename').val()
        if(!store || store=='-1'){
            return showError('请先选择店铺');
        }
    })
});

function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'status asc, create_time desc',
        id:'>,10',
        status:'<>,99'
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        var storename=$("#storename").val();
        var ticket_id=$('#ticketname').val();
        if(name){
            data.name=name;
        }
        if(storename && storename !='-1'){
            data.store_id=storename;
        }
        if(ticket_id && ticket_id !='-1'){
            data.ticket_id=ticket_id;
        }
        var status=$('#status').val();
        if(status && status !='-1'){
            data.status=status;
        }
        var startTime=$("#startTime").val();//上架时间
        var endTime=$("#endTime").val();//下架时间
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
        var startTimesearch=$("#startTimesearch").val();//创建时间开始
        var endTimesearch=$("#endTimesearch").val();//创建时间结束
        if(startTimesearch!=''||endTimesearch!==''){
            if(startTimesearch!='' && endTimesearch!==''){
                if(startTimesearch < endTimesearch){
                    data.create_time='>,'+startTimesearch+',<,'+endTimesearch
                }else{
                    return showError("结束时间不能大于开始时间")
                }
            }else{
                if(startTimesearch){
                    data.create_time='>,'+startTimesearch
                }
                if(endTimesearch){
                    data.create_time='<,'+endTimesearch
                }
            }
        }

    }
    zhget(base_url_getconfig,data).then(function (result) {
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
/*
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
*/
function showSearchPage() {
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}
function addGoodsModels(dom){
    location.href="admin.html#pages/gameconfig.html";
}

function onUpdateClick(id,read) {
    if(read=='read'){
        location.href="admin.html#pages/gameconfig.html?pid="+id+'&read=read';
    }else{
        location.href="admin.html#pages/gameconfig.html?pid="+id;
    }
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
