Loading.on();

var config = null;
function init(){
    $.getJSON('config.json')
        .fail(function(err){
            log('Error on JSON:', err);
        })
        .done(function(json) {
            config = json;
            runGoogleAuth(
                config.api.client_id,
                config.api.scopes,
                true
            ).then(function(){
                run();
            }).catch(function(err){
                log('Error in init: ', err);
            });
        });
}

function initClick(){
    runGoogleAuth(
        config.api.client_id,
        config.api.scopes,
        false
    ).then(function(){
        run();
    });
}

function run(){
    vm.logged_in = true;
    Loading.on('Google API');
    var chain =
        runLoadSheetsApi(
            config.api.discovery
        ).then(function(){
            Loading.on('Members');
            return runGetMembers(
                config.list
            );
        }).then(function(members){
            Loading.on('Attendances');
            var members_dict = {};
            for(var i in members){
                var member = members[i];
                members_dict[member.nickname] = [];
            }
            // collect from every sheet
            return Promise.map(
                config.attendances_dates,
                function(one){
                    return runGetAttendances(
                        one.sheetId
                    ).then(function(data){
                        var sel_dates =
                            data.dates.filter(function(col, i){
                                return one.sel_dates[i].sel;
                            });
                        // select attendance on specific dates
                        var member_sel_attendances =
                            data.member_attendances.map(function(m_a){
                                var nickname = m_a.nickname;
                                var group = m_a.group;
                                var attendance = m_a.attendance;
                                var sel_attendance = [];
                                for(var i = 0; i < one.sel_dates.length; i++){
                                    if(one.sel_dates[i].sel)
                                        sel_attendance.push(attendance[i]? 1: 0);
                                }
                                return {
                                    nickname: nickname,
                                    group: group,
                                    attendance: sel_attendance,
                                };
                            });
                        return {
                            dates: sel_dates,
                            member_attendances: member_sel_attendances,
                        };
                    });
                }
            ).then(function(many){
                var dates = [];
                var member_attendances = [];
                // concatenate
                for(i in many){
                    var one = many[i];
                    [].push.apply(dates, one.dates);
                    [].push.apply(member_attendances, one.member_attendances);
                }
                // group attendances according to nickname
                for(var i in member_attendances){
                    var m_a = member_attendances[i];
                    var nickname = m_a.nickname;
                    if(members_dict[nickname])
                        members_dict[nickname].push(m_a);
                }
                // append meta data to members
                for(var i in members){
                    var member = members[i];
                    var nickname = member.nickname;
                    // unique
                    Object.assign(member, {
                        unique: members_dict[nickname].length == 1,
                    });
                    // attendance
                    if(member.unique){
                        Object.assign(member, members_dict[nickname][0]);
                    }else{
                        // ununique candidates
                        Object.assign(member, {
                            candidates: members_dict[nickname],
                        });
                    }
                }
                vm.members = members;
                // leave sum and isValid to Vue
            }).then(function(){
                log(vm.members);
            });
        }).then(function(){
            Loading.off();
        }).catch(function(err){
            Loading.off(err);
        });
}
