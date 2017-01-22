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
const rmdir = require('rimraf');
const publicDirPath = './public/';
const configPath = publicDirPath + 'config.json';
const tmpDirLink = 'tmp/';

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
    let timer = null;
    socket.on('download', function(data){
        log('Receive', 'DOWNLOAD');
        clearTimeout(timer);
        const downloadLink = tmpDirLink + data.filename;
        const downloadPath = publicDirPath + downloadLink;
        const tmpDirPath = publicDirPath + tmpDirLink;
        if(!fs.existsSync(tmpDirPath)) fs.mkdirSync(tmpDirPath);
        fs.writeFile(downloadPath, data.content, function(err){
            if(err){
                log('ERROR', err);
                socket.emit('downloaded', null);
            }
            else{
                log('Done writing', downloadPath);
                socket.emit('downloaded', downloadLink);
                timer = setTimeout(function(){
                    rmdir(tmpDirPath, function(){
                        log('Deleted', tmpDirPath);
                    });
                }, 60*1000);
            }
        });
    });
});

