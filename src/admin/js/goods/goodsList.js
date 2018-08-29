/**
 * Created by kechen on 2016/9/1.
 */
var base_url_goods = '/rs/goods';
var base_url_goods_category='/rs/goods_category';
var base_url_company = "/rs/company";
var tag_list = '/rs/shop_goods_tags';
var list = [];
var menu = [];
var operation = "add";
var currentPageNo = 1;
var pageRows = 10;
var curId = curMenuId;
var isSearch=false;
$(function() {
    var searchForm = getlocalStorageCookie("searchForm");
    querySel();
    if(searchForm&&searchForm != '{}'){

        console.log("1");
        searchForm = JSON.parse(searchForm);
        onSearchClick();
        searchData();

    }else{
        console.log("2");
        queryList();
    }
    /**查询所有标签**/
    zhget(tag_list,{type:1}).then( function(result) {
        var data = result.rows;
        var html ='<option value="">请选择</option>';
        if(result.code == 200){
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].id+">"+data[i].name+"</option>"
            }
        }

        $("#belong_tag").html(html);
        // $("#belong_tag").html('<option value="">请先选择产品类别</option>');
    });
    // getcategory();
    updateMenuLocationInfo();
});
function querySel(){
    zhget("/rs/shop_goods_category",{size:1000}).then(function (result) {
        if(checkData(result,'get','queryList','table-responsive')) {
            var html='<option value="">请选择</option>';
            for(var i=0;i<result.rows.length;i++){
                html+='<option value="'+result.rows[i].id+'">'+result.rows[i].name+'</option>'
            }
            jQuery("#type").html(html);
        }
    });
};

var statusname=["草稿","待审核","拒绝","上架","下架",'pc产品无状态']
Handlebars.registerHelper('getstatusname', function(value, options) {
        return statusname[value]
});

Handlebars.registerHelper("superif", function (v1,v2, options) {
    if (v1==v2) {
        return options.fn(this);
    }
});

Handlebars.registerHelper("notsuperif", function (v1,v2, options) {
    if (v1 != v2) {
        return options.fn(this);
    }
});

var goodsStatus=["单品","团购","秒杀"];
Handlebars.registerHelper('getGoodsStatus', function(v1, options) {
    return goodsStatus[v1];
});
function resetinput() {
    isSearch=false;
    $("#TalentTryoutSearchForm", $(".reasonRefund"))[0].reset();
    queryList();
}
function searchData(){
    isSearch=true;
    currentPageNo=1;
    $("#table-goodsList").next("div").children("span").remove();
    $("#paginator").html('');
    queryList();
}

function queryList() {
    var pageRecord = getlocalStorageCookie("pageRecord");
    if(pageRecord&&pageRecord>0){
        dellocalStorageCookie("pageRecord");
        $("#pageIndex").val(pageRecord);
        currentPageNo = pageRecord;
    }
    var data={
        order:'status,create_time desc',
        page: currentPageNo,
        size: pageRows,
        trait:1
    }
    if(isSearch){
        var searchForm = getlocalStorageCookie("searchForm");
        searchForm = JSON.parse(searchForm);
        if(searchForm){
            dellocalStorageCookie("searchForm");
            for(var key in searchForm){
                $("input[name='"+key+"']").val(searchForm[key]);
                $("select[name='"+key+"']").val(searchForm[key]);
            }
        }
        var id=$("#goodsId").val();
        if(id!=''){
            data.id=id;
        }

        var name=$("#name").val();
        if(name!=''){
         data.name=name;
        }
        var brand_name=$("#brand_name").val();
        if(brand_name!=''){
            data.brand_name=brand_name;
        }
        var goods_category =$("#type option:selected").val();

        if(goods_category && goods_category !=''){
            data.goods_category =goods_category ;
        }
        var tag_names = $("#belong_tag").val();
        // if(tag_names && category1 ){
            data.tags = tag_names;
        // }
        var status=$("#status option:selected").val();
        if(status!=''){
            data.status=status;
        }else{
            data.status != 99;
        }
        data.search=1;
    }

    $.showActionLoading();
    zhget(base_url_goods, data).then( function(result) {
        $.hideActionLoading();
        if(checkData(result,'get','queryList','table-goodsList')) {
            integrals = result.rows;
            for (var i = 0; i < integrals.length; i++) {
                var indexCode = integrals[i];
                indexCode.rowNum = (currentPageNo - 1) * pageRows + i + 1;
            }
            buildTable(result, 'menu-template', 'menu-placeholder');
        }
    });
}

//获取1级规格数据
function getcategory(){
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
function category1cg(){
    var SuperSelValue=$("#category1").val();
    if(SuperSelValue==''){
        var selBig1 = $("#category2");
        selBig1.empty();
        selBig1.append("<option value='' selected='selected'>全部</option>");
        var selSmall1 = $("#category3");
        selSmall1.empty();
        selSmall1.append("<option value='' selected='selected'>全部</option>");
        $("#belong_tag").html('<option value="0">请先选择产品类别</option>');
        return;
    }
    /**查询所有标签**/
    zhget('/rs/goods_tag',{tag_type:SuperSelValue,order:'order_code'}).then( function(result) {
        var data = result.rows;
        var html = '';
        if(result.code == 200){
            html+="<option value=''>请先选择</option>"
            for(var i=0;i<data.length;i++){
                html+="<option value="+data[i].tag_name+">"+data[i].tag_name+"</option>"
            }
        }
        $("#belong_tag").html(html);

    });
    zhget(base_url_goods_category, {
        pid : SuperSelValue
    }, function (result) {
        var selBig = $("#category2");
        selBig.empty();
        selBig.append("<option value='' selected='selected'>全部</option>");
        for(var al in result.rows){
            var text = result.rows[al].name;
            var value = result.rows[al].id;
            selBig.append("<option value='"+value+"'>"+text+"</option>");
        }
        var BigSelValue=$("#category2").val();
        zhget(base_url_goods_category, {
            pid : BigSelValue
        }, function (result) {
            var selSmall = $("#category3");
            selSmall.empty();
            selSmall.append("<option value='' selected='selected'>全部</option>");
            for(var al in result.rows){
                var text = result.rows[al].name;
                var value = result.rows[al].id;
                selSmall.append("<option value='"+value+"'>"+text+"</option>");
            }
        });
    });
}

function onAddClick() {
    location.href="admin.html#pages/goods/addGoods.html"
}

function onUpdateClick(id,copy) {
    var thispage  = window.location.hash;
    thispage = thispage.replace('#','');
    setlocalStorageCookie("thispage",thispage);
    var searchForm = $("#TalentTryoutSearchForm").form2json();
    console.log(searchForm);
    setlocalStorageCookie("searchForm",JSON.stringify(searchForm));
    var pageRecord = $("#paginator li.active a").text();
    setlocalStorageCookie("pageRecord",pageRecord);
    if(copy=='copy'){
        location.href="admin.html#pages/goods/addGoods.html?id="+id+'&copy=copy';
    }else{
        location.href="admin.html#pages/goods/addGoods.html?id="+id;
    }
}
function updatestatus(el,id,status){
    var val="";
    if(status==3){
        val="确认要上架该商品么？"
    }else if(status==4){
        val="确认要下架该商品么？"
    }
    if(confirm(val)) {
        zhput(base_url_goods + "/" + id, {status:status}).then(function(result) {
            if(result.code==200){
                showSuccess('操作成功！');
                queryList();
            }
            if(result.err){
                showError('操作失败');
            }
        });
    }
}
function onSearchClick() {
    $(".tryoutSearch", $(".reasonRefund")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}

function onDeleteClick(id) {
    if(confirm("确认要删除？")) {
        zhdelete(base_url_goods + "/" + id, null).then(function (result) {
            if(checkData(result,'delete')) {
                queryList();
            }
        });
    }
}

function onSaveClick() {
    var id = $("#id").val();
    var data = {
        name: $("#name").val(),
        pid:MenuDeeps[MenuDeep],
        deep:MenuDeep+1,
        title: $("#title").val(),
        url:$("#url").val()
    };
    if (operation == "add") {
        zhpost(base_url_menu, data, saveResult);
    } else {
        zhput(base_url_menu + "/" + id, data, saveResult);
    }
}

function saveResult(result) {
    if (result.code!=200) {
        showError('保存失败！');
    } else {
        $('#userModal').modal('hide');
        queryList();
        showSuccess('保存成功！');
    }
}

function fillForm(id) {
    var index = 0;
    for (index in menu.rows) {
        var item = menu.rows[index];
        if (item.id == id) {
            $("#id").val(item.id);
            $("#name").val(item.name);
            $("#url").val(item.url);
            $("#pid").val(item.pid);
            $("#deep").val(item.deep);
            return;
        }
    }
}

function cleanForm() {
    $("#id").val("");
    $("#name").val("");
    $("#pid").val("");
    $("#url").val("");
    $("#deep").val("");
}

function returnUpDeep(){
    if(MenuDeep>0)
        onMenu_ManageClick(MenuDeeps[MenuDeep-1],MenuDeep-1)
}
