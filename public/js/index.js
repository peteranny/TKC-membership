function init(){
    $.getJSON("config.json", function(config) {
        log(config)
        runGoogleAuth(
            config.api.client_id,
            config.api.scopes,
            true
        ).then(function(){
            log('Authcheck passed')
        }).catch(function(err){
            log('Error in init: ', err)
        });//.then(showMain, hideMain);
    });
}

