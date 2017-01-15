var vm = new Vue({
    el: '#main',
    data:{
        logged_in: false,
        query: '',
        filters:[],
    },
    computed:{
        unsolved_members: function(){
            return [];
        },
        isSolved: function(){
            return this.unsolved_members.length == 0;
        },
    },
    methods:{
        copyList: function(){
            log('copy list');
        },
        gotoConfig: function(){
            log('goto config');
        },
    },
});
