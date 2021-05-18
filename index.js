const express = require('express')
const app = express()
const server = require('http').Server(app)
const port = 3000

const connection = require("./mysql")
const bodyParser = require("body-parser")

app.use((req, res, next) => {
  //设置请求头
  res.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Max-Age': 1728000,
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8'
  })
  req.method === 'OPTIONS' ? res.status(204).end() : next()
})

// 使用 body-parser 中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

server.listen(port, () => console.log("服务已启动"));

module.exports = app

require("./api/user_info")      // 用户信息模块接口
require("./api/friend_info")    // 好友管理模块接口
require("./api/group_info")    // 分组管理模块接口