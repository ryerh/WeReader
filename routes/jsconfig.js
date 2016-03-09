const cache = require('../lib/cache');
const crypto = require('crypto');
const express = require('express');
const request = require('../lib/request');
const router = express.Router();

// 调用本地 /token 接口获取 Access Token
const getAccessToken = () => {
  return request.get(`${cache.get('site')}/token`);
};

// 获取 JS Ticket
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html（附录一）
const getTicket = token => {
  const jsTicketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
  const data = {
    access_token: token.access_token,
    type: 'jsapi'
  };
  return request.get(jsTicketUri, data);
};

// 生成 JSSDK config 信息
const generateConfig = (ticket, url) => {
  console.log('取得 JSSDK Ticket', ticket);
  const nonceStr = crypto.randomBytes(8).toString('hex');
  const timestamp = Math.floor((new Date()).getTime() / 1000);
  const tempStr = [
    `jsapi_ticket=${ticket.ticket}`,
    `noncestr=${nonceStr}`,
    `timestamp=${timestamp}`,
    `url=${url}`
  ].join('&');
  console.log('Signature 加密前拼接字符串', tempStr);
  const sha1 = crypto.createHash('sha1');
  sha1.update(tempStr);
  const signature = sha1.digest('hex');

  return Promise.resolve({
    appId: cache.get('appid'),
    signature: signature,
    nonceStr: nonceStr,
    timestamp: timestamp,
    comment: 'This appid is test account.'
  });
};

// 微信 JS-SDK 使用权限签名算法
// 参考微信示例（附录一）：
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
router.get('/', function(req, res, next) {
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log('请求 JS Config', url);
  getAccessToken()
    .then(res => getTicket(JSON.parse(res)))
    .then(res => generateConfig(JSON.parse(res), url))
    .then(config => res.send(config))
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }));
});

module.exports = router;
