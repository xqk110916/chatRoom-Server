const express = require('express')
const app = express()
const server = require('http').Server(app)
const port = 3000

const connection = require("./mysql")
const bodyParser = require("body-parser")

// 使用 body-parser 中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SQL = require("./sql")
const base = require("./base")

app.get("/", (req, res) => { 
  req.query  //get方法的参数  url.parse().query
  SQL.select("user_info", "user_name", 'xqk')
  res.send("hello world!")
})

app.post("/api/userInfo/register", (req, res) => {
  let params = req.body
  let sendParams = { success: true }

  function verify() {
    if(params.name === '') {
      sendParams = base.sendMap(false, '名称不能为空')
      return false
    } else if(params.userName === '') {
      sendParams = base.sendMap(false, '账号不能为空')
      return false
    } else if(params.password === '') {
      sendParams = base.sendMap(false, '密码不能为空')
      return false
    }
    return true
  }
  if(!verify()) return res.send(sendParams)

  SQL.add('user_info', params, res)
})

app.post("/add", (req, res) => {
  let params = req.body
  SQL.add("user", params, res)
})

app.post("/update", (req, res) => {
  let params = req.body
  let id = params.id
  delete params.id
  SQL.update("user_info", params, 'id', id, res)
})

app.post("/delete", (req, res) => {
  let { id } = req.body
  SQL.deletes("user_info", 'id', id, res)
})

server.listen(port, () => console.log("服务已启动"));