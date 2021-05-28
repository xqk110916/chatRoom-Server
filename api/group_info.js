//  ## 分组信息模块接口
const app = require('../index').app
const SQL = require("../sql")
const base = require("../base")

app.get("/api/groupInfo/query", (req, res) => {
  let { userId } = base.httpGetParams(req)
  let moduleName = base.receiveHttpLog('/api/groupInfo/query', { userId })
  SQL.select(moduleName, 'user_id', userId).then(data => {
    res.send({ data, success: true })
  })
})
app.post("/api/groupInfo/add", (req, res) => {      // 新增
  let { userId, groupTagName } = req.body
  let moduleName = base.receiveHttpLog('/api/groupInfo/add', { userId, groupTagName })
  let selectSql = `select * from ${moduleName} where  user_id = ${userId} and group_tag_name = '${groupTagName}'`
  SQL.custom(selectSql).then(result => {
    if(result.length) {
      return res.send(base.sendMap(false, '不能创建相同名称的分组'))
    } else {
      SQL.add(moduleName, { userId, groupTagName }, '', '', res).then(data => {
        return res.send({ success: true })
      })
    }
  })
})
app.post("/api/groupInfo/update", (req, res) => {      // 修改
  let params = req.body
  let moduleName = base.receiveHttpLog('/api/groupInfo/update', params)
  SQL.update(moduleName, params, 'id', params.id, res)
})
app.post("/api/groupInfo/delete", (req, res) => {      // 删除
  let { id } = req.body
  let moduleName = base.receiveHttpLog('/api/groupInfo/delete', { id })
  SQL.deletes(moduleName, 'id', id, res)
})