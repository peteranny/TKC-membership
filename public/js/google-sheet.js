function checkAuth() {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    immediate: true,
  }, handleAuthResult);
}

function handleAuthClick(){
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    immediate: false,
  }, handleAuthResult);
}

function handleAuthResult(authResult){
  if (authResult && !authResult.error){
    $('#authorize-div').hide();
    $('#main').show();
    run();
  }
  else{
    $('#authorize-div').show();
    $('#main').hide();
  }
}

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

function loadSheetsApi() {
  return new Promise(function(resolve, reject){
    gapi.client.load(DISCOVERY).then(function(){
      resolve();
    }, function(err){
      reject(err);
    });
  });
}

function listMembers() {
  return new Promise(function(resolve, reject){
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: LIST,
      range: "Registered!A2:Z",
    })
    .then(function(response) {
      var range = response.result;
      vm.rows = range.values.map(function(row){
        return transformRow(row);
      });
      resolve();
    }, function(response) {
      reject(response.result.error.message + ' (' + LIST + ')');
    });
  });
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

function computeHasFeePaid(){
  vm.rows.forEach(function(row){
    var d = row.dof;
    row.hasFeePaid = d!=null && d.getFullYear()==(new Date()).getFullYear();
  });
}

var fellowships = null;
function fetchFellowships(){
  return new Promise(function(resolve, reject){
    gapi.client.sheets.spreadsheets.get({
      spreadsheetId: ATTENDANCE_THIS,
    })
    .then(function(response){
      fellowships = response.result.sheets.map(function(sh){
        return sh.properties.title;
      });
      resolve();
    }, function(response){
      reject(response.result.error.message + ' (' + ATTENDANCE_THIS + ')');
    });
  });
}

var attendance_list = null;
function serial2date(serial) {
  var utc_days  = Math.floor(serial - 25569);
  var utc_value = utc_days * 86400;
  var date_info = new Date(utc_value * 1000);
  var fractional_day = serial - Math.floor(serial) + 0.0000001;
  var total_seconds = Math.floor(86400 * fractional_day);
  var seconds = total_seconds % 60;
  total_seconds -= seconds;
  var hours = Math.floor(total_seconds / (60 * 60));
  var minutes = Math.floor(total_seconds / 60) % 60;
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

function fetchAttendance_wraper(){
  vm.dates = [];
  attendance_list = {};
  return fetchAttendance(ATTENDANCE_THIS);
}

function fetchAttendance(sheetId){
  return Promise.map(fellowships, function(fs, j){
    return new Promise(function(resolve, reject){
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "'"+fs+"'!A1:Y",
        valueRenderOption: "FORMULA",
        dateTimeRenderOption: "FORMATTED_STRING",
      })
      
      .then(function(response){
        var dates = response.result.values[0].slice(1).map(serial2date);
        if(j==0){
          vm.dates = dates.concat(vm.dates);
        }
        var table = response.result.values.slice(1).map(function(row){
          for(var k=1;k<dates.length+1;k++){
            Vue.set(row, k, row[k]==1?1:0);
          }
          return row;
        });
        if(sheetId == ATTENDANCE_THIS){
          attendance_list[fs] = table;
        }
        else{
          attendance_list[fs] = attendance_list[fs].map(function(row, i){
            return table[i].concat(row.slice(1));
          });
        }
        resolve();
      }, function(response){
        reject(response.result.error.message + ' (' + sheetId + ')');
      });
    });
  });
}

function genDate(y,m,d){
  return new Date(y,m-1,d);
}
 
var attendance_name_list = null;
function nameAsKey(){
  return new Promise(function(resolve, reject){
    attendance_name_list = {};
    for(var fs in attendance_list){
      var data = attendance_list[fs];
      for(var i=0;i<data.length;i++){
        var nickname = data[i][0];
        var att = data[i].slice(1);
        if( !(nickname in attendance_name_list) ){
          attendance_name_list[nickname] = [];
        }
        attendance_name_list[nickname].push({
          'fellowship':fs,
          'attendance':att, 
        });
      }
    }
    resolve();
  });
}

function solveConflict(no){
  var row = vm.rows[no-1];
  var attend_list = attendance_name_list[row.nickname];
  var choice_fs = attend_list.map(function(v,i){return v.fellowship;});
  var msg = "請問"+row.name+"("+row.nickname+")是:\n"+choice_fs.map(function(v,i){return "("+(i+1)+")"+v;}).join("\n");
  var choice = -1;
  do{
    choice = prompt(msg);
    if(choice==null) return;
    choice = parseInt(choice);
  }while( !(choice>0 && choice<=choice_fs.length) );
  procAttendance(row, attend_list[choice-1].attendance);
  row.unique = true;
}

function confirmAbsence(no){
  var row = vm.rows[no-1];
  var zero_attend = [];
  for(var i=0;i<vm.dates.length;i++) zero_attend.push(0);
  procAttendance(row, zero_attend);
  row.unique = true;
}

function combineListAndAttendance(){
  return new Promise(function(resolve, reject){
    vm.rows.forEach(function(row, i){
      if(row.nickname){
        var attend_list = attendance_name_list[row.nickname];
        if(attend_list){
          row.unique = attend_list.length==1;
          if(!row.unique) return;
          procAttendance(row, attend_list[0].attendance);
        }
      }
    });
    resolve();
  });
}

function procAttendance(row, attendance){
  row.attendance = attendance.map(function(n){
    return (n==""?0:parseInt(n));
  });
  row.attendSum = computeAttendance(row.attendance);
  row.isValid = computeIsValid(row.attendSum);
}

function computeAttendance(attend){
  return attend.reduce(function(a,b){return a+b;}, 0);
}

function computeIsValid(n){
  return n>=6;
}

var base_date = genDate(2016, 8, 28); // the last valid date!
var valid_num_max = 30-7+1; // [-7, -30]
function cropAttendance(){
  return new Promise(function(resolve, reject){
    var i;
    for(i=vm.dates.length-1;i>=0&&base_date<vm.dates[i];i--);
    if(i<0||vm.dates[i].valueOf()!=base_date.valueOf()){
      // date not found
      reject('Oops: dates[i]=' + vm.dates[i] + '\nbase_date=' + base_date);
      return;
    }

    ((i-valid_num_max+1<0)? fetchAttendance(ATTENDANCE_LAST): Promise.resolve()).then(function(){
      var valid_i_range = [i-valid_num_max+1, i+1];
      for(k in attendance_name_list) if(attendance_name_list.hasOwnProperty(k)){
        attendance_name_list[k].forEach(function(fs_attendance){
          fs_attendance.attendance = fs_attendance.attendance.slice(valid_i_range[0], valid_i_range[1]);
        });
      }
      resolve();
    }, function(err){
      reject(err);
    });
  });
}

