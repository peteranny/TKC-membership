var vm = new Vue({
    el: '#main',
    data:{
        logged_in: false,
        members: [],
        dates: [],
        query: '',
        filters: [],
        console_uri: 'TODO',
        attendance_threshold: 6,
        paid_year: 2017,
    },
    computed:{
        queried_members: function(){
            return this.members.filter(function(member){
                var hasQuery = this.query!='';
                var match_nickname =
                    member.nickname&&
                    member.nickname.toLowerCase().indexOf(this.query.toLowerCase())!=-1;
                var match_name =
                    member.name&&
                    member.name.toLowerCase().indexOf(this.query.toLowerCase())!=-1;
                var is_paid = this.hasFeePaid(member);
                var is_valid = this.isValid(member);
                /* filters */
                return (
                    hasQuery&&(match_nickname||match_name)
                    || !hasQuery//&&match_type;
                );
            }.bind(this));
        },
        unsolved_members: function(){
            return this.members.filter(function(member){
                return !member.solved;
            });
        },
        isSolved: function(){
            return this.unsolved_members.length==0;
        },
    },
    methods:{
        copyList: function(){
            log('copy list');
        },
        gotoConfig: function(){
            log('goto config');
        },
        solveConflict: function(member){
            var msg =
                '請問' + member.name + '(' + member.nickname + ')是:\n' +
                member.candidates.map(function(one, i){ return (i+1) + ') ' + one.group }).join('\n');
            var chosen = -1;
            do{
                chosen = prompt(msg);
                if(chosen==null) return;
                chosen = parseInt(chosen);
            }while( !(chosen>0 && chosen<=member.candidates.length) );
            Object.assign(member, member.candidates[chosen-1]);
            delete member.candidates;
            member.solved = true;
        },
        confirmAbsence: function(member){
            // absent
            Object.assign(member, {
                attendance: '0'.repeat(this.dates.length).split('').map(function(x){ return parseInt(x) }),
            });
            member.solved = true;
        },
        memberType: function(member){
            return;
        },
        attendanceSum: function(member){
            return member.attendance.reduce(function(a, b){
                return a + b;
            }, 0);
        },
        hasFeePaid: function(member){
            var dof = member.date_of_last_fee_paid;
            return (
                dof?
                new Date(dof.replace(/\D/g, ' ')).getFullYear() == this.paid_year:
                false
            );
        },
        isValid: function(member){
            var sum = this.attendanceSum(member);
            var paid = this.hasFeePaid(member);
            return paid && sum >= this.attendance_threshold;
        },
    },
});

Vue.filter('isValidText', function(isValid){
    return isValid==undefined?'':isValid?"有效會員":"無效會員";
});

Vue.filter('attendanceText', function(isValid){
    return isValid==undefined?'':isValid?"有效會員":"無效會員";
});

Vue.filter('hasFeePaidText', function(hasFeePaid){
    return hasFeePaid? '已繳': '未繳';
});
