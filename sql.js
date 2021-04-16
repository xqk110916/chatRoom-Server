var connection = require("./mysql")
var base = require("./base")

// 数据库操作
function operationDatabase(sql) {
  return new Promise((reslove, reject) => {
    connection.query(sql, (error, results, fields) => {
      if(error) {
        throw error
        reject(error)
      } else {
        reslove(results)
      }
    })
  })
}

// 查看数据是否已存在, 已存在就执行sql操作, 如果为新增, 则为找不到执行操作
function dataIsExist(res, name, sole, value, sql, errorInfo, isAdd = false) {
  errorInfo = errorInfo ? errorInfo : '没有查找到该数据'
  select(name, sole, value).then(result => {
    if(result.length > 0 === !isAdd) {
      operationDatabase(sql).then(results => {
        base.executeSqlLog(name, sql, '成功')
        res.send({ success: true })
      }).catch(error => {
        base.executeSqlLog(name, sql, error.message)
        res.send(base.sendMap(false, "系统异常," + error.message))
      })
    } else {
      base.executeSqlLog(name, sql, errorInfo)
      res.send(base.sendMap(false, errorInfo))
    }
  }).catch(error => {
    base.executeSqlLog(name, sql, error.message)
    res.send(base.sendMap(false, "系统异常," + error.message))
  })
}

function select(name, sole, value, selectValue = '*') {
  let sql = `select ${selectValue} from ${name} where ${sole} = "${value}"`
  if(name && !sole && !value) sql = `select * from ${name}`
  return operationDatabase(sql).then(results => {
    return results
  }).catch(error => {
    return error
  })
}

function add(name, params, sole, value, res) {
  params = base.toLineParams(params)
  let sqlRes = base.groupAddParams(params)
  let sql = `insert into ${name} (${sqlRes.key}) value (${sqlRes.value})`
  if(!sole && !value) return operationDatabase(sql)     //如果没有唯一键和值, 直接插入不需要查重
  let errorInfo = '该用户已存在'
  dataIsExist(res, name, sole, value, sql, errorInfo, true)
}

function update(name, params, sole, value, res) {
  params = base.toLineParams(params)
  let sqlValue = base.groupUpdateParams(params)
  let sql = `update ${name} set ${sqlValue} where ${sole} = '${value}'`
  dataIsExist(res, name, sole, value, sql)
}

function deletes(name, sole, value, res) {
  let sql = `delete from ${name} where ${sole} = '${value}'`
  dataIsExist(res, name, sole, value, sql)
}

module.exports.select = select
module.exports.add = add
module.exports.update = update
module.exports.deletes = deletes