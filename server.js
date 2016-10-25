const express = require('express');
const path = require('path');
const app = express(); 
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dethread = require('./dethread.js');

// dethread.on('Library', () => {
//   console.log("I am sending over the library");
// })

dethread.start(io,['coffee','plz']);


dethread.on('Im Hungry', (socket) => {
  console.log("I AM SENDING FOOD IN SERVER");
  socket.emit("Library", {data: 5});
});




app.use(express.static(path.join(__dirname, '/')));



http.listen(8080, function(e){
  console.log("connected on 8080");
});