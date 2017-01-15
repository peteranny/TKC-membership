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
            var range = response.result;
            var rows = range.values;
            var list = rows.map(function(row){
                return {
                    no: parseInt(row[0]),
                    nickname: row[1],
                    name: row[2],
                    unique: true,//TODO
                    sum: 0,//TODO
                    /*
                        attendances: {},
                        attendSum: undefined,
                        hasFeePaid: undefined,
                        isValid: undefined,
                        */
                };
            });
            resolve(list);
        }, function(response) {
            reject(response.result.error.message);
        });
    });
}

function runGetAttendances(sheetId, sel_dates){
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A1:Z',
            valueRenderOption: "FORMATTED_VALUE",
        }).then(function(response){
            var table = response.result.values;
            var dates = table[0].slice(2).filter(function(col, i){
                return sel_dates[i].sel;
            });
            var attendances = table.slice(1).map(function(row){
                var attendance = [];
                for(var i=0;i<sel_dates.length;i++){
                    // leave only selected columns
                    if(sel_dates[i].sel) attendance.push(row[i]? 1: 0);
                }
                return {
                    nickname: row[0],
                    group: row[1],
                    attendance,
                };
            });
            resolve(attendances);
        }, function(response){
            reject(response.result.error.message);
        });
    });
}
