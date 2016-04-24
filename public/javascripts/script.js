var jsApiList = [
  'scanQRCode'
]

// 获取
$.ajax({
  url: '/api/config',
  type: 'GET',
  data: {
    url: location.href.split('#')[0]
  },
  success: function (config) {
    wx.config({
      debug: true,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: jsApiList
    })
  }
})

wx.ready(function () {
  console.log('wechat is ready')
  wx.onMenuShareTimeline({
    title: '你好'
  })
})

wx.error(function (err) {
  console.log('wechat config fail', err)
})
