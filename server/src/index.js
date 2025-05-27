require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { connectDB } = require('./db/connection.js');
const { router } = require('./route/user.route.js');
const chatRouter = require('./route/chatRoute.js');
const messageRouter = require('./route/messageRoute.js');
const errorHandler = require('./utils/errorHandler.js');


const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://127.0.0.1:5173" , "http://localhost:5173"],
    credentials: true
}));
app.use(cookieParser());

app.use('/api/users', router);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
// app.use(errorHandler);


connectDB();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const { chat } = require('./model/chat.model.js');
const io = new Server(server, {
    pingTimeout: 60000, 
    cors: {
        origin:  ["http://127.0.0.1:5173" , "http://localhost:5173"] // make sure this matches your frontend
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
        socket.on('setup', (UserId)=> {
        socket.join(UserId);
        socket.emit('connected');
     })

     socket.on('join chat' ,(room) => {
        socket.join(room);
        console.log('user joined room : ', room)
     })

     socket.on('new message', (newMessageReceived) => {
        const Chat = newMessageReceived.Chat;
        console.log(newMessageReceived.content);

        if(!Chat.users) return console.log("chat.users not defined");

        Chat.users.forEach(user => {
            if(user._id === newMessageReceived.sender._id)  return;
            socket.in(user._id).emit("message received", newMessageReceived);

        })
     })

    //  socket.on('typing' ,(room)=>socket.in(room).emit("typing"));
    //  socket.on('stop typing' ,(room)=>socket.in(room).emit("stop typing"));

});



server.listen(process.env.PORT, () => {
    console.log(`Server is listening at port: ${process.env.PORT}`);
});


