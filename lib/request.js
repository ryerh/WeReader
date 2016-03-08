const http = require('http');
const https = require('https');
const url = require('url');

const request = {
  _request (uri, method) {
    return new Promise((resolve, reject) => {
      const parsedUri = url.parse(uri);
      const client = parsedUri.protocol === 'http:' ? http : https;
      const options = {
        hostname: parsedUri.hostname,
        port: parsedUri.port,
        path: parsedUri.path,
        method: method
      };
      const onRequest = res => {
        const buff = [];
        res.on('data', chunk => buff.push(chunk));
        res.on('end', () => resolve(buff.join('')));
      };
      const req = client.request(options, onRequest);
      req.end();
      req.on('error', reject);
    });
  },

  get (uri) {
    return this._request(uri, 'GET');
  },

  post (uri) {
    return this._request(uri, 'POST');
  }
};

request.get('http://www.baidu.com')
  .then(data => console.log(data));

module.exports = request;
