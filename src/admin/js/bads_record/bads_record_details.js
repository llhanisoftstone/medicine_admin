var base_url_drugs='/rs/bad_record_details';
var id=0;
var resultText = ['','痊愈','好转','未好转']
var affectText = ['','不明显','病情延长','病情加重']
var reuseText = ['','是','否','不明','未再使用']
var subseqText = ['','是','否','不明','未停药或未减轻']
$(function(){
    id=getIdByUrl();
    var level = sessionStorage.getItem('userlevel');
    if(level == 80){
        $("#bads_type").hide();
    }
    if(id){
        zhget(base_url_drugs,{b_id: id}).then(function (result){
            if(result.user){
                $("#realname").val(result.user.realname);
                var genderText = '男';
                if(result.user.gender == 2){
                    genderText = '女'
                }
                $("#genderText").val(genderText);
                $("#nation").val(result.user.nation);
                var birth_time = result.user.birth_time.substring(0, 10);
                $("#birth_time").val(birth_time);
                var current_year = new Date().getFullYear();
                var actual_year = new Date(birth_time).getFullYear();
                $("#age").val(current_year-actual_year);
                if(result.user.weight){
                    $("#weight").val(result.user.weight+"kg");
                }else{
                    $("#weight").val(0);
                }
                $("#phone").val(result.user.phone);
                $("#diseases").val(result.user.diseases);
            }
            if(result.suspected.length > 0){
                createsuspected(result.suspected)
            }else{
                $("#issuspected").hide();
            }
            if(result.blending.length > 0){
                createblending(result.blending)
            }else{
                $("#isblending").hide();
            }
            if(result.bads){
                $("#event_text").val(result.bads.event_text);
                var occurrence_time = result.bads.occurrence_time.substring(0, 10);
                $("#occurrence_time").val(occurrence_time);
                $("#resultText").val(resultText[result.bads.result]);
                $("#affectText").val(affectText[result.bads.affect]);
                $("#details").val(result.bads.details);
                $("#subseq").val(subseqText[result.bads.subseq]);
                $("#reuse").val(reuseText[result.bads.reuse]);
                $("#type").val(result.bads.type);
            }
            if (result.bads.category == 3) {
                $('#saveCarouselData').hide()
            }
        })
    }
})

function createsuspected(suspected){
    for(var i =0;i<suspected.length;i++){
        var bannerhtml="<tr>";
        var index = i+1;
        bannerhtml+='<td>'+index+'</td>';
        bannerhtml+='<td>'+suspected[i].approval_number+'</td>';
        bannerhtml+='<td>'+suspected[i].title+'</td>';
        bannerhtml+='<td>'+suspected[i].common_name+'</td>';
        bannerhtml+='<td>'+suspected[i].company_name+'</td>';
        bannerhtml+='<td>'+suspected[i].batch_number+'</td>';
        bannerhtml+='<td>'+suspected[i].usage_dosage+'</td>';
        bannerhtml+='<td>'+suspected[i].start_time.substring(0,10)+'~'+suspected[i].end_time.substring(0,10)+'</td>';
        bannerhtml+="</tr>";
        $("#suspected").append(bannerhtml);
    }
}

function createblending(blending){
    for(var i =0;i<blending.length;i++){
        var bannerhtml="<tr>";
        var index = i+1;
        bannerhtml+='<td>'+index+'</td>';
        bannerhtml+='<td>'+blending[i].approval_number+'</td>';
        bannerhtml+='<td>'+blending[i].title+'</td>';
        bannerhtml+='<td>'+blending[i].common_name+'</td>';
        bannerhtml+='<td>'+blending[i].company_name+'</td>';
        bannerhtml+='<td>'+blending[i].batch_number+'</td>';
        bannerhtml+='<td>'+blending[i].usage_dosage+'</td>';
        bannerhtml+='<td>'+blending[i].start_time.substring(0,10)+'~'+blending[i].end_time.substring(0,10)+'</td>';
        bannerhtml+="</tr>";
        $("#blending").append(bannerhtml);
    }
}

function onSaveClick() {
    var type = $("#type").val();
    if(type){
        zhput('/rs/bad_record/'+id,{type:type}).then(function (result){
            if(checkData(result,'put')){
                back();
            }
        })
    }
}

function back(){
    location.href="admin.html#pages/bads_record/bads_record.html"
}
