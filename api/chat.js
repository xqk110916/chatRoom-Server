const app = require('../index').app
const io = require('../index').io
const SQL = require('../sql')
const base = require("../base")

// 私聊消息定义: info 接收推送过来的聊天内容; push:+key 将消息推送给双方(key用于定位发送给谁); initConnect 初始化历史消息 
// 消息列表信息定义: initMsgList:+id 初始化所有的聊天记录; pushList:+id 推送初始化的消息

const datas = {
  //  'userId:friendId'(小的ID在前面大的在后面) : [ 聊天集合 ]
}

io.on('connection', function (socket) {
  socket.on('info', (info) => {     // 私聊
    let { userId } = info
    let { data, key } = ReceiveInfo(info, io)
    io.emit('push:' + key, data)

    msg = groupMsgList(userId)      // 推送给消息列表页(msg)
    io.emit("pushList:" + userId, msg)
  });

  socket.on('initConnect', ({ userId, friendId }) => {
    if(!Object.keys(datas).length) {
      initGetData().then(result => {
        pushInitMsg({ userId, friendId })
      })
    } else {
      pushInitMsg({ userId, friendId })
    }
  })

  socket.on('initMsgList', ({ userId }) => {
    let msg = {} 
    if(!Object.keys(datas).length) {
      initGetData().then(result => {
        msg = groupMsgList(userId)
        io.emit("pushList:" + userId, msg)
      })
    } else {
      msg = groupMsgList(userId)
      io.emit("pushList:" + userId, msg)
    }
  })
  // io.emit('push', []);

  socket.on("disconnec", function() {
    console.log("断线重连")
  })
});

function ReceiveInfo(info, io) {      // 接收消息
  info.createTime = base.timestampToTime()
  let { userId, oppositeSideId } = info
  let key = compareSize(userId, oppositeSideId)
  databaseAddMsg(info)
  if(!Object.keys(datas).length) {
    initGetData().then(result => {
      io.emit('push:' + key, datas[key]);
    })
  }
  AddInfo(key, info)
  return { data: datas[key], key }
}
function AddInfo(key, info) {
  if(Boolean(datas[key])) {
    datas[key].push(info)
  } else {
    datas[key] = [info]
  }
}
function databaseAddMsg(info) {
  return SQL.add("private_chat_record", info)
  .then(result => result)
  .catch(error => error)
}

function compareSize(a, b) {
  return Number(a) > Number(b) ? b + ":" + a : a + ":" + b
}
function pushInitMsg({ userId, friendId }) {
  let key = compareSize(userId, friendId)
  let data = datas[key] ? datas[key] : []
  io.emit('push:' + key, data);
}
function initGetData() {
  return SQL.custom('select * from private_chat_record').then(result => {
    let data = base.groupQueryData(result)
    return groupData(data)
  })
}
function groupData(data) {
  data.forEach(item => {
    let key = compareSize(item.userId, item.oppositeSideId)
    AddInfo(key, item)
  })
  return datas
}
function groupMsgList(userId) {
  let msg = {}
  Object.keys(datas).forEach(key => {
    let ids = key.split(":")
    userId = userId.toString()
    if(ids.indexOf(userId) !== -1) {
      msg[key] = datas[key]
    }
  })
  return msg
}