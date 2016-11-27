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
/*
function run(){
  // Promise chain
/*
    .then(function(){
      load('Fetch title');
      return fetchTitle(vm.config.list);
    }, Promise.reject)

/*
    .then(function(){
      var sheets = [{
        description: "會員資料表",
        sheetId: config.list,
      }, {
        description: "最近的主日出席表",
        sheetId: config.attendance_this,
      }, {
        description: "上一個主日出席表",
        sheetId: config.attendance_last,
      }];
      return Promise.map(sheets, function(sheet){
        if(sheet.sheetId!=''){
          return fetchTitle(sheet.sheetId).then(function(title){
            sheet.title = title;
            return Promise.resolve(sheet);
          }, function(err){
            sheet.err = err;
            return Promise.resolve(sheet);
          });
        }
        else{
          return Promise.resolve(sheet);
        }
      });
    }, Promise.reject)

    .then(function(msg){
      loadDone();
      log(msg);
    }, function(err){
      loadDone();
      log(err);
    });
*/
//}






/*
    // stage machine
    function transferStage(stage, logs){
      vm.stage = stage;
      if(logs) log(logs);
    }
*/
/*
    function commitSheetId(){
      if(Array.isArray(vm.tested_config[vm.whichSheetId])){
        vm.tested_config[vm.whichSheetId].push(vm.sheetId);
      }
      else{
        Vue.set(vm.tested_config, vm.whichSheetId, vm.sheetId);
      }
    }
*/
/*
    function resetSheetId(which){
      vm.whichSheetId = which;
      vm.sheetId = '';
    }
*/
/*
    function nextStep(is_okay, logs){
      switch(vm.stage){
        case 'init':
          transferStage('load-config');
          load('Config');
          sendConfig();
          break;
          ///
        case 'load-config':
          loadDone(JSON.stringify(vm.config,null,2));
          transferStage('display-config');
          resetConfig();
          break;
          ///
        case 'display-config':
          transferStage('modify-list');
          resetSheetId('list');
          break;
          ///
        case 'modify-list':
          if(is_okay){
            // Commit
            commitSheetId();
            transferStage('modify-attendance');
            resetSheetId('attendances');
          }
          else{
            // Test
            transferStage('load-list');
            load('Load list');
            runAuthCheck(vm.config.api)

              .then(function(){
                return fetchTitle(vm.sheetId);
              }, Promise.reject)

              .then(function(title){
                nextStep(true, title);
              }, function(err){
                nextStep(false, err);
              })
          }
          break;
        case 'load-list':
          loadDone(logs);
          if(is_okay){
            commitSheetId();
          }
          transferStage('modify-list');
          break;
          /*
        case 'modify-attendance':
          if(is_okay){
            transferStage('load-dates');
            load('Load dates');
            loadDates(vm.config.attendances[0]);
          }
          else{
            transferStage('load-attendance');
            load('Load attendance');
            loadAttendance(vm.config.attendances[0]);
          }
          break;
        case 'load-attendance':
          transferStage('modify-attendance');
          loadDone(logs);
          vm.canSave=is_okay;
        case 'load-dates':
          if(is_okay){
            transferStage('read-base-date');
            loadDone('Read base date');
          }
          else{
            transferStage('modify-attendance');
            vm.canSave=false;
          }
          break;
        case 'read-base-date':
          transferStage('read-num-dates');
          break;
        case 'read-num-dates':
          transferStage('select-dates');
          load('Select dates');
          selectedDates();
          break;
        case 'select-dates':
          if(is_okay){
            transferStage('display-dates');
            loadDone('Display dates');
          }
          else{
            transferStage('modify-more-attendances');
          }
          break;
        case 'modify-more-attendance':
          if(is_okay){
            transferStage('load-more-dates');
            load('Load more dates');
            loadDates(vm.config.attendances[vm.config.attendances.length-1]);
          }
          else{
            transferStage('load-more-attendances');
            load('Load more attendnaces');
            vm.canSave=false;
          }
          break;
        case 'load-more-attendances':
          transferStage('modify-more-attendances');
          loadDone(logs);
          vm.canSave=is_okay;
          break;
        case 'load-more-dates':
          if(is_okay){
            transferStage('concat-dates');
            loadDone('Concatenate dates');
          }
          else{
            transferStage('modify-more-attendances');
            loadDone('Modify more attendances');
            vm.canSave=false;
          }
          break;
        case 'concat-dates':
          transferStage('select-dates');
          break;
        case 'display-dates':
          if(is_okay){
            transferStage('display-config');
            vm.canSave=true;
          }
          else{
            transferStage('read-num-dates');
          }
        default:
          alert('Unknown stage');
          throw 'Unknown stage';
      }
    }
    */
