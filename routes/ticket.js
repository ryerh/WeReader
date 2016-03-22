// 获取 JSSDK Ticket

const cache = require('../lib/cache');
const express = require('express');
const request = require('../lib/request');
const router = express.Router();

// 调用本地 /token 接口获取 Access Token
// @returns {Promise} - 获取到的 token
const getAccessToken = () => {
  return request.get(`${cache.get('site')}/api/token`);
};

// 获取 JS Ticket
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html（附录一）
// @returns {Promise} - 获取到的 ticket
const getTicket = token => {
  // 尝试从缓存获取
  const ticketValue = cache.get('ticket_value');
  const ticketTimestamp = cache.get('ticket_ts');
  const ticketExpire = cache.get('ticket_expire');
  const currentTimestamp = Math.floor((new Date()).getTime() / 1000);
  if(ticketValue && currentTimestamp - ticketTimestamp < ticketExpire) {
    console.log('从缓存中获取 JSSDK Ticket', ticketValue);
    return Promise.resolve({
      // 这里是微信指定的字段
      errcode: 0,
      errmsg: 'ok',
      ticket: ticketValue,
      expires_in: ticketExpire,
      // 这里是自定义添加的字段，用于识别缓存
      source: 'from_cache'
    });
  }
  // 尝试从微信服务器获取
  const jsTicketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
  const data = {
    access_token: token.access_token,
    type: 'jsapi'
  };
  return request.get(jsTicketUri, data);
};

// 微信 JS-SDK 使用权限签名算法
// 参考微信示例（附录一）：
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
router.get('/', function(req, res, next) {
  getAccessToken()
    .then(data => getTicket(JSON.parse(data)))
    .then(data => {
      // 发送 JSSDK Ticket 到客户端
      res.send(data);
      // 缓存操作
      const ticket = typeof data === 'string' ? JSON.parse(data) : data;
      const currentTimestamp = Math.floor((new Date()).getTime() / 1000);
      if(ticket.source !== 'from_cache') {
        console.log('写入新的 JSSDK Ticket 到缓存', ticket.ticket);
        cache.set('ticket_value', ticket.ticket);
        cache.set('ticket_expire', ticket.expires_in);
        cache.set('ticket_ts', currentTimestamp);
        cache.save();
      }
    })
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }));
});

module.exports = router;
