function init(){
  checkAuth(config.client_id, config.scopes, true)
    .then(showMain, hideMain);
}

var login = false;
function initClick(){
  checkAuth(config.client_id, config.scopes, login)
    .then(showMain, function(err){
      login = true;
      hideMain();
    });
}

function hideMain(){
  $('#authorize-div').show();
  $('#main').hide();
}

function showMain(){
  $('#authorize-div').hide();
  $('#main').show();

  loading.run();
  loadSheetsApi()

    .then(function(){
      return listMembers(config.list);
    }, Promise.reject)

    .then(computeHasFeePaid, Promise.reject)

    .then(function(){
      return fetchFellowships(config.attendance_this);
    }, Promise.reject)

    .then(function(fellowships){
      return fetchAttendance_wraper(config.attendance_this, fellowships);
    }, Promise.reject)

    .then(function(fellowships){
      return cropAttendance(config.year, config.month, config.day, config.latest, config.earliest, fellowship, config.attendance_last);
    }, Promise.reject)

    .then(nameAsKey, Promise.reject)

    .then(combineListAndAttendance, Promise.reject)

    .then(function(){
      loading.close();
    }, function(err){
      loading.fail(err);
    });
}

