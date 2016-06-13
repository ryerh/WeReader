const config = require('../config.json')

const cache = {
  get (key) {
    return config[key]
  },

  set (key, value) {
    config[key] = value
  }
}

module.exports = cache
