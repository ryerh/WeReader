const express = require('express');
const cache = require('../lib/cache');
const request = require('../lib/request');
const router = express.Router();

// 从微信服务器请求 Access Token
// @url http://mp.weixin.qq.com/wiki/14/9f9c82c1af308e3b14ba9b973f99a8ba.html
// @returns {Promise} - 获取到的 token
const getAccessToken = () => {
  const tokenValue = cache.get('token_value');
  const tokenTimestamp = cache.get('token_ts');
  const tokenExpire = cache.get('token_expire');
  const currentTimestamp = Math.floor((new Date()).getTime() / 1000);
  if(tokenValue && currentTimestamp - tokenTimestamp < tokenExpire) {
    console.log('从缓存中获取 Access Token', tokenValue);
    return Promise.resolve({
      access_token: tokenValue,
      expires_in: tokenExpire,
      source: 'from_cache'
    });
  }

  const accessTokenUri = 'https://api.weixin.qq.com/cgi-bin/token';
  const data = {
    grant_type: 'client_credential',
    appid: cache.get('appid'),
    secret: cache.get('secret')
  };
  return request.get(accessTokenUri, data);
};

// 返回 Access Token
router.get('/', function(req, res, next) {
  getAccessToken()
    .then(data => {
      const token = typeof data === 'string' ? JSON.parse(data) : data;
      res.send(token);
      if(token.source !== 'from_cache') {
        console.log('写入新的 Access Token 到缓存', token.access_token);
        const currentTimestamp = Math.floor((new Date()).getTime() / 1000);
        cache.set('token_value', token.access_token);
        cache.set('token_ts', currentTimestamp);
        cache.set('token_expire', token.expires_in);
        cache.save();
      }
    });
});

module.exports = router;
