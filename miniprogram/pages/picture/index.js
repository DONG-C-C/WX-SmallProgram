// pages/picture/index.js

var app = getApp();
var useropenid;
const db = wx.cloud.database({});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictruesArray: [],
    pictruesShow: [],
    i: 0,
    userInfo: {},
    pictureLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // useropenid = getApp().globalData.openid;
    // console.log("用户openid------->" + useropenid);


    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    this.getpictrue();
    this.onGetOpenid();

  },

  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  //获取用户的openid
  onGetOpenid: function () {
    // 调用云函数
    const that =this;
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },


  getpictrue: function() { // 查询图片
    const that = this;
    var i;
    // db.collection('comments').where({ _openid: useropenid }).get({
    db.collection('comments').where({ _openid: app.globalData.openid }).field({
      fileIDs: true
    }).get({
      success: res => {
        console.log(res.data[0].fileIDs);
        console.log(res.data.length);
        console.log(res.data);
        // pictruesArray = res.data[0].fileIDs;
        // console.log(pictruesArray);
        for (i = 0; i < res.data.length; ++i) {
          this.data.pictruesShow = this.data.pictruesShow.concat(res.data[i].fileIDs);
        }
        console.log(this.data.pictruesShow);
        that.setData({
          pictruesArray: this.data.pictruesShow
        })

      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  //预览图片
  previewImage: function(e) {
    //console.log(this.data.images);
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.pictruesArray
    })
  },
  // 删除图片
  deleteImage: function (e) {
    const that = this;
    var pictruesArray = that.data.pictruesArray;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    wx.showModal({
      title: '系统提醒',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          pictruesArray.splice(index, 1);
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          pictruesArray: pictruesArray
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})