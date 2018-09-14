
var base_url_getconfig='/rs/log_game_config';
var currentPageNo = 1;
var pageRows = 10;
var issearchModel=false;
var issearchValue=false;
var integrals;
$(function() {
    queryList();
    $("#searchDataBtn", $(".reasonRefund")).bind("click", searchbtn);
    $("#resetSearchBtn", $(".reasonRefund")).bind("click", function(){
        $('#ticketname').html("<option value='-1'>请选择</option>");
        $("#storename").selectpicker('val','-1');
        $("#reasonSearchForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
    $("#resetSaveBtn", $(".reasonRefund")).bind("click", function(){
        $("#userAddForm", $(".reasonRefund"))[0].reset();
        queryList();
    });
});

function queryList(){
    $("#ModelValueList").remove();
    $("#addNew").removeAttr("_modelId");
    var data={
        page: currentPageNo,
        size: pageRows,
        order:'create_time desc',
    }
    if(issearchModel){
        data.search=1;
        var name=$.trim($("#name").val());
        var nickname=$("#nickname").val();
        if(name){
            data.name=name;
        }
        if(nickname){
            data.nickname=nickname;
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


function showSearchPage() {
    $(".addModels", $(".reasonRefund")).css("display", "none");
    $(".reasonSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
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

function clickdetailset(id){
    zhget("/rs/log_game_config/"+id).then(function (result) {
        if (result.code == 200) {
            var html="";
            var list=result.rows[0].ps_json;
            html+="<tr><td>"+list.ticket_id+"</td><td>"+list.strat_time+"</td><td>"+list.end_time+"</td><td>"+list.order_code+"</td><td>"+list.level_json[0].max_step+"</td></tr>"
            $("#infotable").html(html);
            $('#myModalset').modal('show');

        }
    })
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
