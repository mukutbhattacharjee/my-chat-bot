var http = require('http');
var express = require('express');

var socketio = require('socket.io');

var app = express();
app.use(express.static(__dirname+"/public"));

var httpServer  = http.createServer(app);

var port = process.env.PORT || process.env.npm_package_config_port;

var io = socketio(httpServer); //websocket server instance

var users = [];//list of all users online

io.on('connection', (socket)=>{ //socket instance representing one connection, for e.g. one user in a chat application.
                                //whenever one user connects, this socket instance points to that user
    //console.log("a user connected");

    socket.on('disconnect',()=>{ //when a particular connection is closed, for e.g. this user diconnected
        if(!socket.username)return;
        delete users[socket.username];
        io.emit('users-list',Object.keys(users));
        //console.log(socket.username +" disconnected")
    });

    socket.on('new-user', (username,callback) => {
        if(username in users){//Username is not available. 
            //console.log("Username %s not available",username);
            callback(false);
        }else{
            //console.log("Username %s is available",username);
            callback(true);
            socket.username = username;
            users[username] = socket;
            io.emit('users-list',Object.keys(users));
        }
    })

    socket.on('new-message', (message) => {
        //console.log("new message arrived %s from %s",message,socket.username);
        //will broadcast this message to all clients
        var msgData = {msg:message,sender:socket.username}
        console.log('emitting chat-message with data '+msgData)
        io.emit('chat-message',msgData);
    });
});

httpServer.listen(port,()=>{
    console.log("listening on port "+port);
});