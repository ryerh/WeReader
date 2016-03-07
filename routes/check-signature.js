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
  const s = req.query.signature;
  const ts = req.query.timestamp;
  const n = req.query.nonce;
  const isMatch = checkSignature(s, ts, n, TOKEN);
  res.send(isMatch ? s : '');
});

module.exports = router;
