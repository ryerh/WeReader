const fs = require('fs');
const config = require('../config.json');
const path = require('path');

const configPath = path.resolve(__dirname, '../config.json');

const cache = {
  _storage: config,
  _backup: JSON.stringify(config, null, 2),

  get (key) {
    return key ? this._storage[key] : this._storage;
  },

  set (key, value, save) {
    this._storage[key] = value;
    save && this.save();
  },

  del (key) {
    return delete this._storage[key];
  },

  sync () {
    this._storage = JSON.parse(this._backup);
  },

  save () {
    const output = JSON.stringify(this._storage, null, 2);
    const onSave = err => console.log(err ? err : '缓存已保存');
    fs.writeFile(configPath, output, onSave);
    this._backup = output;
  }
};

module.exports = cache;
