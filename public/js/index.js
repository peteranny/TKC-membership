var config = null;
function init(){
    $.getJSON('config.json', function(json) {
        config = json;
        runGoogleAuth(
            config.api.client_id,
            config.api.scopes,
            true
        ).then(function(){
            log('Authcheck passed');
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
}
