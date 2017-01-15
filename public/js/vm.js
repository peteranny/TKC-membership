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
                return !member.unique;
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
        solveConflict: function(no){
            log('solve conflict');
        },
        confirmAbsence: function(no){
            log('confirm absence');
        },
        memberType: function(member){
            return;
        },
        isValid: function(hasFeePaid, attendance){
            var sum = attendance.reduce(function(a, b){
                return a + b;
            }, 0);
            return hasFeepaid && sum >= this.valid_threshold;
        },
    },
});
