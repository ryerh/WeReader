const request = require('../lib/request');

const uri = 'http://localhost:3000/echo?q=11';
const data = {
  param: 'urlparam'
};

request
  .post(uri, data)
  .then(data => {
    console.log('data = ', data);
  });
