//$(document).ready(function() {
// 百度地图API功能
function G(id) {
    return document.getElementById(id);
}

function createMap(cityName){
    console.log(cityName)
    var map = new BMap.Map("l-map");
    map.centerAndZoom(cityName,12);                   // 初始化地图,设置城市和地图级别。
    map.enableScrollWheelZoom();
    var cityval=$("#address").val();
    var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
        {"input" : "address"
            ,"location" : map
        });
    $("#address").val(cityval);
    ac.setInputValue($("#address").val());
    ac.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
            value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
            _value = e.toitem.value;
            value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
    });

    var myValue;
    ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
        var _value = e.item.value;
        myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
        setPlace();
    });
    function showInfo(e){
        $(".lat").val(e.point.lat);
        $(".lng").val(e.point.lng);
        showSuccess("定位成功！");
    }
    map.addEventListener("click", showInfo);

    var local = new BMap.LocalSearch(map, {
        renderOptions:{map: map}
    });

    var PanoramaLabel = new BMap.PanoramaLabel();
    $("#searchBtn").bind("click",function(){
        local.search($("#city_name").find("option:selected").text()+$("#city_name_2").find("option:selected").text()+$("#address").val());
        setTimeout(function(){
            $(".lng").val(map.getCenter().lng);
            $(".lat").val(map.getCenter().lat);
        },300);
    });
    $("#address").on("change",function(){
        $("#address").on("blur",function(){
            local.search($("#city_name").find("option:selected").text()+$("#city_name_2").find("option:selected").text()+$("#address").val());
            setTimeout(function(){
                $(".lng").val(map.getCenter().lng);
                $(".lat").val(map.getCenter().lat);
                $("#address").off("blur");
            },300);
        });
    });

    function setPlace(){
        map.clearOverlays();    //清除地图上所有覆盖物
        function myFun(){
            var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            $(".lat").val(pp.lat);
            $(".lng").val(pp.lng)
            map.centerAndZoom(pp, 18);
            map.addOverlay(new BMap.Marker(pp));    //添加标注
        }
        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        if(myValue != ""){
            local.search(myValue);
        }
    }
    var addressId = $(".addressId").val();
    if(addressId != "" && addressId != undefined){
        myValue = $("#city_name").find("option:selected").text()+$("#city_name_2").find("option:selected").text()+$("#address").val();
        setPlace();
        $("#searchBtn").trigger("click");
    }
}

//点击地图，获取经纬度坐标
//    map.addEventListener("click",function(e){
//        document.getElementById("aa").innerHTML = "经度坐标："+e.point.lng+" &nbsp;纬度坐标："+e.point.lat;
//    });


//});