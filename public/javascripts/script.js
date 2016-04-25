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
      debug: false,
      appId: config.appid,
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

$(function () {
  $('#scan-code').on('click', function () {
    wx.scanQRCode({
      needResult: 0,
      scanType: ['qrCode', 'barCode'],
      success: function (res) {
        var result = res.resultStr
        console.log(result)
      }
    })
  })
})
