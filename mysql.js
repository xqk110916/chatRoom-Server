var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '118.178.184.251',
  user     : '123',
  password : '123456',
  database : '123'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  // console.log('connected as id ' + connection.threadId);
});

module.exports = connection