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
// res ; name: 要操作的表名; sole: 唯一键; value: 对应唯一键的值; sql: 要执行的sql; error: 如果执行select语句没有找到需要报错的信息; isAdd: 是否为新增请求, 修改删除需要在库中找到才会执行, 新增相反, 找到则不执行;
function dataIsExist(res, name, sole, value, sql, errorInfo, isAdd = false) {
  errorInfo = errorInfo ? errorInfo : '没有查找到该数据'
  return select(name, sole, value).then(result => {
    if(result.length > 0 === !isAdd) {
      return operationDatabase(sql).then(results => {
        base.executeSqlLog(name, sql, '成功')
        res.send({ success: true })
        return true
      }).catch(error => {
        base.executeSqlLog(name, sql, error.message)
        res.send(base.sendMap(false, "系统异常," + error.message))
        throw false
      })
    } else {
      base.executeSqlLog(name, sql, errorInfo)
      res.send(base.sendMap(false, errorInfo))
      throw false
    }
  }).catch(error => {
    base.executeSqlLog(name, sql, error.message)
    res.send(base.sendMap(false, "系统异常," + error.message))
    throw false
  })
}

// name: 要操作的表名; sole: 唯一键; value: 唯一键对应的值; selectValue: 要查询的值, 默认为*
function select(name, sole, value, selectValue = '*') {
  sole = base.toLine(sole)
  let sql = `select ${selectValue} from ${name} where ${sole} = "${value}"`
  if(name && !sole && !value) sql = `select * from ${name}`
  return operationDatabase(sql).then(results => {
    return base.groupQueryData(results)
  }).catch(error => {
    return error
  })
}

function add(name, params, sole, value, res) {
  params = base.toLineParams(params)
  let sqlRes = base.groupAddParams(params)
  let sql = `insert into ${name} (${sqlRes.key}) value (${sqlRes.value})`
  if(!sole && !value) return operationDatabase(sql)     //如果没有唯一键和值, 直接插入不需要查重
  let errorInfo = '已存在'
  return dataIsExist(res, name, sole, value, sql, errorInfo, true)
}

function update(name, params, sole, value, res) {
  params = base.toLineParams(params)
  let sqlValue = base.groupUpdateParams(params)
  let sql = `update ${name} set ${sqlValue} where ${sole} = '${value}'`
  return dataIsExist(res, name, sole, value, sql)
}

function deletes(name, sole, value, res) {
  let sql = `delete from ${name} where ${sole} = '${value}'`
  return dataIsExist(res, name, sole, value, sql)
}

module.exports.custom = operationDatabase
module.exports.select = select
module.exports.add = add
module.exports.update = update
module.exports.deletes = deletes