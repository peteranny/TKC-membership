function runGoogleAuth(client_id, scopes, immediate) {
    return new Promise(function(resolve, reject){
        var timer = setTimeout(function(){
            log('這個頁面需要彈出新視窗，\n但你的瀏覽器可能封鎖彈出新視窗了。\n\n請讓瀏覽器允許彈出新視窗之後，重新整理此頁面。');
            reject('Login timeout');
        }, 3000);
        gapi.auth.authorize({
            client_id,
            scope: scopes.join(' '),
            immediate,
        }, function(authResult){
            clearTimeout(timer);
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
    var genDate = function(date){
        if(!date) return null;
        return new Date(
            date
            .replace(/(\D)(\d)(?=\D|$)/g, "$10$2")
            .replace(/\D/g, '-')
        );
    }
    var ch2n = function(ch){
        return ch.charCodeAt(0) - 'A'.charCodeAt(0);
    }
    return new Promise(function(resolve, reject){
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'A2:Z',
        }).then(function(response) {
            var rows = response.result.values;
            var list = rows.map(function(row){
                return {
                    no: parseInt(row[ch2n('A')]),
                    nickname: row[ch2n('B')],
                    name: row[ch2n('C')],
                    date_of_last_fee_paid: genDate(row[ch2n('J')]),
                    date_of_ejected: genDate(row[ch2n('K')]),
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
