$(function () {
    // if($('#l-map').length > 0){
    //     $('#l-map').hide()
    //     $('#zone').bind('change',function () {
    //         $('#l-map').show();
    //         createMap($("#province").find("option:selected").text()+$("#cityName").find("option:selected").text()+$("#zone").find("option:selected").text())
    //     })
    // }
    createMap('西安市');

    $('.datestart').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language : 'cn',
        autoclose: true,
    });
    $('.dateend').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language : 'cn',
        autoclose: true,
    });

    UE.getEditor('planProtocolAddUE1',{
        initialFrameWidth: '100%',  //设置编译器宽度
        initialFrameHeight: '400',  //设置编译器高度
        scaleEnabled: false //设置不自动调整
    })
})

function addUser() {
    $('#selectUser').animate({
        height: 'toggle',
        opacity: 'toggle'
    },'slow')
    if($(".selectUser").is(":visible")) {
        isSearch=false;
    }
}

function back() {
    location.href = 'admin.html#pages/plan_manage.html'
}