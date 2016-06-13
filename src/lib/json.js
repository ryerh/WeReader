const json = {
  parse (objectOrString = '') {
    try {
      return JSON.parse(objectOrString)
    } catch (e) {
      return objectOrString
    }
  },

  stringify (objectOrString = {}) {
    try {
      return JSON.stringify(objectOrString)
    } catch (e) {
      return objectOrString
    }
  }
}

module.exports = json
