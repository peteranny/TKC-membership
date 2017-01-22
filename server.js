const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

const server = app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

// socket.io

const socketIO = require('socket.io');
const io = socketIO.listen(server);
const fs = require('fs');
const publicDirPath = './public/';
const configPath = publicDirPath + 'config.json';
const tmpDirPath = 'tmp/';

function log(){
    const msg = Array.from(arguments).reduce((a,b) => a + ' ' + (
        b instanceof Error ? b.toString():
        typeof b === 'object' ? JSON.stringify(b, null, 2):
        b
    ), '');
    console.log(`${new Date()} ${msg}`);
}

io.on('connection', function(socket){
    log('Receive', 'CONNECTION');
    socket.on('disconnection', function(){
        log('Receive', 'DISCONNECTION');
    });
    socket.on('save', function(config){
        log('Receive', 'SAVE');
        const code = JSON.stringify(config, null, 2);
        fs.writeFile(configPath, code, function(err){
            if(err) log('ERROR', err);
            else log('Done writing', configPath);
            socket.emit('saved', err);
        });
    });
    socket.on('download', function(data){
        log('Receive', 'DOWNLOAD');
        const downloadPath = tmpDirPath + data.filename;
        fs.writeFile(publicDirPath + downloadPath, data.content, function(err){
            if(err){
                log('ERROR', err);
                socket.emit('downloaded', null);
            }
            else{
                log('Done writing', downloadPath);
                socket.emit('downloaded', downloadPath);
            }
        });
    });
});

