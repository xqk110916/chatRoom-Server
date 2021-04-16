const app = require('../index')
const SQL = require("../sql")
const base = require("../base")

app.get("/", (req, res) => { 
  req.query  //get方法的参数  url.parse().query
  res.send("hello world!")
})

app.post("/api/userInfo/register", (req, res) => {    //注册
  let params = req.body
  let sendParams = { success: true }

  function verify() {
    if(params.name === '') {
      sendParams = base.sendMap(false, '名称不能为空')
      return false
    } else if(params.userName === '') {
      sendParams = base.sendMap(false, '账号不能为空')
      return false
    } else if(params.phoneNumber === '') {
      sendParams = base.sendMap(false, '手机号不能为空')
      return false
    } else if(params.password === '') {
      sendParams = base.sendMap(false, '密码不能为空')
      return false
    }
    return true
  }
  if(!verify()) return res.send(sendParams)
  let name = base.receiveHttpLog('/api/userInfo/register', params)
  SQL.add(name, params, 'user_name', params.userName, res)
})

app.post("/api/userInfo/login", (req, res) => {
  let params = req.body
  let sendParams = { success: true, token: base.GenerateRandomId() }
  let name = base.receiveHttpLog('/api/userInfo/login', params)
  SQL.select(name, 'user_name', params.userName, 'password').then(result => {
    if(result.length && result[0].password == params.password) {
      res.send(sendParams)
    } else {
      res.send(base.sendMap(false, "账号或密码错误"))
    }
  })
})
app.post("/api/userInfo/changePassword", (req, res) => {
  let params = req.body
  let name = base.receiveHttpLog('/api/userInfo/changePassword', params)
  SQL.select(name, 'user_name', params.userName).then(result => {
    if(result.length && result[0].password == params.oldPassword && result[0].phone_number == params.phoneNumber) {
      SQL.update(name, { password: params.newPassword }, 'user_name', params.userName, res)
      operationActionUserInfo(result[0], 0, params.newPassword, res)
    } else {
      res.send(base.sendMap(false, "信息输入有误"))
    }
  })
})
app.post("/api/userInfo/resetPassword", (req, res) => {
  let params = req.body
  let name = base.receiveHttpLog('/api/userInfo/resetPassword', params)
  SQL.select(name, 'user_name', params.userName).then(result => {
    if(result.length && result[0].phone_number == params.phoneNumber) {
      SQL.update(name, { password: params.password }, 'user_name', params.userName, res)
      operationActionUserInfo(result[0], 1, params.password, res)
    } else {
      res.send(base.sendMap(false, "账号或手机号输入有误"))
    }
  })
})
app.post("/api/userInfo/changeName", (req, res) => {
  let params = req.body
  let { userId, name } = params
  let moduleName = base.receiveHttpLog('/api/userInfo/changeName', params)
  if(name === '') {
    res.send(base.sendMap(false,'用户名不能为空'))
    return false
  }
  SQL.update(moduleName, { name }, 'id', userId, res)
})

function operationActionUserInfo(result, type, newValue, res) {
  let payload = {
    userId: result.id,
    type: 1,
    old: result.password,
    new: newValue,
    update_time: base.timestampToTime()
  }
  SQL.add('action_user_info', payload, '', '', res)
}


app.post("/api/user/add", (req, res) => {
  let params = req.body
  base.receiveHttpLog('/api/user/add',params)
  SQL.add("user", params, 'name', params.name, res)
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