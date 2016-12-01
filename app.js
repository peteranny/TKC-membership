var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// socket.io

var socketIO = require('socket.io');
var io = socketIO.listen(server);
var fs = require('fs');
var Promise = require('bluebird');
var configPath = "./public/js/config.json";

io.on('connection', function(socket){
  console.log('Receive connection');
  socket.on('disconnection', function(){
    console.log('Receive disconnection');
  });
  socket.on('config', function(){
    console.log('Receive config');
    config = require(configPath);
    console.log('Send config');
    socket.emit('config', config);
  });
  socket.on('save', function(config){
    console.log('Receive save');
    var code = JSON.stringify(config, null, 2);
    fs.writeFile(configPath, code, function(err){
      if(err) console.log(err);
      else console.log('Write done');
      socket.emit('saved', err);
    });
  });
});

