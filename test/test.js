const cache = require('../lib/cache');

cache.del('k');
cache.save();
console.log(cache.get());
