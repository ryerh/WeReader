const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// 路由
const routes = require('./routes/index');
const auth = require('./routes/auth');
const checkSignature = require('./routes/check-signature');
const echo = require('./routes/echo');
const jsconfig = require('./routes/jsconfig');
const token = require('./routes/token');
const users = require('./routes/users');

const app = express();

// 视图存放位置和模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 把收藏夹图标放在 /public 目录后注释掉下面这一行
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/', routes);
app.use('/auth', auth);
app.use('/check-signature', checkSignature);
app.use('/echo', echo);
app.use('/jsconfig', jsconfig);
app.use('/token', token);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 异常处理

// 开发环境错误回调
// 输出错误调用栈
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// 生产环境错误回调
// 用户看不到错误调用栈
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
