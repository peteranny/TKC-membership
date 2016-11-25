function run(){
  loading.run();
  loadSheetsApi()
    .then(listMembers, Promise.reject)
    .then(computeHasFeePaid, Promise.reject)
    .then(fetchFellowships, Promise.reject)
    .then(fetchAttendance_wraper, Promise.reject)
    .then(cropAttendance, Promise.reject)
    .then(nameAsKey, Promise.reject)
    .then(combineListAndAttendance, Promise.reject)
    .then(function(){
      loading.close();
    }, function(err){
      loading.fail(err);
    });
}

