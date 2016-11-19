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
var configPath = "public/config.js";

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
      attendances: ATTENDANCE,
    });
  });
  socket.on('test', function(info){
    console.log('Receive test');
    /*
    checkAuth()
    
    .then(loadSheetsApi, Promise.reject)
    
    .then(function(){
      var sheets = [{
        description: "會員資料表",
        sheetId: LIST,
      }, {
        description: "最近的主日出席表",
        sheetId: ATTENDANCE[0],
      }, {
        description: "上一個主日出席表",
        sheetId: ATTENDANCE[1],
      }];
      return Promise.map(sheets, function(sheet){

        return fetchTitle(sheet.sheetId).then(function(title){
          return Promise.resolve({
            description:sheet.description,
            title:title
          });
        });
      });
    }, Promise.reject)
    
    .then(function(sheets){
    */
      console.log('Send logs');
      /*
      var logs = sheets.map(function(sheet){
        return sheet.description+"："+sheet.title;
      }).join('\n');
      */
      var logs = "Hello World";
      socket.emit('logs', logs);
      console.log('Send save');
      socket.emit('save');
      /*
    },function(err){
      console.log(err);
      socket.emit('logs', err);
    });
    */
  });
  socket.on('save', function(info){
    console.log('Receive save');
    var code =
      "var CLIENT_ID = " + JSON.stringify(info.client_id, null, 2) + ";\n"+
      "var SCOPES = " + JSON.stringify(info.scopes, null, 2) + ";\n"+
      "var DISCOVERY = " + JSON.stringify(info.discovery, null, 2) + ";\n"+
      "var LIST = " + JSON.stringify(info.list, null, 2) + ";\n"+
      "var ATTENDANCE = " + JSON.stringify(info.attendances, null, 2) + ";\n";
    console.log(code);
    fs.writeFile(configPath, code, function(err){
      if(err) console.log(err);
      console.log('Write done');
    });
  });
});

// google api
function checkAuth() {
  return new Promise(function(resolve, reject){
    gapi.auth.authorize({
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      immediate: true,
    }, function(authResult){
      if (authResult && !authResult.error){
        console.log('Auth done');
        resolve();
      }
      else{
        console.log('Auth failed');
        reject(authResult.error);
      }
    });
  });
}
function loadSheetsApi() {
  return new Promise(function(resolve, reject){
    gapi.client.load(DISCOVERY).then(function(){
      console.log('Load API done');
      resolve();
    }, function(err){
      console.log('Load API failed');
      reject(err);
    });
  });
}
function fetchTitle(sheetId){
  return new Promise(function(resolve, reject){
    gapi.client.sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    }).then(function(response){
      var title = response.result.properties.title;
      console.log('Fetch title: '+title);
      resolve(title);
    }, function(err){
      console.log('Fetch title failed');
      reject(err);
    });
  });
}
