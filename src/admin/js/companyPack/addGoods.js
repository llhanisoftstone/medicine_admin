var base_url_goods_model='/rs/goods_model_comp';
var base_url_goods_model_value='/rs/store_goods_model_value';
var base_url_goods_brand='/rs/company_store';
var base_url_goods = '/rs/store_goods';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";
var compid='';
var postoff=false;
function back(){
    history.go(-1);
}
var model=[];
var modelvalue=[];
var dels=[];
var compq_id="";

$(function(){
    $("#brand-placeholder").on("change",function(){
        console.log(this.value)
        // 删除规格
        if(compq_id!=$("#brand-placeholder").val()){

            $("#menu-placeholder").html(`<tr>
                                            <td  style="max-width: 160px;">
                                                <select  class="selectpicker" id="select1name-placeholder" onchange="select1cg(this)" title="请选择" data-live-search ="true">
                                                </select>
                                            </td>
                                            <td  style="max-width: 160px;">
                                                <select class="form-control" style="color: #999" disabled="disabled" id="select1info-placeholder" onchange="select2cg(this)" >
                                                    <option value="">请选择</option>
                                                </select>
                                            </td>
                                            <td  style="max-width: 160px;">
                                                <select onchange="select1cg(this)" id="select1-2name-placeholder" class="selectpicker" title="请选择" data-live-search ="true" >
                                                </select>
                                            </td>
                                            <td  style="max-width: 160px;">
                                                <select class="form-control" style="color: #999" disabled="disabled" id="select1-2info-placeholder" onchange="select2cg(this)" >
                                                    <option value="">请选择</option>
                                                </select>
                                            </td>
                                            <td>
                                                <!--市场价-->
                                                <input type="number" maxlength="5" name="stock_price" class="form-control" id="stock_price">
                                            </td>
                                            <td>
                                                <!--会员价-->
                                                <input type="number" maxlength="5" name="vip_price" class="form-control" id="vip_price" datatype="require">
                                            </td>
                                            <td>
                                                <!--库存-->
                                                <input datatype="require integer" maxlength="9" name="stock_count" id="less_stock" class="form-control">
                                            </td>
                                            <td>
                                                <div class="input-group" >
                                                    <input type="text" id="speci_pic" class="form-control" style="cursor: pointer;" readonly="readonly">
                                                    <span class="input-group-addon" style="cursor: pointer;overflow: hidden;">
                                                       <i class="glyphicon glyphicon-search">
                                                        <input type="file" name="picfile[]" placeholder="" value="pic file"  id="title_picfile"  multiple="multiple" style="margin-top:-20px;margin-left:-20px;-webkit-opacity: 0;opacity: 0;width: 30px;height: 20px;">
                                                        </i>
                                                </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="btn-link" style="margin-top: 5px;display: block;cursor: pointer;padding-left: 13px;" onclick="onDeleteClick(this)">删除</span>
                                            </td>
                                        </tr>`)
            $('#goods_buttonid').bind("click");
            $('#copyGoods0').bind("click");
            $('#copyGoods1').bind("click");
            var read=getQueryByName("read");
            var copy=getQueryByName("copy");
            // console.log(copy)
            if(read=='read'){
                $(".text-center").hide();
                $("#user_form input").attr("disabled","disabled");
                $("#user_form select").attr("disabled","disabled");
                $("#user_form button").attr("disabled","disabled");
            }
            if(copy=='copy'){
                $(".text-center").hide();
                $(".copyGoods").show();
            }
            getselect1();
            getdelivery();
            status()
            $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
        }
        compq_id=$("#brand-placeholder").val();
    })
});

function startSort(a){
    var filenames=[];
    var fileList=[];
    for(var i =0;i<a.length;i++){
        if(getN(a[i].filename)!=''){
            filenames.push(getN(a[i].filename));
        }else{
            fileList.push(a[i])
        }
    }
    function getN(s) {
        if(s.replace(/[^0-9]/ig,"")!=''){
            var num=new BigNumber(s.replace(/[^0-9]/ig,""));
            return num;
        }
        return '';
    }
    var data=[];
    getdata();
    function getdata() {
        for(var i = 0 ;i<filenames.length;i++){
            var min=BigNumber.min(filenames);
            if(filenames[i].equals(min)){
                data.push(min);
                filenames.splice(i,1);
                if(filenames.length==0){
                    break;
                }
                getdata();
            }
        }
    }
    var newdata=[];
    for(var j =0;j<data.length;j++){
        for(var i=0;i<a.length;i++){
            if(getN(a[i].filename)!=''&&data[j].equals(getN(a[i].filename))){
                console.log(a[i].filename);
                newdata.push(a[i]);
                continue;
            }
        }
    }
    return newdata.concat(fileList);
}
$(function(){
    $('#goods_buttonid').bind("click", onSaveClick);
    $('#goods_buttonid1').bind("click", onSaveClick1);
    $('#copyGoods0').bind("click", onCopySaveClick0);
    $('#copyGoods1').bind("click", onCopySaveClick1);
    var read=getQueryByName("read");
    var copy=getQueryByName("copy");
    var id=getQueryString("id");
    if(read=='read'){
        $(".text-center").hide();
        $("#user_form input").attr("disabled","disabled");
        $("#user_form select").attr("disabled","disabled");
        $("#user_form button").attr("disabled","disabled");
    }
    if(copy=='copy'){
        $(".text-center").hide();
        $(".copyGoods").show();
    }
    if(id==''||id==null){
        // console.log('新增>>>>>>>');
        operation = "add";
        getselect1();
        getbrand();
        getdelivery();
        status()
    }else{
        operation = "modify";
        getGoodsById(id);
    }
    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);

});


function sendspeciPic(id,file,i){
    var form='';
    if(i==1){
        form = document.getElementById(""+id);
    }else{
        form = document.getElementById("speci_picform");
    }
    var formData = new FormData(form);
    upajax('/op/upload', formData, function (result) {
        result = JSON.parse(result);
        // console.log('op/upload>>>>>>>>>');
        // console.log(result);
        if(result[0].code==200){
            if(i==1){
                $("#"+file+"").val(result[0].url);
            }else{
                $("#speci_pic").val(result[0].url);
            }

        } else
            showError(result[0].err);
    });
}
function compare(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}
function onUploadDetailPic(formObject, fileComp, list) {
    var attrs = fileComp.attr("refattr");
    if(list.length>1){
        for(var i =0;i<list.length;i++){
            list[i].filename=list[i].filename.split('.')[0];
        }
        list.sort(compare('filename'));
    }
    if(attrs){
        if(list.length > 0 && list[0].code == 200){
            var sAttachUrl = list[0].url;
            $("#"+attrs, formObject).val(sAttachUrl);
        }
    }else if(fileComp.attr("id")=='picfile'){
        if(list.length > 0 && list[0].code == 200){
            for(var i =0;i<list.length;i++){
                if(i==0){
                    var order_code=i+1;
                    var html="<tr>";
                    html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                    html+='<td> <input maxlength="9" value="'+order_code+'" type="text" style="margin-top: 35px;" class="form-control"  datatype="require"> </td>';
                    html+='<td><button  style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
                    html+="</tr>";
                    $("#banner").append(html);
                    $("#banner_btn").hide()
                }
            }
        }
    }else if(fileComp.attr("id")=='goodsInfofile'){
        if(list.length > 0 && list[0].code == 200){
            list=startSort(list);
            for(var i =0;i<list.length;i++){
                var order_code=i+1;
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" alt="'+list[i].filename+'" src='+targetUrl+list[i].url+'></td>';
                console.log(list[i].filename);
                console.log(list[i].url);
                html+='<td> <input maxlength="9" value="'+order_code+'" type="number" style="margin-top: 35px;" class="form-control"> </td>';
                // <button class="btn-link" style="margin-top: 35px;" onclick="">修改</button>
                html+='<td> <button class="btn-link" style="margin-top: 35px;"  onclick="onDeleteClick2(this)">删除</button> </td>';
                html+="</tr>";
                $("#goodsInfo").append(html);
            }
        }
    }else{
        if(list.length > 0 && list[0].code == 200){
            fileComp.parents(".input-group-addon").prev().val(list[0].url)
        }
    }
}

//这个只是针对后台url传参，在参数只有一个的情况下有效:http://localhost:3000/admin/admin.html#pages/goods/addGoods.html?id=13341####
function getid() {
    var num=window.location.href.indexOf("#");
    var str=window.location.href.substr(num+1,window.location.href.length);
    var r=str.indexOf("=");
    if(r<0){
        return '';
    }
    var leng=str.indexOf("#")>-1?str.indexOf("#"):str.length+1;
    r=str.substring(r+1,leng);
    return r;
}

//根据id查询产品数据
function getGoodsById(id){
    $.showActionLoading();
    zhget(base_url_goods,{id:id}).then(function(result) {
        $.hideActionLoading();
        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#goods_buttonid").attr("status",result.rows[0].status);
        $("#title_pic").val(result.rows[0].title_pic);
        $("#delivery").val(result.rows[0].delivery_price/100);
        compid=result.rows[0].store_id
        getbrand(result.rows[0].brand_id);
        getdelivery(result.rows[0].delivery_id);
        status(result.rows[0].status);
        compq_id=result.rows[0].store_id;
        // getsafeguard_json(result.rows[0].safeguard_json);
        if(result.model==null||result.model==''){
            getselect1();
        }else{
            $("#menu-placeholder").children().remove();//移除第一行
            createhtml(result);
        }

        createBanner(result);//加载banner图和详情图
        console.log(result)
    });
    // });

}
// 加载banner图和详情图  格式为：路径|顺序,路径|顺序,路径|顺序
function createBanner(result){
    //加载banner图
    if(result.rows[0].banner_pics){
        var arr=result.rows[0].banner_pics.split(',');
        var banner = [];
        for(var i=0;i<arr.length;i++){
            var att = arr[i].split('|');
            banner.push({url:att[0],order_code:att[1]});
        }
        console.log(banner);
    }
    if(banner!=null&&banner.length>0){
        for(var i =0;i<banner.length;i++){
            var bannerhtml="<tr>";
            bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+banner[i].url+'></td>';
            bannerhtml+='<td> <input maxlength="9" type="number" style="margin-top: 35px;" value="'+banner[i].order_code+'" class="form-control"> </td>';
            bannerhtml+='<td>  <button style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
            bannerhtml+="</tr>";
            $("#banner").append(bannerhtml);
            $("#banner_btn").hide()
        }
    }


    //加载详情列表
    if(result.rows[0].details_pics){
        var arr1=result.rows[0].details_pics.split(',');
        var datail = [];
        for(var i=0;i<arr1.length;i++){
            var att = arr1[i].split('|');
            datail.push({url:att[0],order_code:att[1],remark:att[2]});
        }
        console.log(datail);
    }
    if(datail!=null&&datail.length>0){
        for(var i =0;i<datail.length;i++){
            var datailhtml="<tr>";
            datailhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+datail[i].url+'></td>';
            datailhtml+='<td> <input maxlength="9" type="number" style="margin-top: 35px;" value="'+datail[i].order_code+'" class="form-control"> </td>';
            datailhtml+='<td> <button style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick2(this)">删除</button> </td>';
            datailhtml+="</tr>"
            $("#goodsInfo").append(datailhtml);
        }
    }
}
function getModelValue(model){
    var data = {
        model_id:model
    };
    return zhget(base_url_goods_model_value,data);
}
function getModel(comp_id){
    var data = {};
    if(comp_id){
        data.comp_id=comp_id;
    }
    console.log(data)
    return zhget(base_url_goods_model,data);
}
function createMOdelValueHtml(selected,result,model){
    if(result.code==200) {
        var html='';
        for (var i = 0; i < result.rows.length; i++) {
            if(result.rows[i].model_id==model){
                if(selected==result.rows[i].id){
                    html+='<option selected="selected" value="'+result.rows[i].id+'">'+result.rows[i].name+'</option>';
                }else{
                    html+='<option value="'+result.rows[i].id+'">'+result.rows[i].name+'</option>';
                }
            }

        }
        return html;
    }
}
function createModelHtml(selected,result){
    var html='';
    if(result.code==200){
        for(var i =0;i<result.rows.length;i++){
            if(selected==result.rows[i].name){
                html+='<option selected="selected" val="'+result.rows[i].id+'" value="'+result.rows[i].name+'">'+result.rows[i].name+'</option>';
            }else{
                html+='<option val="'+result.rows[i].id+'" value="'+result.rows[i].name+'">'+result.rows[i].name+'</option>';
            }
        }
        return html;
    }
}
function createhtml(result){
    console.log(result);
    var data=result.model
    var index=1;
    var index2=1;
    $.showActionLoading();
    getModel(result.rows[0].comp_id).then(function(modeldata){
        getModelValue().then(function (modelvalue) {
            for(var i in data){
                var html='<tr data-id="'+data[i].id+'">';
                html+='<td _index="'+index+'" style="max-width: 160px;"><select class="selectpicker" id="select'+index+'name-placeholder" onchange="select1cg(this)" title="请选择" data-live-search ="true">'
                var model1=createModelHtml(data[i].model1_name1,modeldata);
                html+=model1+'</select></td>';
                html+='<td _index="'+index+'" style="max-width: 160px;"><select class="selectpicker" id="select'+index+'info-placeholder" onchange="select2cg(this)" title="请选择" data-live-search ="true">';
                var model1name=createMOdelValueHtml(data[i].model1_id2,modelvalue,data[i].model1_id1);
                html+=model1name+'</select></td>';
                index2=index+1;
                html+='<td _index="'+index+'" style="max-width: 160px;"><select class="selectpicker" id="select'+index+'-'+index2+'name-placeholder" onchange="select1cg(this)" title="请选择" data-live-search ="true">';
                var model1=createModelHtml(data[i].model2_name1,modeldata);
                html+=model1+'</select></td>';
                html+='<td _index="'+index+'" style="max-width: 160px;"><select class="selectpicker" id="select'+index+'-'+index2+'info-placeholder" onchange="select2cg(this)" title="请选择" data-live-search ="true">';
                var model1name=createMOdelValueHtml(data[i].model2_id2,modelvalue,data[i].model2_id1);
                html+=model1name+'</select></td>';
                html+='<td><input maxlength="5" value="'+formatPriceFixed2(data[i].sale_price)+'" name="stock_price" class="form-control" type="number"></td>';
                html+='<td><input maxlength="5" value="'+formatPriceFixed2(data[i].price)+'" name="vip_price" class="form-control" type="number" datatype="require"></td>';
                html+='<td><input maxlength="9" value="'+data[i].stock_count+'" name="stock_count" class="form-control" datatype="require integer"></td>';
                var fileformid="speci_picform"+index+"";
                var fileid="speci_pic"+index+"";
                //input onchange="sendspeciPic('+"'"+fileformid+"'"+','+"'"+fileid+"'"+',1)"
                html+='<td><div class="input-group" > <input type="text" value="'+data[i].pic_url+'" id="speci_pic'+index+'" class="form-control" style="cursor: pointer;" readonly="readonly"> <span class="input-group-addon" style="cursor: pointer;overflow: hidden;"> <i class="glyphicon glyphicon-search">  <input  type="file" name="picfile[]" value="pic file" id="speci_picfile'+index+'"  multiple="multiple"style="margin-top:-20px;margin-left:-20px;-webkit-opacity: 0;opacity: 0;width: 30px;height: 20px;"> <input type="text" name="upType" value="titlePic" style="display:none;"> </i> </span> </div></td>';

                html+='<td> <span class="btn-link" style="margin-top: 5px;display: block;cursor: pointer;padding-left: 13px;" onclick="onDeleteClick(this)">删除</span> </td>';


                html+="</tr>";

                $("#menu-placeholder").append(html);

                initselect("select"+index+"name-placeholder");
                initselect("select"+index+"info-placeholder");
                initselect("select"+index+'-'+index2+"name-placeholder");
                initselect("select"+index+'-'+index2+"info-placeholder");
                index++;
            }
            $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
            validator();
            $.hideActionLoading();
        })
    })
}


//获取所有规格数据，加载select
function getAllSepci(clasname,dom){
    console.log(clasname);
    Promise.all([
        zhget(base_url_goods_model,{}),
        zhget(base_url_goods_model_value,{})])
        .then(function(values) {
            model = values[0].rows;
            modelvalue = values[1].rows;
            console.log('aaa');
            if(clasname=='model1'){
                var tds=$(dom).parents("tr").children("td");
                console.log(tds);
                var html='';
                var model1=$(tds[0]).children("select option:selected").val();
                for(var j =0;j<model.length;j++){
                    if(model1==model[j].id){
                        html+='<option selected="selected" value='+model[j].id+'>'+model[j].name+'</option>'
                    }else{
                        html+='<option value='+model[j].id+'>'+model[j].name+'</option>';
                    }
                }
                $(tds[0]).children("select").html('');
                $(tds[0]).children("select").html(html);
            }else{

            }
        })

}

function createModel1Select(selected){
    var se1='<td><select onchange="select1cg(this)" class="form-control">';
    getAllModel().then(function(data){
        // console.log(data);
        for(var i=0;i<data.rows.length;i++){//生成select1
            if(data.rows[i].id==selected){
                se1+='<option selected="selected" value='+data.rows[i].id+'>'+data.rows[i].name+'</option>'
            }else{
                se1+='<option value='+data.rows[i].id+'>'+data.rows[i].name+'</option>'
            }
        }
    })

    se1+='</select></td>';
    return se1;
}
function createModel2Select(data,selected){
    var se2='<td><select onchange="select2cg(this)" class="form-control">'
    for(var i=0;i<data.length;i++){//生成select1
        if(data[i].id==selected){
            se2+='<option selected="selected" value='+data[i].id+'>'+data[i].name+'</option>'
        }else{
            se2+='<option value='+data[i].id+'>'+data[i].name+'</option>'
        }
    }
    se2+='</select></td>';
    return se2;
}


//获取所有规格名称
function getAllModel(){
    var data = {};
    // var compid = getCookie("compid");
    var compid = $('#brand-placeholder').val();
    if(compid){
        data.comp_id = compid;
    }else{
        return;
    }
    return zhget(base_url_goods_model,data);
}
//获取所有规格内容
function getAllModelValue(){
    var data = {};
    return zhget(base_url_goods_model_value,data);
}

//快递信息
function getdelivery(selected){
    var data={}
}
//品牌信息
function getbrand(selected){
    var data={status:1}
    if(sessionStorage.getItem("compid")&&sessionStorage.getItem("compid")!=''){
        data.id=sessionStorage.getItem("compid")
    }
    $.showActionLoading();
    zhget(base_url_goods_brand,data).then(function(result) {
        if(result.code==200) {
            for(var i=0;i<result.rows.length;i++){
                if(result.rows[i].id==compid){
                    result.rows[i].selected=1
                }else{
                    result.rows[i].selected=0
                }
            }
            // }
            buildTable(result, 'brand-template', 'brand-placeholder');
            initselect('brand-placeholder');
            $.hideActionLoading();
        }else{
            buildTable(result, 'brand-template', 'brand-placeholder');
            initselect('brand-placeholder');
            $.hideActionLoading();
        }
    });
}
//上架下架
function status(selected){
    var status = $("#status");
    status.val(selected);

}

var select1='';
//获取1级规格数据
function getselect1(){
    var data = {};
    compid = $("#brand-placeholder").val()?$("#brand-placeholder").val():compid
    if(compid){
        data.comp_id = compid;
    }else{
        var result={};
        buildTable(result, 'select1-template', 'select1name-placeholder');
        initselect('select1name-placeholder');
        buildTable(result, 'select11-template', 'select1-2name-placeholder');
        initselect('select1-2name-placeholder');
        return;
    }
    zhget(base_url_goods_model,data).then(function(result) {
        select1 = result;
        buildTable(result, 'select1-template', 'select1name-placeholder');
        initselect('select1name-placeholder');
        buildTable(result, 'select11-template', 'select1-2name-placeholder');
        initselect('select1-2name-placeholder');
    });
}
function initselect(id){
    $('#'+id).selectpicker({
        size: 10,
        width:'100%'
    });
}
var selected1=0;//select1选中值
var selected2=0;//select2选中值
var selected11=0;//select11选中值
var selected22=0;//select22选中值
// var select2='';
//获取se1 2级规格数据
function select1cg(dom){
    $(dom).parent("td").next().children().empty();
    var model_id= $(dom).find("option:selected").attr("val");
    var data={
        "model_id":model_id
    }
    zhget(base_url_goods_model_value,data).then(function(result) {
        var rs=result.rows;
        createSe2(dom,rs);
    });
}
//动态生成搜索select
function createSe2(dom,rs){
    console.log(1)
    var id=$(dom).parents("td").next().children("select").attr("id");
    if(id==undefined){
        id=$(dom).parents("td").next().children().find("select").attr("id");
        $("#"+id).parent().remove();
    }else{
        $("#"+id).remove();
    }
    var td=$(dom).parents("td").next();

    var se2html='<select class="selectpicker" id="'+id+'" onchange="select2cg(this)" title="请选择" data-live-search ="true">';
    for(var i =0;i<rs.length;i++){
        se2html+='<option value='+rs[i].id+'>'+rs[i].name+'</option>';
    }
    se2html+='</select>';
    $(td).append(se2html);

    initselect(id);
}

var iModelsType=[];
function select2cg(){
    var model_id=$("#select1info-placeholder  option:selected").val();
    if(iModelsType.length>0) {
        var se2 = $("#menu-placeholder").find("tr").eq(0).children().eq(1).children().children();
        iModelsType[0].se2 = se2;
    }
    selected2=model_id;
}

var index=0;
//新增规格
function getrow1(){

    var trlength=$("#menu-placeholder").find("tr").length;
    if(trlength>0){
        var se1=$("#menu-placeholder").find("tr:last").children().eq(0).children().find("select").children();//select1元素集合
        var se2=$("#menu-placeholder").find("tr:last").children().eq(1).children().find("select").children();//select2元素集合
        var se11=$("#menu-placeholder").find("tr:last").children().eq(2).children().find("select").children();//select11元素集合
        var se22=$("#menu-placeholder").find("tr:last").children().eq(3).children().find("select").children();//select22元素集合
        var price=$("#menu-placeholder").find("tr:last").children().eq(4).children();//市场价
        var vipprice=$("#menu-placeholder").find("tr:last").children().eq(5).children();//会员价
        var count=$("#menu-placeholder").find("tr:last").children().eq(6).children();//库存
        var pic=$("#menu-placeholder").find("tr:last").children().eq(7).children();//图片
        index=$("#menu-placeholder").find("tr:last").children().eq(7).children().children("input").attr("id").substr(9,1);
        if(index==''){
            index=0;
        }else{
            index=parseInt(index);
            index++;
        }
        iModelsType[0]={};
        iModelsType[0].se1=se1;

        var dom1select=$("#menu-placeholder").find("tr:last").children().eq(0).children().find("select").find("option:selected").val();
        var dom2select=$("#menu-placeholder").find("tr:last").children().eq(1).children().find("select").find("option:selected").val();
        var dom11select=$("#menu-placeholder").find("tr:last").children().eq(2).children().find("select").find("option:selected").val();
        var dom22select=$("#menu-placeholder").find("tr:last").children().eq(3).children().find("select").find("option:selected").val();
        selected1=dom1select;
        selected2=dom2select;
        selected11=dom11select;
        selected22=dom22select;
        iModelsType[0].index=$("#menu-placeholder").find("tr:last").children().eq(0).attr("_index");
        iModelsType[0].se2=se2;
        iModelsType[0].se11=se11;
        iModelsType[0].se22=se22;
        iModelsType[0].price=price;
        iModelsType[0].vipprice=vipprice;
        iModelsType[0].count=count;
        iModelsType[0].pic=pic;
        iModelsType[0].trlength=trlength;
    }else{//当前产品没有规格
        var html='<tr>'
        html+='<td style="max-width: 160px;">'
        html+='<select  class="selectpicker" id="select1name-placeholder" onchange="select1cg(this)" title="请选择" data-live-search ="true"></select></td>'
        html+='<td style="max-width: 160px;">'
        html+='<select class="form-control" style="color: #999" disabled="disabled"  onchange="select2cg(this)">'
        html+='<option value="">请选择</option> </select> </td>'
        html+='<td _index="1" style="max-width: 160px;">'
        html+=' <select onchange="select1cg(this)"  class="selectpicker" title="请选择" data-live-search ="true" > </select> </td>'
        html+='<td  style="max-width: 160px;">'
        html+=' <select class="form-control" style="color: #999" disabled="disabled"  onchange="select2cg(this)" >'
        html+='<option value="">请选择</option> </select> </td>'
        html+='<td> <input maxlength="9" type="number" maxlength="9" name="stock_price" class="form-control"></td>'
        html+='<td> <input maxlength="9" type="number" maxlength="9" name="vip_price" class="form-control" datatype="require"> </td>'
        html+='<td> <input maxlength="9" datatype="require integer" name="stock_count" class="form-control"></td>'
        html+='<td> <div class="input-group" >'
        html+='<input type="text" id="speci_pic" class="form-control" style="cursor: pointer;overflow: hidden;" readonly="readonly">'
        html+='<span class="input-group-addon" style="cursor: pointer;overflow: hidden;"> '
        html+='<i class="glyphicon glyphicon-search">'
        html+='<input type="file" name="picfile[]" placeholder="" value="pic file"  id="title_picfile"  multiple="multiple" style="margin-top:-20px;margin-left:-20px;-webkit-opacity: 0;opacity: 0;width: 30px;height: 20px;"> '
        html+='</i> </span> </div> </td>  '
        html+='<td><span class="btn-link" style="margin-top: 5px;display: block;cursor: pointer;padding-left: 13px;" onclick="onDeleteClick(this)">删除</span> </td></tr>';
        $("#menu-placeholder").append(html)
        getselect1();
    }

}
//增加规格

function addrow(){
    getrow1();
    var trlength=iModelsType[0].index+1;
    var se1='<tr><td _index="'+trlength+'" style="max-width: 160px;"><select id="select'+trlength+'name-placeholder" onchange="select1cg(this)" title="请选择" data-live-search="true" class="selectpicker">'
    for(var i=1;i<iModelsType[0].se1.length;i++){//新增select1
        // console.log($(iModelsType[0].se1[i]).html())
        if($(iModelsType[0].se1[i]).val()==selected1){
            se1+='<option val="'+$(iModelsType[0].se1[i]).attr("val")+'" selected="selected" value='+$(iModelsType[0].se1[i]).val()+'>'+$(iModelsType[0].se1[i]).html()+'</option>'
        }else{
            se1+='<option val="'+$(iModelsType[0].se1[i]).attr("val")+'" value='+$(iModelsType[0].se1[i]).val()+'>'+$(iModelsType[0].se1[i]).html()+'</option>'
        }
    }
    se1+='</select></td>';
    se1+='<td _index="'+trlength+'" style="max-width: 160px;"><select id="select'+trlength+'info-placeholder" onchange="select2cg(this)" title="请选择" data-live-search="true" class="selectpicker">';
    for(var i=1;i<iModelsType[0].se2.length;i++){//新增select2
        if($(iModelsType[0].se2[i]).val()==selected2){
            se1+='<option selected="selected" value='+$(iModelsType[0].se2[i]).val()+'>'+$(iModelsType[0].se2[i]).html()+'</option>'
        }else{
            se1+='<option value='+$(iModelsType[0].se2[i]).val()+'>'+$(iModelsType[0].se2[i]).html()+'</option>'
        }
    }
    se1+='</select></td>';

    se1+='<td _index="'+trlength+'" style="max-width: 160px;"><select id="select'+trlength+'-'+trlength+'name-placeholder" onchange="select1cg(this)" title="请选择" data-live-search="true" class="selectpicker">'
    for(var i=1;i<iModelsType[0].se11.length;i++){//新增select11

        if($(iModelsType[0].se11[i]).val()==selected11){
            se1+='<option val="'+$(iModelsType[0].se1[i]).attr("val")+'" selected="selected" value='+$(iModelsType[0].se11[i]).val()+'>'+$(iModelsType[0].se11[i]).html()+'</option>'
        }else{
            se1+='<option val="'+$(iModelsType[0].se1[i]).attr("val")+'" value='+$(iModelsType[0].se11[i]).val()+'>'+$(iModelsType[0].se11[i]).html()+'</option>'
        }
    }
    se1+='</select></td>';
    se1+='<td _index="'+trlength+'" style="max-width: 160px;"><select id="select'+trlength+'-'+trlength+'info-placeholder" onchange="select2cg(this)" title="请选择" data-live-search="true" class="selectpicker">';
    for(var i=1;i<iModelsType[0].se22.length;i++){//新增select22
        if($(iModelsType[0].se22[i]).val()==selected22){
            se1+='<option selected="selected" value='+$(iModelsType[0].se22[i]).val()+'>'+$(iModelsType[0].se22[i]).html()+'</option>'
        }else{
            se1+='<option value='+$(iModelsType[0].se22[i]).val()+'>'+$(iModelsType[0].se22[i]).html()+'</option>'
        }
    }
    se1+='</select></td>';

    if(iModelsType[0].price.val().trim()!=''){
        se1+='<td><input maxlength="9" value='+iModelsType[0].price.val()+' class="form-control" id="pic"  type="number"/></td>';
    }else{
        se1+='<td><input maxlength="9" class="form-control" id="name" type="number"/></td>';
    }
    if(iModelsType[0].vipprice.val().trim()!=''){
        se1+='<td><input maxlength="9" value='+iModelsType[0].vipprice.val()+' class="form-control" id="vipprice" type="number" datatype="require" /></td>';
    }else{
        se1+='<td><input maxlength="9"  class="form-control" id="name" type="number" datatype="require" /></td>';
    }
    if(iModelsType[0].count.val().trim()!=''){
        se1+='<td><input maxlength="9" value='+iModelsType[0].count.val()+' class="form-control" id="less_stock" type="number"/></td>';
    }else{
        se1+='<td><input maxlength="9" class="form-control" id="name"  datatype="require integer"/></td>';
    }
    var fileformid="speci_picform"+index+"";
    var fileid="speci_pic"+index+"";
    se1+='<td><div class="input-group" > <input type="text" id="speci_pic'+index+'" class="form-control" style="cursor: pointer;" readonly="readonly"> <span class="input-group-addon" style="cursor: pointer;overflow: hidden;"> <i class="glyphicon glyphicon-search"> <input  type="file" name="picfile[]" value="pic file" id="speci_picfile'+index+'"  multiple="multiple"style="margin-top:-20px;margin-left:-20px;-webkit-opacity: 0;opacity: 0;width: 30px;height: 20px;"> <input type="text" name="upType" value="titlePic" style="display:none;">  </i> </span> </div></td>';

    se1+='<td> <span class="btn-link" style="margin-top: 5px;display: block;cursor: pointer;padding-left: 13px;" onclick="onDeleteClick(this)">删除</span> </td>';
    se1+='</tr>';
    $("#menu-placeholder").append(se1);
    initselect("select"+trlength+"name-placeholder");
    initselect("select"+trlength+"info-placeholder");
    initselect('select'+trlength+'-'+trlength+'name-placeholder');
    initselect('select'+trlength+'-'+trlength+'info-placeholder');
    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);
    index++;
    validator();
    $(this).blur();
    $("#menu-placeholder").focus();
}
//删除规格
function onDeleteClick(dom){
    if($("#menu-placeholder tr").length!=1){
        dels.push($(dom).parent("td").parent("tr").attr("data-id"))
        $(dom).parent("td").parent("tr").remove();
    }else{
        showError('产品规格至少保存一个');
        return;
    }
}
//删除banner
function onDeleteClick1(dom){
//baner非必须，直接移除
    $(dom).parent("td").parent("tr").remove();
    if($("#banner").find("tr").length>0){
        $("#banner_btn").hide()
    }else{
        $("#banner_btn").show()
    }

}
//删除详情
function onDeleteClick2(dom){
    $(dom).parent("td").parent("tr").remove();
    //详情非必须，直接移除
}
function gosearch()
{
    if(window.event.keyCode == 13||window.event.keyCode == 32)
    {
        return false;
    }
}

function isEXISTS(data,ndata){
    var is=0;
    if(data.length>0&&ndata.length>0){
        for(var j =0;j<ndata.length;j++){
            if(data==ndata.model_value1){
                is=1
            }
        }
    }
    return is;
}
function onSaveClick(){
    if($("#goods_buttonid").attr("_getGoodsIsActivityIn")=="1"){
        alert('该产品正在活动中，请检查活动信息');
    }
    saveData(0)
}
function onSaveClick1(){
    if($("#goods_buttonid1").attr("_getGoodsIsActivityIn")=="1"){
        alert('该产品正在活动中，请检查活动信息');
    }
    saveData(1)
}
function onCopySaveClick0(){
    saveData(0,'copy')
}
function onCopySaveClick1(){
    saveData(1,'copy')
}
function  saveData(savestatus,copyGoods){
    var doms=$("#menu-placeholder").find("tr");
    var data=[];
    var specifications1=[];//一级规格
    var specifications2=[];//二级规格
    var brand=$("#brand-placeholder").val();
    if(brand==-1||brand==''||brand=='请选择'){
        showError('请选择店铺');
        return;
    }
    for(var i=0;i<doms.length;i++){
        // console.log(i)

        data[i]={};
        if($(doms[i]).attr("data-id")){
            data[i].id=$(doms[i]).attr("data-id")
        }
        data[i].se1=$(doms[i]).children().eq(0).find("option:selected").val();
        data[i].se1name=$(doms[i]).children().eq(0).find("option:selected").text();
        data[i].se2=$(doms[i]).children().eq(1).find("option:selected").val();
        data[i].se2name=$(doms[i]).children().eq(1).find("option:selected").text();
        if(data[i].se1name=='请选择'||data[i].se2name=='请选择'){
            showError('请正确填写规格数据1');
            return;
        }
        specifications1.push(data[i].se2name);
        data[i].se11=$(doms[i]).children().eq(2).find("option:selected").val();
        data[i].se11name=$(doms[i]).children().eq(2).find("option:selected").text();
        data[i].se22=$(doms[i]).children().eq(3).find("option:selected").val();
        if(data[i].se22==''){
            data[i].se22=0;
        }
        data[i].se22name=$(doms[i]).children().eq(3).find("option:selected").text();
        data[i].stock_count=$(doms[i]).children().eq(4).children("input").val()*100;
        data[i].stock_price=$(doms[i]).children().eq(5).children("input").val()*100;
        if(data[i].stock_count<0.01){
            showError('市场价不能小于0.01');
            return;
        }
        if(data[i].stock_price<0.01){
            showError('会员价不能小于0.01');
            return;
        }
        if(data[i].stock_count>999999999){
            showError('市场价不能大于9999999.99');
            return;
        }
        if(data[i].stock_price>999999999){
            showError('会员价不能大于9999999.99');
            return;
        }
        data[i].count=$(doms[i]).children().eq(6).children("input").val();
        if(data[i].count<0){
            showError('库存不能小于0');
            return;
        }
        data[i].pic=$(doms[i]).children().eq(7).children().children("input").val();
        if(data[i].se11name!="请选择"&&data[i].se22name!="请选择"){
            specifications2.push(data[i].se22name);
        }else if(data[i].se11name=="请选择"&&data[i].se22name=="请选择"){
            data[i].se11name="";
            data[i].se22name="";
        }
        if(data[i].stock_count==''||data[i].stock_price===''||data[i].price==''){
            showError('请正确填写规格数据');
            return;
        }
        if(data[i].pic==''){
            showError('请上传规格图片');
            return;
        }
    }
    var models=[];
    for(var i=0;i<data.length;i++){
        for(var j=0;j<data.length;j++){
            if(i!=j){
                if(data[i].se22==0||data[i].se22==null||data[i].se22==''||data[i].se22==undefined){
                    if(data[i].se2==data[j].se2){
                        showError('二级规格为空时,只能存在唯一一级规格');
                        return
                    }
                }
            }
        }
        models.push({
            "model_value_id1": data[i].se2,
            "model_value_id2":  data[i].se22||'0',
            "sale_price":data[i].stock_count,
            "price":data[i].stock_price,
            "stock_count":data[i].count,
            "pic_url": data[i].pic,
            "id": data[i].id
        })
    }
    console.log(models)
    //获取产品基本信息
    var safeguard_json=[];
    var i=0;
    $("input:checkbox[name='safeguard_json']:checked").each(function() {
        safeguard_json.push(parseInt($(this).val()));
    });
    var name=$.trim($("#name").val());
    var title_pic=$.trim($("#title_pic").val());
    var delivery=$("#delivery").val()*100;
    var pic_url=$.trim($("#title_picfile").val());
    //获取Banner图数据
    var bannerdoms=$("#banner").find("tr");
    var banner_pics='';
    for(var i=0;i<bannerdoms.length;i++){
        var url=$(bannerdoms[i]).children().eq(0).children().attr("src");
        if(i==0){
            banner_pics+=url.replace(targetUrl,'');
        }else{
            banner_pics+=","+url.replace(targetUrl,'');
        }
        banner_pics+="|"+$(bannerdoms[i]).children().eq(1).children("input").val();
    }
    // return;
    //获取详情列表数据
    var goodsInfodoms=$("#goodsInfo").find("tr");
    // console.log(goodsInfodoms);
    var details_pics='';
    for(var i=0;i<goodsInfodoms.length;i++){
        var url=$(goodsInfodoms[i]).children().eq(0).children().attr("src");
        if(i==0){
            details_pics+=url.replace(targetUrl,'');
        }else{
            details_pics+=","+url.replace(targetUrl,'');
        }
        details_pics+="|"+$(goodsInfodoms[i]).children().eq(1).children("input").val();
    }
    var url="/rs/store_goods";
    var trade_send=$("#trade_send option:selected").val();
    if(!banner_pics||banner_pics==""){
        showError("请插入至少一张banner图");
        return;
    }
    if(!details_pics||details_pics==""){
        showError("请插入至少一张详情图");
        return;
    }
    for(var i=0;i<models.length;i++){
        var m_id1=models[i].model_value_id1
        var m_id2=models[i].model_value_id2
        for(var j=i+1;j<models.length;j++){
            if(m_id1==models[j].model_value_id1&&m_id2==models[j].model_value_id2){
                showError('不能保存相同规格！');
                return false
            }
            if(m_id1==models[j].model_value_id2&&m_id2==models[j].model_value_id1){
                showError('不能保存相同规格！');
                return false
            }
        }
    }
    var is_hot=jQuery("#is_hot").val();
    var urldata={
        name:name,
        title_pic:title_pic,
        store_id:brand,
        banner_pics:banner_pics,
        details_pics:details_pics,
        delivery_price:delivery,
        models:models,
    };
    if(dels.length>0){
        urldata.dels=dels
    }
    if(copyGoods=='copy'){
        operation='add';

    }
    if(savestatus == 1){
        urldata.agree=1;
    }
    if (operation == "add") {
        console.log('新增操作>>>>>>>>>>>');
        // var compid = getCookie("compid");
        var compid = $('#brand-placeholder').val();
        if(compid){
            urldata.store_id = compid;
        }else{
            return;
        }
        urldata.status=0
        $.showActionLoading();
        if(postoff){
            return;
        }
        postoff=true;
        zhpost(url,urldata).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                showSuccess('保存成功！');
                dels=[];
                location.href="admin.html#pages/companyPack/goodsList.html"
            }
            setTimeout(function(){
                postoff=false;
            },1000);
        });
    } else {
        urldata.modify=1
        var id = $("#id").val();
        console.log('修改操作>>>>>>>>>>>');
        urldata.status=$("#goods_buttonid").attr("status")
        zhput(url + "/" + id, urldata).then(function(result) {
            if(checkData(result,'put')) {
                showSuccess('保存成功！');
                dels=[]
                location.href="admin.html#pages/companyPack/goodsList.html"
            }
        });
    }
}


