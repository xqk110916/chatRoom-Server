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
app.get("/api/friendInfo/queryDetailsById", (req, res) => {     // 根据ID查询好友的信息
  let { id } = base.httpGetParams(req)
  base.receiveHttpLog('/api/friendInfo/queryDetailsById', { id })
  let moduleName = 'user_info'
  SQL.select(moduleName, 'id', id, 'id, user_name, name').then(result => {
    let data = base.groupQueryData(result)
    res.send({data: data, success: true})
  })
})
app.get("/api/friendInfo/queryDetailsByUserName", (req, res) => {       // 根据用户名查询好友的信息
  let { userName } = base.httpGetParams(req)
  base.receiveHttpLog('/api/friendInfo/queryDetailsByUserName', { userName })
  let moduleName = 'user_info'
  SQL.select(moduleName, 'userName', userName, 'id, user_name, name').then(result => {
    let data = base.groupQueryData(result)
    res.send({data: data, success: true})
  })
})
app.get("/api/friendInfo/queryAddRequest", (req, res) => {    // 查询未处理的好友申请
  let { userId } = base.httpGetParams(req)
  base.receiveHttpLog('/api/friendInfo/queryDetailsById', { userId })
  let moduleName = 'application_record'
  let sql = `select * from ${moduleName} where friend_id = "${userId}" and status = 0`
  SQL.custom(sql).then(result => {
    let data = base.groupQueryData(result)
    res.send({data: data, success: true})
  }).catch(error => {
    res.send(base.sendMap(false, error.message))
  })
})

app.post("/api/friendInfo/add", (req, res) => {       // 添加好友
  let params = req.body
  let { userId, friendId } = params
  let moduleName = base.receiveHttpLog('/api/friendInfo/add', params)
  let operationName = 'application_record'
  let sql = `select * from ${moduleName} where user_id = "${userId}" and friend_id = "${friendId}"`
  SQL.custom(sql).then(result => {
    if(result.length) {
      return res.send(base.sendMap(false, '你已经有该用户好友, 无法重复添加'))
    } else {
      let recordSql = `select * from ${operationName} where user_id = "${userId}" and friend_id = "${friendId}"`
      SQL.custom(recordSql).then(record => {
        if(!record.length || record[0].status !== 0) {
          params.status = 0
          params.createTime = base.timestampToTime()
          SQL.add(operationName, params, '', '', res).then(addResult => {
            return res.send({ success: true })
          })
        } else {
          return res.send(base.sendMap(false, '你的申请记录还未被处理, 请勿重复提交'))
        }
      })
    }
  })
})
app.post("/api/friendInfo/handlerAddRequest", (req, res) => {      // 处理好友申请
  let { userId, id, status } = req.body
  let moduleName = base.receiveHttpLog('/api/friendInfo/handlerAddRequest', { userId, id, status })
  let operationName = 'application_record'
  let sql = `select * from ${operationName} where friend_id = "${userId}" and id = "${id}"`
  SQL.custom(sql).then(result => {
    if(result.length) {
      let current = result[0]
      if(current.status !== 0) return res.send(base.sendMap(false, '该申请已处理过'))
      let updateSql = `update ${operationName} set status = ${status}, update_time = '${base.timestampToTime()}' where id = '${id}'`
      SQL.custom(updateSql).then(updateResults => {
        if(status == 1) {
          let payLoad = {
            user_id: current.user_id,
            friend_id: current.friend_id,
            group_tag_id: current.group_tag_id,
            remark_name: current.remark_name,
            relation_type: 0
          }
          let selectSql = `select * from friend_info where user_id = '${current.user_id}' and friend_id = '${current.friend_id}'`
          SQL.custom(selectSql).then(selectResult => {
            console.log(selectResult)
            if(selectResult.length) {
              res.send(base.sendMap(false, '你已经是该用户好友了, 请勿重复添加'))
            } else {
              SQL.add(moduleName, payLoad, '', '', res).then(data => {
                res.send( { success: true } )
              })
            }
          })
        } else {
          res.send( { success: true } )
        }
      })
    } else {
      return res.send(base.sendMap(false, '没有查找到该条记录'))
    }
  })
})
app.post("/api/friendInfo/delete", (req, res) => {      // 删除好友
  updateFriendInfo("/api/friendInfo/delete", req.body, -2, res).then(result => {
    let { moduleName, current } = result
    SQL.deletes(moduleName, 'id', current.id, res)
  }).catch(err => err)
})
app.post("/api/friendInfo/updateBlacklist", (req, res) => {     // 加入黑名单
  updateFriendInfo("/api/friendInfo/updateBlacklist", req.body, -1, res).then(result => {
    let { moduleName, current } = result
    current.relation_type = -1
    SQL.update(moduleName, current, 'id', current.id, res)
  }).catch(err => err)
})
app.post("/api/friendInfo/updateParticular", (req, res) => {     // 特别关心
  updateFriendInfo("/api/friendInfo/updateBlacklist", req.body, 1, res).then(result => {
    let { moduleName, current } = result
    current.relation_type = 1
    SQL.update(moduleName, current, 'id', current.id, res)
  }).catch(err => err)
})
app.post("/api/friendInfo/updateRemarkName", (req, res) => {      // 修改好友备注
  updateFriendInfo("/api/friendInfo/updateRemarkName", req.body, '', res).then(result => {
    let { RemarkName } = req.body
    let { moduleName, current } = result
    current.Remark_name = RemarkName
    SQL.update(moduleName, current, 'id', current.id, res)
  })
})
app.post("/api/friendInfo/changeGrouping", (req, res) => {      // 修改好友分组
  updateFriendInfo("/api/friendInfo/changeGrouping", req.body, '', res).then(result => {
    let { groupId } = req.body
    let { moduleName, current } = result
    current.group_tag_id = groupId
    SQL.update(moduleName, current, 'id', current.id, res)
  })
})

//  公共函数
function updateFriendInfo(url, params, type, res) {     // 更改好友的
  let { userId, friendId } = params
  let moduleName = base.receiveHttpLog(url, params)
  let sql = `select * from ${moduleName} where user_id = "${userId}" and friend_id = "${friendId}"`
  return SQL.custom(sql).then(result => {
    if(result.length) {
      let current = result[0]
      operationActionFriendInfo(userId, friendId, type, res)
      return { moduleName, current }
    } else {
      res.send(base.sendMap(false, '操作失败,没有查找到该好友'))
      throw false
    }
  })
}
function operationActionFriendInfo(userId, friendId, type, res) {     // 操作friend_info表时, 写入操作记录表
  if(type === '') return
  let payload = {
    userId,
    friendId,
    type,
    update_time: base.timestampToTime()
  }
  SQL.add('friend_operating_record', payload, '', '', res)
}