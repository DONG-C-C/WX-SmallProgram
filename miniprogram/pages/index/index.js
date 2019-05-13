//index.js
const app = getApp()

const db = wx.cloud.database()
var sourceType = [
  ['camera'],
  ['album'],
  ['camera', 'album']
];
var sizeType = [
  ['compressed'],
  ['original'],
  ['compressed', 'original']
];
var count = [1, 2, 3, 4, 5, 6, 7, 8, 9];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [],
    fileIDs: [],
    sourceTypeIndex: 2,
    sourceType1: ['拍照', '相册', '拍照或相册'],
    sizeTypeIndex: 2,
    sizeType1: ['压缩', '原图', '压缩或原图'],
    countIndex: 8,
    count1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },


  submit: function() {
    wx.showLoading({
      title: '提交中',
    })
    const that = this;
    const promiseArr = []
    //只能一张张上传 遍历临时的图片数组

    if (this.data.imgs.length == 0) {
      wx.showLoading({
        title: '没有选择图片',
        duration: 2000
      })
    } else {
      for (let i = 0; i < this.data.imgs.length; i++) {
        let filePath = this.data.imgs[i]
        let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
        //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
        promiseArr.push(new Promise((reslove, reject) => {
          wx.cloud.uploadFile({
            cloudPath: new Date().getTime() + suffix,
            filePath: filePath, // 文件路径
          }).then(res => {
            // get resource ID
            console.log(res.fileID)
            this.setData({
              fileIDs: this.data.fileIDs.concat(res.fileID)
            })
            reslove()
          }).catch(error => {
            console.log(error)
          })
        }))
      }
      Promise.all(promiseArr).then(res => {
        db.collection('comments').add({
            data: {
              fileIDs: this.data.fileIDs //只有当所有的图片都上传完毕后，这个值才能被设置，但是上传文件是一个异步的操作，你不知道他们什么时候把fileid返回，所以就得用promise.all
            }
          })
          .then(res => {
            console.log(res)
            wx.hideLoading()
            wx.showToast({
              title: '提交成功',
            })
            that.setData({
              imgs: []
            })

          })
          .catch(error => {
            console.log(error)
          })
      })
    }
  },
  //图片来源
  bindPickerChange1: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value),
      console.log('picker发送选择改变，携带值为', this.data.sourceType1[e.detail.value]),
      this.setData({
        sourceTypeIndex: e.detail.value
      })
    console.log('图片来源---------->', sourceType[this.data.sourceTypeIndex])
  },

  //图片质量
  bindPickerChange2: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value),
      console.log('picker发送选择改变，携带值为', this.data.sizeType1[e.detail.value]),
      this.setData({
        sizeTypeIndex: e.detail.value
      })
    console.log('图片质量---------->', sizeType[this.data.sizeTypeIndex])
  },
  //图片数量
  bindPickerChange3: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value),
      console.log('picker发送选择改变，携带值为', this.data.count1[e.detail.value]),
      this.setData({
        countIndex: e.detail.value
      })
    console.log('图片数量---------->', count[this.data.countIndex])
  },


  chooseImg: function(e) {
    var that = this;
    var imgs = this.data.imgs;
    if (imgs.length >= 9) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function() {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      return false;
    }
    console.log('sourceTypeIndex------------>', this.data.sourceTypeIndex)
    console.log('picker发送选择改变，------------>', sourceType[this.data.sourceTypeIndex])
    console.log('picker发送选择改变，=+++++++++++>', this.data.count1[this.data.countIndex])
    wx.chooseImage({
      // count: 9, // 默认9
      // sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      // sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      //count: this.imgs.length + this.count[this.data.countIndex] > 9 ? 9 - this.imgs.length : this.count[this.data.countIndex],
      count: this.data.count1[this.data.countIndex],
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        // console.log(tempFilePaths + '----');
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 9) {
            that.setData({
              imgs: imgs
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
          }
        }
        console.log(imgs);
        that.setData({
          imgs: imgs
        });
      }
    });
  },
  // 删除图片-方法一
  deleteImg: function(e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },

  // 删除图片-方法二
  deleteImage: function(e) {
    var that = this;
    var imgs = that.data.imgs;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    wx.showModal({
      title: '系统提醒',
      content: '确定要删除此图片吗？',
      success: function(res) {
        if (res.confirm) {
          imgs.splice(index, 1);
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          imgs: imgs
        });
      }
    })
  },









  // 图片预览
  previewImage: function(e) {
    //console.log(this.data.images);
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.imgs
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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