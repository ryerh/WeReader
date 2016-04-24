const crypto = require('crypto')
const express = require('express')
const cache = require('../lib/cache')
const request = require('../lib/request')
const weutils = require('../lib/weutils')
const router = express.Router()

// echo 测试服务
router.get('/echo', (req, res) => {
  res.send(req.query)
})

// 进行微信 auth 认证
// 参考微信示例代码：
// @url http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
router.get('/auth', (req, res) => {
  const { code, state } = req.query

  if(!code) {
    return res.send('user not accepted!')
  }

  res.send(`
    <p>code => ${code}</p>
    <p>state => ${state}</p>
  `)
})

// 生成 JSSDK 配置信息

// 微信 JS-SDK 使用权限签名算法
// 参考微信示例（附录一）：
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
router.get('/config', (req, res) => {
  weutils.getTicket()
    .then(data => weutils.generateConfig(JSON.parse(data), req.query.url))
    .then(data => res.send(data))
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }))
})

router.get('/signature', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query
  const isMatch = weutils.checkSignature(signature, timestamp, nonce)
  res.send(isMatch ? echostr : 'signature invalid')
})

// 微信 JS-SDK 使用权限签名算法
// 参考微信示例（附录一）：
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
router.get('/ticket', (req, res) => {
  weutils.getAccessToken()
    .then(data => weutils.getTicket(JSON.parse(data)))
    .then(data => {
      // 发送 JSSDK Ticket 到客户端
      res.send(data)
      // 缓存操作
      const ticket = typeof data === 'string' ? JSON.parse(data) : data
      const currentTimestamp = Math.floor((new Date()).getTime() / 1000)
      if(ticket.source !== 'from_cache') {
        console.log('写入新的 JSSDK Ticket 到缓存', ticket.ticket)
        cache.set('ticket_value', ticket.ticket)
        cache.set('ticket_expire', ticket.expires_in)
        cache.set('ticket_ts', currentTimestamp)
        cache.save()
      }
    })
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }))
})

// 返回 Access Token
router.get('/token', (req, res) => {
  weutils.getAccessToken()
    .then(data => {
      // 发送 Access Token 到客户端
      res.send(data)
      // 缓存操作
      const token = typeof data === 'string' ? JSON.parse(data) : data
      const currentTimestamp = Math.floor((new Date()).getTime() / 1000)
      if(token.source !== 'from_cache') {
        console.log('写入新的 Access Token 到缓存', token.access_token)
        cache.set('token_value', token.access_token)
        cache.set('token_expire', token.expires_in)
        cache.set('token_ts', currentTimestamp)
        cache.save()
      }
    })
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }))
})

module.exports = router
