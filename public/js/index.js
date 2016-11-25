function run(){
  loading.run();
  loadSheetsApi()
    .then(listMembers, rejectStack('listMembers'))
    .then(computeHasFeePaid, rejectStack('computeHasFeedPaid'))
    .then(fetchFellowships, rejectStack('fetchFellowships'))
    .then(fetchAttendance_wraper, rejectStack('fetchAttendance_wraper'))
    .then(cropAttendance, rejectStack('cropAttendance'))
    .then(nameAsKey, rejectStack('nameAsKey'))
    .then(combineListAndAttendance, rejectStack('combineListAndAttendance'))
    .then(function(){
      loading.close();
    }, function(errStack){
      loading.fail(errStack);
    });
}

