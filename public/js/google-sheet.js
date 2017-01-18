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
                    date_of_last_fee_paid: row[9],
                };
            });
            resolve(list);
        }, function(response) {
            reject(response.result.error.message);
        });
    });
}

function runGetAttendances(sheetId, dates_only){
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A1:Z',
            valueRenderOption: "FORMATTED_VALUE",
        }).then(function(response){
            var table = response.result.values;
            var dates = table[0].slice(2);
            if(dates_only){
                resolve(dates);
                return;
            }
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

function runGetTitle(sheetId){
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        }).then(function(response){
            resolve(response.result.properties.title);
        }, function(response){
            if(!response.result) reject(response.statusText);
            else reject(response.result.error.message);
        });
    });
}
