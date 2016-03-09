#!/usr/bin/env node

const http = require('http');
const https = require('https');
const url = require('url');
const qs = require('querystring');

const request = {
  get (uri, queryData) {
    return new Promise((resolve, reject) => {
      const parsedUri = url.parse(uri);
      const parsedQuery = qs.parse(parsedUri.query);
      const mergedQuery = Object.assign({}, parsedQuery, queryData);
      const pathString = parsedUri.pathname + '?' + qs.stringify(mergedQuery);
      const options = {
        protocol: parsedUri.protocol,
        hostname: parsedUri.hostname,
        port: parsedUri.port,
        path: pathString,
        method: 'GET'
      };
      const buff = [];

      // 提交请求
      const client = options.protocol === 'http:' ? http : https;
      const req = client.request(options, res => {
        res.on('data', chunk => buff.push(chunk));
        res.on('end', () => resolve(buff.join('')));
      });
      req.on('error', reject);

      // 请求结束
      req.end();
    });
  },

  post (uri, postData) {
    return new Promise((resolve, reject) => {
      const parsedUri = url.parse(uri);
      const bodyString = qs.stringify(postData);
      const options = {
        protocol: parsedUri.protocol,
        hostname: parsedUri.hostname,
        port: parsedUri.port,
        path: parsedUri.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': bodyString.length
        }
      };
      const buff = [];

      // 提交请求
      const client = options.protocol === 'http:' ? http : https;
      const req = client.request(options, res => {
        res.on('data', chunk => buff.push(chunk));
        res.on('end', () => resolve(buff.join('')));
      });
      req.on('error', reject);

      // 写入数据，请求结束
      req.write(bodyString);
      req.end();
    });
  }
};

module.exports = request;
