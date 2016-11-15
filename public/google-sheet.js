// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '354856638975-pnjlmu0d866uf774kop1k787vjmkqqri.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
var LIST = "1TDcdilPsHpnRJ6MjAZO7ifHvbrrW-0UA38UupMlO-zA";
var ATTENDANCE = [
  "1X5oma_O_i32wjRiILgVKCbNsf9qnSeu-vc9npZSnbOI",
  "1Bqam_dHyxn78JhYosgO2VN4x_91EKb01EdbI2A9foUI",
];

var loading = {
  timer:null,
  text:"LOADING",
  num_dots:3,
  dt:100,
  run:function(isRun){
    var tgt = $("#loading");
    tgt.text(loading.text);
    if(isRun){
      tgt.show();
      timer = setInterval(function(){
        if(tgt.text().length<loading.text.length+loading.num_dots){
          tgt.text(tgt.text()+".")
        }
        else{
          tgt.text(loading.text);
        }
      }, loading.dt);
    }
    else{
      tgt.hide();
      tgt.text("");
      timer = clearInterval(loading.timer);
    }
  }
};


// called on page load
function checkAuth() {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    immediate: true,
  }, handleAuthResult);
}

// called on button clicked
function handleAuthClick(event) {
  gapi.auth.authorize({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    immediate: false,
  }, handleAuthResult);
  return false;
}

// called with response from google api
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
  loading.run(true);
  loadSheetsApi()
    .then(listMembers)
    .then(fetchFellowships)
    .then(fetchAttendance_wraper)
    .then(cropAttendance)
    .then(nameAsKey)
    .then(combineListAndAttendance)
    .then(function(){
      loading.run(false);
    });
}

function loadSheetsApi() {
  var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  return new Promise(function(resolve, reject){
    gapi.client.load(discoveryUrl).then(function(){
      resolve();
    });
  });
}

function listMembers() {
  return new Promise(function(resolve, reject){
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: LIST,
      range: "Registered!A2:Z",
    }).then(function(response) {
      var range = response.result;
      if (range.values.length > 0) {
        for (i = 0; i < range.values.length; i++) {
          var row = range.values[i];
          // Print columns A and E, which correspond to indices 0 and 4.
          vm.rows.push(transformRow(row));
        }
      } else {
        appendPre('No data found.');
      }
      resolve();
    }, function(response) {
      appendPre('Error: ' + response.result.error.message);
      reject();
    });
  });
}

function transformRow(row){
  return {
    no:row[0],
    nickname:row[1],
    name:row[2],
    dob:row[3],
    ident:row[4],
    tel:row[5],
    addr:row[6],
    doj:row[7], // date of join
    dojf:row[8],
    dof:row[9], // date of fee
    dow: row[10], // date of withdrawal
    attendance: [],
    attendSum: 0,
    isValid:undefined,
  };
}

var fellowships = null;
function fetchFellowships(){
  return new Promise(function(resolve, reject){
    var obj = gapi.client.sheets.spreadsheets.get({
      spreadsheetId: '1X5oma_O_i32wjRiILgVKCbNsf9qnSeu-vc9npZSnbOI'
    }).then(function(response){
      fellowships = response.result.sheets.map(function(sh){
        return sh.properties.title;
      });
      resolve();
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
  return fetchAttendance(0);
}

function fetchAttendance(i){
  return Promise.map(fellowships, function(fs, j){
    return new Promise(function(resolve, reject){
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: ATTENDANCE[i],
        range: "'"+fs+"'!A1:Y",
        valueRenderOption: "FORMULA",
        dateTimeRenderOption: "FORMATTED_STRING",
      }).then(function(response){
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
        if(i==0){
          attendance_list[fs] = table;
        }
        else{
          attendance_list[fs] = attendance_list[fs].map(function(row, i){
            return table[i].concat(row.slice(1));
          });
        }
        resolve();
      });
    });
  }).then(function(){
    return Promise.resolve();
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
function solveConflict(i){
  return function(){
    var row = vm.rows[i];
    var attend_list = attendance_name_list[row.nickname];
    var choice_fs = attend_list.map(function(v,i){return v.fellowship;});
    var msg = "請問"+row.name+"("+row.nickname+")是"+choice_fs.map(function(v,i){return "("+(i+1)+")"+v;}).join(",");
    var choice = -1;
    do{
      choice = parseInt(prompt(msg));
    }while( !(choice>0 && choice<=choice_fs.length) );
    choice--;
    row.attendance = attend_list[choice].attendance;
  };
}
function combineListAndAttendance(){
  return new Promise(function(resolve, reject){
    for(var i=0;i<vm.rows.length;i++){
      var row = vm.rows[i];
      if(row.nickname){
        var attend_list = attendance_name_list[row.nickname];
        if(attend_list){
          if(attend_list.length==1){
            row.attendance = attend_list[0].attendance;
          }
          else{
            $('#member'+(i+1)).html($('<button>').text('有資料衝突，點選我解決...').click(solveConflict(i)));
          }
          row.attendance = row.attendance.map(function(n){
            return (n==""?0:parseInt(n));
          });
          row.attendSum = computeAttendance(row.attendance);
          row.isValid = computeIsValid(row.attendSum);
        }
      }
    }
    resolve();
  });
}
function computeAttendance(attend){
  return attend.reduce(function(prevValue, value, index){
    return prevValue + value;
  }, 0);
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
      alert('oops : dates[i]=' + vm.dates[i] + '\nbase_date=' + base_date);
      reject();
      return;
    }
    ((i-valid_num_max+1<0)? fetchAttendance(1): Promise.resolve()).then(function(){
      var valid_i_range = [i-valid_num_max+1, i+1];
      for(k in attendance_name_list) if(attendance_name_list.hasOwnProperty(k)){
        attendance_name_list[k].forEach(function(fs_attendance){
          fs_attendance.attendance = fs_attendance.attendance.slice(valid_i_range[0], valid_i_range[1]);
        });
      }
      resolve();
    });
  });
}

