const crypto = require('crypto');
const express = require('express');
const request = require('../lib/request');
const router = express.Router();

// 微信 JS-SDK 使用权限签名算法
// 参考微信示例（附录一）：
// @url http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html
router.get('/', function(req, res, next) {
  const jsApiTicket = '';
  const nonceStr = crypto.randomBytes(8).toString('hex');
  const timeStamp = Number.parseInt(now.getTime() / 1000);
  const now = new Date();
  const url = req.query.url.split('#').shift();

  if(!code) {
    return res.send('user not accepted!');
  }

  res.send(`
    code => ${code}<br>
    state => ${state}
  `);
});

module.exports = router;
