Loading.on();

var config = null;
function init(){
    $.getJSON('config.json')
        .fail(function(err){
            log('Error on JSON:', err);
        })
        .done(function(json) {
            config = json;
            runGoogleAuth(
                config.api.client_id,
                config.api.scopes,
                true
            ).then(function(){
                run();
            }).catch(function(err){
                log('Error in init: ', err);
            });
        });
}

function initClick(){
    runGoogleAuth(
        config.api.client_id,
        config.api.scopes,
        false
    ).then(function(){
        run();
    });
}

function run(){
    vm.logged_in = true;
    Loading.on('Google API');
    var chain =
        runLoadSheetsApi(
            config.api.discovery
        ).then(function(){
            Loading.on('Members');
            function convertDate(s){
                if(!s) return null;
                var matched = s.match(/(\d+)\.(\d+)\.(\d+)/);
                if(!matched) return null;
                var y = matched[1], m = matched[2], d = matched[3];
                return new Date(y, m-1, d);
            }
            return runGetMembers(
                config.list
            );
        }).then(function(members){
            Loading.on('Attendances');
            vm.members = members;
            return Promise.map(
                config.attendances_dates,
                function(one){
                    return runGetAttendances(
                        one.sheetId,
                        one.sel_dates
                    );
                }
            ).then(function(many){
                return many.reduce(function(a, b){
                    return a.concat(b);
                }, []);
            });
        }).then(function(data){
            log(data);
            Loading.off();
        }).catch(function(err){
            Loading.off(err);
        });
}
