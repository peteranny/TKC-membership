function init(){
  checkAuth(config.client_id, config.scopes, true)
    .then(showMain, hideMain);
}

function initClick(){
  checkAuth(config.client_id, config.scopes, false)
    .then(showMain, hideMain);
}

function hideMain(){
  $('#authorize-div').show();
  $('#main').hide();
}

function showMain(){
  $('#authorize-div').hide();
  $('#main').show();

  loading.run();
  loadSheetsApi(config.discovery)

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
      return cropAttendance(config.year, config.month, config.day, config.latest, config.earliest, fellowships, config.attendance_last);
    }, Promise.reject)

    .then(function(){
      return nameAsKey();
    }, Promise.reject)

    .then(combineListAndAttendance, Promise.reject)

    .then(function(){
      loading.close();
    }, function(err){
      loading.fail(err);
    });
}

