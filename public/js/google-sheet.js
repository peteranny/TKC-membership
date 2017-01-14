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

