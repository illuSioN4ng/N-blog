var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js'),
	Post = require('../models/post.js');
var formidable = require('formidable'),
	fs = require('fs'),
	UPLOAD_FOLDER = '/images/upload_images/';

/* GET home page. */
//router.get('/', function(req, res) {
//  res.render('index', { title: 'Express' });
//});

router.get('/',function(req, res) {
	Post.get(null, function (err, posts) {
		if (err) {
			posts = [];
		}
		res.render('index', {
			title: '主页',
			user: req.session.user,
			posts: posts,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//router.get("/u/:user",function(req,res){
//	User.get(req.params.user,function(err,user){
//		if(!user){
//			req.flash('error','用户不存在');
//			return res.redirect('/');
//		}
//
//		Post.get(user.name,function(err,posts){
//			if(err){
//				req.flash('error',err);
//				return res.redirect('/');
//			}
//			res.render('user',{
//				title:user.name,
//				posts:posts
//			});
//
//		});
//	});
//});

router.get('/post', checkLogin);
router.get('/post', function (req, res) {
	res.render('post', {
		title: '发表',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});
router.post('/post',checkLogin);
router.post("/post",function(req,res){
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.title,req.body.post);
	post.save(function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('/');
		}

		req.flash('success','发表成功');
		//console.log(currentUser);
		res.redirect('/');
	});
});

router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
	res.render('reg',{
		title:"用户注册",
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/reg',checkNotLogin);
router.post("/reg",function(req,res) {
	var name = req.body.username,
		password = req.body.password,
		password_re = req.body['password-repeat'];
	//检验用户两次输入的密码是否一致
	//console.log(name);
	if (password_re != password) {
		req.flash('error', '两次输入的密码不一致!');
		return res.redirect('/reg');//返回注册页
	}
	//生成密码的 md5 值
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: name,
		password: password,
		//email: req.body.email
	});
	//检查用户名是否已经存在
	User.get(newUser.name, function (err, user) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		//console.log(user);
		if (user) {
			req.flash('error', '用户已存在!');
			return res.redirect('/reg');//返回注册页
		}
		//如果不存在则新增用户
		newUser.save(function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');//注册失败返回主册页
			}
			req.session.user = user;//用户信息存入 session
			//console.log(req.session.user);
			req.flash('success', '注册成功!');
			//console.log("注册成功123"+req.session.user.name);
			res.redirect('/');//注册成功后返回主页
		});
	});
});

router.get('/login',checkNotLogin);
router.get("/login",function(req,res){
	res.render('login', {
		title: '登录',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()});
});

router.post('/login',checkNotLogin);
router.post("/login",function(req,res){
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');

	User.get(req.body.username,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/login');
		}
		if((user.password+" ") != (password + " ")){
			//console.log(user.password+'\n'+password);
			req.flash('error','用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		//console.log(user);
		req.flash('success','登入成功');
		res.redirect('/');
	});
});

router.get("/logout", checkLogin);
router.get("/logout",function(req, res){
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');//登出成功后跳转到主页
});

router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/upload', checkLogin);
router.post('/upload', function (req, res) {
	var form = new formidable.IncomingForm();   //创建上传表单
	form.encoding = 'utf-8';		//设置编辑
	form.uploadDir = '../public' + UPLOAD_FOLDER;	 //设置上传目录
	form.keepExtensions = true;	 //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

	form.parse(req, function(err, fields, files) {
		if (err) {
			req.flash('error', '文件上传失败!');
			return;
		}

		var types       = files.file1.name.split('.');
		var extName = String(types[types.length-1]);  //后缀名

		if(extName.length == 0){
			req.flash('error', '只支持png和jpg格式图片');
			return;
		}

		var fileName = Math.random() + '.' + extName;
		var newPath = form.uploadDir + fileName;
		console.log(fileName);

		fs.renameSync(files.file1.path, newPath);  //重命名
		//req.flash('success', '文件上传成功，文件名为：'+fileName);
		req.flash('success', '文件上传成功，文件路径为：/images/upload_images/'+fileName);
		res.redirect('/post');
	});
});

function checkLogin(req, res, next){
	if(!req.session.user){
		req.flash('error',"未登入");
		return res.redirect('/login');
	}
	next();
};

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash("error","已登入");
		return res.redirect('/');
	}
	next();
};

module.exports = router;
