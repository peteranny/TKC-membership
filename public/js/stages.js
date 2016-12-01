var stages = {
  'init':{
    action:function(){
    },
    to:[{
      label:'display-config',
      beforeNext:function(next){
        next();
      },
    }],
  },
  'display-config':{
    action:function(){
      sendConfig();
    },
    to:[{
      label:'modify-list',
      beforeNext:function(next){
        log('');
        next();
      },
    }],
  },
  'modify-list':{
    action:function(){
      resetSheetId('list');
    },
    to:[{
      label:'modify-list',
      beforeNext:function(next){
        load('Load list');
        loadSheetId(function(is_okay, logs){
          loadDone(logs);
          next();
        });
      },
    },{
      label:'modify-dates',
      beforeNext:function(next){
        log('');
        commitListSheetId();
        resetSheetId();
        next(true);
      },
    }],
  },
  'modify-dates':{
    action:function(reload){
      if(reload){
        load('Load dates');
        loadAllSheetDates(function(is_okay, logs){
          loadDone(is_okay? 'Pick target dates': logs);
        });
      }
    },
    to:[{
      label:'modify-dates',
      beforeNext:function(next){
        load('Load attendance');
        loadSheetId(function(is_okay, logs){
          var reload;
          if(is_okay){
            loadDone('');
            commitAttendanceSheetId();
            resetSheetId();
            reload = true;
          }
          else{
            loadDone(logs);
            reload = false;
          }
          next(reload);
        });
      },
    },{
      label:'preview-config',
      beforeNext:function(next){
        log('');
        next();
      },
    },{
      label:'modify-dates',
      beforeNext:function(next){
      },
    }],
  },
  'preview-config':{
    action:function(){
      log(JSON.stringify(vm.config, null, 2));
    },
    to:[{
      label:'display-config',
      beforeNext:function(next){
        saveConfig();
        next();
      },
    }],
  },
};
