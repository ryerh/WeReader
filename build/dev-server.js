const _               = require('lodash')
const favicon         = require('serve-favicon')
const logger          = require('morgan')
const cookieParser    = require('cookie-parser')
const bodyParser      = require('body-parser')
const path            = require('path')
const express         = require('express')
const webpack         = require('webpack')
const config          = require('../config')
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig   = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

// 路由
// const apis            = require('./views/apis')
// const site            = require('./views/site')

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

const app = express()
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
})

const hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
const staticPath = path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

// 把收藏夹图标放在 /public 目录后注释掉下面这一行
//app.use(favicon(path.join(APP_ROOT, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// 路由
// app.use('/', site)
// app.use('/api', apis)

// 代理设置
app.set('trust proxy', 'loopback')

// catch 404 and forward to error handler
// app.use((req, res, next) => {
//   const err = new Error('Not Found')
//   err.status = 404
//   next(err)
// })

// 开发环境错误回调
// 输出错误调用栈
// if (app.get('env') === 'development') {
//   app.use((err, req, res, next) => {
//     res.status(err.status || 500)
//     res.render('error', {
//       message: err.message,
//       error: err
//     })
//   })
// }

// 生产环境错误回调
// 用户看不到错误调用栈
// app.use((err, req, res, next) => {
//   res.status(err.status || 500)
//   res.render('error', {
//     message: err.message,
//     error: {}
//   })
// })

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
