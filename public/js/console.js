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

var vm = new Vue({
  el:"#main",
  data:{
    isLoading:true,
    stage: 'init',

    config:{},
    tested_config:{},

    sheetId:'',
    whichSheetId:'',
  },
  computed:{
    canSave:function(){
      return JSON.stringify(this.config)===JSON.stringify(this.tested_config);
    },
    canCommitSheetId:function(){
      if(Array.isArray(this.tested_config[this.whichSheetId])){
        var n = this.tested_config.length;
        return this.sheetId==this.tested_config[this.whichSheetId][n-1];
      }
      else{
        return this.sheetId==this.tested_config[this.whichSheetId];
      }
    },
  },
  /*
  computed:{
    canSave: function(){
      // can save only if the data is tested
      var config = this.config;
      var tested_config = this.tested_config;
      try{
        Object.keys(config).forEach(function(k){
          if(typeof config[k]=='string'){
            if(config[k]!=tested_config[k]) throw "Not passed";
          }
          if(Array.isArray(config[k])){
            config[k].forEach(function(v, i){
              if(config[k][i]!=tested_config[k][i]) throw "Not passed";
            });
          }
        });
      }catch(err){
        return false;
      }
      return true;
    },
  },
  methods:{
    openWindow: function(sheetId){
      var url = 'https://docs.google.com/spreadsheets/d/' + sheetId;
      window.open(url, '', '');
    },
  },
  */
});

Vue.filter('whichSheetIdText', function(whichSheetId){
  switch(whichSheetId){
    case 'list': return '會員資料表';
    case 'attendances': return '主日出席表';
    default: return '';
  }
});
