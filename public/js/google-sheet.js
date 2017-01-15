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

function runGetMembers(sheetId, procRow) {
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A2:Z',
        }).then(function(response) {
            var range = response.result;
            var rows = range.values;
            var list = rows.map(procRow);
            resolve(list);
        }, function(response) {
            var err = response.result.error.message;
            reject(err);
        });
    });
}

