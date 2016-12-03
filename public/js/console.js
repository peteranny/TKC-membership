// log
function log(logs){
  vm.logs = logs;
}

// isLoading
function load(msg){
  vm.isLoading = true;
  log('載入中... ' + msg);
}
function loadDone(msg){
  vm.isLoading = false;
  log(msg);
}

// init
load('Initialization');
function init(){
  loadDone('Done');
  nextStage();
}

// stages
function nextStage(i, logs){
  var stage = stages[vm.stage_label];
  var i = i? i: 0;
  stage.to[i].beforeNext(function(x){
    var next_label = stage.to[i].label;
    var next_stage = stages[next_label];
    if(next_stage){
      vm.stage_label = next_label;
      next_stage.action(x);
    }
    else{
      throw 'Failed to transfer stage "'+next_label+'"';
    }
  });
}

// auth
var hasLogin = false;
function runAuthCheck(api){
  return checkAuth(api.client_id, api.scopes, hasLogin)
    .then(
        loadSheetsApi(api.discovery),
        Promise.reject)
    .then(function(){
      hasLogin = true;
      return Promise.resolve();
    }, Promise.reject);
}

// sheetId
function resetSheetId(which){
  vm.sheetId = which? vm.config[which]: '';
}
function loadSheetId(next){
  runAuthCheck(vm.config.api)
    .then(function(){
      return fetchTitle(vm.sheetId);
    }, Promise.reject)
  .then(function(title){
    next(true, title);
  }, function(err){
    next(false, err);
  });
}
function commitListSheetId(){
  Vue.set(vm.config, 'list', vm.sheetId);
}
function commitAttendanceSheetId(){
  vm.config.sheet_dates.push({
    sheetId:vm.sheetId,
    title:'',
    sel_dates:[],
  });
}

// sheet_dates
function loadAllSheetDates(next){
  runAuthCheck(vm.config.api)
    .then(function(){
      return Promise.map(vm.config.sheet_dates, function(sheet_date,i){
        if(sheet_date.sel_dates.length>0){
          return Promise.resolve();
        }
        else{
          return fetchTitle(sheet_date.sheetId)
            .then(function(title){
              Vue.set(vm.config.sheet_dates[i], "title", title);
              return Promise.resolve();
            }, Promise.reject)
          .then(function(){
            Vue.set(vm.config.sheet_dates[i], "sel_dates", []);
            return loadSheetDates(sheet_date);
          }, Promise.reject);
        }
      })
    })
  .then(function(){
    next(true);
  }, function(err){
    next(false, err);
  });
}
function loadSheetDates(sheet_date){
  return runAuthCheck(vm.config.api)
    .then(function(){
      return fetchDates(sheet_date.sheetId);
    }, Promise.reject)
  .then(function(dates){
    dates.forEach(function(date, i){
      sheet_date.sel_dates.push({
        date:date,
        i:i,
        sel:false,
      });
    });
    return Promise.resolve();
  }, Promise.reject);
}

// config
function sendConfig(){
  load('Config');
  socket.emit('config');
}
socket.on('config', function(config){
  vm.config = config;
  loadDone(JSON.stringify(vm.config,null,2));
});
function saveConfig(){
  load('Save');
  socket.emit('save', vm.config);
};
socket.on('saved', function(err){
  loadDone(err? err: '');
});
