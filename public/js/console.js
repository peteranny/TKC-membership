var login = false;
function init(){
  checkAuth(config.client_id, config.scopes, login)
    .then(function(){
      login = true;
      log('');
      run();
    }, log);
}

function run(){
  load();
  loadSheetsApi(config.discovery)

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
*/

    .then(function(sheets){
      loadDone();
      logTitles(sheets);
    }, function(err){
      loadDone();
      log(err);
    });
}

var vm = new Vue({
  el:"#main",
  data:{
    config:{},
    tested_config:{},
    isLoading:false,
  },
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
});
