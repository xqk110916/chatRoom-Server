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

module.exports.groupAddParams = groupAddParams
module.exports.groupUpdateParams = groupUpdateParams
module.exports.toHump = toHump
module.exports.toLineParams = toLineParams
module.exports.sendMap = sendMap