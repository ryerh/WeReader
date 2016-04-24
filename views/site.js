const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  const title = 'hello, world'
  res.render('index', { title })
})

router.get('/404', (req, res) => {
  res.send('respond with a resource')
})

module.exports = router
