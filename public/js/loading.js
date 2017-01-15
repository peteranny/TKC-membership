var Loading = {
    $el: $('<div>').css({
        'position': 'fixed',
        'top': '0px',
        'left': '0px',
        'width': '100%',
        'height': '100%',
        'background-color': 'rgba(0,0,0,0.5)',
        'color': 'white',
        'font-size': '100pt',
        'font-weight': 'bold',
        'text-align': 'center',
        'overflow': 'hidden',
    }).appendTo($('body')),

    indicators: '⣾⣽⣻⢿⡿⣟⣯⣷',
    dt: 100,
    loadingText: '載入中',
    failText: '載入失敗',
    consoleText: '進入管理介面',
    timer: null,
    on: function(isRun){
        $('#loading').text(Loading.loadingText);
        $('#loading').fadeIn('slow');
        function next(i){
            var indicator = Loading.indicators.charAt(i);
            Loading.$el.text(
                indicator + Loading.loadingText + indicator
            );
            var j = (i + 1) % Loading.indicators.length;
            Loading.timer = setTimeout(next.bind(null, j), Loading.dt);
        }
        next(0);
    },
    off: function(err){
        clearInterval(Loading.timer);
        if(!err){
            Loading.$el.fadeOut();
        }else{
            Loading.$el
                .text(Loading.failText)
                .append(
                    $('<h6>')
                    .append($('<blockquote>').text(err))
                ).append(
                    $('<a>')
                    .addClass('btn btn-danger btn-lg')
                    .text(consoleText)
                    .attr('href', vm.console_uri)
                );
        }
    },
};
