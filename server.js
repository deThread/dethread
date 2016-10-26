const express = require('express');
const path = require('path');
const app = express(); 
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socketConnection = require('./application');
socketConnection(io);

app.use(express.static(path.join(__dirname, '/')));



http.listen(8080, function(e){
  console.log("connected on 8080");
});
