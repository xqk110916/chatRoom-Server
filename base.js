const fs = require('fs');
const url = require('url');

// 写日志
function receiveHttpLog(url, params) {    // 写日志的同时返回获取的表名
  let fileName = urlSplitMouduleName(url)
  let value = `请求记录: 时间: ${timestampToTime()}, url: ${url}, 参数: ${JSON.stringify(params)};`
  writeLog(fileName, value)
  return fileName
}
function executeSqlLog(fileName, sql, msg) {
  let value = `执行记录: 时间: ${timestampToTime()}, SQL: ${sql}, 响应消息: ${msg}`
  writeLog(fileName, value)
}
function urlSplitMouduleName(url) {        // 从url中提取 /api/ 后面跟着的模块名
  let moduleName = url.split("/api/")[1]
  let idx = moduleName.indexOf("/")
  moduleName = moduleName.substring(0, idx)
  moduleName = toLine(moduleName)
  return moduleName
}
function writeLog(fileName, value) {
  value = value + '\n'
  fs.appendFile(`./log/${fileName}.log`, value, err => {
    if(err) return console.log("写入失败" + err)
  })
}

// 将对象转化为sql用的string
function groupAddParams(params) {
  let keyAry = Object.keys(params)
  let keyStr = ''
  let valueStr = ''
  keyAry.forEach((key, index) => {
    let end = ', '
    if(index === keyAry.length - 1) end = ''
    keyStr += key + end
    valueStr += '"' + params[key] + '"' + end
  })
  return { key: keyStr, value: valueStr }
}
function groupUpdateParams(params) {
  let keyAry = Object.keys(params)
  let value = ''
  keyAry.forEach((key, index) => {
    let end = ', '
    if(index === keyAry.length - 1) end = ''
    value = value + `${key} = '${params[key]}'${end}`
  })
  return value
}
// 将数据库下划线的数据转化为驼峰
function groupQueryData(data) {
  return data.map(item => {
    let params = {}
    let keys = Object.keys(item)
    keys.forEach(key => {
      params[toHump(key)] = item[key]
    })
    return params
  })
}
// 下划线转换驼峰
function toHump(name) {
  return name.replace(/\_(\w)/g, function(all, letter){
      return letter.toUpperCase();
  });
}
// 驼峰转换下划线
function toLine(name) {
  return name.replace(/([A-Z])/g,"_$1").toLowerCase();
}
function toLineParams(params) {
  let obj = {}
  Object.keys(params).forEach(key => {
    let nKey = toLine(key)
    obj[nKey] = params[key]
  })
  return obj
}

// 返回信息格式
function sendMap(success, errorInfo) {
  return {
    success,  errorInfo,
  }
}

// 深复制
function clone(params) {
  let data = Array.isArray(params) ? [] : {}
  for(let key in params) {
    let type = typeof params[key]
    if(type === 'string' || type === 'boolean' || type === 'number') data[key] = params[key]
    if(typeof params[key] === 'object') {
      if(params[key] instanceof Date) {       //Date日期对象也会被认为object, 故判断一下
        data[key] = params[key]
      } else if(!params[key]) {         //处理值为null时会被处理为空对象的问题
        data[key] = ''
      } else {
        data[key] = clone(params[key])
      }
    }
  }
  return data
}

function httpGetParams(req) {      //获取get请求的参数
  return url.parse(req.url, true).query
}

//将时间戳转化为 时间格式(带时分秒)
function timestampToTime(timestamp = Date.now()) {
  var date = new Date(Number(timestamp)); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}

function GenerateRandomId() {      //生成随机ID, 时间戳加字母加随机数字
  let time =  Date.now()
  return randomLetter() + time + randomLetter() + randomNumber() + randomNumber()
}

function randomNumber() {
  let num = Math.random() * 10
  return Math.floor(num)
}
function randomLetter() {
  let arr = ['A','B','C','D','E','F','G','H','I','J']
  let index = randomNumber()
  return arr[index]
}

module.exports.groupAddParams = groupAddParams
module.exports.groupUpdateParams = groupUpdateParams
module.exports.groupQueryData = groupQueryData
module.exports.toHump = toHump
module.exports.toLine = toLine
module.exports.toLineParams = toLineParams
module.exports.sendMap = sendMap
module.exports.receiveHttpLog = receiveHttpLog
module.exports.executeSqlLog = executeSqlLog
module.exports.GenerateRandomId = GenerateRandomId
module.exports.timestampToTime = timestampToTime
module.exports.clone = clone
module.exports.httpGetParams = httpGetParams