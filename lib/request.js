#!/usr/bin/env node

const http = require('http');
const https = require('https');
const url = require('url');
const qs = require('querystring');

const log = console.log.bind(console);

const request = {
  _parseOptions (uri, method, requestData) {
    const parsedUri = url.parse(uri);
    const parsedQuery = qs.parse(parsedUri.query);
    const mergedQuery = Object.assign({}, requestData, parsedQuery);
    const searchString = (method === 'GET') ?
      parsedUri.pathname + '?' + qs.stringify(mergedQuery) :
      parsedUri.path;
    return {
      protocol: parsedUri.protocol,
      hostname: parsedUri.hostname,
      port: parsedUri.port,
      path: searchString,
      method: method
    };
  },

  _request (uri, method, requestData) {
    log(method, uri, requestData);
    return new Promise((resolve, reject) => {
      const options = this._parseOptions(uri, method, requestData);
      log('OPTIONS', options);
      const buff = [];
      const onRequest = res => {
        log('REQUESTING...');
        res.on('data', chunk => buff.push(chunk));
        res.on('end', () => resolve(buff.join('')));
      };
      const client = options.protocol === 'http:' ? http : https;
      const req = client.request(options, onRequest);
      if(method = 'POST') {
        req.write(qs.stringify(requestData));
      }
      req.end();
      req.on('error', reject);
    });
  },

  get (uri, queryData) {
    return this._request(uri, 'GET', queryData);
  },

  post (uri, postData) {
    return this._request(uri, 'POST', postData);
  }
};

module.exports = request;
