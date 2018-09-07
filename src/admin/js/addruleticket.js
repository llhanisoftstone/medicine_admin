/**
 * Created by kechen on 2016/9/2.
 */
var base_url_goods = '/rs/ticket_send_rule';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid;
var id;
var u_id;
$(function(){
    compid = getCookie('storeid');
    shopselect();
    getmember();
    id=getQueryString("pid");
    if(id==''||id==null){
        operation = "add";
    }else{
        operation = "modify";
        getGoodsById(id);
    }

});
function back(){
    history.go(-1);
}
function getmember(){
    zhget('/rs/member',{store_id:compid,rank:20}).then(function(result){
        if(result.code==200){
            u_id=result.rows[0].id;
        }
    })
}
var selected1='';
function shopselect(goodscompid){
    var data={};
    data.status="1";
    data.store_id=compid;
    zhget('/rs/ticket',data).then(function(result){
        selected1=result;
        if(result.code==200) {
            buildTableNoPage(result, 'brand-template', 'goodscompid');
            initselect('goodscompid');
            $.hideActionLoading();
        }else{
            buildTableNoPage(result, 'brand-template', 'goodscompid');
            initselect('goodscompid');
            $.hideActionLoading();
        }
    })
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%',
        noneSelectedText : '请选择',
    });
}
//根据id查询产品数据
function getGoodsById(id){
    $.showActionLoading();
    zhget(base_url_goods+"/"+id,{}).then(function(result) {
        $.hideActionLoading();
        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#title_pic").val(result.rows[0].picurl);
        $("#sale_price").val(formatPriceFixed2(result.rows[0].price));
    });

}
var iModelsType=[];
var index=0;
function getrow1(){
    var trlength=$("#menu-placeholder").find("tr").length;
    if(trlength>0){
        var se1=$("#menu-placeholder").find("tr:last").children().eq(0).children().find("select").children();//select1元素集合
        var amount=$("#menu-placeholder").find("tr:last").children().eq(1).children();//数量
        iModelsType[0]={};
        iModelsType[0].se1=se1;
        iModelsType[0].index=$("#menu-placeholder").find("tr:last").children().eq(0).attr("_index");
        var dom1select=$("#menu-placeholder").find("tr:last").children().eq(0).children().find("select").find("option:selected").val();
        selected1=dom1select;
        iModelsType[0].amount=amount;
    }else{//当前产品没有规格
        var html='<tr><td  style="max-width: 160px;"><select  class="selectpicker" id="goodscompid" title="请选择" data-live-search ="true"></select></td>';
        html+="<td><input name='stock_count' placeholder='请输入' onkeyup='value=value.replace(/[^\d]/g,"+'""'+")'  class='form-control' maxlength='7'></td>";
        html+='<td style="text-align:center"><span class="btn-link" style="margin-top: 5px;display: block;cursor: pointer;padding-left: 13px;" onclick="onDeleteClick(this)">删除</span>';
        html+='</td></tr>';
        shopselect(goodscompid);
    }

}
function addrow(){
    getrow1();
    var trlength=parseFloat(iModelsType[0].index)+1;
    var html='<tr><td _index="'+trlength+'" style="max-width: 160px;"><select id="index'+trlength+'goodscompid" onchange="shopselect(this)" title="请选择" data-live-search="true" class="selectpicker">';
    for(var i=1;i<iModelsType[0].se1.length;i++){//新增select1
        if($(iModelsType[0].se1[i]).val()==selected1){
            html+='<option selected="selected" value='+$(iModelsType[0].se1[i]).val()+'>'+$(iModelsType[0].se1[i]).html()+'</option>';
        }else{
            html+='<option value='+$(iModelsType[0].se1[i]).val()+'>'+$(iModelsType[0].se1[i]).html()+'</option>';
        }
    }
    html+='</select></td>';
    html+="<td><input name='stock_count' placeholder='请输入' oninput=\"this.value=this.value.replace(/\\D/g,'')\"  class='form-control' maxlength='7'></td>";
    html+='<td style="text-align:center"><span class="btn-link" style="margin-top: 5px;display: block;cursor: pointer;padding-left: 13px;" onclick="onDeleteClick(this)">删除</span>';
    html+='</td></tr>';
    $("#menu-placeholder").append(html)
    initselect("index"+trlength+"goodscompid");
}
//删除产品
function onDeleteClick(dom){
    if($("#menu-placeholder tr").length!=1){
        $(dom).parent("td").parent("tr").remove();
    }else{
        showError('产品至少保存一个');
        return;
    }
}
function  saveData(){
    var urldata={
    };
    var goodsdata=[];
    //获取产品基本信息
    var title=$("#title").val().trim();
    if(title){
        urldata.title=title;
    }else{
        showError("请输入规则名称");
        return;
    }
    var type=$("#type").val()
    if(type&&type!="-1"){
        urldata.type=type;
    }else{
        showError("请选择类型");
        return;
    }
    var total_amount=$("#total_num").val().trim();
    if(total_amount){
        urldata.total_amount=total_amount;
    }else{
        showError("请输入数量");
        return;
    }
    var dtStartTime=$("#dtStartTime").val().trim();
    if(dtStartTime){
        urldata.start_time=dtStartTime;
    }else{
        showError("请选择开始时间");
        return;
    }
    var dtEndTime=$("#dtEndTime").val().trim();
    if(dtEndTime){
        var date1 = new Date(dtStartTime);
        var date2= new Date(dtEndTime);
        if(date2.getTime() < date1.getTime()){
            return showError("结束时间不能晚于开始时间");
        }else{
            urldata.end_time=dtEndTime;
        }
    }else{
        showError("请选择结束时间");
        return;
    }
    var doms=jQuery("#menu-placeholder tr");
    for(var i=0;i<doms.length;i++){
        goodsdata[i]={};
        goodsdata[i].ticket_id=$(doms[i]).children().eq(0).find("option:selected").val();
        if(goodsdata[i].ticket_id==''||goodsdata[i].ticket_id=='-1'){
            showError('请选择产品名称');
            return;
        }
        goodsdata[i].amount=$(doms[i]).children().eq(1).children("input").val();
        if(goodsdata[i].amount==""||goodsdata[i].amount==null){
            showError('请输入产品数量');
            return;
        }
    }
    $("#savebtn").attr("disabled","disabled");
    if (operation == "add") {
        urldata.auto_id=1;
        $.showActionLoading();
        zhpost(base_url_goods,{urldata:urldata,goodsdata:goodsdata}).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                location.href="admin.html#pages/ruleticket.html";
                $('#goodscompid').selectpicker('refresh');
                $("#savebtn").attr("disabled",false);
            }
        });
    } else {
        var id = $("#id").val();
        zhput(base_url_goods + "/" + id, urldata).then(function(result) {
            if(checkData(result,'put')) {
                location.href="admin.html#pages/ruleticket.html";
                $('#goodscompid').selectpicker('refresh');
                $("#savebtn").attr("disabled",false);
            }
        });
    }
}



