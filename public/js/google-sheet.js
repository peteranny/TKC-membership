function runGoogleAuth(client_id, scopes, immediate) {
    return new Promise(function(resolve, reject){
        gapi.auth.authorize({
            client_id,
            scope: scopes.join(' '),
            immediate,
        }, function(authResult){
            if(authResult && !authResult.error){
                resolve();
            }
            else{
                reject(authResult.error);
            }
        });
    });
}

function runLoadSheetsApi(discovery){
    return new Promise(function(resolve, reject){
        gapi.client.load(discovery).then(function(){
            resolve();
        }, function(err){
            reject(err);
        });
    });
}

