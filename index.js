var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// socket.io

var socketIO = require('socket.io');
var io = socketIO.listen(server);
var fs = require('fs');
var Promise = require('bluebird');
var configPath = "public/js/config.js";

io.on('connection', function(socket){
  console.log('Receive connection');
  socket.on('disconnection', function(){
    console.log('Receive disconnection');
  });
  socket.on('info', function(){
    console.log('Receive info');

    eval(fs.readFileSync(configPath).toString());
    console.log('Send info');
    socket.emit('info', {
      client_id: CLIENT_ID,
      scopes: SCOPES,
      discovery: DISCOVERY,
      list: LIST,
      attendance_this: ATTENDANCE_THIS,
      attendance_last: ATTENDANCE_LAST,
      year: YEAR,
      month: MONTH,
      day: DAY,
      latest: LATEST,
      earliest: EARLIEST,
    });
  });
  socket.on('save', function(info){
    console.log('Receive save');
    var code =
      "var CLIENT_ID = " + JSON.stringify(info.client_id, null, 2) + ";\n"+
      "var SCOPES = " + JSON.stringify(info.scopes, null, 2) + ";\n"+
      "var DISCOVERY = " + JSON.stringify(info.discovery, null, 2) + ";\n"+
      "var LIST = " + JSON.stringify(info.list, null, 2) + ";\n"+
      "var ATTENDANCE_THIS = " + JSON.stringify(info.attendance_this, null, 2) + ";\n" +
      "var ATTENDANCE_LAST = " + JSON.stringify(info.attendance_last, null, 2) + ";\n" + 
      "\n" + 
      "var YEAR = " + JSON.stringify(info.year) + "\n" + 
      "var MONTH = " + JSON.stringify(info.month) + "\n" + 
      "var DAY = " + JSON.stringify(info.day) + "\n" + 
      "\n" + 
      "var LATEST = " + JSON.stringify(info.latest) + "\n" + 
      "var EARLIEST = " + JSON.stringify(info.earliest) + "\n"; 
    fs.writeFile(configPath, code, function(err){
      if(err) console.log(err);
      console.log('Write done');
    });
  });
});

