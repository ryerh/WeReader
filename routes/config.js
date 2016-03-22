// 生成 JSSDK 配置信息

const cache = require('../lib/cache');
const crypto = require('crypto');
const express = require('express');
const request = require('../lib/request');
const router = express.Router();

// 调用本地 /token 接口获取 JSSDK Ticket
// @returns {Promise} - 获取到的 ticket
const getTicket = () => {
  return request.get(`${cache.get('site')}/ticket`);
};

// 生成 JSSDK config 信息
const generateConfig = (ticket, url) => {
  console.log('获取到的 Ticket', ticket);
  console.log('请求 JS Config 的 URL', url);

  if(!url) {
    return Promise.reject('请求 JSConfig 的 URL 参数无效');
  }

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
  console.log('加密后的 Signature', signature);

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
router.get('/', (req, res, next) => {
  getTicket()
    .then(data => generateConfig(JSON.parse(data), req.query.url))
    .then(data => {
      const jsonpCb = req.query.callback;
      if(jsonpCb) {
        res.send(`jsonpCb(${JSON.stringify(data)})`);
      } else {
        res.send(data);
      }
    })
    .catch(err => res.send({
      status: 500,
      msg: err.toString()
    }));
});

module.exports = router;
