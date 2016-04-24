const crypto  = require('crypto')
const cache   = require('./cache')
const request = require('./request')

// 生成 JSSDK config 信息
const generateConfig = (ticket, url) => {
  console.log('获取到的 Ticket', ticket)
  console.log('请求 JS Config 的 URL', url)

  if(!url) {
    return Promise.reject('请求 JSConfig 的 URL 参数无效')
  }

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

  return Promise.resolve({
    appId: cache.get('appid'),
    signature: signature,
    nonceStr: nonceStr,
    timestamp: timestamp,
    comment: 'This appid is test account.'
  })
}

// 从微信服务器请求 Access Token
// @url http://mp.weixin.qq.com/wiki/14/9f9c82c1af308e3b14ba9b973f99a8ba.html
// @returns {Promise} - 获取到的 token
const getAccessToken = () => {
  // 尝试从缓存获取
  const tokenValue = cache.get('token_value')
  const tokenTimestamp = cache.get('token_ts')
  const tokenExpire = cache.get('token_expire')
  const currentTimestamp = Math.floor((new Date()).getTime() / 1000)
  if(tokenValue && currentTimestamp - tokenTimestamp < tokenExpire) {
    console.log('从缓存中获取 Access Token', tokenValue)
    return Promise.resolve({
      // 这里是微信指定的字段
      access_token: tokenValue,
      expires_in: tokenExpire,
      // 这里是自定义添加的字段，用于识别缓存
      source: 'from_cache'
    })
  }
  // 尝试从微信服务器获取
  const accessTokenUri = 'https://api.weixin.qq.com/cgi-bin/token'
  const data = {
    grant_type: 'client_credential',
    appid: cache.get('appid'),
    secret: cache.get('secret')
  }
  return request.get(accessTokenUri, data)
}

// 获取 JS Ticket
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html（附录一）
// @returns {Promise} - 获取到的 ticket
const getTicket = (token) => {
  // 尝试从缓存获取
  const ticketValue = cache.get('ticket_value')
  const ticketTimestamp = cache.get('ticket_ts')
  const ticketExpire = cache.get('ticket_expire')
  const currentTimestamp = Math.floor((new Date()).getTime() / 1000)
  if(ticketValue && currentTimestamp - ticketTimestamp < ticketExpire) {
    console.log('从缓存中获取 JSSDK Ticket', ticketValue)
    return Promise.resolve({
      // 这里是微信指定的字段
      errcode: 0,
      errmsg: 'ok',
      ticket: ticketValue,
      expires_in: ticketExpire,
      // 这里是自定义添加的字段，用于识别缓存
      source: 'from_cache'
    })
  }
  // 尝试从微信服务器获取
  const jsTicketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
  const data = {
    access_token: token.access_token,
    type: 'jsapi'
  }
  return request.get(jsTicketUri, data)
}

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
}

module.exports = {
  generateConfig,
  getAccessToken,
  getTicket,
  checkSignature
}
