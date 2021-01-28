var base_url_drugsInfo='/rs/bad_record_details';
var base_url_event='/rs/event';
var base_url_drugs='/rs/drugs';
var drugList = [];
var id=0;
var drugsid='';
var suspectedList = [];
var combinedList = [];
$(function(){
    id=getIdByUrl();
    if(id){
        zhget(base_url_drugsInfo,{b_id: id}).then(function (res){
            if(res.code == 200) {
                let picpath = res.bads.picpath.split(',');
                for (let i=0;i<picpath.length;i++) {
                    $('#imglist').append(`<img src="${targetUrl+picpath[i]}" alt="" />`);
                }
            }
        })
    }
    $('#event_text').selectpicker({
        noneSelectedText: '请选择',
        size: 10
    });
    zhget(base_url_event,{order:"create_time desc", status: 1}).then(res => {
        if(res.code == 200) {
            let event_text = $('#event_text');
            for(let i=0;i<res.rows.length;i++){
                event_text.append(`<option value=${res.rows[i].name}>${res.rows[i].name}</option>`)
            }
            $('#event_text').selectpicker('val', '');
            $('#event_text').selectpicker('refresh');
        }
    });
    datepickerFn('occurrence_time');
    datepickerFn('birth_time');
    datepickerFn('datestart');
    datepickerFn('dateend');

});

function datepickerFn(id) {
    $('#'+id).datepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
}

function getdruglist() {
    zhget(base_url_drugs,{status: 1,order: 'create_time desc'}).then(res => {
        if(res.code == 200) {
            $('#name').empty();
            drugList = res.rows;
            let name = $('#name').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                name.append(`<option value='${res.rows[i].title}'>${res.rows[i].title}</option>`)
            }
            $('#name').selectpicker('refresh');
        }
    });
}


function back(){
    location.href="admin.html#pages/bads_record/bads_record.html"
}

function addMedicine() {
    cleanFormVal();
    getdruglist();
    $('#name').selectpicker('refresh');
    $('#addMedicine').modal('show');

    $('.bs-searchbox input').unbind('keyup').keyup(function (e) {
        if(e.keyCode == 13){
            $('#name').append(`<option value='${$(this).val()}'>${$(this).val()}</option>`);
            $('#name').selectpicker('val',$(this).val());
            $('#name').selectpicker('refresh');
            drugsid = '';
        }
    });
}

function cleanFormVal() {
    $('#name').selectpicker('val','');
    $('#commonName').val('');
    $('#allow').val('');
    $('#product').val('');
    $('#productId').val('');
    $('#how').val('');
    $('#datestart').val('');
    $('#dateend').val('');
    $('.iptradio:first').prop('checked',true);
}

$('#name').on('changed.bs.select',(event,clickedIndex) => {
    if (clickedIndex != 0 && clickedIndex <= drugList.length){
        drugsid = drugList[clickedIndex - 1].id;
        $('#commonName').val(drugList[clickedIndex - 1].common_name);
        $('#allow').val(drugList[clickedIndex - 1].approval_number);
        $('#product').val(drugList[clickedIndex - 1].comp_name);
        $('#productId').val(drugList[clickedIndex - 1].batch_number);
        $('#how').val(drugList[clickedIndex - 1].usage_dosage);
    }else {
        drugsid = '';
        cleanFormVal();
    }
});

function confirmAdd() {
    if($('#name').val() == -1 || !$('#name').val()){
        showError('请选择药品名称');
        return false;
    }
    if(!$('#datestart').val() || !$('#dateend').val()){
        showError('请选择用药时间');
        return false;
    }
    let items = {
        type: $('.iptradio:checked').val(),
        title: $('#name').val(),
        common_name: $('#commonName').val(),
        approval_number: $('#allow').val(),
        company_name: $('#product').val(),
        batch_number: $('#productId').val(),
        usage_dosage: $('#how').val(),
        start_time: $('#datestart').val(),
        end_time: $('#dateend').val()
    };
    if(drugsid){
        items.id = drugsid;
    }
    if($('.iptradio:checked').val() == 1){
        suspectedList.push(items);
        createList('suspected',suspectedList);
        $('#addMedicine').modal('hide');
    }else {
        combinedList.push(items);
        createList('blending',combinedList);
        $('#addMedicine').modal('hide');
    }
}

function createList(id,suspected){
    $("#"+id).empty();
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
        bannerhtml+='<td>'+suspected[i].start_time+'~'+suspected[i].end_time+'</td>';
        bannerhtml+="</tr>";
        $("#"+id).append(bannerhtml);
    }
}

function onSaveClick() {
    if(!$('#realname').val()){
        showError('请输入患者姓名');
        return false;
    }
    if(!$('#event_text').val()){
        showError('请选择不良反应/事件名称');
        return false;
    }
    if(!$('#occurrence_time').val()){
        showError('请选择不良反应/事件发生时间');
        return false;
    }
    if(!$('#details').val()){
        showError('请输入不良反应/事件过程描述');
        return false;
    }
    let params = {
        id: id,
        patient: {
            realname: $('#realname').val(),
            gender: $('.gender:checked').val(),
            nation: $('#nation').val(),
            birth_time: $('#birth_time').val(),
            weight: $('#weight').val(),
            phone: $('#phone').val(),
            diseases: $('#diseases').val()
        },
        drugs: suspectedList.concat(combinedList),
        bad_record: {
            category: 3,
            progress: 3,
            event_text: $('#event_text').val().toString(),
            occurrence_time: $('#occurrence_time').val(),
            details: $('#details').val(),
            result: $('.resultText:checked').val(),
            affect: $('.affectText:checked').val(),
            subseq: $('.subseq:checked').val(),
            reuse: $('.reuse:checked').val(),
            type: $("#type").val()
        }
    };
    zhpost('/rs/cleaning_bad',params).then((res) => {
        if(res.code == 200){
            showSuccess('保存成功');
            location.href="admin.html#pages/bads_record/bads_record.html";
        }
    })
}

