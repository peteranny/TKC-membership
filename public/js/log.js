function log(){
    var text = Array.from(arguments).reduce(function(x,y){
        return x + (
            y instanceof Error? y.toString():
            typeof y=='object'? JSON.stringify(y, null, 2):
            y
        );
    }, '');
    var ele =
        $('<pre>')
        .text(text)
        .css({
            'background-color': 'rgba(0, 100, 0, 0.7)',
            'color': 'lightgreen',
        })
        .css({
            'margin': '1em',
            'padding': '1em',
            'width': 'calc(100% - 2em)',
            'height': 'calc(100% - 2em)',
        })
        .css({
            'position': 'fixed',
            'top': '0px',
            'left': '0px',
            'z-index': 999,
        })
        .corner()
        .css('cursor', 'pointer')
        .click(function(){
            $(this).hide('show')
        })
        .hover(function(){
            $(this).css('color', 'yellow');
        }, function(){
            $(this).css('color', 'lightgreen');
        })
        .hide()
        .prependTo($('body'))
        .show('slow');
}
