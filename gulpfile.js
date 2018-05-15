var config = require('./config');
var gulp = require('gulp');
var minifyCss = require('gulp-clean-css'); //- 压缩CSS为一行；
var htmlmin = require('gulp-htmlmin');
var rev = require('gulp-rev'); //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector'); //- 路径替换
var clean = require('gulp-clean');
var uglify = require('gulp-uglify')
//串行执行任务
var runSequence = require('run-sequence');
//同个task下合并多个步骤
var mergeStream = require('merge-stream');
//图片压缩相关
var imagemin = require('gulp-imagemin');
//cach
var cache = require('gulp-cache');
//错误抛出的补丁->防止异常情况下停止程序
var plumber = require('gulp-plumber');
//内容替换
var replace = require('gulp-replace');
var base64 = require('gulp-base64');
var del = require('del');

var handleErrors = function(error) {
    //继续监听
    console.log("~~~错误:" + error);
};
//情况以前目录
gulp.task('clean', function() {
    return gulp.src([
        config.clean.src
    ])
    //异常处理的补丁
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(clean({
            force: true
        }));
});
//处理需要md5签名的图片
gulp.task('dealMd5Img', function() {
    //排除html/**/img下面的
    //排除/libs/**/img下的
    return gulp.src([config.img.src, '!' + config.html.img.src, '!' + config.libs.img.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(rev())
        .pipe(gulp.dest(config.img.dest))
        .pipe(rev.manifest(config.img.revJson, {
            //不合并
            merge: false
        }))
        //因为已经进入了json了,所以默认./就行
        .pipe(gulp.dest('./'));
});
//处理其他的图片-除去上面压缩后的
gulp.task('dealOtherImg', function() {
    //html/**/img下面的
    ///libs/**/img下的
    var htmlImg = gulp.src([config.html.img.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(config.html.img.dest));
    var libsImg = gulp.src([config.libs.img.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(config.libs.img.dest));

    return mergeStream(htmlImg, libsImg);
});
//压缩并处理 json-这个是json文件夹下面的配置,只处理这个文件夹
gulp.task('dealJSON', function() {
    return gulp.src([config.json.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(rev())
        .pipe(gulp.dest(config.json.dest))
        .pipe(rev.manifest(config.json.revJson, {
            //不合并
            merge: false
        }))
        //因为已经进入了json了,所以默认./就行
        .pipe(gulp.dest('./'));
});
//处理css
gulp.task('dealCss', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    //排除libs下的css
    return gulp.src([config.rev.revJson, config.css.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(minifyCss()) //- 压缩处理成一行
        .pipe(rev()) //- 文件名加MD5后缀
        .pipe(gulp.dest(config.css.dest)) //- 输出文件本地,*号会自动输出
        .pipe(rev.manifest(config.css.revJson, {
            merge: false
        }))
        .pipe(gulp.dest('./')); //- 将 rev-manifest.json 保存到 rev 目录内
});
//先处理框架第三方不会依赖其它脚本的文件,排除seajs的配置,排除cacheConfig配置
//先处理的css,所以core里就算有引用css也没问题
gulp.task('dealCoreJs', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.rev.revJson, config.js.coreJs.src, '!' + config.js.seaConfigJs.src, '!' + config.js.cacheConfigJs.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['jQuery','require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.js.coreJs.dest))
        .pipe(rev.manifest(config.js.coreJs.revJson, {
            merge: false
        }))
        .pipe(gulp.dest('./'));
});
//再处理业务js,会依赖于以上的两种js
//排除业务处理的config
gulp.task('dealBizlogicJs', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.rev.revJson, config.js.bizlogicJs.src, '!' + config.js.bizConfigJs.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['jQuery','require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.js.bizlogicJs.dest))
        .pipe(rev.manifest(config.js.bizlogicJs.revJson, {
            merge: false
        }))
        .pipe(gulp.dest('./'));
});

//再处理seajs的配置,或者是项目中的配置
gulp.task('dealSeaConfig', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.rev.revJson, config.js.seaConfigJs.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['jQuery','require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.js.seaConfigJs.dest))
        .pipe(rev.manifest(config.js.seaConfigJs.revJson, {
            //允许合并以前的bizConfig
            //这里注意,如果是通过路径找到的json，则merge有用,否则merge并没有用
            merge: true
        }))
        .pipe(gulp.dest('./'));
});
//处理bizConfigJs的配置,或者是项目中的配置
//排除业务设置的路径
gulp.task('dealBizConfig', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.rev.revJson, config.js.bizConfigJs.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['jQuery','require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.js.bizConfigJs.dest))
        .pipe(rev.manifest(config.js.bizConfigJs.revJson, {
            merge: true
        }))
        .pipe(gulp.dest('./'));
});
//cacheController->控制引入seaConfig
gulp.task('dealCacheConfigJs', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.rev.revJson, config.js.cacheConfigJs.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['jQuery','require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.js.cacheConfigJs.dest))
        .pipe(rev.manifest(config.js.cacheConfigJs.revJson, {
            merge: true
        }))
        .pipe(gulp.dest('./'));
});
//处理html
gulp.task('dealHtml', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.rev.revJson, config.html.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(revCollector())
        .pipe(htmlmin({
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            //有时候有这个配置会出错(当代码作为示例显示时),所以脚本和css只压缩单独的文件
            minifyJS: true,
            minifyCSS: true
        })) //压缩
        .pipe(gulp.dest(config.html.dest));
});
//处理其它,除去img,css,html,js,以外的,单独包括.project文件
gulp.task('dealOthers', function() {
    //出去svn
    return gulp.src([config.other.src, config.other.project.src, '!' + config.js.coreJs.src, '!' + config.js.bizlogicJs.src, '!' + config.css.src, '!' + config.html.src, '!' + config.json.src, '!' + config.img.src, '!' + config.other.svn.src, '!' + config.other.settings.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(gulp.dest(config.other.dest));
});

// 看守
gulp.task('watch', function() {

    console.log("路径:" + config.src + '/gulpWatch.json');
    // 看守所有位在 dist/  目录下的档案，一旦有更动，便进行重整
    //	gulp.watch([config.src+'/gulpWatch.json']).on('change', function(file) {
    //		console.log("改动");
    //	});
    gulp.watch(config.src + '/gulpWatch.json', ['default']);

});



//压缩框架文件,仅仅压缩
gulp.task('MiniCoreJs', function() {
    //- 需要处理的css文件，先替换里面的图片,然后再压缩md5签名
    return gulp.src([config.js.coreJs.src])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        //.pipe(revCollector())
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['jQuery','require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        //.pipe(rev())
        .pipe(gulp.dest(config.js.coreJs.dest))
//		.pipe(rev.manifest(config.js.coreJs.revJson, {
//			merge: false
//		}))
//		.pipe(gulp.dest('./'));
});
// gulp.task('default', function(callback) {
// 	if(!config.isMiniJs){
// 		runSequence('clean', 'dealMd5Img', 'dealOtherImg', 'dealJSON', 'dealCss', 'dealCoreJs', 'dealBizlogicJs', 'dealSeaConfig', 'dealBizConfig', 'dealCacheConfigJs', 'dealHtml', 'dealOthers',
// 			callback);
// 	}else{
// 		runSequence('MiniCoreJs',
// 			callback);
// 	}
//
// });



var app_publish = 'dist'
var admin_publish = 'dist_ad/admin'
var admin_pc = 'dist_ad/pc'
var wx_push = 'E:\\06食盒\\code\\fbox\\public'
var app_android_push = 'D:\\JavaWorkspaces\\androidworkspace\\fbox_android\\assets\\apps\\fbox\\www';
var formatURL = "http://fbox.o2oshangjia.cn";
var formatWS = "ws://112.126.90.118:1777";

var devURL = "http://fbox.o2oshangjia.cn";
var devWS = "ws://112.126.90.118:1777";


// Images
gulp.task('images', function() {
    return gulp.src('src/app/img/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))

});

gulp.task('base64', function () {
    return gulp.src(config.dest+"/css/*.css")
        .pipe(base64())
        .pipe(gulp.dest(config.dest+'/css'));
});


// gulp.task('base64', function () {
//     return gulp.src(config.dest + '/css2/*.css')
//         .pipe(base64({
//             src: config.dest + '/css2/*.css',
//             dest: config.dest + '/css3',
//             options: {
//                 baseDir: config.dest,
//                 extensions: ['svg', 'png', /\.jpg#datauri$/i],
//                 maxImageSize: 20 * 1024,
//                 debug: true}
//         }))
//         .pipe(gulp.dest(config.dest+'/css3'));
// });

gulp.task('copy',  function() {
    return gulp.src(['src/app/**/*','!src/app/unpackage/*','!src/app/gulpWatch.json','!src/app/manifest.json','!src/app/less/*'])
        .pipe(gulp.dest(app_publish))
});

gulp.task('copyadmin',  function() {
    return gulp.src(['src/admin/**/*'])
        .pipe(gulp.dest(admin_publish))
});

gulp.task('copypc',  function() {
    return gulp.src(['src/pc/**/*'])
        .pipe(gulp.dest(admin_pc))
});

gulp.task('copy_wx',  function() {
    return gulp.src(['dist_ad/**/*'])
        .pipe(gulp.dest(wx_push))
});


gulp.task('copy_android',  function() {
    return gulp.src(['dist/**/*'])
        .pipe(gulp.dest(app_android_push))
});


gulp.task('replaceURL_dist_dev', function(){
    gulp.src(['dist/js/config/UrlConfig.js'])
        .pipe(replace(formatURL, devURL))
        .pipe(replace(devURL, devURL))
        .pipe(gulp.dest('dist/js/config/UrlConfig/'));
});

gulp.task('replaceURL_dist', function(){
    gulp.src(['dist/js/config/UrlConfig.js'])
        .pipe(replace(devURL, formatURL))
        .pipe(replace(formatURL, formatURL))
        .pipe(gulp.dest('dist/js/config/UrlConfig/'));
});

gulp.task('replaceURL_pc_dev', function(){
    gulp.src(['dist_ad/pc/js/config/UrlConfig.js'])
        .pipe(replace(formatURL, devURL))
        .pipe(replace(devURL, devURL))
        .pipe(gulp.dest('dist_ad/pc/js/config/UrlConfig/'));
});

gulp.task('replaceURL_pc', function(){
    gulp.src(['dist_ad/pc/js/config/UrlConfig.js'])
        .pipe(replace(devURL, formatURL))
        .pipe(replace(formatURL, formatURL))
        .pipe(gulp.dest('dist_ad/pc/js/config/UrlConfig/'));
});


gulp.task('default', function(callback) {

    runSequence('clean', 'copy','copyadmin','MiniCoreJs','replaceURL_dist_dev','replaceURL_pc_dev','base64','copy_android','copypc','copy_wx',
        callback);

});

gulp.task('default_pro', function(callback) {

    runSequence('clean', 'copy','copyadmin','replaceURL_dist','replaceURL_pc','copy_wx',
        callback);

});

gulp.task('delete_dist`', function (cb) {
    del([
        'dist/*',
        'dist_ad/*',
    ], cb);
});


//ios打包

var app_ios_push = '/Users/lxw/Documents/code/jbl/jbl_ios/HBuilder-Hello/HBuilder-Hello/Pandora/apps/zfapp/www'
gulp.task('copy_ios',  function() {
    return gulp.src(['dist/**/*'])
        .pipe(gulp.dest(app_ios_push))
});


gulp.task('default_ios', function(callback) {

    runSequence('clean', 'copy','replaceURL_dist_dev','replaceURL_pc_dev','copy_ios',
        callback);
});

gulp.task('default_ios_pro', function(callback) {

    runSequence('clean', 'copy','replaceURL_dist','replaceURL_pc','copy_ios',
        callback);
});
