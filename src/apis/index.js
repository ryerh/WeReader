const express = require('express')
const fetch = require('isomorphic-fetch')
const json = require('../lib/json')
const weutils = require('../lib/weutils')
const router = express.Router()

// echo 测试服务
router.get('/echo', (req, res) => {
  res.send({
    query: req.query,
    params: req.params,
    body: req.body
  })
})

// 进行微信 auth 认证
// 参考微信示例代码：
// @url http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
router.get('/auth', (req, res) => {
  const { code, state } = req.query

  if(!code) {
    return res.send('user not accepted!')
  }

  res.send({ code, state })
})

router.get('/signature', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query
  weutils.checkSignature(signature, timestamp, nonce)
    .then(data => res.send(echostr))
    .catch(err => res.send('signature invalid'))
})

// 微信 JS-SDK 使用权限签名算法
// 参考微信示例（附录一）：
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
router.get('/config', (req, res) => {
  const { url } = req.query
  weutils.generateConfig(url)
    .then(data => res.send(data))
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }))
})

// 豆瓣图书代理
router.get('/book/:isbn', (req, res) => {
  const { isbn } = req.params
  fetch(`https://api.douban.com/v2/book/isbn/${isbn}`)
    .then(res => res.json())
    .then(book => {
      console.log('获取书籍', book)
      book.title = book.title || `Book not found (${isbn})`
      res.send(book)
    })
})

module.exports = router
