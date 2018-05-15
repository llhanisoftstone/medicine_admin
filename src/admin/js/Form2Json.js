function paramString2obj (serializedParams){
	var obj={};
	function evalThem (str) {
		var attributeName = str.split("=")[0];
		var attributeValue = str.split("=")[1];
		if(!attributeValue){
			return ;
		}
		var array = attributeName.split(".");
		for (var i = 1; i < array.length; i++) {
			var tmpArray = Array();
			tmpArray.push("obj");
			for (var j = 0; j < i; j++) {
				tmpArray.push(array[j]);
			}
			var evalString = tmpArray.join(".");
			// alert(evalString);
			if(!eval(evalString)){
				eval(evalString+"={};"); 
			}
		}

		if(obj[attributeName]){
			if(obj[attributeName] instanceof Array){
				obj[attributeName].push(attributeValue);
			}else{
				var temp = obj[attributeName];
				obj[attributeName] = [];
				obj[attributeName].push(temp);
				obj[attributeName].push(attributeValue);
			}
		}else{
			obj[attributeName]=attributeValue;
//		   eval("obj."+attributeName+"='"+attributeValue+"';");
		}
		
		eval("obj."+attributeName+"=\""+attributeValue.trim()+"\";");
		
	}
	var properties = serializedParams.split("&");
	for (var i = 0; i < properties.length; i++) {
		evalThem(properties[i]);
	}
	return obj;
}

$.fn.formReset = function(){
	var form = $(this);
	form.find("input").val("");
	var selects = form.find("select");
	selects.each(function(){
		var option = $(this).children();
		if (option.size() > 0)
		{
			option[0].selected = true; 
		}
	});
	form.find("textarea").val("");
};

$.fn.form2json = function(){
	var serializedParams = this.serialize();
	serializedParams = serializedParams.replace(/\+/g," ");
	serializedParams = decodeURIComponent(serializedParams);
	var obj = paramString2obj(serializedParams);
	return obj;
};