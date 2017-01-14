function log(){
    var text = Array.from(arguments).reduce(function(x,y){
        return x + (
            y instanceof Error? y.toString():
            typeof y=='object'? JSON.stringify(y, null, 2):
            y
        );
    }, '');
    $('<pre>')
    .text(text)
    .css('background-color', 'rgba(0,0,0,0.1')
    .css('margin', '1em')
    .css('padding', '1em')
    .hide()
    .prependTo($('body'))
    .show('slow');
}
