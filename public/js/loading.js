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
        'z-index': 999,
    }).appendTo($('body')),

    indicators: '⣾⣽⣻⢿⡿⣟⣯⣷',
    loading_text: '載入中',
    fail_text: '載入失敗',
    console_text: '進入管理介面',

    dt: 100,
    timer: null,
    on: function(message){
        Loading.$el.fadeIn('slow');
        (function next(i){
            var indicator = Loading.indicators.charAt(i);
            Loading.$el
                .empty()
                .text(
                    indicator + Loading.loading_text + indicator
                );
            if(message)
                Loading.$el.append(
                    $('<h2>').append($('<blockquote>').text(message))
                );
            if(Loading.timer) clearTimeout(Loading.timer);
            var j = (i + 1) % Loading.indicators.length;
            Loading.timer = setTimeout(next.bind(null, j), Loading.dt);
        })(0);
    },
    off: function(err){
        clearInterval(Loading.timer);
        if(!err){
            Loading.$el.fadeOut();
        }else{
            Loading.$el
                .empty()
                .text(Loading.fail_text)
                .append(
                    $('<h2>').append($('<blockquote>').text(err))
                ).append(
                    $('<a>')
                    .addClass('btn btn-danger btn-lg')
                    .text(Loading.console_text)
                    .attr('href', app.console_uri)
                );
        }
    },
}

