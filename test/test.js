const request = require('../lib/request');

const uri = 'http://localhost:3000/echo';
const data = {
  param: 'urlparam'
};

request
  .get(uri)
  .then(data => {
    console.log('data = ', data);
  });
