//  ## 好友信息模块接口
const app = require('../index')
const SQL = require("../sql")
const base = require("../base")

app.get("/api/friendInfo/queryAll",(req, res) => {     // 查询所有的好友
  let { userId } = base.httpGetParams(req)
  let moduleName = base.receiveHttpLog('/api/friendInfo/queryAll', { userId })
  SQL.select(moduleName, 'userId', userId).then(result => {
    let data = base.groupQueryData(result)
    res.send({data: data, success: true})
  })
})
app.post("/api/friendInfo/add", (req, res) => {       // 添加好友
  let params = req.body
  let { userId, friendId } = params
  let moduleName = base.receiveHttpLog('/api/friendInfo/add', params)
  let sql = `select * from ${moduleName} where user_id = "${userId}" and friend_id = "${friendId}"`
  SQL.custom(sql).then(result => {
    if(result.length) {
      return res.send(base.sendMap(false, '你已经有该用户好友, 无法重复添加'))
    } else {
      params.relationType = 0   // 默认为一般好友
      operationActionFriendInfo(userId, friendId, 0, 0, res)
      SQL.add(moduleName, params, '', '', res).then(data => {
        res.send( { success: true } )
      })
    }
  })
})
app.post("/api/friendInfo/delete", (req, res) => {      // 删除好友
  updateFriendInfo("/api/friendInfo/delete", req.body, -2, 1, res).then(result => {
    let { moduleName, current } = result
    SQL.deletes(moduleName, 'id', current.id, res)
  }).catch(err => err)
})
app.post("/api/friendInfo/updateBlacklist", (req, res) => {     // 加入黑名单
  updateFriendInfo("/api/friendInfo/updateBlacklist", req.body, -1, 1, res).then(result => {
    let { moduleName, current } = result
    current.relation_type = -1
    SQL.update(moduleName, current, 'id', current.id, res)
  }).catch(err => err)
})
app.post("/api/friendInfo/updateParticular", (req, res) => {     // 特别关心
  updateFriendInfo("/api/friendInfo/updateBlacklist", req.body, 1, 1, res).then(result => {
    let { moduleName, current } = result
    current.relation_type = 1
    SQL.update(moduleName, current, 'id', current.id, res)
  }).catch(err => err)
})


//  公共函数
function updateFriendInfo(url, params, type, status, res) {
  let { userId, friendId } = params
  let moduleName = base.receiveHttpLog(url, params)
  let sql = `select * from ${moduleName} where user_id = "${userId}" and friend_id = "${friendId}"`
  return SQL.custom(sql).then(result => {
    if(result.length) {
      let current = result[0]
      operationActionFriendInfo(userId, friendId, type, status, res)
      return { moduleName, current }
    } else {
      res.send(base.sendMap(false, '操作失败,没有查找到该好友'))
      throw false
    }
  })
}
function operationActionFriendInfo(userId, friendId, type, status, res) {     // 操作friend_info表时, 写入操作记录表
  let payload = {
    userId,
    friendId,
    type,
    status,
    update_time: base.timestampToTime()
  }
  SQL.add('friend_operating_record', payload, '', '', res)
}