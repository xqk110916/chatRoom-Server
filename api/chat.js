const app = require('../index').app
const io = require('../index').io
const base = require("../base")

const datas = {
  //  'userId:friendId'(小的ID在前面大的在后面) : [ 聊天集合 ]
}

io.on('connection', function (socket) {
  socket.on('info', function (data) {     // 私聊
    console.log(data)
    io.emit('push', [data]);
  });
  io.emit('push', []);

  socket.on("disconnec", function() {
    console.log("断线重连")
  })
});

function groupInfo(info) {

}