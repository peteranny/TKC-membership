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
const https = require('https');
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

    socket.on('config', function(){
        log('Receive', 'CONFIG');
        requestMLab('GET', {_id:'default'}, function(configs){
            if(configs.length != 1){
                log('ERROR: Found not exactly one config')
            }
            else{
                var config = configs[0].config;
                log('GET');
                socket.emit('got-config', config);
            }
        });
    });

    socket.on('save', function(config){
        log('Receive', 'SAVE');
        requestMLab('POST', {_id:'default', config:config}, function(response){
            log('POST', response);
            socket.emit('saved');
        });
    });

    var timer = null;
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

function requestMLab(method, data, callback){
    data = data? JSON.stringify(data): '';
    var apiKey = 'RUg7fCn5rsI85SowYalPJzSMU2Bf1bi5';
    var options = {
        host: 'api.mlab.com',
        path: '/api/1/databases/tkc/collections/tkc-membership?apiKey=' + apiKey,
        method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        },
    };
    var req = https.request(options, function(res) {
        var buf = new Buffer(1024*1024);
        var n = 0;
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            n += buf.write(chunk, n);
        });
        res.on('end', function(){
            callback(JSON.parse(buf.slice(0,n).toString().toString()));
        });
    });
    req.write(data);
    req.end();
}
