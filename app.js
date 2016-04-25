const _               = require('lodash')
const express         = require('express')
const path            = require('path')
const favicon         = require('serve-favicon')
const logger          = require('morgan')
const cookieParser    = require('cookie-parser')
const bodyParser      = require('body-parser')
const proxyMiddleware = require('http-proxy-middleware')

// 绑定视图的路由
const apis            = require('./views/apis')
const site            = require('./views/site')

// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyMap = {
  // '/api/**/*': 'http://localhost:8000'
}

// 应用根目录
const APP_ROOT = __dirname

const app = express()

// 代理设置
app.set('trust proxy', 'loopback')

// 视图存放位置和模板引擎
app.set('views', path.join(APP_ROOT, 'templates'))
app.set('view engine', 'jade')

// 把收藏夹图标放在 /public 目录后注释掉下面这一行
//app.use(favicon(path.join(APP_ROOT, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(APP_ROOT, 'public')))

// 路由
app.use('/', site)
app.use('/api', apis)

// proxy api requests
_.map(proxyMap, (context, options) => {
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// 开发环境错误回调
// 输出错误调用栈
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// 生产环境错误回调
// 用户看不到错误调用栈
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
