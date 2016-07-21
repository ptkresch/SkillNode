module.exports = function(socket) {

    socket.on('subscribe', function(room) {
        // console.log(room);
        // socket.emit('init', {room: room});
        socket.join(room);
    });

    // socket.on('unsubscribe', function(room) {  
    //     console.log('leaving room', room);
    //     socket.leave(room); 
    // })

    // socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        console.log(data.room);
        console.log(socket.adapter.rooms);
        socket.to(data.room).emit('message', data);
        // socket.emit('message', data);
        // io.sockets.emit('message', data);
    });
}