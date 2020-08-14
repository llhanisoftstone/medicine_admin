var compid;
var level;
$(document).ready(function(){
    containerHeightOut();
});
$(window).resize(function(){
    containerHeightOut();
});
function containerHeightOut(){
    let docH=$(document.body).height();
    let navH=$('#nav').height()+parseFloat($('#nav').css('border-bottom-width'));
    let container=$('#container');
    container.height(docH-navH-parseFloat(container.css('padding-top'))-parseFloat(container.css('padding-bottom'))+'px');
}
$(function(){
    compid = sessionStorage.getItem('compid');
    level = sessionStorage.getItem('userlevel');
    getStatisticalData();
    dates()
});

function getStatisticalData(){
    var data = {};
    if(level == 80){
        data.comp_id = compid;
    }
    zhpost('/rs/statics_data', data).then( function (result) {
        if(result.bg_count && result.bg_count > 0){
            $("#bg_count").html('（'+result.bg_count+'份)');
        }
        if(result.bus_count && result.bus_count > 0){
            $("#bus_count").html('（'+result.bus_count+'名)');
        }
        if(result.dr_count && result.dr_count > 0){
            $("#dr_count").html('（'+result.dr_count+'种）');
        }
        if(result.gj_count && result.gj_count > 0){
            $("#gj_count").html('（'+result.gj_count+'例）');
        }
        if(result.cp_count && result.cp_count > 0){
            $("#cp_count").html('（'+result.cp_count+'家）');
        }
    })
}

function baogao(){
    location.href="admin.html#pages/bads_record/bads_record.html"
}

function yonghu(){
    if(level < 90){
        showError('无访问权限')
        return
    }else{
        location.href="admin.html#pages/member.html"
    }
}

function yaopin(){
    location.href="admin.html#pages/drugs.html"
}

function fengxian(){
    if(level < 81){
        showError('无访问权限')
        return
    }else{
        location.href="admin.html#pages/bads_record/bads_record.html?type=1"
    }
}

function qiye(){
    if(level < 90){
        showError('无访问权限')
        return
    }else{
        location.href="admin.html#pages/company.html"
    }
}

function quanxian(){
    if(level < 90){
        showError('无访问权限')
        return
    }else{
        location.href="admin.html#pages/role/roleAdmin.html"
    }
}

function meiwen(){
    if(level < 90){
        showError('无访问权限')
        return
    }else{
        location.href="admin.html#pages/informationList.html"
    }
}

function dates(){
    var timer=setInterval(()=>{
        let nows=new Date();
        let hour=toDub(nows.getHours());
        let min=toDub(nows.getMinutes());
        let sec=toDub(nows.getSeconds());
        let year=nows.getFullYear();
        let mon=toDub(nows.getMonth()+1);
        let day=toDub(nows.getDate());
        let week=nows.getDay();
        var date=hour+":"+min+":"+sec;
        var years=year+"-"+mon+"-"+day+" "+"星期"+toStr(week);
        $('.timer').html(date);
        $('.dates').html(years)
    },0)
}
function toDub(num) {
    return num > 9 ? '' + num : '0' + num;
}
function toStr(str) {
    switch(str){
        case 1:
            return str="一";
            break;
        case 2:
            return str="二";
            break;
        case 3:
            return str="三";
            break;
        case 4:
            return str="四";
            break;
        case 5:
            return str="五";
            break;
        case 6:
            return  str="六";
            break;
        case 0:
            return  str="日";
            break;
    }
}