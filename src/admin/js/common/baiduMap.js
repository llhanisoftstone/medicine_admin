//$(document).ready(function() {
// 百度地图API功能
function G(id) {
    return document.getElementById(id);
}

function createMap(cityName){
    var map = new BMap.Map("l-map");
    if(cityName.lng){
        var point = new BMap.Point(cityName.lng,cityName.lat)
        map.centerAndZoom(point,18);                   // 初始化地图,设置城市和地图级别。
        map.addOverlay(new BMap.Marker(point));    //添加标注
        setTimeout(function(){
            map.panTo(point,18);
        }, 1400);
    }else{
        map.centerAndZoom(cityName,12);                   // 初始化地图,设置城市和地图级别。
    }
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
        map.clearOverlays();
        var geocoder= new BMap.Geocoder();
        geocoder.getLocation(e.point,function(rs){
            var as = regularAddress(rs);
            $("#addressInfo").val(as);
        })
        $("#latitude").val(e.point.lat);
        $("#longitude").val(e.point.lng);
        var point = new BMap.Point(e.point.lng, e.point.lat);
        var marker = new BMap.Marker(point)
        map.addOverlay(marker);
    }

    map.addEventListener("click", showInfo);

    var local = new BMap.LocalSearch(map, {
        renderOptions:{map: map}
    });

    var PanoramaLabel = new BMap.PanoramaLabel();
    $("#searchBtn").bind("click",function(){
        local.search($("#addressInfo").val());
        setTimeout(function(){
            $("#longitude").val(map.getCenter().lng);
            $("#latitude").val(map.getCenter().lat);
        },500);
    });
    $("#addressInfo").on("change",function(){
        $("#addressInfo").on("blur",function(){
            local.search($("#addressInfo").val());
            setTimeout(function(){
                $("#longitude").val(map.getCenter().lng);
                $("#latitude").val(map.getCenter().lat);
                $("#addressInfo").off("blur");
            },500);
        });
    });

    function regularAddress(address){
        var ads = '',adrs = '';
        $("#zone").val(address.addressComponents.district);
        if(address.surroundingPois.length > 0){
            var res = address.surroundingPois[0].address;
            adrs = address.surroundingPois[0].address;
            if(res.indexOf(address.addressComponents.province) == -1){
                ads += address.addressComponents.province;
            }else{
                adrs = adrs.replace(address.addressComponents.province,'');
            }
            if(res.indexOf(address.addressComponents.city) == -1){
                ads += address.addressComponents.city;
            }else{
                adrs = adrs.replace(address.addressComponents.city,'');
            }
            if(res.indexOf(address.addressComponents.district) == -1){
                ads += address.addressComponents.district;
            }else{
                adrs = adrs.replace(address.addressComponents.district,'');
            }
            ads = ads + res + address.surroundingPois[0].title;
            adrs = adrs + address.surroundingPois[0].title;
            $("#address").val(adrs);
        }else{
            var res = address.address;
            adrs = address.address;
            if(res.indexOf(address.addressComponents.province) == -1){
                ads += address.addressComponents.province
            }else{
                adrs = adrs.replace(address.addressComponents.province,'');
            }
            if(res.indexOf(address.addressComponents.city) == -1){
                ads += address.addressComponents.city;
            }else{
                adrs = adrs.replace(address.addressComponents.city,'');
            }
            if(res.indexOf(address.addressComponents.district) == -1){
                ads += address.addressComponents.district;
            }else{
                adrs = adrs.replace(address.addressComponents.district,'');
            }
            ads = ads + res;
            $("#address").val(adrs);
        }
        return ads;
    }

    function setPlace(){
        map.clearOverlays();    //清除地图上所有覆盖物
        function myFun(){
            var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            $("#latitude").val(pp.lat);
            $("#longitude").val(pp.lng)
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
    // if(addressId != "" && addressId != undefined){
    //     myValue = $("#addressInfo").val();
    //     // setPlace();
    //     // $("#searchBtn").trigger("click");
    // }
}