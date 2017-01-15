var vm = new Vue({
    el: '#main',
    data:{
        logged_in: false,
        members: [],
        query: '',
        filters: [],
        console_uri: 'TODO',
    },
    computed:{
        queried_members: function(){
            return this.members;
        },
        unsolved_members: function(){
            return this.members.filter(function(member){
                return !member.unique || member.sum<0;
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
        }
    },
});
