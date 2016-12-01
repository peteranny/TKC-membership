var hasLogin = false;
function runAuthCheck(api){
  return new Promise(function(resolve, reject){
    checkAuth(api.client_id, api.scopes, hasLogin)

      .then(function(){
        return loadSheetsApi(api.discovery);
      }, Promise.reject)

      .then(function(){
        hasLogin = true;
        resolve();
      }, function(err){
        reject(err);
      });
  });
}
