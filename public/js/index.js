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
            }, function(err){
                Loading.off();
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
    app.logged_in = true;
    Loading.on('Load Google API');
    var chain =
        runLoadSheetsApi(
            config.api.discovery
        ).then(function(){
            Loading.on('Load members');
            return runGetMembers(
                config.list.sheetId
            ).then(function(members){
                return members.filter(function(member){
                    return member.name!=='' && !member.date_of_ejected;
                });
            });
        }).then(function(members){
            var members_dict = {};
            for(var i in members){
                var member = members[i];
                members_dict[member.nickname] = [];
            }
            // collect from every sheet
            Loading.on('Load attendances');
            return Promise.map(
                config.attendances,
                function(attendances){
                    return runGetAttendances(
                        attendances.sheetId
                    ).then(function(data){
                        var sel_dates =
                            data.dates.filter(function(col, i){
                                return attendances.dates[i].sel;
                            });
                        // select attendance on specific dates
                        var member_sel_attendances =
                            data.member_attendances.map(function(m_a){
                                var nickname = m_a.nickname;
                                var group = m_a.group;
                                var attendance = m_a.attendance;
                                var sel_attendance = [];
                                for(var i = 0; i < attendances.dates.length; i++){
                                    if(attendances.dates[i].sel)
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
                var member_attendances_dict = {};
                for(i in many){
                    var one = many[i];
                    one.member_attendances.forEach(function(m_a){
                        var nickname = m_a.nickname;
                        var group = m_a.group;
                        if(!member_attendances_dict[nickname]){
                            member_attendances_dict[nickname] = {};
                        }
                        if(!member_attendances_dict[nickname][group]){
                            // insert previous absence
                            var attendance = [];
                            for(j in dates){ attendance.push(0) }
                            member_attendances_dict[nickname][group] = attendance;
                        }
                        // concatenate attendance
                        [].push.apply(member_attendances_dict[nickname][group], m_a.attendance);
                    });
                    [].push.apply(dates, one.dates);
                }
                // group attendances according to nickname
                for(var nickname in member_attendances_dict){
                    for(var group in member_attendances_dict[nickname]){
                        var attendance = member_attendances_dict[nickname][group];
                        // preserve only members in the list
                        if(members_dict[nickname]){
                            members_dict[nickname].push({
                                group: group,
                                attendance: attendance,
                            });
                        }
                    }
                }
                // append meta data to members
                for(var i in members){
                    var member = members[i];
                    var nickname = member.nickname;
                    // solved
                    Object.assign(member, {
                        solved: members_dict[nickname].length == 1,
                    });
                    // attendance
                    if(member.solved){
                        Object.assign(member, members_dict[nickname][0]);
                    }else{
                        // unsolved candidates
                        Object.assign(member, {
                            candidates: members_dict[nickname],
                        });
                    }
                }
                app.dates = dates;
                app.members = members;
            });
        }).then(function(){
            Loading.off();
        }).catch(function(err){
            Loading.off(err);
        });
}
