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
  let time = base.timestampToTime()
  params.createTime = time
  params.updateTime = time
  let name = base.receiveHttpLog('/api/userInfo/register', params)
  SQL.add(name, params, 'user_name', params.userName, res)
})

app.post("/api/userInfo/login", (req, res) => {       //登录
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
app.post("/api/userInfo/changePassword", (req, res) => {      //更改密码
  let params = req.body
  let name = base.receiveHttpLog('/api/userInfo/changePassword', params)
  SQL.select(name, 'user_name', params.userName).then(result => {
    if(result.length && result[0].password == params.oldPassword && result[0].phone_number == params.phoneNumber) {
      SQL.update(name, { password: params.newPassword }, 'user_name', params.userName, res)
      operationActionUserInfo(result[0], 0, params.newPassword, result[0].password, res)
    } else {
      res.send(base.sendMap(false, "信息输入有误"))
    }
  })
})
app.post("/api/userInfo/resetPassword", (req, res) => {     ///重置密码
  let params = req.body
  let name = base.receiveHttpLog('/api/userInfo/resetPassword', params)
  SQL.select(name, 'user_name', params.userName).then(result => {
    if(result.length && result[0].phone_number == params.phoneNumber) {
      SQL.update(name, { password: params.password }, 'user_name', params.userName, res)
      operationActionUserInfo(result[0], 1, params.password,  result[0].password, res)
    } else {
      res.send(base.sendMap(false, "账号或手机号输入有误"))
    }
  })
})
app.post("/api/userInfo/changeName", (req, res) => {      // 更改用户名
  let params = req.body
  let { userId, name } = params
  let moduleName = base.receiveHttpLog('/api/userInfo/changeName', params)
  if(name === '') {
    res.send(base.sendMap(false,'用户名不能为空'))
    return false
  }
  operationActionUserInfo({ userId }, 3, name, '', res)
  SQL.update(moduleName, { name }, 'id', userId, res)
})
app.post("/api/userInfo/changeProfile", (req, res) => {        // 更改头像
  let params = req.body
  let { userId, profile } = params
  let moduleName = base.receiveHttpLog('/api/userInfo/changeProfile', params)
  operationActionUserInfo({ userId }, 2, profile, '', res)
  SQL.update(moduleName, { profilePicture: profile }, 'id', userId, res)
})
app.post("/api/userInfo/changeSignature", (req, res) => {        // 更改个性签名
  let params = req.body
  let { userId, value } = params
  let moduleName = base.receiveHttpLog('/api/userInfo/changeSignature', params)
  operationActionUserInfo({ userId }, 4, value, '', res)
  SQL.update(moduleName, { personalizedSignature: value }, 'id', userId, res)
})

app.post("/api/userInfo/queryInfo", (req, res) => {       // 获取用户信息
  let { userId } = req.body
  let moduleName = base.receiveHttpLog('/api/userInfo/changeSignature', { userId })
  SQL.select(moduleName, 'id', userId).then(result => {
    res.send({data: result, success: true})
  })
})


//  公共函数
function operationActionUserInfo(userId, type, newValue, oldValue, res) {     // 操作user_info表时, 写入操作记录表
  let payload = {
    userId,
    type,
    old: oldValue,
    new: newValue,
    update_time: base.timestampToTime()
  }
  SQL.add('action_user_info', payload, '', '', res)
}