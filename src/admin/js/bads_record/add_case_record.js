const base_url_drugs = '/rs/drugs';
const base_url_addUrl = '/op/addReport';
const base_url_detail = '/op/queryReportDetail';
const base_url_update = '/op/updateReport';
let ill_info = [];
let ill_info2 = [];
let drugList = [];
let suspectedList = [];
let combinedList = [];
let badList = [];
let relevanceList = [];
let laboratoryList = [];
let pastList = [];
let fileList = [];
let id = 0;
let check = '';
let updateList = null;

$(function () {
    id= getUrlParamsValue('id') == 'undefined'  ? 0 : getUrlParamsValue('id');
    check = getUrlParamsValue('check') == 'undefined' ? '' : getUrlParamsValue('check');

    if (id){
        zhpost(base_url_detail,{id: id}).then(res => {
            if (res.code == 200){
                updateList = res.data;
                if(!$.isEmptyObject(res.data.base)){
                    const { report_type, patient_name, patient_gender, patient_age, patient_country,patient_nation,patient_race,patient_height,patient_weight,patient_phone,ins_name
                        , case_num, is_smoke, is_drink, is_allergy, is_other, med_bad_reaction, patient_birth_time } = res.data.base;
                    $('input[name="type"][value="'+report_type+'"]').prop('checked',true);
                    $('#realname').val(patient_name);
                    $('input[name="gender"][value="'+patient_gender+'"]').prop('checked',true);
                    $('#birth_time').val(patient_birth_time);
                    $('#age').val(patient_age);
                    $('#country').val(patient_country);
                    $('#nation').val(patient_nation);
                    $('#race').val(patient_race);
                    $('#height').val(patient_height);
                    $('#weight').val(patient_weight);
                    $('#phone').val(patient_phone);
                    $('#hospital').val(ins_name);
                    $('#medicineNum').val(case_num);
                    $('input[name="isSmoke"][value="'+is_smoke+'"]').prop('checked',true);
                    $('input[name="isDrink"][value="'+is_drink+'"]').prop('checked',true);
                    $('input[name="isAllergy"][value="'+is_allergy+'"]').prop('checked',true);
                    $('input[name="isOther"][value="'+is_other+'"]').prop('checked',true);
                    $('input[name="past"][value="'+med_bad_reaction+'"]').prop('checked',true);
                    if(res.data.base.case_ill_info && res.data.base.case_ill_info.length > 0){
                        ill_info = res.data.base.case_ill_info;
                        illList();
                    }
                }
                if (res.data.med && res.data.med.length > 0){
                    for (let i=0;i<res.data.med.length;i++){
                        if(res.data.med[i].med_use_type == 0){
                            suspectedList.push(res.data.med[i]);
                            createList('suspected',suspectedList);
                        }else {
                            combinedList.push(res.data.med[i]);
                            createList('blending',combinedList);
                        }
                    }
                }
                if(res.data.bad && res.data.bad.length > 0){
                    badList = res.data.bad;
                    badListFn();
                }
                if(res.data.eva && res.data.eva.length > 0){
                    relevanceList = res.data.eva;
                    relevanceListFn();
                }
                if(res.data.exam && res.data.exam.length > 0){
                    laboratoryList = res.data.exam;
                    laboratoryListFn();
                }
                if (!$.isEmptyObject(res.data.gest)){
                    const { name, gender, birth_time, age, height, weight, last_mens_time, narra, case_med_use } = res.data.gest;
                    $('#famName').val(name);
                    $('input[name="gender2"][value="'+gender+'"]').prop('checked',true);
                    $('#famBirthDate').val(birth_time);
                    $('#famAge').val(age);
                    $('#famHeight').val(height);
                    $('#famWeight').val(weight);
                    $('#secret').val(last_mens_time);
                    $('#gestationDescribe').val(narra);
                    if(res.data.gest.case_ill_info && res.data.gest.case_ill_info.length > 0){
                        ill_info2 = res.data.gest.case_ill_info;
                        illList2();
                    }
                    if(case_med_use && case_med_use.length > 0){
                        pastList = case_med_use;
                        pastListFn();
                    }
                }
                if(!$.isEmptyObject(res.data.add)){
                    $('#reporterName').val(res.data.add.name);
                    $('#company').val(res.data.add.opera);
                    $('#reporterPhone').val(res.data.add.phone);
                    $('#email').val(res.data.add.email);
                    $('input[name="major"][value="'+res.data.add.occupation+'"]').prop('checked',true);
                    $('input[name="evaluate"][value="'+res.data.add.evaluate+'"]').prop('checked',true);
                    $('#eventArea').val(res.data.add.country);
                    $('#firstTime').val(res.data.add.first_time);
                    $('#codeNo').val(res.data.add.case_code);
                    $('#codeNo').val(res.data.add.case_code);
                    $('input[name="source"][value="'+res.data.add.from+'"]').prop('checked',true);
                    $('#MAHName').val(res.data.add.mah_name);
                    $('#connectMan').val(res.data.add.mah_opera);
                    $('#connectPhone').val(res.data.add.mah_phone);
                    $('#address').val(res.data.add.mah_addr);
                    $('#remarks').val(res.data.add.remark);
                    if(res.data.add.filelist && res.data.add.filelist.length > 0){
                        fileList = res.data.add.filelist;
                        fileListFn();
                    }
                }
            }
        })
    }

    if (check == 1){
        $("form[id=addBannerForm] :text").attr("disabled",true);
        $("form[id=addBannerForm] textarea").attr("disabled",true);
        $("form[id=addBannerForm] select").attr("disabled",true);
        $("form[id=addBannerForm] button").attr("disabled",true);
        $("form[id=addBannerForm] :radio").attr("disabled",true);
        $("form[id=addBannerForm] :checkbox").attr("disabled",true);

        $('input[type=number]').attr("disabled",true);
    }

    $.initSystemFileUploadnotLRZ($("#uploadInfo"), onUploadFile);

    datepickerFn('expiring')
    datepickerFn('birth_time');
    datepickerFn('occurrence_time');
    datepickerFn('datestart');
    datepickerFn('dateend');
    datepickerFn('start');
    datepickerFn('end');
    datepickerFn('start2');
    datepickerFn('end2');
    datepickerFn('badStart');
    datepickerFn('badEnd');
    datepickerFn('deadLine');
    datepickerFn('firstTime');
    datepickerFn('checkDate');
    datepickerFn('famBirthDate');
    datepickerFn('pastStart');
    datepickerFn('pastEnd');
    datepickerFn('secret');
});

function diseaseConfirm() {
    if(!$('#diseaseName').val()) {
        showError('请输入疾病名称！');
        return;
    }

    ill_info.push({
        name: $('#diseaseName').val(),
        start_time: $('#start').val() || null,
        end_time: $('#end').val() || null,
        is_exist: $('input[name="isExist"]:checked').val() ? parseInt($('input[name="isExist"]:checked').val()) : null,
        is_exist_str: $('input[name="isExist"]:checked').parent().text() || null
    });

    illList();

    $('#addDisease').modal('hide');
}

function delData(i) {
    if(check != 1){
        ill_info.splice(i,1);
        if(ill_info.length>0){
            illList();
        }else {
            $("#disease").empty();
        }
    }
}

function illList() {
    $("#disease").empty();
    for(let i =0;i<ill_info.length;i++){
        $("#disease").append(`
            <tr>
                <td>${ill_info[i].name || ''}</td>
                <td>${ill_info[i].start_time || ''}</td>
                <td>${ill_info[i].end_time || ''}</td>
                <td>${ill_info[i].is_exist_str || ''}</td>
                <td><span class="delBtn" title="删除" onclick="delData(${i})">删除</span></td>
            </tr>
        `);
    }
}

function addMedicine() {
    $('#medicineInfo')[0].reset();
    getDrugList();
    $('#commonName').selectpicker('refresh');
    $('#addMedicine').modal('show');

    $('.bs-searchbox input').unbind('keyup').keyup(function (e) {
        if(e.keyCode == 13){
            $('#commonName').append(`<option value='${$(this).val()}'>${$(this).val()}</option>`);
            $('#commonName').selectpicker('val',$(this).val());
            $('#commonName').selectpicker('refresh');
        }
    });
}

function medicineConfirm() {
    if (!$('#commonName').val() || !$('#allow').val() || !$('#belong').val() || !$('#sickness').val() || !$('#datestart').val()
        || !$('#dateend').val() || !$('#continue').val() || !$('#drugType').val() || !$('#way').val()) {
        showError('请完善必填信息！');
        return;
    }
    let checkboxVal = [];
    let checkboxStr =[];
    $('input[name="situation"]:checked').each(function () {
        checkboxVal.push(parseInt($(this).val()));
        checkboxStr.push($(this).parent().text())
    });
    let item = {
        med_use_type: parseInt($('.iptradio:checked').val()),
        med_approve_num: $('#allow').val(),
        med_name: $('#name').val() || null,
        med_name_norm: $('#commonName').val(),
        med_spec: $('#standards').val() || null,
        med_approve_owner: $('#belong').val(),
        med_expire_date: $('#expiring').val() || null,
        med_treat_ill: $('#sickness').val(),
        start_time: $('#datestart').val(),
        end_time: $('#dateend').val(),
        duration: $('#continue').val(),
        code: $('#productId').val() || null,
        methods: $('#usage').val() || null,
        ml: $('#drugType').val(),
        way: $('#way').val(),
        relevant_mech: $('#appliance').val() || null,
        med_cond_json: checkboxVal.length > 0 ? checkboxVal : null,
        med_cond_str_json: checkboxStr.length > 0 ? checkboxStr.toString() : null,
        med_measure: $('input[name="step"]:checked').val() ? parseInt($('input[name="step"]:checked').val()) : null,
        med_measure_str: $('input[name="step"]:checked').parent().text() || null
    };
    if($('.iptradio:checked').val() == 0){
        suspectedList.push(item);
        createList('suspected',suspectedList);
        $('#addMedicine').modal('hide');
    }else {
        combinedList.push(item);
        createList('blending',combinedList);
        $('#addMedicine').modal('hide');
    }
}

function createList(id,suspected){
    $("#"+id).empty();
    for(let i =0;i<suspected.length;i++){
        $("#"+id).append(`
            <tr>
                <td>${suspected[i].med_approve_num || ''}</td>';
                <td>${suspected[i].med_name_norm || ''}</td>';
                <td>${suspected[i].med_name || ''}</td>';
                <td>${suspected[i].med_spec || ''}</td>';
                <td>${suspected[i].med_approve_owner || ''}</td>';
                <td>${suspected[i].med_expire_date || ''}</td>';
                <td>${suspected[i].methods || ''}</td>';
                <td>${suspected[i].med_treat_ill || ''}</td>';
                <td>${suspected[i].med_cond_str_json || ''}</td>';
                <td>${suspected[i].med_measure_str || ''}</td>';
                <td><span class="delBtn" title="删除" onclick="delMedicineData(${i},${suspected[i].med_use_type})">删除</span></td>';
            </tr>
        `);
    }
}

function delMedicineData(i,checkVal) {
    if(check != 1){
        if(checkVal == 0){
            suspectedList.splice(i,1);
            if(suspectedList.length>0){
                createList('suspected',suspectedList);
            }else {
                $("#suspected").empty();
            }
        }else {
            combinedList.splice(i,1);
            if(combinedList.length>0){
                createList('blending',combinedList);
            }else {
                $("#blending").empty();
            }
        }
    }
}

function addBadFeeds() {
    $('#badInfo')[0].reset();
    $('.dieOuter').hide();
    $('#addBadFeeds').modal('show');
    $('input[type="radio"][name="result"]').change(function () {
        $('.dieOuter').hide();
        if ($(this).val() == '5'){
            $('.dieOuter').show();
        }
    })
}

function badConfirm() {
    if (!$('#badName').val() || !$('#badStart').val() || !$('#badEnd').val() || !$('#badFlow').val()) {
        showError('请完善必填信息！');
        return;
    }
    badList.push({
        bad_term: $('#badName').val(),
        start_time: $('#badStart').val(),
        duration: $('#badDuring').val() || null,
        end_time: $('#badEnd').val(),
        is_serious: parseInt($('input[name="seriousness"]:checked').val()),
        is_serious_str: $('input[name="seriousness"]:checked').parent().text(),
        result: parseInt($('input[name="result"]:checked').val()),
        result_str: $('input[name="result"]:checked').parent().text(),
        dead_time: $('#deadLine').val() || null,
        dead_reason: $('#deadResult').val() || null,
        is_autopsy: $('input[name="autopsy"]:checked').val() ? parseInt($('input[name="autopsy"]:checked').val()) : null,
        narra: $('#badFlow').val()
    });

    badListFn();

    $('#addBadFeeds').modal('hide');
}

function delBadsData(i) {
    if(check != 1){
        badList.splice(i,1);
        if(badList.length>0){
            badListFn();
        }else {
            $("#badFeels").empty();
        }
    }
}

function badListFn() {
    $("#badFeels").empty();
    for(let i =0;i<badList.length;i++){
        $("#badFeels").append(`
            <tr>
                <td>${badList[i].bad_term || ''}</td>
                <td>${badList[i].start_time || ''}</td>
                <td>${badList[i].duration || ''}</td>
                <td>${badList[i].end_time}</td>
                <td>${badList[i].is_serious_str || ''}</td>
                <td>${badList[i].result_str || ''}</td>
                <td><span class="delBtn" title="删除" onclick="delBadsData(${i})">删除</span></td>
            </tr>
        `);
    }
}

function relevanceConfirm() {
    if ($('#doubtMedicine').val() == -1 || $('#relevanceBad').val() == -1) {
        showError('请完善必填信息！');
        return;
    }
    relevanceList.push({
        case_report_med: $('#doubtMedicine').val(),
        case_report_bad: $('#relevanceBad').val(),
        is_unexpect: parseInt($('input[name="expect"]:checked').val()),
        is_unexpect_str: $('input[name="expect"]:checked').parent().text(),
        is_relief: parseInt($('input[name="reduce"]:checked').val()),
        is_relief_str: $('input[name="reduce"]:checked').parent().text(),
        is_repeat: parseInt($('input[name="again"]:checked').val()),
        is_repeat_str: $('input[name="again"]:checked').parent().text(),
        med_owner_eva: parseInt($('input[name="evaluate"]:checked').val()),
        med_owner_eva_str: $('input[name="evaluate"]:checked').parent().text(),
    });

    relevanceListFn();

    $('#addRelevance').modal('hide');
}

function delRelevanceData(i) {
    if (check != 1){
        relevanceList.splice(i,1);
        if(relevanceList.length>0){
            relevanceListFn();
        }else {
            $("#relevanceList").empty();
        }
    }
}

function relevanceListFn() {
    $("#relevanceList").empty();
    for(let i =0;i<relevanceList.length;i++){
        $("#relevanceList").append(`
            <tr>
                <td>${relevanceList[i].case_report_med || ''}</td>
                <td>${relevanceList[i].case_report_bad || ''}</td>
                <td>${relevanceList[i].is_unexpect_str || ''}</td>
                <td>${relevanceList[i].is_relief_str || ''}</td>
                <td>${relevanceList[i].is_repeat_str || ''}</td>
                <td>${relevanceList[i].med_owner_eva_str || ''}</td>
                <td><span class="delBtn" title="删除" onclick="delRelevanceData(${i})">删除</span></td>
            </tr>
        `);
    }
}

function laboratoryConfirm() {
    if (!$('#checkProject').val()) {
        showError('请输入检查项目！');
        return;
    }
    laboratoryList.push({
        item: $('#checkProject').val(),
        exam_time: $('#checkDate').val() || null,
        result: $('#lResult').val() || null,
        value_range: $('#regular').val() || null
    });

    laboratoryListFn();

    $('#addLaboratory').modal('hide');
}

function delLaboratoryData(i) {
    if(check != 1){
        laboratoryList.splice(i,1);
        if(laboratoryList.length>0){
            laboratoryListFn();
        }else {
            $("#laboratoryList").empty();
        }
    }
}

function laboratoryListFn() {
    $("#laboratoryList").empty();
    for(let i =0;i<laboratoryList.length;i++){
        $("#laboratoryList").append(`
            <tr>
                <td>${laboratoryList[i].item || ''}</td>
                <td>${laboratoryList[i].exam_time || ''}</td>
                <td>${laboratoryList[i].result || ''}</td>
                <td>${laboratoryList[i].value_range || ''}</td>
                <td><span class="delBtn" title="删除" onclick="delLaboratoryData(${i})">删除</span></td>
            </tr>
        `);
    }
}

function diseaseConfirm2() {
    if(!$('#diseaseName2').val()) {
        showError('请输入疾病名称！');
        return;
    }

    ill_info2.push({
        name: $('#diseaseName2').val(),
        start_time: $('#start2').val() || null,
        end_time: $('#end2').val() || null,
        is_exist: $('input[name="isExist2"]:checked').val() ? parseInt($('input[name="isExist2"]:checked').val()) : null,
        is_exist_str: $('input[name="isExist2"]:checked').parent().text() || null
    });

    illList2();

    $('#addDisease2').modal('hide');
}

function delData2(i) {
    if(check != 1){
        ill_info2.splice(i,1);
        if(ill_info2.length>0){
            illList2();
        }else {
            $("#diseaseList").empty();
        }
    }
}

function illList2() {
    $("#diseaseList").empty();
    for(let i =0;i<ill_info2.length;i++){
        $("#diseaseList").append(`
            <tr>
                <td>${ill_info2[i].name || ''}</td>
                <td>${ill_info2[i].start_time || ''}</td>
                <td>${ill_info2[i].end_time || ''}</td>
                <td>${ill_info2[i].is_exist_str || ''}</td>
                <td><span class="delBtn" title="删除" onclick="delData2(${i})">删除</span></td>
            </tr>
        `);
    }
}

function pastConfirm() {
    if(!$('#medicineName').val()) {
        showError('请输入药物名称！');
        return;
    }

    pastList.push({
        name: $('#medicineName').val(),
        start_time: $('#pastStart').val() || null,
        end_time: $('#pastEnd').val() || null,
        treat: $('#medicineAction').val() || null
    });

    pastListFn();

    $('#addPastMedicine').modal('hide');
}

function delPastData(i) {
    if(check != 1){
        pastList.splice(i,1);
        if(pastList.length>0){
            pastListFn();
        }else {
            $("#pastMedicineList").empty();
        }
    }
}

function pastListFn() {
    $("#pastMedicineList").empty();
    for(let i =0;i<pastList.length;i++){
        $("#pastMedicineList").append(`
            <tr>
                <td>${pastList[i].name || ''}</td>
                <td>${pastList[i].start_time || ''}</td>
                <td>${pastList[i].end_time || ''}</td>
                <td>${pastList[i].treat || ''}</td>
                <td><span class="delBtn" title="删除" onclick="delPastData(${i})">删除</span></td>
            </tr>
        `);
    }
}

function filesConfirm() {
    if(!$('#uploadTime').val()) {
        showError('请输入上传文件！');
        return;
    }

    fileList.push({
        url: $('#url').val(),
        filename: $('#fileName').val() || null,
        upload_time: $('#uploadTime').val(),
        type: $('#fileType').val(),
        name: $('#uploadCompany').val() || null,
        summary: $('#summary').val() || null,
        file_dir: $('#file_dir').val()
    });

    fileListFn();

    $('#uploadFiles').modal('hide');
}

function delUploadData(i,name,type) {
    if (check != 1){
        fileList.splice(i,1);
        if(fileList.length>0){
            fileListFn();
        }else {
            $("#uploadList").empty();
        }
    }else {
        let params = {
            id: i,
            upType: 'report_files'
        };

        downloadFile(params,`${name}.${type}`,'/op/downloadFile');
    }
}

function fileListFn() {
    $("#uploadList").empty();
    for(let i =0;i<fileList.length;i++){
        if(check == 1){
            $("#uploadList").append(`
                <tr>
                    <td>${fileList[i].name || ''}</td>
                    <td>${fileList[i].upload_time || ''}</td>
                    <td>${fileList[i].filename || ''}</td>
                    <td>${fileList[i].type}</td>
                    <td>${fileList[i].summary || ''}</td>
                    <td><span class="rolelimit" title="下载" onclick="delUploadData('${fileList[i].id}','${fileList[i].filename}','${fileList[i].type}')">下载</span></td>
                </tr>
            `);
        }else {
            $("#uploadList").append(`
                <tr>
                    <td>${fileList[i].name || ''}</td>
                    <td>${fileList[i].upload_time || ''}</td>
                    <td>${fileList[i].filename || ''}</td>
                    <td>${fileList[i].type}</td>
                    <td>${fileList[i].summary || ''}</td>
                    <td><span class="delBtn" title="删除" onclick="delUploadData(${i})">删除</span></td>
                </tr>
            `);
        }
    }
}

function onSaveClick() {
    if (!$('#realname').val() || !$('#birth_time').val() || !$('#age').val() || !$('#reporterName').val() || !$('#eventArea').val() ||
    !$('#firstTime').val() || !$('#codeNo').val() || !$('#MAHName').val() || !$('#connectMan').val() || !$('#connectPhone').val()) {
        showError('请完善必填项信息');
        return;
    }

    let  params = {
        report_type: parseInt($('input[name="type"]:checked').val()),
        base: {
            patient_name: $('#realname').val(),
            patient_gender: parseInt($('input[name="gender"]:checked').val()),
            patient_age: parseInt($('#age').val()),
            patient_birth_time: $('#birth_time').val(),
            patient_country: $('#country').val() || null,
            patient_nation: $('#nation').val() || null,
            patient_race: $('#race').val() || null,
            patient_height: $('#height').val() ? parseInt($('#height').val()) : null,
            patient_weight: $('#weight').val() ? parseInt($('#weight').val()) : null,
            patient_phone: $('#phone').val() || null,
            ins_name: $('#hospital').val() || null,
            case_num: $('#medicineNum').val() || null,
            is_smoke: $('input[name="isSmoke"]:checked').val() ? parseInt($('input[name="isSmoke"]:checked').val()) : null,
            is_drink: $('input[name="isDrink"]:checked').val() ? parseInt($('input[name="isDrink"]:checked').val()) : null,
            is_allergy: $('input[name="isAllergy"]:checked').val() ? parseInt($('input[name="isAllergy"]:checked').val()) : null,
            is_other: $('input[name="isOther"]:checked').val() ? parseInt($('input[name="isOther"]:checked').val()) : null,
            med_bad_reaction: $('input[name="past"]:checked').val() ? parseInt($('input[name="past"]:checked').val()) : null,
            case_ill_info: ill_info
        },
        med: suspectedList.concat(combinedList),
        bad: badList,
        eva: relevanceList,
        exam: laboratoryList,
        gest: {
            name: $('#famName').val() || null,
            gender: $('input[name="gender2"]:checked').val() ? parseInt($('input[name="gender2"]:checked').val()) : null,
            birth_time: $('#famBirthDate').val() || null,
            age: $('#famAge').val() ? parseInt($('#famAge').val()) : null,
            height: $('#famHeight').val() ? parseInt($('#famHeight').val()) : null,
            weight: $('#famWeight').val() ? parseInt($('#famWeight').val()) : null,
            last_mens_time: $('#secret').val() || null,
            narra: $('#gestationDescribe').val() || null,
            case_ill_info: ill_info2,
            case_med_use: pastList
        },
        add: {
            name: $('#reporterName').val(),
            opera: $('#company').val() || null,
            phone: $('#reporterPhone').val() || null,
            email: $('#email').val() || null,
            occupation: parseInt($('input[name="major"]:checked').val()),
            evaluate: parseInt($('input[name="initial"]:checked').val()),
            country: $('#eventArea').val(),
            first_time: $('#firstTime').val(),
            case_code: $('#codeNo').val(),
            from: parseInt($('input[name="source"]:checked').val()),
            mah_name: $('#MAHName').val(),
            mah_opera: $('#connectMan').val(),
            mah_phone: $('#connectPhone').val(),
            mah_addr: $('#address').val() || null,
            remark: $('#remarks').val() || null,
            filelist: fileList
        }
    };

    if(id){
        let data = Object.assign({},updateList);
        for (var p in updateList){
            if(typeof updateList[p].length === 'undefined'){
                for (var j in updateList[p]){
                    if (updateList[p][j] !== undefined && params[p][j] !== undefined){
                        data[p][j] = params[p][j];
                    }else {
                        data[p][j] = updateList[p][j];
                    }
                }
            }else {
                data[p] = params[p]
            }
        }
        data.id = id;
        data.report_type = parseInt($('input[name="type"]:checked').val());
        zhpost(base_url_update,data).then(res => {
            if (res.code == 200){
                showSuccess(res.message);
                back();
            }
        });
        return;
    }

    zhpost(base_url_addUrl,params).then(res => {
        if (res.code == 200){
            showSuccess(res.message);
            back();
        }
    })
}

function back() {
    location.href="admin.html#pages/bads_record/case_record.html"
}

function getDrugList() {
    zhget(base_url_drugs,{status: 1,order: 'create_time desc'}).then(res => {
        if(res.code == 200) {
            $('#commonName').empty();
            drugList = res.rows;
            let commonName = $('#commonName').append(`<option value='-1'>请选择</option>`);
            for(let i=0;i<res.rows.length;i++){
                commonName.append(`<option value='${res.rows[i].common_name}'>${res.rows[i].common_name}</option>`)
            }
            $('#commonName').selectpicker('refresh');
        }
    });
}

$('#commonName').on('changed.bs.select',(event,clickedIndex) => {
    if (clickedIndex != 0 && clickedIndex <= drugList.length){
        $('#name').val(drugList[clickedIndex - 1].title);
        $('#allow').val(drugList[clickedIndex - 1].approval_number);
        $('#usage').val(drugList[clickedIndex - 1].usage_dosage);
    }else {
        $('#medicineInfo')[0].reset();
    }
});

// 文件上传
function onUploadFile(formObject, fileComp, list) {
    if(list.length > 0 && list[0].code == 200){
        showSuccess('上传成功！')
        $('#uploadTime').val(list[0].date);
        let fileName = list[0].filename;
        $('#fileName').val(fileName.substr(0,fileName.lastIndexOf('.')))
        $('#fileType').val(list[0].type);
        $('#url').val(list[0].url);
        $('#file_dir').val(list[0].file_dir);
    }
}

function modalShow(formId,modalId) {
    if (modalId == 'addRelevance'){
        $('#doubtMedicine').empty();
        $('#relevanceBad').empty();
        let doubtMedicine = $('#doubtMedicine').append(`<option value="-1">请选择</option>`);
        let relevanceBad = $('#relevanceBad').append(`<option value="-1">请选择</option>`);
        for (let i=0;i<suspectedList.length;i++){
            doubtMedicine.append(`<option value="${suspectedList[i].med_name_norm}">${suspectedList[i].med_name_norm}</option>`)
        }
        for (let i=0;i<badList.length;i++){
            relevanceBad.append(`<option value="${badList[i].bad_term}">${badList[i].bad_term}</option>`)
        }
    }
    $('#'+formId)[0].reset();
    $('#'+modalId).modal('show');
}

function datepickerFn(id) {
    $('#'+id).datepicker({
        format: 'yyyy-mm-dd',
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
}