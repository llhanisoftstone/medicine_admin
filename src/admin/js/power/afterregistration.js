/**
 * Created by Administrator on 2017/9/1.
 */
var base_url_notification="/rs/member_score_record";
var currentPageNo = 1;
var pageRows1 = 10;
var issearch=false;

$(document).ready(function(){
    $("#resetNotifiSearchBtn").bind("click", function(){
        $("#notificationSearchForm")[0].reset();
        queryList();
    });
    queryList();
    $("#searchNotifiData").unbind("click");
    $("#searchNotifiData").bind("click",searchNotification);
})

function searchNotification(){
    issearch=true;
    currentPageNo=1;
    queryList();
}
function queryList(){

    var data={
        page: currentPageNo,
        size: pageRows1,
        // order:"trait asc",
        order:"create_time desc"
    }
    if(issearch){

        // var quest_rank1=$("#quest_rank1 option:selected").val();
        // if(quest_rank1&&quest_rank1!="-1"){
        //     data.category=quest_rank1;
        // }
        var room_number=$("#roomTitle").val();
        var re_realname=$("#re_realname").val();
        data.room_number=room_number;
        data.re_realname=re_realname;
        data.search=1;
    }

    zhget( "/rs/post_natal_service_member",data).then(function(result){

        if (checkData(result, 'get', 'queryList', 'table-notification')) {
            departmentContact=result;
            for(var i=0;i<result.rows.length;i++){
                //result.rows[i].rowNum = (currentPageNo - 1) * pageRows1 + i + 1;
                //result.rows[i].type=typeCategory(result.rows[i].type);
            }
            buildTableByke(result, 'notification-template', 'notification-placeholder', "paginator", queryList, 10);
        }
    })
}

function onSearchClick() {
    $(".reasonSearch", $("#wrapper")).animate({
        height : 'toggle',
        opacity : 'toggle'
    }, "slow");
}


Handlebars.registerHelper('superif', function (v1, v2, options) {
    if (v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});
// Handlebars.registerHelper('cuoshi', function (v1,v2,options) {
//
//     var str="";
//     console.log(v1)
//
//     var v=v1.split(",");
//     for(var i=0;i<v.length;i++){
//         if(v[i]==1){
//             str+="通风"+" "
//         }else if(v[i]==2){
//             str+="消毒"+" "
//         }else if(v[i]==3){
//             str+="加湿"+" "
//         }
//     }
//     return str;
//
// });




