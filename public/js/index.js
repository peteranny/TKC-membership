var config = null;
function init(){
  $.getJSON("config.json", function(json) {
    config = json;
    checkAuth(config.api.client_id, config.api.scopes, true)
    .then(showMain, hideMain);
  });
}

function initClick(){
  checkAuth(config.api.client_id, config.api.scopes, false)
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

  loadSheetsApi(config.api.discovery)

  .then(function(){
    return listMembers(config.list, transformRow);
  }, Promise.reject)

  .then(function(list){
    list.forEach(function(member){
      var d = member.dof;
      member.hasFeePaid = d!=null && d.getFullYear()==(new Date()).getFullYear();
    });
    vm.rows = list;
    //TODO
    return Promise.map(vm.config.sheet_dates, function(sheet_date){
        var sheetId = sheet_date.sheetId;
        var selected = sheet_date.sel_dates.map(function(sel_date){
            return sel_date.sel;
        });
        return fetchFellowships(sheetId, selected);
    })
    .then(tables){
        vm.rows = tables.reduce(function(a,b){ return a.concat(b); });
    }, Promise.reject);
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

function transformRow(row){
  return {
    no: parseInt(row[0]),
    nickname: row[1],
    name: row[2],
    dob: convertDate(row[3]),
    ident: row[4],
    tel: row[5],
    addr: row[6],
    doj: convertDate(row[7]), // date of join
    dojf: row[8],
    dof: convertDate(row[9]), // date of fee
    dow: convertDate(row[10]), // date of withdrawal
    unique: undefined,
    attendance: [],
    attendSum: undefined,
    hasFeePaid: undefined,
    isValid: undefined,
  };
}

function convertDate(s){
  if(!s) return null;
  var matched = s.match(/(\d+)\.(\d+)\.(\d+)/);
  if(!matched) return null;
  var y = matched[1];
  var m = matched[2];
  var d = matched[3];
  return genDate(y,m,d);
}

function genDate(y,m,d){
  return new Date(y,m-1,d);
}
