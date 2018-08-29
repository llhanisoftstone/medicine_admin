/**
 * Created by kechen on 2016/9/2.
 */

var base_url_goods_category='/rs/goods_category';
var base_url_goods = '/rs/goods';
var tag_list = '/rs/shop_goods_tags';
var currentPageNo = 1;
var pageRows = 10;
var operation = "add";

function back(){
    history.go(-1);
}

function querySel(fn){
    zhget("/rs/shop_goods_category",{size:1000}).then(function (result) {
        if(checkData(result,'get','queryList','table-responsive')) {
            var html='<option value="-1">请选择</option>';
            for(var i=0;i<result.rows.length;i++){
                html+='<option value="'+result.rows[i].id+'">'+result.rows[i].name+'</option>'
            }
            jQuery("#type").html(html);
            if(fn){
                fn();
            }
        }
    });
};

function project_type(){
    jQuery("#project_type").on("change",function(){
        if(jQuery(this).val()==1){
            jQuery("#maink").show();
            jQuery("#mainklist").hide();
        }else{
            jQuery("#maink").hide();
            jQuery("#mainklist").show();
        }
    })
}

var model=[];
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
    project_type();

    var id=getQueryByName("id");

    if(id==''||id==null){

        operation = "add";
        getGoodsTag();
        querySel();
    }else{

        operation = "modify";
        getGoodsTag();
        getGoodsById(id);
    }

    $.initSystemFileUpload($("#titleForm"), onUploadDetailPic);

});


function getGoodsTag(cid,hadTag){
    cid = cid || 321; //默认第一个分类
    /**查询所有标签**/
    zhget(tag_list,{order:'order_code,name',type:">=,1,<=,2"}).then( function(result) {
        var data = result.rows;
        var html = '';

        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].name+"</option>"
            }
        }

        $("#tagName").html(html);
        $('#tagName').selectpicker({
            'selectedText': '请选择'
        });
        if(hadTag){
            $('#tagName').selectpicker('val', hadTag);
        }

        $("#tagName").selectpicker('refresh');
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
                var order_code=i+1;
                var html="<tr>";
                html+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+list[i].url+'></td>';
                html+='<td> <input value="'+order_code+'" type="text" style="margin-top: 35px;" class="form-control"  datatype="require"> </td>';
                html+='<td><button  style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
                html+="</tr>";
                $("#banner").append(html);
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
                html+='<td> <input type="text" style="margin-top: 35px;" class="form-control"> </td>';
                html+='<td> <input value="'+order_code+'" type="text" style="margin-top: 35px;" class="form-control"> </td>';
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

//判断产品是否在活动中
function getGoodsIsActivityIn(result){
    if(result.activity_json&&result.activity_json!=null){
        var now = new Date().getTime();
        var endTime = new Date(result.activity_json.end_time).getTime();
        if(endTime>=now){
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
}
//根据id查询产品数据
function getGoodsById(id){

    $.showActionLoading();
    zhget(base_url_goods+"/"+id,{}).then(function(result) {
        $.hideActionLoading();
        if(getGoodsIsActivityIn(result.rows[0])){
            $("#goods_buttonid").attr("_getGoodsIsActivityIn","1");
            $("#goods_buttonid1").attr("_getGoodsIsActivityIn","1");
        }

        var product_tag = result.rows[0].tags;

        if(product_tag){
            if(product_tag.indexOf(',') != '-1'){
                product_tag = product_tag.split(',');
            }
            var hadTag = [];
            for(var i=0;i<product_tag.length;i=i+2){
                hadTag.push(product_tag[i]);
            }
            getGoodsTag(result.rows[0].category1,hadTag)
        }

        $("#id").val(result.rows[0].id);
        $("#name").val(result.rows[0].name);
        $("#title_pic").val(result.rows[0].picpath);
        $("#stock").val(result.rows[0].stock);
        $("#sale_price").val(formatPriceFixed2(result.rows[0].price));
        $("#price_leaguer").val(formatPriceFixed2(result.rows[0].price_leaguer));
        $("#price_inner").val(formatPriceFixed2(result.rows[0].price_inner));

        querySel(function(){
            $("#type").val(result.rows[0].goods_category);
        });

        setTimeout(function(){
            editor.setData(result.rows[0].details);
        },500);

        $("#send_hour").val(result.rows[0].send_hour);
        $("#sale_count").val(result.rows[0].goods_base_sale_count);
        $("#collection_count").val(result.rows[0].collection_count);
        $("#trade_send").val(result.rows[0].trade_send);
        $("#less_stock").val(result.rows[0].less_stock);
        $("#base_collection_count").val(result.rows[0].base_collection_count);

        createBanner(result);//加载banner图和详情图

    });

}
// 加载banner图和详情图
function createBanner(result){
    //加载banner图
    var banner=result.rows[0].banners;
    // console.log(result.rows[0].banner_json);
    if(banner!=null&&banner.length>0){
        for(var i =0;i<banner.length;i++){
            var bannerhtml="<tr>";
            bannerhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+banner[i].picpath+'></td>';
            bannerhtml+='<td> <input type="number" style="margin-top: 35px;" value="'+banner[i].order_code+'" class="form-control"> </td>';
            // <button class="btn-link" style="margin-top: 35px;" onclick="">修改</button>
            bannerhtml+='<td>  <button style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick1(this)">删除</button> </td>';
            bannerhtml+="</tr>";
            $("#banner").append(bannerhtml);
        }
    }


    //加载详情列表
    if(result.rows[0].details_category==2){
        var datail=result.rows[0].details;
        if(datail!=null&&datail.length>0){
            for(var i =0;i<datail.length;i++){
                var datailhtml="<tr>";
                datailhtml+='<td><img style="width: 90px;height: 90px;background-size: 90px" src='+targetUrl+datail[i].url+'></td>';
                datailhtml+='<td> <input type="text" style="margin-top: 35px;" value="'+datail[i].remark+'" class="form-control"> </td>';
                datailhtml+='<td> <input type="number" style="margin-top: 35px;" value="'+datail[i].order_code+'" class="form-control"> </td>';
                // <button class="btn-link" style="margin-top: 35px;" onclick="">修改</button>
                datailhtml+='<td> <button style="margin-top: 35px;"  class="btn-link" onclick="onDeleteClick2(this)">删除</button> </td>';
                datailhtml+="</tr>"
                $("#goodsInfo").append(datailhtml);
            }
        }
    }
}

//商品类别
function getcategory(category1,category2,category3){
    if(!category1) {                        //新增产品处理
        zhget(base_url_goods_category, {
            pid: 0
        }, function (result) {
            var selSuper = $("#category1");
            for (var al in result.rows) {
                var text = result.rows[al].name;
                var value = result.rows[al].id;
                selSuper.append("<option value='" + value + "'>" + text + "</option>");
            }
            var SuperSelValue = $("#category1").val();
            zhget(base_url_goods_category, {
                pid: SuperSelValue
            }, function (result) {
                var selBig = $("#category2");
                for (var al in result.rows) {
                    var text = result.rows[al].name;
                    var value = result.rows[al].id;
                    selBig.append("<option value='" + value + "'>" + text + "</option>");
                }
                var BigSelValue = $("#category2").val();
                zhget(base_url_goods_category, {
                    pid: BigSelValue
                }, function (result) {
                    var selSmall = $("#category3");
                    for (var al in result.rows) {
                        var text = result.rows[al].name;
                        var value = result.rows[al].id;
                        selSmall.append("<option value='" + value + "'>" + text + "</option>");
                    }
                });
            });
        });
    }
    else{                       //修改商品处理
        Promise.all([
            zhget(base_url_goods_category, {pid:category2}),
            zhget(base_url_goods_category, {pid:category1}),
            zhget(base_url_goods_category, {pid:0})
        ]).then(function(values) {

            var selSmall = $("#category3");
            var selBig = $("#category2");
            var selSuper = $("#category1");
            for(var al in values[0].rows){
                var text = values[0].rows[al].name;
                var value = values[0].rows[al].id;
                if(value==category3){
                    selSmall.append("<option selected='selected' value='" + value + "'>" + text + "</option>");
                }else{
                    selSmall.append("<option value='" + value + "'>" + text + "</option>");
                }
            }
            for(var al in values[1].rows){
                var text = values[1].rows[al].name;
                var value = values[1].rows[al].id;
                if(value==category2){
                    selBig.append("<option selected='selected' value='" + value + "'>" + text + "</option>");
                }else{
                    selBig.append("<option value='" + value + "'>" + text + "</option>");
                }
            }
            for(var al in values[2].rows){
                var text = values[2].rows[al].name;
                var value = values[2].rows[al].id;
                if(value==category1){
                    selSuper.append("<option selected='selected' value='" + value + "'>" + text + "</option>");
                }else{
                    selSuper.append("<option value='" + value + "'>" + text + "</option>");
                }
            }
        })
    }
}

//删除banner
function onDeleteClick1(dom){
//baner非必须，直接移除
    $(dom).parent("td").parent("tr").remove();
}

function  saveData(){

    //获取产品基本信息
    var name=$.trim($("#name").val());
    if(!name||name.trim()==""){
        showError("请输入产品名称！");
        return;
    }
    var title_pic=$.trim($("#title_pic").val());
    if(!title_pic||title_pic.trim()==""){
        showError("请输入标题图片！");
        return;
    }
    var category=$("#type  option:selected").val();
    if(!category||category==null||category==''||category=='-1'){
        showError('请选择产品分类');
        return;
    }
    var stock=$.trim($("#stock").val());
    if(!stock||stock.trim()==""){
        showError("请输入库存！");
        return;
    }
    var sale_price=$.trim($("#sale_price").val())*100;
    if(!sale_price||sale_price==""||sale_price<=0){
        showError("请输入大于零的市场价！");
        return;
    }
    var price_leaguer=$.trim($("#price_leaguer").val())*100;
    if(!price_leaguer||price_leaguer==""||price_leaguer<=0){
        showError("请输入大于零的会员价！");
        return;
    }
    var price_inner=$.trim($("#price_inner").val())*100;
    if(!price_inner||price_inner==""||price_inner<=0){
        showError("请输入大于零的内部员工价！");
        return;
    }

    if(sale_price<price_leaguer){
        showError("会员价不能大于市场价！");
        return;
    }
    if(price_leaguer<price_inner){
        showError("内部员工价不能大于市场价！");
        return;
    }
    var project_type=$("#project_type  option:selected").val();

    var tag_name=$("#tagName").val();

    //获取Banner图数据
    var bannerdoms=$("#banner").find("tr");
    var banner_json=[];
    for(var i=0;i<bannerdoms.length;i++){
        banner_json[i]={};
        banner_json[i].picpath=$(bannerdoms[i]).children().eq(0).children().attr("src");
        banner_json[i].picpath=banner_json[i].picpath.replace(targetUrl,'');
        banner_json[i].order_code=$(bannerdoms[i]).children().eq(1).children("input").val();
    }

    //获取详情列表数据
    var details_json=editor.getData();
    if(!details_json||details_json.trim()==""){
        showError("请输入详情！");
        return;
    }
    var url="/rs/goods";
    var urldata={
        name:name,
        picpath:title_pic,
        price:sale_price,
        price_leaguer:price_leaguer,
        price_inner:price_inner,
        stock:stock,
        goods_category:category,
        details_category:"1",
        banners:banner_json,
        details:details_json,
        tags:tag_name
    };
    saveData=null;
    if (operation == "add") {
        console.log('新增操作>>>>>>>>>>>');

        $.showActionLoading();
        zhpost(url,urldata).then(function(result) {
            $.hideActionLoading();
            if(checkData(result,'post')) {
                history.go(-1);
                location.href="admin.html#pages/goods/goodslist.html";
            }
        });
    } else {
        var id = $("#id").val();
        console.log('修改操作>>>>>>>>>>>');
        zhput(url + "/" + id, urldata).then(function(result) {
            if(checkData(result,'put')) {
                history.go(-1);
                location.href="admin.html#pages/goods/goodslist.html";
            }
        });
    }
}



