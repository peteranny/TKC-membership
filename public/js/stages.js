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
        runAuthCheck(vm.config.api)

          .then(function(){
            return fetchTitle(vm.sheetId);
          }, Promise.reject)

          .then(function(title){
            loadDone(title);
            commitSheetId();
            next();
          }, function(err){
            loadDone(err);
            next();
          });
      },
    },{
      label:'modify-attendance',
      beforeNext:function(next){
      },
    }],
  },
  'modify-attendance':{
    action:function(){
      resetSheetId('attendances');
    },
    to:[{
      label:'',
      beforeNext:function(next){
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
