var stages = {
  'init':{
    action:function(){
    },
    to:[{
      label:'load-config',
      beforeNext:function(next){
        next();
      },
    }],
  },
  'load-config':{
    action:function(){
      load('Config');
      sendConfig();
    },
    to:[{
      label:'display-config',
      beforeNext:function(next){
        loadDone(JSON.stringify(vm.config,null,2));
        next();
      },
    }],
  },
  'display-config':{
    action:function(){
      resetConfig();
    },
    to:[{
      label:'modify-list',
      beforeNext:function(next){
        log('');
        resetSheetId('list');
        next();
      },
    }],
  },
  'modify-list':{
    action:function(){
    },
    to:[{
      label:'modify-list',
      beforeNext:function(next){
        load('Load list');
        loadSheetId(function(logs){
          loadDone(logs);
          next();
        });
      },
    },{
      label:'modify-attendance',
      beforeNext:function(next){
        log('');
        resetSheetId('attendances');
        next();
      },
    }],
  },
  'modify-attendance':{
    action:function(){
    },
    to:[{
      label:'modify-attendance',
      beforeNext:function(next){
        load('Load attendance');
        loadSheetId(function(logs){
          loadDone(logs);
          next();
        });
      },
    },{
      label:'modify-dates',
      beforeNext:function(next){
        next();
      },
    }],
  },
  'modify-dates':{
    action:function(){
      load('Load dates');
      resetSheetId('attendances');
      loadDates(function(){
        loadDone(JSON.stringify(vm.dates));
      });
    },
    to:[{
      label:'',
      beforeNext:function(){
      },
    }],
  },
  /*
  '':{
    action:function(){
    },
    to:[{
      label:'',
      beforeNext:function(){
      },
    }],
  },
  '':{
    action:function(){
    },
    to:[{
      label:'',
      beforeNext:function(){
      },
    }],
  },
  '':{
    action:function(){
    },
    to:[{
      label:'',
      beforeNext:function(){
      },
    }],
  },
  '':{
    action:function(){
    },
    to:[{
      label:'',
      beforeNext:function(){
      },
    }],
  },
  '':{
    action:function(){
    },
    to:[{
      label:'',
      beforeNext:function(){
      },
    }],
  },
  */
};
