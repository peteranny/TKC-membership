function run(){
  load();
  loadSheetsApi()

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
    
    .then(function(sheets){
      loadDone();

      var logs = sheets.map(function(sheet){
        var titleText;
        if(sheet.sheetId==="") titleText = '無';
        else if(sheet.title!==undefined) titleText = sheet.title;
        else if(sheet.err) titleText = '資料抓取失敗：' + sheet.err + ' (' + sheet.sheetId + ')';
        else throw "Unexpected titleText";
        return sheet.description + "： " + titleText;
      }).join('\n');

      if(sheets.filter(function(sheet){
        return sheet.title===undefined;
      }).length==0){
        vm.tested_config = deepcopy(vm.config);
        logs += '\n\n確認完畢請按提交！';
      }
      log(logs);
    }, function(err){
      loadDone();
      log(err);
    });
}
