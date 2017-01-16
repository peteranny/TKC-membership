var vm = new Vue({
    el: '#main',
    data:{
        logged_in: false,
        members: [],
        dates: [],
        query: '',
        filters: [],
        console_uri: 'TODO',
        valid_threshold: 6,
    },
    computed:{
        queried_members: function(){
            return this.members;
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
            member.solved = true;
        },
        memberType: function(member){
            return;
        },
        isValid: function(hasFeePaid, attendance){
            var sum = attendance.reduce(function(a, b){
                return a + b;
            }, 0);
            return hasFeePaid && sum >= this.valid_threshold;
        },
    },
});
