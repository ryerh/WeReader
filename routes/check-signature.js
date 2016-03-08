const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const TOKEN = 'ryerh';

// 检查 signature 的有效性
// 参考微信示例代码：
// @url http://mp.weixin.qq.com/wiki/8/f9a0b8382e0b77d87b3bcc1ce6fbc104.html
// @returns {Boolean} - 检查结果是否成功
const checkSignature = (signature, timestamp, nonce, token) => {
  const joined = [token, timestamp, nonce].sort().join('');

  // 注意：hash 对象执行 .digest() 方法后不可再次执行 .update() 方法
  const sha1 = crypto.createHash('sha1');
  sha1.update(joined);
  const encoded = sha1.digest('hex');

  return encoded === signature;
};

router.get('/', function(req, res, next) {
  const signature = req.query.signature;
  const timestamp = req.query.timestamp;
  const nonce = req.query.nonce;
  const echostr = req.query.echostr;
  const isMatch = checkSignature(signature, timestamp, nonce, TOKEN);
  res.send(isMatch ? echostr : '');
});

module.exports = router;
