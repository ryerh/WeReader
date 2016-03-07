var express = require('express');
var router = express.Router();
const crypto = require('crypto');

const TOKEN = 'ryerh';

const checkSignature = (signature, timestamp, nonce, token) => {
  const sha1 = crypto.createHash('sha1');
  const joined = [token, timestamp, nonce].sort().join('');

  sha1.update(joined);
  const encoded = sha1.digest('hex');
  return encoded === signature;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  const signature = req.query.signature;
  const timestamp = req.query.timestamp;
  const nonce = req.query.nonce;
  const echostr = req.query.echostr;
  const isMatch = checkSignature(signature, timestamp, nonce, TOKEN);
  res.send(isMatch ? echostr : '');
});

module.exports = router;
