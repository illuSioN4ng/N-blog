var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var methodOverride = require('method-override');
var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var ueditor = require("ueditor");
//var multer  = require('multer');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
//  // ueditor 客户发起上传图片请求
//  if (req.query.action === 'uploadimage') {
//    var foo = req.ueditor;
//
//    var imgname = req.ueditor.filename;
//
//    var img_url = '/images/ueditor/' ;
//    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
//  }
//  //  客户端发起图片列表请求
//  else if (req.query.action === 'listimage') {
//    var dir_url = '/images/ueditor/';
//    res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
//  }
//  // 客户端发起其它请求
//  else {
//    // console.log('config.json')
//    res.setHeader('Content-Type', 'application/json');
//    res.redirect('/ueditor/nodejs/config.json');
//  }
//}));

//ueditor
app.use("/ueditor/ue", ueditor({//这里的/ueditor/ue是因为文件件重命名为了ueditor,如果没改名，那么应该是/ueditor版本号/ue
  configFile: '/ueditor/nodejs/config.json',//如果下载的是jsp的，就填写/ueditor/jsp/config.json
  mode: 'local', //本地存储填写local
  //accessKey: 'Adxxxxxxx',//本地存储不填写，bcs填写
  //secrectKey: 'oiUqt1VpH3fdxxxx',//本地存储不填写，bcs填写
  staticPath: path.join(__dirname, 'public'), //一般固定的写法，静态资源的目录，如果是bcs，可以不填
  //dynamicPath: '/blogpicture' //动态目录，以/开头，bcs填写buckect名字，开头没有/.路径可以根据req动态变化，可以是一个函数，function(req) { return '/xx'} req.query.action是请求的行为，uploadimage表示上传图片，具体查看config.json.
}, function(req, res, next) {
  // ueditor 客户发起上传图片请求
  if (req.query.action === 'uploadimage') {
    var foo = req.ueditor;
    console.log(foo.filename);
    console.log(foo.encoding);
    console.log(foo.mimetype);
    var date = new Date();
    var imgname = foo.filename;

    var img_url = '/images/ueditor/';
    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage') {
    var dir_url = '/images/ueditor/';
    res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    // console.log('config.json')
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/nodejs/config.json');
  }
}));

app.use(session({
  secret:settings.cookieSecret,
  store:new MongoStore({
    db:settings.db
  }),
  resave:true,
  saveUninitialized:true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//app.use(multer({
//  dest: './public/images/upload_images',
//  rename: function (fieldname, filename) {
//    return filename;
//  }
//}));

/*--------------start register route ----------------*/
//app.get("/",routes.index);
//app.get("/u/:user",routes.user);
//app.post("/post",routes.post);
//app.get("/reg",routes.reg);
//app.post("/reg",routes.doReg);
//app.get("/login",routes.login);
//app.post("/login",routes.doLogin);
//app.get("/logout",routes.logout);
//app.use(routes);
/*--------------end register route ----------------*/

//app.get('/user/:username', function(req, res) {
//  res.send('user:' + req.params.username);
//});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
