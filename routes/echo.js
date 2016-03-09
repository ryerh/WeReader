const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.send(req.query);
});

router.post('/', (req, res, next) => {
  res.send(req.query);
});

module.exports = router;
