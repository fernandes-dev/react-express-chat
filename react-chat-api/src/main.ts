import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

const port = Number(process.env.PORT || 3333)

const app = express();

app.get('/', (req, res) => res.json({message: "Hello World"}))

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const users: any[] = []

io.on("connection", (socket) => {
    socket.on('login', (user) => {
        const foundUser = users.find(u => u.id === user.id)

        if(!foundUser) users.push(user)
    })

    socket.on('message', (message) => {
        const author = users.find(u => u.id === socket.id)

        socket.broadcast.emit('message', {author: author.name, text: message, id: Math.random().toString()})
    })
});

httpServer.listen(port);