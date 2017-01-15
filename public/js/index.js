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
    Loading.on();
    var chain =
        runLoadSheetsApi(
            config.api.discovery
        ).then(function(){
            function convertDate(s){
                if(!s) return null;
                var matched = s.match(/(\d+)\.(\d+)\.(\d+)/);
                if(!matched) return null;
                var y = matched[1];
                var m = matched[2];
                var d = matched[3];
                return new Date(y,m-1,d);
            }
            return runGetMembers(
                config.list,
                function(row){ return {
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
                }}
            );
        }).then(function(members){
            vm.members = members;
        }).catch(function(err){
            Loading.off(err);
        }).then(function(){
            Loading.off();
        });
}
