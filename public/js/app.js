const filters = {
    showPaidValid: {
        text: "已繳費有效會員",
        sel: true,
    },
    showUnpaidValid: {
        text: "未繳費有效會員",
        sel: false,
    },
    showPaidInvalid: {
        text: "已繳費無效會員",
        sel: false,
    },
    showUnpaidInvalid: {
        text: "未繳費無效會員",
        sel: false,
    },
};

var app = new Vue({
    el: '#main',
    data:{
        logged_in: false,
        members: [],
        dates: [],
        query: '',
        filters,
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
                var match_filter =
                    filters.showPaidValid.sel && is_paid && is_valid ||
                    filters.showPaidInvalid.sel && is_paid && !is_valid ||
                    filters.showUnpaidValid.sel && !is_paid && is_valid ||
                    filters.showUnpaidInvalid.sel && !is_paid && !is_valid;
                return (
                    hasQuery&&(match_nickname||match_name)
                    || !hasQuery&&match_filter
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
            $('#clipboard').text(
                this.queried_members.map(function(member){
                    return member.name+"("+member.nickname+")";
                }).join('\n')
            );
            $('.modal').modal('show');
        },
        gotoConfig: function(){
            document.location = 'setting.html';
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
        hasFeePaid: function(member){
            var dof = member.date_of_last_fee_paid;
            return (
                dof?
                dof.getFullYear() == this.paid_year:
                false
            );
        },
        attendanceSum: function(member){
            return member.attendance.reduce(function(a, b){
                return a + b;
            }, 0);
        },
        isValid: function(member){
            return this.attendanceSum(member) >= config.attendance_threshold;
        },
        canVote: function(member){
            return this.hasFeePaid(member) && this.isValid(member);
        },
    },
});

Vue.filter('canVoteText', function(canVote){
    return canVote? '有': '無';
});

Vue.filter('attendanceText', function(attendance){
    return attendance? '有效會員': '無效會員';
});

Vue.filter('hasFeePaidText', function(hasFeePaid){
    return hasFeePaid? '已繳': '未繳';
});
