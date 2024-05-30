$(document).ready(function(){


    var socket = io.connect('http://127.0.0.1:7777');

    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
    });

    socket.on('sayhi', function (data) {
        console.log(data.hello);
    });

    socket.emit('say',{text:'my text'});

    $('#test').on('click',function() {
        socket.emit('say', {
            username: 'Username hehe',
            text: 'text hehe  '
        });
    });
})

