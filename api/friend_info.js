//  ## 好友信息模块接口
const app = require('../index')
const SQL = require("../sql")
const base = require("../base")

app.get("/api/friendInfo/queryAll",(req, res) => {     // 查询所有的好友
  let { userId } = base.httpGetParams(req)
  let moduleName = base.receiveHttpLog('/api/friendInfo/queryAll', { userId })
  SQL.select(moduleName, 'userId', userId).then(result => {
    res.send({data: result, success: true})
  })
})
app.post("/api/friendInfo/add", (req, res) => {
  let params = req.body
  let { userId, id } = params
  let moduleName = base.receiveHttpLog('/api/friendInfo/add', params)
  let sql = `select * from ${moduleName} where user_id = "${userId}" and friend_id = "${id}"`
  SQL.custom(sql).then(result => {
    console.log(result)
    res.send({data: result, success: true})
    if(result.length) {
      
    }
  })
})


//  公共函数
function operationActionFriendInfo(userId, type, newValue, oldValue, res) {     // 操作user_info表时, 写入操作记录表
  let payload = {
    userId,
    type,
    old: oldValue,
    new: newValue,
    update_time: base.timestampToTime()
  }
  SQL.add('action_user_info', payload, '', '', res)
}