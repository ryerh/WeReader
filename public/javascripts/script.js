// config
var appid = 'wx37009e136e4b43ae';
var secrect = '2897d54cf9cf571f9ff6efe3317cbfa5';
var accessTokenUrl = [
  'https://api.weixin.qq.com/cgi-bin/token',
  '?grant_type=client_credential',
  '&appid=', appid,
  '&secret=', secrect
].join('');

// get access token
$.ajax({
  url: accessTokenUrl,
  type: 'GET',
  dataType: 'jsonp',
  success: function(accessToken) {
    alert(accessToken);
  }
});
