const http = require('http')
const express = require('express')
const app = express()

const words = require('./words')

app.use(express.static('public'))
app.set('port', '3000')

const server = http.createServer(app)
server.on('listening', ()=>{
    console.log('Server started at port 3000 ')
})


let users = 0;
let guessed = 0;
let word;
let boards_id = [];

const io = require('socket.io')(server)

io.sockets.on('connection', (socket)=>{

    if (users===0){
        word = words[Math.floor(Math.random()* words.length)];
    }
    if(users%2!=0){
        boards_id.push(socket.id)
        console.log(boards_id)
    }
    

    users+=1
    console.log(users)
    
    socket.emit('get_changed_word', word)

    if(users===2){
        socket.emit('print_word')
    }

    socket.on('guess', ()=>{
        guessed+=1
        if (guessed >= users/2-1){
            guessed = 0;
            socket.emit('clear')
            socket.broadcast.emit('clear')
            word = words[Math.floor(Math.random()* words.length)];
            socket.emit('get_changed_word', word)
            socket.broadcast.emit('get_changed_word', word)
            io.to( boards_id[Math.floor(Math.random()* boards_id.length)] ).emit('print_word')
        }
    })

    socket.on('send', (message)=>{
        socket.broadcast.emit('send', message)
    })

    socket.on('draw', (data) => socket.broadcast.emit('draw', data))

    socket.on('clear', (param)=> socket.broadcast.emit('clear', param))

    socket.on('disconnect', ()=>{
        users-=1
        console.log(users)
        if(boards_id.indexOf(socket.id)!== -1){
            boards_id.splice( boards_id.indexOf(socket.id) , 1)
            console.log(boards_id)
        }        
    })
})



server.listen(3000)