'use strict'
var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var compression = require("compression");
// var cors = require('cors');
var app = express();
app.disable('x-powered-by');
// app.use(cors());
app.use(compression());
app.use(express.static(path.join(__dirname, 'src'), {index:'index.html'}));
// app.use(express.static(path.join(__dirname, 'src/app'), {index:'html/index.html'}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.json({err: {
        message: '发生错误了',
        error: err
    }});
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({err: {
            message: err.message,
            error: err
        }});
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({err: {
        message: err.message,
        error: {}
    }});
});

app.listen(3030, function(){
    console.log('Express server listening on port 3030')
});

function oToStr(object, name){
    var fks = Object.keys(object)
    if(fks.length == 0)
        return ''
    var str = ' ' + name + ' : {';
    for(var i = 0; i < fks.length; i++){
        str += '"'+fks[i]+'":'+'"'+object[fks[i]]+'",'
    }
    if(fks.length)
        str = str.substr(0,str.length - 1) + '};'
    return str;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


