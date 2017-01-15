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

function runGetMembers(sheetId) {
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A2:Z',
        }).then(function(response) {
            var rows = response.result.values;
            var list = rows.map(function(row){
                return {
                    no: parseInt(row[0]),
                    nickname: row[1],
                    name: row[2],
                    hasFeePaied: true, // TODO: row[9]
                };
            });
            resolve(list);
        }, function(response) {
            reject(response.result.error.message);
        });
    });
}

function runGetAttendances(sheetId){
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A1:Z',
            valueRenderOption: "FORMATTED_VALUE",
        }).then(function(response){
            var table = response.result.values;
            var dates = table[0].slice(2);
            var member_attendances = table.slice(1).map(function(row){
                return {
                    nickname: row[0],
                    group: row[1],
                    attendance: row.slice(2),
                };
            });
            resolve({
                dates: dates,
                member_attendances: member_attendances,
            });
        }, function(response){
            reject(response.result.error.message);
        });
    });
}
