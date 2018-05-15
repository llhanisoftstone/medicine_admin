$.extend({
	//显示正在加载
	initSystemFileUpload:function(formObject, callBack, onChangeCallBack)
	{
		'use strict';
		formObject.find("input[type='file']").each(function(){
			var fileComp = $(this);
			fileComp.unbind();
			fileComp.bind('change',function(){
				console.log(this.files.length)
				var result = [];
				var fileLength = this.files.length;
				for(var i = 0;i<this.files.length;i++){
					lrz(this.files[i], {width: 750,fileName:$(this).attr("name")})
						.then(function (rst) {
							rst.formData.append('fileLen', rst.fileLen);
							rst.formData.append('upType', fileComp.attr("uptype")==null?"advPic":fileComp.attr("uptype"));
							$.showActionLoading();
							$.ajax({
								url: targetUrl + '/op/upload',
								data: $.extend(rst.formData, {sid:getCookie('sid')}),
								processData: false,
								contentType: false,
								type: 'POST',
								success: function (data) {
									// alert(JSON.stringify(data));
									$.hideActionLoading();
									result.push(data[0]);
									if(result.length == fileLength && fileLength > 1){
										callBack(formObject, fileComp, result);
									}else if(fileLength == 1){
										callBack(formObject, fileComp, data);
									}
								}
							});
						});
					}
			})
		});
	},
    initSystemFileUploadnotLRZ:function(formObject, callBack, onChangeCallBack)
    {
        'use strict';
        formObject.find("input[type='file']").each(
            function() {
                var fileComp = $(this);
                var parent = fileComp.parent().parent();
                fileComp.fileupload({
                    url : targetUrl + '/op/upload',
                    dataType : 'json',
                    formData:{upType: fileComp.attr("uptype")==null?"titlePic":fileComp.attr("uptype"),sid:getCookie('sid')},
                    done : function(e, data) {
                        $.hideActionLoading();
                        var result = data.result;
                        var status = result[0].code;
                        fileComp.val("") //防止选择同一个文件不触发change事件
                        switch (status) {
                            case 200: {
                                callBack(formObject, fileComp, result);
                                break;
                            }
                            default:
                                break;
                        }
                    },
                    progressall : function(e, data) {
                        $.showActionLoading();
                        var progress = parseInt(data.loaded / data.total
                            * 100, 10);
                        console.log(progress)
                        if (progress == 100) {
                            $.hideActionLoading();
                        }
                    },
                    fail : function(e, data) {
                        $.hideActionLoading();
                        alert('上传出现异常');
                    }
                });
            });
    }
});