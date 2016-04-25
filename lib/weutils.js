const crypto  = require('crypto')
const cache   = require('./cache')
const json    = require('./json')
const request = require('./request')

// 检查 signature 的有效性
// 参考微信示例代码：
// @url http://mp.weixin.qq.com/wiki/8/f9a0b8382e0b77d87b3bcc1ce6fbc104.html
// @returns {Boolean} - 检查结果是否成功
const checkSignature = (signature, timestamp, nonce) => {
  const token = cache.get('token')
  const joined = [token, timestamp, nonce].sort().join('')

  // 注意：hash 对象执行 .digest() 方法后不可再次执行 .update() 方法
  const sha1 = crypto.createHash('sha1')
  sha1.update(joined)
  const encoded = sha1.digest('hex')

  return encoded === signature
    ? Promise.resolve(true)
    : Promise.reject(false)
}

// 从微信服务器请求 Access Token
// @url http://mp.weixin.qq.com/wiki/14/9f9c82c1af308e3b14ba9b973f99a8ba.html
// @returns {Promise} - 获取到的 token
const getAccessToken = () => {
  // 尝试从缓存获取
  const { expire, timestamp, value } = cache.get('accessToken')
  const curTimestamp = Math.floor((new Date()).getTime() / 1000)
  if(value && curTimestamp - timestamp < expire) {
    console.log('从缓存中获取 Access Token', value)
    return Promise.resolve({
      access_token: value,
      expires_in: expire,
      source: 'from_cache' // 自定义，识别缓存
    })
  }
  // 尝试从微信服务器获取
  const accessTokenUri = 'https://api.weixin.qq.com/cgi-bin/token'
  const { appid, secret } = cache.get('app')
  const options = {
    grant_type: 'client_credential',
    appid,
    secret
  }
  return request.get(accessTokenUri, options)
    .then(data => {
      // 缓存操作
      const token = json.parse(data)
      const curTimestamp = Math.floor((new Date()).getTime() / 1000)
      console.log('写入新的 Access Token 到缓存', token)
      cache.set('accessToken', {
        expire: token.expires_in,
        timestamp: curTimestamp,
        value: token.access_token
      }, true)
      return token
    })
}

// 获取 JS Ticket
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html（附录一）
// @returns {Promise} - 获取到的 ticket
const getTicket = () => {
  return getAccessToken()
    .then(token => {
      // 尝试从缓存获取
      const { expire, timestamp, value } = cache.get('jsTicket')
      const curTimestamp = Math.floor((new Date()).getTime() / 1000)
      if(value && curTimestamp - timestamp < expire) {
        console.log('从缓存中获取 JSSDK Ticket', value)
        return Promise.resolve({
          errcode: 0,
          errmsg: 'ok',
          ticket: value,
          expires_in: expire,
          source: 'from_cache' // 自定义，识别缓存
        })
      }
      // 尝试从微信服务器获取
      const jsTicketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
      const options = {
        access_token: token.access_token,
        type: 'jsapi'
      }
      return request
        .get(jsTicketUri, options)
        .then(data => {
          // 缓存操作
          const ticket = json.parse(data)
          const curTimestamp = Math.floor((new Date()).getTime() / 1000)
          console.log('写入新的 JSSDK Ticket 到缓存', ticket)
          cache.set('jsTicket', {
            expire: ticket.expires_in,
            timestamp: curTimestamp,
            value: ticket.ticket
          }, true)
          return ticket
        })
    })
}

// 生成 JSSDK config 信息
const generateConfig = (url) => {
  return getTicket()
    .then(data => {
      const ticket = json.parse(data)
      const nonceStr = crypto.randomBytes(8).toString('hex')
      const timestamp = Math.floor((new Date()).getTime() / 1000)
      const tempStr = [
        `jsapi_ticket=${ticket.ticket}`,
        `noncestr=${nonceStr}`,
        `timestamp=${timestamp}`,
        `url=${url}`
      ].join('&')

      console.log('Signature 加密前拼接字符串', tempStr)
      const sha1 = crypto.createHash('sha1')
      sha1.update(tempStr)
      const signature = sha1.digest('hex')
      console.log('加密后的 Signature', signature)

      const { appid } = cache.get('app')
      return {
        appid,
        signature,
        nonceStr,
        timestamp,
        comment: 'This appid is test account.'
      }
    })
}

module.exports = {
  checkSignature,
  generateConfig
}
