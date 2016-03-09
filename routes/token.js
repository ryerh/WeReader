const config = require('../config.json');
const express = require('express');
const request = require('../lib/request');
const router = express.Router();

// 从微信服务器请求 Access Token
// @url http://mp.weixin.qq.com/wiki/14/9f9c82c1af308e3b14ba9b973f99a8ba.html
// @returns {Promise} - 获取到的 token
const getAccessToken = () => {
  const accessTokenUri = 'https://api.weixin.qq.com/cgi-bin/token';
  const data = {
    grant_type: 'client_credential',
    appid: config.appid,
    secret: config.secrect
  };
  return request.get(accessTokenUri, data);
};

// 返回 Access Token
router.get('/', function(req, res, next) {
  getAccessToken().then(token => res.send(token));
});

module.exports = router;
