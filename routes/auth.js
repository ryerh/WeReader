const express = require('express');
const router = express.Router();

// 进行微信 auth 认证
// 参考微信示例代码：
// @url http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
router.get('/', function(req, res, next) {
  const code = req.query.code;
  const state = req.query.state;

  if(!code) {
    return res.send('user not accepted!');
  }

  res.send(`
    code => ${code}<br>
    state => ${state}
  `);
});

module.exports = router;
