var config = null;
function init(){
    $.getJSON('config.json', function(json) {
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
    var chain =
        runLoadSheetsApi(config.api.discovery)
        .catch(function(err){
            log(err);
        }).then(function(){
            log('Done');
        });
}
